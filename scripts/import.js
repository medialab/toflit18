/* eslint no-console: 0 */
/**
 * TOFLIT18 Import Script
 * =======================
 *
 * Script aiming at importing the project's sources into a neo4j database which
 * will be used by the datascape.
 */
import {argv} from 'yargs';
import async from 'async';
import {parse as parseCsv, stringify as stringifyCsv} from 'csv';
import {default as h} from 'highland';
import {api as apiConfig} from '../config.json';
import {hash} from '../lib/crypto';
import {normalizeYear} from '../lib/republican_calendar';
import {cleanText, cleanNumber} from '../lib/clean';
import fs from 'fs';
import _ from 'lodash';

/**
 * Initialization
 * ===============
 *
 * Defining path constants, reading the CLI arguments etc.
 */

/**
 * Paths
 */
const ROOT_PATH = '/base',
      BDD_CENTRALE_PATH = ROOT_PATH + '/bdd_centrale.csv',
      BDD_OUTSIDERS = ROOT_PATH + '/marchandises_sourcees.csv',
      BDD_UNITS = ROOT_PATH + '/Units_N1.csv',
      ORTHOGRAPHIC_CLASSIFICATION = ROOT_PATH + '/bdd_revised_marchandises_normalisees_orthographique.csv',
      SIMPLIFICATION = ROOT_PATH + '/bdd_revised_marchandises_simplifiees.csv',
      MEDICINAL_CLASSIFICATIONS = ROOT_PATH + '/bdd_revised_classification_medicinales.csv',
      HAMBURG_CLASSIFICATION = ROOT_PATH + '/bdd_revised_classification_hamburg.csv',
      AMERIQUEDUNORD_CLASSIFICATION = ROOT_PATH + '/bdd_classification_AmeriqueduNord.csv',
      EDENTREATY_CLASSIFICATION = ROOT_PATH + '/bdd_classification_edentreaty.csv',
      COUNTRY_ORTHOGRAPHIC = ROOT_PATH + '/classification_country_orthographic_normalization.csv',
      COUNTRY_SIMPLIFICATION = ROOT_PATH + '/classification_country_simplification.csv',
      COUNTRY_GROUPED = ROOT_PATH + '/classification_country_grouping.csv',
      COUNTRY_OBRIEN = ROOT_PATH + '/classification_country_obrien.csv',
      COUNTRY_CLASSIFICATIONS = ROOT_PATH + '/bdd_pays.csv';

/**
 * Constants
 */

// Possible properties
const POSSIBLE_NODE_PROPERTIES = [
  'rawUnit',
  'unit',
  'quantity:float',
  'value:float',
  'unitPrice:float',
  'year:int',
  'rawYear',
  'import:boolean',
  'sheet',
  'name',
  'path',
  'type',
  'model',
  'note',
  'slug',
  'password',
  'description',
  'source:boolean',
  'direction',
  'country',
  'sourceType',
  'product'
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

    const nodesWriteStream = fs.createWriteStream('./.output/nodes.csv', 'utf-8'),
          edgesWriteStream = fs.createWriteStream('./.output/edges.csv', 'utf-8');

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
    this.edgesStream.write([':START_ID', ':END_ID', ':TYPE', 'line:int', 'sheet:int']);
  }

  save(data, label) {
    const row = _({})
      .merge(_.mapValues(NODE_PROPERTIES_MAPPING, () => ''))
      .merge(data)
      .pairs()
      .sortBy(e => NODE_PROPERTIES_MAPPING[e[0]])
      .map(e => e[1])
      .concat([[].concat(label || []).join(';'), this.nodesCount])
      .value();

    this.nodesStream.write(row);

    return this.nodesCount++;
  }

  relate(source, predicate, target, data) {
    const row = [source, target, predicate];

    if (data)
      row.push(data.line || '', data.sheet || '');

    this.edgesStream.write(row);
  }
}

// Creating the builder
const BUILDER = new Builder();

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
 * Data Hydratation
 * =================
 *
 * Scaffolding the necessary nodes and indexes so we can start the import.
 */

// Creating the TOFLIT18 user
const TOFLIT18_USER = BUILDER.save({
  name: 'toflit18',
  password: hash(apiConfig.secret)
}, 'User');

// Indexes
const INDEXES = {
  directions: {},
  countries: {},
  offices: {},
  operators: {},
  origins: {},
  products: {},
  sources: {}
};

const UNITS_INDEX = {};
const CONVERSION_TABLE = {};

const OUTSIDER_INDEXES = {
  sund: {},
  belg: {},
  unknown: {}
};

const EDGE_INDEXES = {
  offices: new Set()
};

const CLASSIFICATION_NODES = {
  product_sources: BUILDER.save({
    name: 'Sources',
    model: 'product',
    slug: 'sources',
    description: 'Collecting the sources themselves.',
    source: '' + true
  }, 'Classification'),
  product_orthographic: BUILDER.save({
    name: 'Orthographic Normalization',
    model: 'product',
    slug: 'orthographic_normalization',
    description: 'Fixing the source\'s somewhat faulty orthograph.'
  }, 'Classification'),
  // product_revised_orthographic: BUILDER.save({
  //   name: 'Revised Orthographic Normalization',
  //   model: 'product',
  //   slug: 'revised_orthographic_normalization',
  //   description: 'Revised version of the initial orthographic normalization.'
  // }, 'Classification'),
  product_simplified: BUILDER.save({
    name: 'Simplification',
    model: 'product',
    slug: 'simplification',
    description: 'Simplifying the source.'
   }, 'Classification'),
  // product_revised_simplified: BUILDER.save({
  //   name: 'Revised Simplification',
  //   model: 'product',
  //   slug: 'revised_simplification',
  //   description: 'Simplifying the source.'
  // }, 'Classification'),
  // product_categorized: BUILDER.save({
  //   name: 'Categorization',
  //   model: 'product',
  //   slug: 'categorization',
  //   description: 'Categorizing the various products.'
  // }, 'Classification'),
  // product_sitcrev1: BUILDER.save({
  //   name: 'SITC Rev.1',
  //   model: 'product',
  //   slug: 'sitc_rev1',
  //   description: 'SITC Rev.1'
  // }, 'Classification'),
  // product_sitcrev2: BUILDER.save({
  //   name: 'SITC Rev.2',
  //   model: 'product',
  //   slug: 'sitc_rev2',
  //   description: 'SITC Rev.2'
  // }, 'Classification'),
  product_medicinal: BUILDER.save({
    name: 'Medicinal products',
    model: 'product',
    slug: 'medicinal',
    description: 'Gathering some medicinal products.'
  }, 'Classification'),
  product_hamburg: BUILDER.save({
    name: 'Hamburg classification',
    model: 'product',
    slug: 'hamburg',
    description: 'link to the Hamburg classification'
  }, 'Classification'),
  product_ameriquedunord: BUILDER.save({
    name: 'Amerique du Nord',
    model: 'product',
    slug: 'ameriquedunord',
    description: 'indicates if products are from North America'
  }, 'Classification'),
  product_edentreaty: BUILDER.save({
    name: 'Eden Treaty',
    model: 'product',
    slug: 'edentreaty',
    description: '?'
  }, 'Classification'),
  country_sources: BUILDER.save({
    name: 'Sources',
    model: 'country',
    slug: 'sources',
    description: 'Collecting the sources themselves.',
    source: '' + true
  }, 'Classification'),
  country_orthographic: BUILDER.save({
    name: 'Orthographic Normalization',
    model: 'country',
    slug: 'orthographic_normalization',
    description: 'Fixing the source\'s somewhat faulty orthograph.'
  }, 'Classification'),
  country_simplified: BUILDER.save({
    name: 'Simplification',
    model: 'country',
    slug: 'simplification',
    description: 'Simplifying the source.'
  }, 'Classification'),
  country_grouped: BUILDER.save({
    name: 'Grouping',
    model: 'country',
    slug: 'grouping',
    description: 'Grouping the countries for convenience.'
  }, 'Classification'),
  country_obrien: BUILDER.save({
    name: 'O\'brien',
    model: 'country',
    slug: 'obrien',
    description: 'Grouping the countries from Obrien'
  }, 'Classification')
};

const CLASSIFICATION_INDEXES = {};

Object.keys(CLASSIFICATION_NODES).forEach(k => {
  BUILDER.relate(CLASSIFICATION_NODES[k], 'CREATED_BY', TOFLIT18_USER);
  CLASSIFICATION_INDEXES[k] = {};
});

BUILDER.relate(CLASSIFICATION_NODES.product_orthographic, 'BASED_ON', CLASSIFICATION_NODES.product_sources);
//BUILDER.relate(CLASSIFICATION_NODES.product_revised_orthographic, 'BASED_ON', CLASSIFICATION_NODES.product_sources);
BUILDER.relate(CLASSIFICATION_NODES.product_simplified, 'BASED_ON', CLASSIFICATION_NODES.product_orthographic);
//BUILDER.relate(CLASSIFICATION_NODES.product_revised_simplified, 'BASED_ON', CLASSIFICATION_NODES.product_revised_orthographic);
//BUILDER.relate(CLASSIFICATION_NODES.product_categorized, 'BASED_ON', CLASSIFICATION_NODES.product_simplified);
//BUILDER.relate(CLASSIFICATION_NODES.product_sitcrev2, 'BASED_ON', CLASSIFICATION_NODES.product_simplified);
BUILDER.relate(CLASSIFICATION_NODES.product_medicinal, 'BASED_ON', CLASSIFICATION_NODES.product_simplified);
BUILDER.relate(CLASSIFICATION_NODES.product_hamburg, 'BASED_ON', CLASSIFICATION_NODES.product_simplified);
BUILDER.relate(CLASSIFICATION_NODES.product_ameriquedunord, 'BASED_ON', CLASSIFICATION_NODES.product_simplified);
BUILDER.relate(CLASSIFICATION_NODES.product_edentreaty, 'BASED_ON', CLASSIFICATION_NODES.product_simplified);
//BUILDER.relate(CLASSIFICATION_NODES.product_sitcrev1, 'BASED_ON', CLASSIFICATION_NODES.product_sitcrev2);
BUILDER.relate(CLASSIFICATION_NODES.country_orthographic, 'BASED_ON', CLASSIFICATION_NODES.country_sources);
BUILDER.relate(CLASSIFICATION_NODES.country_simplified, 'BASED_ON', CLASSIFICATION_NODES.country_orthographic);
BUILDER.relate(CLASSIFICATION_NODES.country_grouped, 'BASED_ON', CLASSIFICATION_NODES.country_simplified);
BUILDER.relate(CLASSIFICATION_NODES.country_obrien, 'BASED_ON', CLASSIFICATION_NODES.country_simplified);

const OUTSIDER_SOURCES_NODES = {
  sund: BUILDER.save({name: 'sund'}, 'ExternalSource'),
  belg: BUILDER.save({name: 'belgium'}, 'ExternalSource'),
  unknown: BUILDER.save({name: 'unknown'}, 'ExternalSource')
};

/**
 * Consumers
 * ==========
 *
 * Definining the functions that will consume the multiple CSV streams in
 * order to produce the graph to import.
 */

/**
 * Consuming the flows.
 */
function importer(csvLine) {

  // Direction
  const isImport = /(imp|sortie)/i.test(csvLine.exportsimports);

  // Creating a flow node
  const nodeData = {
    rawYear: csvLine.year,
    import: '' + isImport,
  };

  // Year
  if (csvLine.year) {
    if (/semestre/.test(csvLine.year))
       nodeData.year = csvLine.year.split('-')[0];
    else
      if (csvLine.year==="10 mars-31 décembre 1787")   
          nodeData.year = 1787;
      else
        nodeData.year = normalizeYear(csvLine.year);
  }

  // Unit
  if (csvLine.quantity_unit) {
    nodeData.rawUnit = csvLine.quantity_unit;

    const normalized = UNITS_INDEX[nodeData.rawUnit];

    if (normalized)
      nodeData.unit = normalized;
  }

  // Value
  if (csvLine.value) {
    const realValue = cleanNumber(csvLine.value);

    if (realValue)
      nodeData.value = realValue;
    else if (realValue !== 0)
      console.log('  !! Weird value:', csvLine.value);
  }

  // Quantity
  if (csvLine.quantit) {
    const realQuantity = cleanNumber(csvLine.quantit);

    if (realQuantity)
      nodeData.quantity = realQuantity;
    else if (realQuantity !== 0)
      console.log('  !! Weird quantity:', csvLine.quantit);
  }

  // Unit price
  if (csvLine.prix_unitaire) {
    const realPrice = cleanNumber(csvLine.prix_unitaire);

    if (realPrice)
      nodeData.unitPrice = realPrice;
    else if (realPrice !== 0)
      console.log('  !! Weird unit price:', csvLine.prix_unitaire);
  }

  if (csvLine.remarks)
    nodeData.note = csvLine.remarks;

  // Additional static indexed properties for convenience
  if (csvLine.pays)
    nodeData.country = csvLine.pays;
  if (csvLine.direction)
    nodeData.direction = csvLine.direction;
  if (csvLine.marchandises)
    nodeData.product = csvLine.marchandises;
  if (csvLine.sourcetype)
    nodeData.sourceType = csvLine.sourcetype;

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
    const hashedKey = [csvLine.source, csvLine.sourcepath].join('|||');

    const sourceNode = indexedNode(INDEXES.sources, 'Source', hashedKey, {
      name: csvLine.source,
      path: csvLine.sourcepath,
      type: csvLine.sourcetype
    });

    BUILDER.relate(flowNode, 'TRANSCRIBED_FROM', sourceNode, {
      line: +csvLine.numrodeligne,
      sheet: +csvLine.sheet
    });
  }

  // Product
  if (csvLine.marchandises) {
    const alreadyLinked = INDEXES.products[csvLine.marchandises];

    const productNode = indexedNode(INDEXES.products, ['Product', 'Item'], csvLine.marchandises, {
      name: csvLine.marchandises
    });

    BUILDER.relate(flowNode, 'OF', productNode);

    if (!alreadyLinked)
      BUILDER.relate(CLASSIFICATION_NODES.product_sources, 'HAS', productNode);
  }

  // Origin
  if (csvLine.origine) {
    const originNode = indexedNode(INDEXES.origins, 'Origin', csvLine.origine, {
      name: csvLine.origine
    });

    BUILDER.relate(flowNode, 'ORIGINATES_FROM', originNode);
  }

  // Office
  if (csvLine.bureaux) {
    const officeNode = indexedNode(INDEXES.offices, 'Office', csvLine.bureaux, {
      name: csvLine.bureaux
    });

    if (isImport)
      BUILDER.relate(flowNode, 'FROM', officeNode);
    else
      BUILDER.relate(flowNode, 'TO', officeNode);

    if (csvLine.direction && !EDGE_INDEXES.offices.has(csvLine.bureaux)) {
      const directionNode = indexedNode(INDEXES.directions, 'Direction', csvLine.direction, {
        name: csvLine.direction
      });

      BUILDER.relate(directionNode, 'GATHERS', officeNode);
      EDGE_INDEXES.offices.add(csvLine.bureaux);
    }
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
    const alreadyLinked = INDEXES.countries[csvLine.pays];

    const countryNode = indexedNode(INDEXES.countries, ['Country', 'Item'], csvLine.pays, {
      name: csvLine.pays
    });

    if (!isImport)
      BUILDER.relate(flowNode, 'FROM', countryNode);
    else
      BUILDER.relate(flowNode, 'TO', countryNode);

    if (!alreadyLinked)
      BUILDER.relate(CLASSIFICATION_NODES.country_sources, 'HAS', countryNode);
  }
}

/**
 * Consuming products coming from external sources.
 */
function outsiderProduct(line) {
  const name = line.name,
        nodeData = {name};

  ['sund', 'belg', 'unknown'].forEach(function(source) {
    if (line[source]) {
      if (OUTSIDER_INDEXES[source][name])
        return;

      if (source === 'unknown' && INDEXES.products[name])
        return;

      const preexisting = !!INDEXES.products[name];

      const node = indexedNode(
        INDEXES.products,
        ['Item', 'Product', 'OutsiderItem', 'OutsiderProduct'],
        name,
        nodeData
      );

      // Linking to the source only if not preexisting
      if (!preexisting)
        BUILDER.relate(CLASSIFICATION_NODES.product_sources, 'HAS', node);

      // Linking to the external source
      BUILDER.relate(node, 'TRANSCRIBED_FROM', OUTSIDER_SOURCES_NODES[source]);

      OUTSIDER_INDEXES[source][name] = true;
    }
  });
}

/**
 * Consuming the classifications.
 */
function makeClassificationConsumer(groupIndex, classificationNode, parentNode, itemIndex, groupKey, itemKey, opts = {}) {

  const linkedItemIndex = new Set(),
        linkedGroupIndex = new Set();

  return function(line) {
    const group = line[groupKey],
          item = line[itemKey];

    // Dropping empty values
    if (!group || !item)
      return;

    const itemNode = itemIndex[item];

    // Building the group node
    const nodeData = {
      name: group
    };

    // Adding the note only if required
    if (opts.shouldTakeNote && line.note)
      nodeData.note = line.note;

    const groupNode = indexedNode(
      groupIndex,
      'ClassifiedItem',
      group,
      nodeData
    );

    // Linking the group to the classification on first run
    if (!linkedGroupIndex.has(group)) {
      BUILDER.relate(classificationNode, 'HAS', groupNode);

      linkedGroupIndex.add(group);
    }

    // From sources
    if (itemNode) {

      // Have we several group pointing to the same item?
      if (linkedItemIndex.has(item)) {
        console.log('  !! Warning: item is targeted by multiple groups:', item);
        return;
      }

      // The group aggregates the item
      BUILDER.relate(groupNode, 'AGGREGATES', itemNode);
      linkedItemIndex.add(item);
    }
  };
}

const orthographicProduct = makeClassificationConsumer(
  CLASSIFICATION_INDEXES.product_orthographic,
  CLASSIFICATION_NODES.product_orthographic,
  CLASSIFICATION_NODES.product_sources,
  INDEXES.products,
  'modified',
  'original',
  {shouldTakeNote: true}
);

// const revisedOrthographicProduct = makeClassificationConsumer(
//   CLASSIFICATION_INDEXES.product_revised_orthographic,
//   CLASSIFICATION_NODES.product_revised_orthographic,
//   CLASSIFICATION_NODES.product_sources,
//   INDEXES.products,
//   'modified',
//   'original',
//   {}
// );

const simplifiedProduct = makeClassificationConsumer(
  CLASSIFICATION_INDEXES.product_simplified,
  CLASSIFICATION_NODES.product_simplified,
  CLASSIFICATION_NODES.product_orthographic,
  CLASSIFICATION_INDEXES.product_orthographic,
  'simplified',
  'orthographic',
  {}
);

// const revisedSimplifiedProduct = makeClassificationConsumer(
//   CLASSIFICATION_INDEXES.product_revised_simplified,
//   CLASSIFICATION_NODES.product_revised_simplified,
//   CLASSIFICATION_NODES.product_revised_orthographic,
//   CLASSIFICATION_INDEXES.product_revised_orthographic,
//   'simplified',
//   'orthographic',
//   {}
// );

// const categorizedProduct = makeClassificationConsumer(
//   CLASSIFICATION_INDEXES.product_categorized,
//   CLASSIFICATION_NODES.product_categorized,
//   CLASSIFICATION_NODES.product_simplified,
//   CLASSIFICATION_INDEXES.product_simplified,
//   'categorized',
//   'simplified',
//   {shouldTakeNote: true}
// );

// const sitcrev2Product = makeClassificationConsumer(
//   CLASSIFICATION_INDEXES.product_sitcrev2,
//   CLASSIFICATION_NODES.product_sitcrev2,
//   CLASSIFICATION_NODES.product_simplified,
//   CLASSIFICATION_INDEXES.product_simplified,
//   'sitcrev2',
//   'simplified',
//   {}
// );

// const sitcrev1Product = makeClassificationConsumer(
//   CLASSIFICATION_INDEXES.product_sitcrev1,
//   CLASSIFICATION_NODES.product_sitcrev1,
//   CLASSIFICATION_NODES.product_sitcrev2,
//   CLASSIFICATION_INDEXES.product_sitcrev2,
//   'sitcrev1',
//   'sitcrev2',
//   {}
// );

const medicinalProduct = makeClassificationConsumer(
  CLASSIFICATION_INDEXES.product_medicinal,
  CLASSIFICATION_NODES.product_medicinal,
  CLASSIFICATION_NODES.product_simplified,
  CLASSIFICATION_INDEXES.product_simplified,
  'medicinal',
  'simplified',
  {}
);

const hamburgProduct = makeClassificationConsumer(
  CLASSIFICATION_INDEXES.product_hamburg,
  CLASSIFICATION_NODES.product_hamburg,
  CLASSIFICATION_NODES.product_simplified,
  CLASSIFICATION_INDEXES.product_simplified,
  'hamburg',
  'simplified',
  {}
);

const ameriquedunordProduct = makeClassificationConsumer(
  CLASSIFICATION_INDEXES.product_ameriquedunord,
  CLASSIFICATION_NODES.product_ameriquedunord,
  CLASSIFICATION_NODES.product_simplified,
  CLASSIFICATION_INDEXES.product_simplified,
  'ameriquedunord',
  'simplified',
  {}
);

const edentreatyProduct = makeClassificationConsumer(
  CLASSIFICATION_INDEXES.product_edentreaty,
  CLASSIFICATION_NODES.product_edentreaty,
  CLASSIFICATION_NODES.product_simplified,
  CLASSIFICATION_INDEXES.product_simplified,
  'edentreaty',
  'simplified',
  {}
);

const orthographicCountry = makeClassificationConsumer(
  CLASSIFICATION_INDEXES.country_orthographic,
  CLASSIFICATION_NODES.country_orthographic,
  CLASSIFICATION_NODES.country_sources,
  INDEXES.countries,
  'orthographic',
  'original',
  {}
);

const simplifiedCountry = makeClassificationConsumer(
  CLASSIFICATION_INDEXES.country_simplified,
  CLASSIFICATION_NODES.country_simplified,
  CLASSIFICATION_NODES.country_orthographic,
  CLASSIFICATION_INDEXES.country_orthographic,
  'simplified',
  'orthographic',
  {}
);

const groupedCountry = makeClassificationConsumer(
  CLASSIFICATION_INDEXES.country_grouped,
  CLASSIFICATION_NODES.country_grouped,
  CLASSIFICATION_NODES.country_simplified,
  CLASSIFICATION_INDEXES.country_simplified,
  'grouped',
  'simplified',
  {}
);

const obrienCountry = makeClassificationConsumer(
  CLASSIFICATION_INDEXES.country_obrien,
  CLASSIFICATION_NODES.country_obrien,
  CLASSIFICATION_NODES.country_simplified,
  CLASSIFICATION_INDEXES.country_simplified,
  'obrien',
  'simplified',
  {}
);

/**
 * Process
 * ========
 *
 * Reading the multiple CSV file and parsing them accordingly in order to create
 * the graph.
 */
async.series({

  units(next) {
    console.log('Processing units...');

    const csvData = fs.readFileSync(DATA_PATH + BDD_UNITS, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {

      data.forEach(row => {
        const first = cleanText(row[1]),
              second = cleanText(row[2]);

        const bestGuess = second || first;

        if (bestGuess) {
          UNITS_INDEX[cleanText(row[0])] = bestGuess;

          // Updating conversion table
          const unit = cleanText(row[3]),
                factor = cleanNumber(cleanText(row[4])),
                note = cleanText(row[5]);

          if (unit && factor) {
            const hashedKey = `${bestGuess}[->]${unit}`,
                  conversion = CONVERSION_TABLE[hashedKey];

            if (!conversion) {
              CONVERSION_TABLE[hashedKey] = {
                from: bestGuess,
                to: unit,
                factor
              };

              if (note)
                CONVERSION_TABLE[hashedKey].note = note;
            }
            else {
              if (conversion.factor !== factor ||
                  (note && conversion.note !== note))
                console.log('  !! Weird conversion:', conversion, factor, note);
            }
          }
        }
      });

      return next();
    });
  },

  flows(next) {
    console.log('Processing flows...');

    let readStream = fs.createReadStream(DATA_PATH + BDD_CENTRALE_PATH)
      .pipe(parseCsv({delimiter: ',', columns: true}));

    readStream = h(readStream)
      .map(l => _.mapValues(l, cleanText))
      .each(importer)
      .on('end', () => next());
  },

  externalProduct(next) {
    console.log('Processing outsider products...');

    const csvData = fs.readFileSync(DATA_PATH + BDD_OUTSIDERS, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          name: cleanText(line[0]),
          sources: line[1].trim() === '1',
          sund: line[2].trim() === '1',
          belg: line[3].trim() === '1',
          unknown: line[4].trim() === '0'
        }))
        .filter(row => !row.sources)
        .forEach(outsiderProduct);

      return next();
    });
  },

  productOrthographic(next) {
    console.log('Processing classifications...');

    console.log('  -- Products orthographic normalization');

    // Parsing orthographic corrections for products
    const csvData = fs.readFileSync(DATA_PATH + ORTHOGRAPHIC_CLASSIFICATION, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          original: cleanText(line[0]),
          modified: cleanText(line[1]),
          note: cleanText(line[2])
        }))
        .forEach(orthographicProduct);

      return next();
    });
  },

  productSimplification(next) {
    console.log('  -- Products simplification');

    // Parsing raw simplification
    const csvData = fs.readFileSync(DATA_PATH + SIMPLIFICATION, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          orthographic: cleanText(line[0]),
          simplified: cleanText(line[1])
        }))
        .forEach(simplifiedProduct);

      return next();
    });
  },


  productMedical(next) {
    console.log('  -- Products medicinal classifications');

    // Parsing various classifications
    const csvData = fs.readFileSync(DATA_PATH + MEDICINAL_CLASSIFICATIONS, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          simplified: cleanText(line[0]),
          medicinal: cleanText(line[1])//+cleanText(line[1]) > 0 ? cleanText(line[1]) : null
        }))
        .forEach(medicinalProduct);

      return next();
    });
  },

    productHamburg(next) {
    console.log('  -- Products Hamburg classifications');

    // Parsing various classifications
    const csvData = fs.readFileSync(DATA_PATH + HAMBURG_CLASSIFICATION, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          simplified: cleanText(line[0]),
          hamburg: cleanText(line[1])//+cleanText(line[1]) > 0 ? cleanText(line[1]) : null
        }))
        .forEach(hamburgProduct);

      return next();
    });
  },

   productAmeriquedunord(next) {
    console.log('  -- Products Amerique du Nord classifications');

    // Parsing various classifications
    const csvData = fs.readFileSync(DATA_PATH + AMERIQUEDUNORD_CLASSIFICATION, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          simplified: cleanText(line[0]),
          ameriquedunord: cleanText(line[1])//+cleanText(line[1]) > 0 ? cleanText(line[1]) : null
        }))
        .forEach(ameriquedunordProduct);

      return next();
    });
  },

   productEdentreaty(next) {
    console.log('  -- Products Eden Treaty classifications');

    // Parsing various classifications
    const csvData = fs.readFileSync(DATA_PATH + HAMBURG_CLASSIFICATION, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          simplified: cleanText(line[0]),
          edentreaty: cleanText(line[1])//+cleanText(line[1]) > 0 ? cleanText(line[1]) : null
        }))
        .forEach(edentreatyProduct);

      return next();
    });
  },

  countryOrthographic(next) {
    console.log('  -- Countries orthographic');

     // Parsing revised orthographic corrections for products
    const csvData = fs.readFileSync(DATA_PATH + COUNTRY_ORTHOGRAPHIC, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          original: cleanText(line[0]),
          orthographic: cleanText(line[1]),
          note: cleanText(line[2])
        }))
        .forEach(orthographicCountry);
      return next();
    });
  },
  countrySimplification(next) {
    console.log('  -- Countries simplification');

     // Parsing revised orthographic corrections for products
    const csvData = fs.readFileSync(DATA_PATH + COUNTRY_SIMPLIFICATION, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          orthographic: cleanText(line[0]),
          simplified: cleanText(line[1]),
          note: cleanText(line[2])
        }))
        .forEach(simplifiedCountry);
      return next();
    });
  },
  countryGrouped(next) {
    console.log('  -- Countries grouped');

     // Parsing revised orthographic corrections for products
    const csvData = fs.readFileSync(DATA_PATH + COUNTRY_GROUPED, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          simplified: cleanText(line[0]),
          grouped: cleanText(line[1]),
          note: cleanText(line[2])
        }))
        .forEach(groupedCountry);
      return next();
    });
  },
  countryObrien(next) {
    console.log('  -- Countries O\'brien');

     // Parsing revised orthographic corrections for products
    const csvData = fs.readFileSync(DATA_PATH + COUNTRY_OBRIEN, 'utf-8');
    parseCsv(csvData, {delimiter: ','}, function(err, data) {
      data
        .slice(1)
        .map(line => ({
          simplified: cleanText(line[0]),
          obrien: cleanText(line[1]),
          note: cleanText(line[2])
        }))
        .forEach(obrienCountry);
      return next();
    });
  }

}, err => err && console.error(err));
