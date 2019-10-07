/* eslint no-console: 0 */
/**
 * TOFLIT18 Import Script
 * =======================
 *
 * Script aiming at importing the project's sources into a neo4j database which
 * will be used by the datascape.
 */
import config from 'config';
import {argv} from 'yargs';
import async from 'async';
import {parse as parseCsv, stringify as stringifyCsv} from 'csv';
import parseSync from 'csv-parse/lib/sync';
import {default as h} from 'highland';
import {hash} from '../lib/crypto';
import {normalizeYear} from '../lib/republican_calendar';
import {cleanText, cleanNumber} from '../lib/clean';
import path from 'path';
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
      BDD_CENTRALE_PATH = path.join(ROOT_PATH, '/bdd_centrale.csv'),
      BDD_OUTSIDERS = path.join(ROOT_PATH, '/marchandises_sourcees.csv'),
      BDD_DIRECTIONS = path.join(ROOT_PATH, '/bdd_directions.csv'),
      // classifications index
      INDEX_CLASSIFICATIONS = path.join(ROOT_PATH, '/classifications_index.csv');

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
  'originalDirection',
  'country',
  'sourceType',
  'product'
];

const NODE_PROPERTIES_MAPPING = _(POSSIBLE_NODE_PROPERTIES)
  .map((p, i) => [p.split(':')[0], i])
  .fromPairs()
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

    const outputDirectory = argv.output || argv.o || './.output';

    const nodesWriteStream = fs.createWriteStream(path.join(outputDirectory, 'nodes.csv'), 'utf-8'),
          edgesWriteStream = fs.createWriteStream(path.join(outputDirectory, 'edges.csv'), 'utf-8');

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
    this.edgesStream.write([':START_ID', ':END_ID', ':TYPE', 'line:string', 'sheet:int']);
  }

  save(data, label) {
    const row = _({})
      .assign(_.mapValues(NODE_PROPERTIES_MAPPING, () => ''))
      .assign(data)
      .toPairs()
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

// Indexes
const INDEXES = {
  directions: {},
  country: {},
  offices: {},
  operators: {},
  origins: {},
  product: {},
  sources: {}
};

const DIRECTIONS_INDEX = {};

const OUTSIDER_INDEXES = {
  sund: {},
  belg: {},
  unknown: {}
};

const EDGE_INDEXES = {
  offices: new Set()
};

// loading classification index
const csvData = fs.readFileSync(DATA_PATH + INDEX_CLASSIFICATIONS, 'utf-8');
let classificationsIndex = parseSync(csvData, {delimiter: ',', columns: true});

const slugifyClassif = classification => `${classification.model}_${classification.slug}`;

const CLASSIFICATION_NODES = {};
// building the tree to set the right process order
const children = {};
const roots = [];
const classificationBySlug = {};
classificationsIndex.forEach(classification => {
    CLASSIFICATION_NODES[slugifyClassif(classification)] = BUILDER.save({
    name: classification.name,
    model: classification.model,
    slug: classification.slug,
    description: classification.description,
    source: classification.slug === 'source' ? 'true' : ''
  }, 'Classification');
  if (classification.slug === 'source')
    roots.push(slugifyClassif(classification));
  else
    children[`${classification.model}_${classification.parentSlug}`] = (children[`${classification.model}_${classification.parentSlug}`] || []).concat(slugifyClassif(classification));
  classificationBySlug[slugifyClassif(classification)] = classification;
});

// reorder classifications by depth from root to leaf order in the classif tree.
classificationsIndex = _.flatten(roots.map(r => {
  let cs = children[r];
  let orderedClassif = [];
  // iterate through the tree by depth
  while (cs && cs.length > 0) {
    // store current children
    orderedClassif = orderedClassif.concat(cs);
    // get grand children if exist
    cs = cs ? _.flatten(cs.map(c => children[c]).filter(e => e)) : undefined;
  }
  return [r].concat(_.flatten(orderedClassif)).map(s => classificationBySlug[s]);
}));


// create authors
const CLASSIFICATION_AUTHORS = {};
_.uniq(classificationsIndex.map(c => c.author)).forEach(a => {
  CLASSIFICATION_AUTHORS[a] = BUILDER.save({
    name: a,
    password: hash(config.get('api.secret'))
  }, 'User');
});


const CLASSIFICATION_INDEXES = {};

classificationsIndex.forEach(c => {
  BUILDER.relate(CLASSIFICATION_NODES[slugifyClassif(c)], 'CREATED_BY', CLASSIFICATION_AUTHORS[c.author]);
  CLASSIFICATION_INDEXES[slugifyClassif(c)] = {};
  if (c.slug !== 'source') {
    BUILDER.relate(CLASSIFICATION_NODES[slugifyClassif(c)], 'BASED_ON', CLASSIFICATION_NODES[`${c.model}_${c.parentSlug}`]);
  }
});

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

// helper
// we want every product to have their first letter capitalized and leave the rest as in the source
const capitalizeProduct = p => _.capitalize(p[0]) + p.slice(1, p.length);

/**
 * Consuming the flows.
 */
function importer(csvLine) {

  // Handling double accounts
  if (csvLine.doubleaccounts && +csvLine.doubleaccounts > 1)
    return;

  //Patching directions names
  const originalDirection = csvLine.direction;

  let direction = DIRECTIONS_INDEX[originalDirection];

  if (!!originalDirection && !direction) {
    direction = originalDirection;
    console.log('  !! Could not find simplified direction for:', originalDirection, 'In file:', csvLine.sourcepath);
  }

  // Import or Export
  const isImport = /(imp|sortie)/i.test(csvLine.exportsimports);

  // Creating a flow node
  const nodeData = {
    rawYear: csvLine.year,
    import: '' + isImport,
  };


  // Year
  if (csvLine.year) {
    if (/semestre/.test(csvLine.year)) {
      nodeData.year = csvLine.year.split('-')[0];
    }
    else if (csvLine.year === '10 mars-31 décembre 1787') {
      nodeData.year = 1787;
    }
    else if (/\-/.test(csvLine.year)) {
      const min = csvLine.year.split('-')[0];
      nodeData.year = normalizeYear(min);
    }
    else {
      nodeData.year = normalizeYear(csvLine.year);
    }
  }
  if (isNaN(nodeData.year)) {
    console.error(`${csvLine.year} is not a year`);
    console.error(csvLine);
    return;
  }
  // Unit
  if (csvLine.quantity_unit) {
    nodeData.rawUnit = csvLine.quantity_unit;

    // NOTE: this will now be processed by a separate script
    // const normalized = UNITS_INDEX[nodeData.rawUnit];

    // if (normalized)
    //   nodeData.unit = normalized;
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
  if (direction)
    nodeData.direction = direction;
  if (originalDirection)
    nodeData.originalDirection = originalDirection;

  if (csvLine.marchandises) {
    // we want every product name to be have a capital on the first letter
    nodeData.product = capitalizeProduct(csvLine.marchandises);
  }
  if (csvLine.sourcetype)
    nodeData.sourceType = csvLine.sourcetype;

  // Here, we filter some lines deemed irrelevant
  if (!nodeData.value && !nodeData.quantity && !nodeData.unitPrice)
    return;

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
      line: '' + csvLine.numrodeligne,
      sheet: +csvLine.sheet
    });
  }

  // Product
  if (csvLine.marchandises) {
    const product = capitalizeProduct(csvLine.marchandises);
    const alreadyLinked = INDEXES.product[product];

    const productNode = indexedNode(INDEXES.product, ['Product', 'Item'], product, {
      name: product
    });

    BUILDER.relate(flowNode, 'OF', productNode);

    if (!alreadyLinked)
      BUILDER.relate(CLASSIFICATION_NODES.product_source, 'HAS', productNode);
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

    if (!isImport)
      BUILDER.relate(flowNode, 'FROM', officeNode);
    else
      BUILDER.relate(flowNode, 'TO', officeNode);

    if (direction && !EDGE_INDEXES.offices.has(csvLine.bureaux)) {
      const directionNode = indexedNode(INDEXES.directions, 'Direction', direction, {
        name: direction
      });

      BUILDER.relate(directionNode, 'GATHERS', officeNode);
      EDGE_INDEXES.offices.add(csvLine.bureaux);
    }
  }

  // Direction
  if (direction) {
    const directionNode = indexedNode(INDEXES.directions, 'Direction', direction, {
      name: direction
    });

    if (!isImport)
      BUILDER.relate(flowNode, 'FROM', directionNode);
    else
      BUILDER.relate(flowNode, 'TO', directionNode);
  }

  // Country
  if (csvLine.pays) {
    const alreadyLinked = INDEXES.country[csvLine.pays];

    const countryNode = indexedNode(INDEXES.country, ['Country', 'Item'], csvLine.pays, {
      name: csvLine.pays
    });

    if (isImport)
      BUILDER.relate(flowNode, 'FROM', countryNode);
    else
      BUILDER.relate(flowNode, 'TO', countryNode);

    if (!alreadyLinked)
      BUILDER.relate(CLASSIFICATION_NODES.country_source, 'HAS', countryNode);
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

      if (source === 'unknown' && INDEXES.product[name])
        return;

      const preexisting = !!INDEXES.product[name];

      const node = indexedNode(
        INDEXES.product,
        ['Item', 'Product', 'OutsiderItem', 'OutsiderProduct'],
        name,
        nodeData
      );

      // Linking to the source only if not preexisting
      if (!preexisting)
        BUILDER.relate(CLASSIFICATION_NODES.product_source, 'HAS', node);

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
    if (!group || !item || group.trim().toLowerCase() === '[vide]' || item.trim().toLowerCase() === '[vide]') {
      return;
    }

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

/**
 * Process
 * ========
 *
 * Reading the multiple CSV file and parsing them accordingly in order to create
 * the graph.
 */
async.series({

  directions(next) {
    console.log('Processing directions...');

    const csvDirections = fs.readFileSync(DATA_PATH + BDD_DIRECTIONS, 'utf-8');
    parseCsv(csvDirections, {delimiter: ','}, function(err, data) {

      data.forEach(row => {
        if (_.some(row, e => e.trim().toLowerCase() === '[vide]'))
          return;
        const sourceDirection = cleanText(row[0]),
              targetDirection = cleanText(row[1]);

        DIRECTIONS_INDEX[sourceDirection] = targetDirection;
      });

      return next();
    });
  },

  flows(next) {
    console.log('Processing flows...');

    const readStream = fs.createReadStream(DATA_PATH + BDD_CENTRALE_PATH)
      .pipe(parseCsv({delimiter: ',', columns: true}));

    h(readStream)
      .map(l => _.mapValues(l, cleanText))
      .each(importer)
      .on('end', () => next());
  },

  externalProduct(next) {
    console.log('Processing outsider products...');

    const csvOutsiders = fs.readFileSync(DATA_PATH + BDD_OUTSIDERS, 'utf-8');
    parseCsv(csvOutsiders, {delimiter: ','}, function(err, data) {
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

  classification(next) {
    console.log('Processing classifications...');
    async.series(classificationsIndex.filter(c => c.slug !== 'source').map(c => {
      return cb => {
        console.log(`  --  ${c.model} ${c.name}`);
        const consumer = makeClassificationConsumer(
          CLASSIFICATION_INDEXES[slugifyClassif(c)],
          CLASSIFICATION_NODES[slugifyClassif(c)],
          CLASSIFICATION_NODES[`${c.model}_${c.parentSlug}`],
          c.parentSlug === 'source' ? INDEXES[c.model] : CLASSIFICATION_INDEXES[`${c.model}_${c.parentSlug}`],
          'group', // column name for group
          'entity', // column name for entities
          {shouldTakeNote: true}
        );
        const csvClassification = fs.readFileSync(path.join(DATA_PATH, ROOT_PATH, `classification_${c.model}_${c.slug}.csv`), 'utf-8');
        parseCsv(csvClassification, {delimiter: ',', columns: true}, function(err, data) {
          data
            .map(line => ({
              entity: cleanText(line[c.parentSlug]),
              group: cleanText(line[c.slug]),
              note: cleanText(line.note ? line.note : '')
            }))
            .forEach(consumer);

          return cb();
        });
      };
    }), e => {
      next(e);
    });
  }
}, err => err && console.error(err));
