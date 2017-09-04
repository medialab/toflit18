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
import {cleanText} from '../lib/clean';

/**
 * Reading arguments.
 */
const DATA_PATH = argv.path || argv.p;

if (!DATA_PATH)
  throw Error('No data path provided.');

console.log('Reading csv files from "' + DATA_PATH + '"');

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

const HASH_LEVEL1 = data => `${data.ortho}`;

const INDEX_LEVEL1 = new Map(),
      INDEX_LEVEL2 = new Index(),
      INDEX_LEVEL3 = new Index();

/**
 * Queries.
 */
const QUERY_GET_FLOWS = `
  MATCH (f:Flow) WHERE exists(f.rawUnit)
  RETURN f;
`;

const QUERY_UPDATE_FLOWS = `
  UNWIND {batch} AS row
  MATCH (f)
  WHERE id(f) = row.id
  SET f += row.properties;
`;

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
            console.log(line);
          });

          return callback();
        });
      },

      // Third level: unit name + product name + location
      level3: callback => {
        return callback();
      }
    }, next);
  },
  processNormalizedUnits: next => {

    // 1 - Normalize unit
    // 2 - Solve level 2
    // 3 - Solve level 3
    // 4 - Conversion

    return next();
  }
}, err => {
  if (err)
    return console.error(err);

  console.log('Done!');
});
