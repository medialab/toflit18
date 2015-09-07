/**
 * TOFLIT18 Import Script
 * =======================
 *
 * Script aiming at importing the project's sources into a neo4j database which
 * will be used by the datascape.
 */
import {argv} from 'yargs';
import {parse as parseCsv, stringify as stringifyCsv} from 'csv';
import {default as h} from 'highland';
import {db as dbConfig, api as apiConfig} from '../config.json';
import {hash} from '../lib/crypto';
import {normalizeYear} from '../lib/republican_calendar';
import {cleanText} from '../lib/clean';
import fs from 'fs';
import _ from 'lodash';

/**
 * Helpers
 * ========
 *
 * Miscellaneous utilities used by the script.
 */

/**
 * Builder class
 */
class Builder {
  constructor() {

    const nodesWriteStream = fs.createWriteStream('./nodes.csv', 'utf-8'),
          edgesWriteStream = fs.createWriteStream('./edges.csv', 'utf-8');

    // Properties
    this.nodesCount = 0;
    this.nodesStream = h();
    this.edgesStream = h();

    // Piping
    this.nodesStream
      .pipe(stringifyCsv({delimiter: ','}))
      .pipe(nodesWriteStream);

    this.edgesStream
      .pipe(stringifyCsv({delimiter: ','}))
      .pipe(edgesWriteStream);

    // Writing headers
    this.nodesStream.write(NODE_PROPERTIES_TYPES.concat(':LABEL', ':ID'));
    this.edgesStream.write([':START_ID', ':END_ID', ':TYPE']);
  }

  save(data, label) {
    const row = _({})
      .merge(_.mapValues(NODE_PROPERTIES_MAPPING, x => ''))
      .merge(data)
      .pairs()
      .sortBy(e => NODE_PROPERTIES_MAPPING[e[0]])
      .map(e => e[1])
      .concat([label, this.nodesCount])
      .value();

    this.nodesStream.write(row);

    return this.nodesCount++;
  }

  relate(source, predicate, target) {
    const row = [source, target, predicate];

    this.edgesStream.write(row);
  }
}

/**
 * Index creation function
 */
function indexedNode(index, label, key, data) {
  let node = index[key];
  if (!node) {
    node = BUILDER.save(data, label);
    index[key] = node;
  }

  return node;
}


/**
 * Initialization
 * ===============
 *
 * Defining path constants, reading the CLI arguments etc.
 */

/**
 * Paths
 */
const BDD_CENTRALE_PATH = '/base_centrale/bdd_centrale.csv',
      CLASSIFICATIONS_PATH = '/Traitement des marchandises, pays, unités',
      ORTHOGRAPHIC_CLASSIFICATION = CLASSIFICATIONS_PATH + '/bdd_marchandises_normalisees_orthographique.csv',
      COUNTRY_CLASSIFICATIONS = CLASSIFICATIONS_PATH + '/bdd_pays.csv';

/**
 * Constants
 */

// Possible properties
const POSSIBLE_NODE_PROPERTIES = [
  'no:int',
  'quantity',
  'value',
  'unit_price',
  'normalized_year:int',
  'year',
  'import:boolean',
  'sheet',
  'name',
  'path',
  'type',
  'model',
  'note',
  'slug',
  'password'
];

const NODE_PROPERTIES_MAPPING = _(POSSIBLE_NODE_PROPERTIES)
  .map((p, i) => [p.split(':')[0], i])
  .zipObject()
  .value();

const NODE_PROPERTIES_TYPES = POSSIBLE_NODE_PROPERTIES;

/**
 * Reading arguments
 */
const DATA_PATH = argv.path || argv.p;

if (!DATA_PATH)
  throw Error('No data path provided.');

console.log('Reading csv files from "' + DATA_PATH + '"');
console.log('Processing flows...');

/**
 * Basic instantiation
 */

// Creating the builder
const BUILDER = new Builder();

// Creating the TOFLIT18 user
const TOFLIT18_USER = BUILDER.save({
  name: 'toflit18',
  password: hash(apiConfig.secret)
}, 'User');

// Indexes
const INDEXES = {
  directions: {},
  countries: {},
  operators: {},
  origins: {},
  products: {},
  sources: {},
  units: {}
};

const CLASSIFICATION_INDEXES = {
  orthographic: {}
};

const CLASSIFICATION_NODES = {
  orthographic: BUILDER.save({
    name: 'Orthographic Normalization',
    model: 'Product',
    slug: 'orthographic_normalization'
  }, 'Classification')
};

BUILDER.relate(CLASSIFICATION_NODES.orthographic, 'CREATED_BY', TOFLIT18_USER);


/**
 * Process
 * ========
 *
 * Reading the multiple CSV file and parsing them accordingly in order to create
 * the graph.
 */

/**
 * Parsing the file
 */
let readStream = fs.createReadStream(DATA_PATH + BDD_CENTRALE_PATH)
  .pipe(parseCsv({delimiter: ',', columns: true}));

// Getting the flows
readStream = h(readStream)
  // .drop(5000)
  // .take(1000)
  .map(l => _.mapValues(l, cleanText))
  .each(importer)
  .on('end', function() {

    console.log('Processing product classifications...');

    console.log('  -- Orthographic normalization');

    // Parsing orthographic simplifications for products
    const csvData = fs.readFileSync(DATA_PATH + ORTHOGRAPHIC_CLASSIFICATION, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          original: cleanText(line[0]),
          modified: cleanText(line[1]),
          note: cleanText(line[2])
        }))
        .forEach(orthographicProducts);
    });
  });

/**
 * Consuming the flows.
 */
function importer(csvLine) {

  // Direction
  const isImport = /imp/i.test(csvLine.exportsimports);

  // Creating a flow node
  const nodeData = {
    no: +csvLine.numrodeligne,
    quantity: csvLine.quantit,
    value: +csvLine.value,
    unit_price: csvLine.prix_unitaire,
    year: csvLine.year,
    normalized_year: normalizeYear(csvLine.year),
    import: '' + isImport,
    sheet: +csvLine.sheet
  };

  if (csvLine.remarks)
    nodeData.note = csvLine.remarks;

  const flowNode = BUILDER.save(nodeData, 'Flow');

  // Operator
  if (csvLine.dataentryby) {
    const operatorNode = indexedNode(INDEXES.operators, 'Operator', csvLine.dataentryby, {
      name: csvLine.dataentryby
    });

    BUILDER.relate(flowNode, 'TRANSCRIBED_BY', operatorNode);
  }

  // Source
  if (csvLine.source) {
    const sourceNode = indexedNode(INDEXES.sources, 'Source', csvLine.source, {
      name: csvLine.source,
      path: csvLine.sourcepath,
      type: csvLine.sourcetype
    });

    BUILDER.relate(flowNode, 'TRANSCRIBED_FROM', sourceNode);
  }

  // Product
  if (csvLine.marchandises) {
    const productNode = indexedNode(INDEXES.products, 'Product', csvLine.marchandises, {
      name: csvLine.marchandises
    });

    BUILDER.relate(flowNode, 'OF', productNode);
  }

  // Origin
  if (csvLine.origine) {
    const originNode = indexedNode(INDEXES.origins, 'Origin', csvLine.origine, {
      name: csvLine.origine
    });

    BUILDER.relate(originNode, 'ORIGINATES_FROM', flowNode);
  }

  // Direction
  if (csvLine.direction) {
    const directionNode = indexedNode(INDEXES.directions, 'Direction', csvLine.direction, {
      name: csvLine.direction
    });

    if (isImport)
      BUILDER.relate(flowNode, 'FROM', directionNode);
    else
      BUILDER.relate(flowNode, 'TO', directionNode);
  }

  // Country
  if (csvLine.pays) {
    const countryNode = indexedNode(INDEXES.countries, 'Country', csvLine.pays, {
      name: csvLine.pays
    });

    if (!isImport)
      BUILDER.relate(flowNode, 'FROM', countryNode);
    else
      BUILDER.relate(flowNode, 'TO', countryNode);
  }

  // Units
  if (csvLine.quantity_unit) {
    const productNode = indexedNode(INDEXES.units, 'Unit', csvLine.quantity_unit, {
      name: csvLine.quantity_unit
    });

    BUILDER.relate(flowNode, 'VALUE_IN', productNode);
  }

  // TODO: bureaux
  // TODO: normalize unit_price
}

/**
 * Consuming the classifications.
 */
function orthographicProducts(line) {
  const alreadyLinked = !!CLASSIFICATION_INDEXES.orthographic[line.modified];

  const nodeData = {
    name: line.modified
  };

  if (line.note)
    nodeData.note = line.note;

  const classifiedNode = indexedNode(
    CLASSIFICATION_INDEXES.orthographic,
    'ClassifiedProduct',
    line.modified,
    nodeData
  );

  const targetNode = INDEXES.products[line.original];

  // if (targetNode === undefined) {
  //   console.log(`      > "${line.original}" not found!`);
  // }

  if (!alreadyLinked)
    BUILDER.relate(CLASSIFICATION_NODES.orthographic, 'HAS', classifiedNode);

  if (targetNode !== undefined)
    BUILDER.relate(classifiedNode, 'AGGREGATES', targetNode);
}
