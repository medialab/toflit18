/**
 * TOFLIT18 Import Script
 * =======================
 *
 * Script aiming at importing the project's sources into a neo4j database which
 * will be used by the datascape.
 */
import seraph from 'seraph';
import {argv} from 'yargs';
import parseCsv from 'csv-parse';
import {default as h} from 'highland';
import {db as dbConfig} from '../config.json';
import fs from 'fs';

/**
 * Reading arguments
 */
const filePath = argv.file;

if (!filePath)
  throw Error('No file given.');

/**
 * Parsing the file
 */
let readStream = fs.createReadStream(filePath)
  .pipe(parseCsv({delimiter: ',', columns: true}));

readStream = h(readStream)
  // .drop(5000)
  // .take(1000)
  .each(importer);

readStream.on('end', commit);

/**
 * Main process
 */
const DB = seraph({
  server: `http://${dbConfig.host}:${dbConfig.port}`,
  user: dbConfig.user,
  pass: dbConfig.password
});

const batch = DB.batch();
batch.query('USING PERIODIC COMMIT 10000');

const indexes = {
  directions: {},
  countries: {},
  operators: {},
  products: {},
  sources: {},
  units: {}
};

function indexedNode(index, label, key, data) {
  let node = indexes[index][key];
  if (!node) {
    node = batch.save(data);
    batch.label(node, label);

    indexes[index][key] = node;
  }

  return node;
}

function importer(csvLine) {

  // Direction
  const isImport = /imp/i.test(csvLine.exportsimports);

  // Creating a flow node
  const flowNode = batch.save({
    no: +csvLine.numrodeligne,
    quantity: csvLine.quantit,
    value: +csvLine.value,
    unit_price: csvLine.prix_unitaire,

    // TODO: translate the year into computable format
    year: csvLine.year,
    import: isImport,
    sheet: +csvLine.sheet,

    // TODO: drop the unused properties
    remarks: csvLine.remarks
  });
  batch.label(flowNode, 'Flow');

  // Operator
  if (csvLine.dataentryby) {
    const operatorNode = indexedNode('operators', 'Operator', csvLine.dataentryby, {
      name: csvLine.dataentryby
    });

    batch.relate(flowNode, 'TRANSCRIBED_BY', operatorNode);
  }

  // Source
  if (csvLine.source) {
    const sourceNode = indexedNode('sources', 'Source', csvLine.source, {
      name: csvLine.source,
      path: csvLine.sourcepath,
      type: csvLine.sourcetype
    });

    batch.relate(flowNode, 'TRANSCRIBED_FROM', sourceNode);
  }

  // Product
  if (csvLine.marchandises) {
    const productNode = indexedNode('products', 'Product', csvLine.marchandises, {
      name: csvLine.marchandises
    });

    batch.relate(flowNode, 'OF', productNode);
  }

  // Direction
  if (csvLine.direction) {
    const directionNode = indexedNode('directions', 'Direction', csvLine.direction, {
      name: csvLine.direction
    });

    if (isImport)
      batch.relate(flowNode, 'FROM', directionNode);
    else
      batch.relate(flowNode, 'TO', directionNode);
  }

  // Country
  if (csvLine.pays) {
    const countryNode = indexedNode('countries', 'Country', csvLine.pays, {
      name: csvLine.pays
    });

    if (!isImport)
      batch.relate(flowNode, 'FROM', countryNode);
    else
      batch.relate(flowNode, 'TO', countryNode);
  }

  // Units
  if (csvLine.quantity_unit) {
    const productNode = indexedNode('units', 'Unit', csvLine.quantity_unit, {
      name: csvLine.quantity_unit
    });

    batch.relate(flowNode, 'VALUE_IN', productNode);
  }

  // TODO: don't process when value is null
  // TODO: bureaux
  // TODO: origin
  // TODO: normalize unit_price
}

function commit() {
  console.log('Committing to the database...');

  batch.commit(function(err) {
    if (err) return console.error(err);
    console.log('Done!');
  });
}
