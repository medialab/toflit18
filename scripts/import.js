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
import {db as dbConfig} from '../config.json';
import {normalizeYear} from '../lib/republican_calendar';
import {cleanText} from '../lib/clean';
import fs from 'fs';
import _ from 'lodash';

/**
 * Paths
 */
const BDD_CENTRALE_PATH = '/base_centrale/bdd_centrale.csv',
      CLASSIFICATIONS_PATH = '/Traitement des marchandises, pays, unités',
      ORTHOGRAPHIC_CLASSIFICATION = CLASSIFICATIONS_PATH + '/bdd_marchandises_normalisees_orthographique.csv'

/**
 * Reading arguments
 */
const dataPath = argv.path || argv.p;

if (!dataPath)
  throw Error('No data path provided.');

console.log('Reading csv files from "' + dataPath + '"');
console.log('Processing flows...');

/**
 * Parsing the file
 */
let readStream = fs.createReadStream(dataPath + BDD_CENTRALE_PATH)
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
    const csvData = fs.readFileSync(dataPath + ORTHOGRAPHIC_CLASSIFICATION, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          original: cleanText(line[0]),
          modified: cleanText(line[1])
        }))
        .forEach(orthographicProducts);
    });
  });

const nodesWriteStream = fs.createWriteStream('./nodes.csv', 'utf-8'),
      edgesWriteStream = fs.createWriteStream('./edges.csv', 'utf-8');

/**
 * Helpers
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
  'remarks',
  'name',
  'path',
  'type',
  'model',
  'slug'
];

const NODE_PROPERTIES_MAPPING = _(POSSIBLE_NODE_PROPERTIES)
  .map((p, i) => [p.split(':')[0], i])
  .zipObject()
  .value();

const NODE_PROPERTIES_TYPES = POSSIBLE_NODE_PROPERTIES;

// Mapping, and out streams
class Builder {
  constructor() {

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

const builder = new Builder();

const indexes = {
  directions: {},
  countries: {},
  operators: {},
  products: {},
  sources: {},
  units: {}
};

function indexedNode(index, label, key, data) {
  let node = index[key];
  if (!node) {
    node = builder.save(data, label);
    index[key] = node;
  }

  return node;
}

/**
 * Consuming the flows.
 */
function importer(csvLine) {

  // Direction
  const isImport = /imp/i.test(csvLine.exportsimports);

  // Creating a flow node
  const flowNode = builder.save({
    no: +csvLine.numrodeligne,
    quantity: csvLine.quantit,
    value: +csvLine.value,
    unit_price: csvLine.prix_unitaire,

    // TODO: translate the year into computable format
    year: csvLine.year,
    normalized_year: normalizeYear(csvLine.year),
    import: isImport,
    sheet: +csvLine.sheet,

    // TODO: drop the unused properties
    remarks: csvLine.remarks
  }, 'Flow');

  // Operator
  if (csvLine.dataentryby) {
    const operatorNode = indexedNode(indexes.operators, 'Operator', csvLine.dataentryby, {
      name: csvLine.dataentryby
    });

    builder.relate(flowNode, 'TRANSCRIBED_BY', operatorNode);
  }

  // Source
  if (csvLine.source) {
    const sourceNode = indexedNode(indexes.sources, 'Source', csvLine.source, {
      name: csvLine.source,
      path: csvLine.sourcepath,
      type: csvLine.sourcetype
    });

    builder.relate(flowNode, 'TRANSCRIBED_FROM', sourceNode);
  }

  // Product
  if (csvLine.marchandises) {
    const productNode = indexedNode(indexes.products, 'Product', csvLine.marchandises, {
      name: csvLine.marchandises
    });

    builder.relate(flowNode, 'OF', productNode);
  }

  // Direction
  if (csvLine.direction) {
    const directionNode = indexedNode(indexes.directions, 'Direction', csvLine.direction, {
      name: csvLine.direction
    });

    if (isImport)
      builder.relate(flowNode, 'FROM', directionNode);
    else
      builder.relate(flowNode, 'TO', directionNode);
  }

  // Country
  if (csvLine.pays) {
    const countryNode = indexedNode(indexes.countries, 'Country', csvLine.pays, {
      name: csvLine.pays
    });

    if (!isImport)
      builder.relate(flowNode, 'FROM', countryNode);
    else
      builder.relate(flowNode, 'TO', countryNode);
  }

  // Units
  if (csvLine.quantity_unit) {
    const productNode = indexedNode(indexes.units, 'Unit', csvLine.quantity_unit, {
      name: csvLine.quantity_unit
    });

    builder.relate(flowNode, 'VALUE_IN', productNode);
  }

  // TODO: bureaux
  // TODO: origin
  // TODO: normalize unit_price
  // TODO: check external flows
}

/**
 * Consuming the classifications.
 */
const classificationIndexes = {
  orthographic: {}
};

let orthographicClassificationNode;

function orthographicProducts(line) {
  if (!orthographicClassificationNode)
    orthographicClassificationNode = builder.save(
      {
        name: 'Orthographic Normalization',
        model: 'Product',
        slug: 'orthographic_normalization'
      },
      'Classification'
    );

  const alreadyLinked = !!classificationIndexes.orthographic[line.modified];


  const classifiedNode = indexedNode(
    classificationIndexes.orthographic,
    'ClassifiedProduct',
    line.modified,
    {name: line.modified}
  );

  const targetNode = indexes.products[line.original];

  if (targetNode === undefined) {
    console.log(`      > "${line.original}" not found!`);
  }

  if (!alreadyLinked)
    builder.relate(orthographicClassificationNode, 'HAS', classifiedNode);

  if (targetNode !== undefined)
    builder.relate(classifiedNode, 'AGGREGATES', targetNode);
}
