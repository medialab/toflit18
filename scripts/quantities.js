/* eslint no-console: 0 */
/**
 * TOFLIT18 Quantities Script
 * ===========================
 *
 * Script meant to be run after the import in the Neo4j database. Its goal is
 * to process the quantities normalizations and compute some values for the
 * visualizations.
 */
import {argv} from 'yargs';
import async from 'async';
import path from 'path';
import fs from 'fs';
import Index from 'mnemonist/index';
import {parse as parseCSV} from 'csv';
import database from '../api/connection';
import {cleanText, cleanNumber} from '../lib/clean';

/**
 * Reading arguments.
 */
const DATA_PATH = argv.path || argv.p;

if (!DATA_PATH)
  throw Error('No data path provided.');

console.log('Reading csv files from "' + DATA_PATH + '"');

/**
 * Queries.
 */
const QUERY_GET_FLOWS = `
  MATCH
    (:Classification {model: "product", slug: "simplification"})-[:HAS]->()-[:AGGREGATES*1..]->(p:Product)<-[:OF]-(f:Flow),
    (:Classification {model: "country", slug: "grouping"})-[:HAS]->()-[:AGGREGATES*1..]->(c:Country)<-[:FROM|:TO]-(f)
  WHERE exists(f.rawUnit)
  RETURN
    id(f) AS id,
    f.rawUnit AS rawUnit,
    f.direction AS direction,
    f.import AS import,
    p.name AS simplifiedProduct,
    c.name AS countryGrouping;
`;

const QUERY_UPDATE_FLOWS = `
  UNWIND {batch} AS row
  MATCH (f)
  WHERE id(f) = row.id
  SET f += row.properties;
`;

/**
 * Constants.
 */
const METRICS_FILE_LEVEL1 = path.join(DATA_PATH, 'base', 'Units_Normalisation_Orthographique.csv'),
      METRICS_FILE_LEVEL2 = path.join(DATA_PATH, 'base', 'Units_Normalisation_Metrique1.csv'),
      METRICS_FILE_LEVEL3 = path.join(DATA_PATH, 'base', 'Units_Normalisation_Metrique2.csv');

const PARSING_OPTIONS = {
  delimiter: ',',
  columns: true
};

const NONE = '[&NONE&]';

const HASH_LEVEL3_ADD = data => {
  return [
    data.import,
    data.ortho,
    data.countryGrouping || NONE,
    data.simplifiedProduct || NONE,
    data.direction || NONE
  ].join('§|§').toLowerCase();
};

const HASH_LEVEL3_GET = data => {
  return [
    data.import,
    data.unit,
    data.countryGrouping,
    data.simplifiedProduct,
    data.direction
  ].join('§|§').toLowerCase();
};

const INDEX_LEVEL1 = new Map(),
      INDEX_LEVEL2 = new Map(),
      INDEX_LEVEL3 = new Index([HASH_LEVEL3_ADD, HASH_LEVEL3_GET]);

const UPDATE_BATCH = [];

const IMPORT_REGEX = /imp/i;

/**
 * State.
 */
let LEVEL2_MATCHES = 0,
    LEVEL3_MATCHES = 0;

/**
 * Process outline.
 */
async.series({
  readCsvFiles: next => {
    return async.parallel({

      // First level: only normalize unit name
      level1: callback => {

        const csvString = fs.readFileSync(METRICS_FILE_LEVEL1, 'utf-8');

        return parseCSV(csvString, PARSING_OPTIONS, (err, lines) => {
          if (err)
            return callback(err);

          lines.forEach(line => {
            const data = {
              name: cleanText(line.quantity_unit),
              ortho: cleanText(line.quantity_unit_ortho)
            };

            INDEX_LEVEL1.set(data.name, data);
          });

          return callback();
        });
      },

      // Second level: unit name + product name
      level2: callback => {

        const csvString = fs.readFileSync(METRICS_FILE_LEVEL2, 'utf-8');

        return parseCSV(csvString, PARSING_OPTIONS, (err, lines) => {
          if (err)
            return callback(err);

          lines.forEach(line => {

            // Filtering empty lines
            if (!line.u_conv || !line.q_conv)
              return;

            const data = {
              ortho: cleanText(line.quantity_unit_ortho),
              normalized: cleanText(line.u_conv),
              factor: cleanNumber(line.q_conv)
            };

            if (!data.factor) {
              console.error(line, data);
              throw new Error('Error while processing factor.');
            }

            INDEX_LEVEL2.set(data.ortho, data);
          });

          return callback();
        });
      },

      // Third level: unit name + product name + location
      level3: callback => {
        const csvString = fs.readFileSync(METRICS_FILE_LEVEL3, 'utf-8');

        return parseCSV(csvString, PARSING_OPTIONS, (err, lines) => {
          if (err)
            return callback(err);

          lines.forEach(line => {

            // Filtering empty lines
            if (!line.u_conv || !line.q_conv)
              return;

            const data = {
              ortho: cleanText(line.quantity_unit_ortho),
              normalized: cleanText(line.u_conv),
              factor: cleanNumber(line.q_conv),
              import: IMPORT_REGEX.test(line.exportsimports),
              countryGrouping: cleanText(line.pays_grouping),
              direction: cleanText(line.direction),
              simplifiedProduct: cleanText(line.marchandises_simplification)
            };

            if (!data.factor) {
              console.error(line, data);
              throw new Error('Error while processing factor.');
            }

            INDEX_LEVEL3.add(data);
          });

          return callback();
        });
      }
    }, next);
  },
  processNormalizedUnits: next => {

    // Retrieving flows
    console.log('Retrieving flows...');
    return database.cypher(QUERY_GET_FLOWS, (err, rows) => {
      if (err)
        return next(err);

      for (let i = 0, l = rows.length; i < l; i++) {
        const row = rows[i];

        if (i % 5000 === 0)
          console.log(`  Processed ${i} out of ${l} flows.`);

        // 1) First we need to normalize the unit
        const level1Data = INDEX_LEVEL1.get(row.rawUnit);
        row.unit = level1Data ? level1Data.ortho : row.rawUnit;

        // 2) We try to solve level 3
        const level3Data = INDEX_LEVEL3.get(row);

        if (level3Data) {
          LEVEL3_MATCHES++;

          continue;
        }

        // 3) We try to solve level 2
        const level2Data = INDEX_LEVEL2.get(row.rawUnit);

        if (level2Data) {
          LEVEL2_MATCHES++;

          continue;
        }
      }

      return next();
    });
  }
}, err => {
  database.close();

  if (err)
    return console.error(err);

  console.log(`${LEVEL2_MATCHES} level 2 matches.`);
  console.log(`${LEVEL3_MATCHES} level 3 matches.`);
  console.log('Done!');
});
