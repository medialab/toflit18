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
import database from '../api/connection';

/**
 * Reading arguments
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

/**
 * Process outline.
 */
async.series({
  readCsvFiles: next => {
    return async.parallel({

      // First level: only normalize unit name
      level1: callback => {
        return callback();
      },

      // Second level: unit name + product name
      level2: callback => {
        return callback();
      },

      // Third level: unit name + product name + location
      level3: callback => {
        return callback();
      }
    }, next);
  },
  processNormalizedUnits: next => {
    return next();
  }
}, err => {
  if (err)
    return console.error(err);

  console.log('Done!');
});
