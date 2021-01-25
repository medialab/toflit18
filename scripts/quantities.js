/* eslint no-console: 0 */
/**
 * TOFLIT18 Quantities Script
 * ===========================
 *
 * Script meant to be run after the import in the Neo4j database. Its goal is
 * to process the quantities normalizations and compute some values for the
 * visualizations.
 */
import { argv } from "yargs";
import async from "async";
import path from "path";
import fs from "fs";
import FuzzyMap from "mnemonist/fuzzy-map";
import { parse as parseCSV } from "csv";
import database from "../api/connection";
import { cleanText, cleanNumber } from "../lib/clean";
import { some, values } from "lodash";

/**
 * Reading arguments.
 */
const DATA_PATH = argv.path || argv.p;

if (!DATA_PATH) throw Error("No data path provided.");

console.log('Reading csv files from "' + DATA_PATH + '"');

/**
 * Queries.
 */

// TODO: remove quantity condition
const QUERY_GET_FLOWS = `
  MATCH (f:Flow)
  WHERE exists(f.rawUnit) AND exists(f.quantity)
  WITH f
  MATCH
    (pc:Classification {model: "product", slug: "simplification"}),
    (cc:Classification {model: "partner", slug: "grouping"}),
    (f)-[:OF]->(:Product)<-[:AGGREGATES*2]-(p:ClassifiedItem)<-[:HAS]-(pc),
    (f)-[:FROM|:TO]->(:Partner)<-[:AGGREGATES*3]-(c:ClassifiedItem)<-[:HAS]-(cc)
  RETURN
    id(f) AS id,
    f.rawUnit AS rawUnit,
    f.quantity AS quantity,
    f.region AS region,
    f.import AS import,
    p.name AS simplifiedProduct,
    c.name AS partnerGrouping;
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
const METRICS_FILE_ORTHOGRAPHIC = path.join(DATA_PATH, "base", "classification_quantityunit_orthographic.csv"),
  METRICS_FILE_SIMPLIFICATION = path.join(DATA_PATH, "base", "classification_quantityunit_simplification.csv"),
  METRICS_FILE_METRIC1 = path.join(DATA_PATH, "base", "classification_quantityunit_metric1.csv"),
  METRICS_FILE_METRIC2 = path.join(DATA_PATH, "base", "classification_quantityunit_metric2.csv");

const PARSING_OPTIONS = {
  delimiter: ",",
  columns: true,
};

const NONE = "[&NONE&]";

const HASH_METRIC2_ADD = data => {
  return [
    data.import,
    data.simplification,
    data.partnerGrouping || NONE,
    data.simplifiedProduct || NONE,
    data.region || NONE,
  ]
    .join("§|§")
    .toLowerCase();
};

const HASH_METRIC2_GET = data => {
  return [data.import, data.unit, data.partnerGrouping, data.simplifiedProduct, data.region || NONE]
    .join("§|§")
    .toLowerCase();
};

const INDEX_ORTHOGRAPHIC = new Map(),
  INDEX_SIMPLIFICATION = new Map(),
  INDEX_METRIC1 = new Map(),
  INDEX_METRIC2 = new FuzzyMap([HASH_METRIC2_ADD, HASH_METRIC2_GET]);

const UPDATE_BATCH = [];

const IMPORT_REGEX = /imp/i;

/**
 * State.
 */
let ORTHOGRAPHIC_MATCHES = 0,
  SIMPLIFICATION_MATCHES = 0,
  METRIC1_MATCHES = 0,
  METRIC2_MATCHES = 0;

/**
 * Process outline.
 */
async.series(
  {
    readCsvFiles: next => {
      return async.parallel(
        {
          // First normalization of unit name
          orthographic: callback => {
            const csvString = fs.readFileSync(METRICS_FILE_ORTHOGRAPHIC, "utf-8");

            return parseCSV(csvString, PARSING_OPTIONS, (err, lines) => {
              if (err) return callback(err);

              lines.forEach(line => {
                if (some(values(line), e => e.trim().toLowerCase() === "[vide]")) return;

                const data = {
                  name: cleanText(line.source),
                  orthographic: cleanText(line.orthographic),
                };

                INDEX_ORTHOGRAPHIC.set(data.name, data);
              });

              return callback();
            });
          },
          // Second normalization of unit name
          simplification: callback => {
            const csvString = fs.readFileSync(METRICS_FILE_SIMPLIFICATION, "utf-8");

            return parseCSV(csvString, PARSING_OPTIONS, (err, lines) => {
              if (err) return callback(err);

              lines.forEach(line => {
                if (some(values(line), e => e.trim().toLowerCase() === "[vide]")) return;

                const data = {
                  name: cleanText(line.orthographic),
                  simplification: cleanText(line.simplification),
                };

                INDEX_SIMPLIFICATION.set(data.name, data);
              });

              return callback();
            });
          },

          // Metric 1: unit name + product name
          metric1: callback => {
            const csvString = fs.readFileSync(METRICS_FILE_METRIC1, "utf-8");

            return parseCSV(csvString, PARSING_OPTIONS, (err, lines) => {
              if (err) return callback(err);

              lines.forEach(line => {
                // Filtering empty lines
                if (
                  !line.conv_simplification_to_metric ||
                  !line.metric ||
                  some(values(line), e => e.trim().toLowerCase() === "[vide]")
                )
                  return;

                const data = {
                  simplification: cleanText(line.simplification),
                  normalized: cleanText(line.metric),
                  factor: cleanNumber(line.conv_simplification_to_metric),
                };

                if (!data.factor) {
                  console.error(line, data);
                  throw new Error("Error while processing factor.");
                }

                INDEX_METRIC1.set(data.simplification, data);
              });

              return callback();
            });
          },

          // Metric 2 : unit name + product name + partner
          metric2: callback => {
            const csvString = fs.readFileSync(METRICS_FILE_METRIC2, "utf-8");

            return parseCSV(csvString, PARSING_OPTIONS, (err, lines) => {
              if (err) return callback(err);

              lines.forEach(line => {
                // Filtering empty lines
                if (
                  !line.conv_simplification_to_metric ||
                  !line.metric ||
                  some(values(line), e => e.trim().toLowerCase() === "[vide]")
                )
                  return;

                const data = {
                  simplification: cleanText(line.simplification),
                  normalized: cleanText(line.metric),
                  factor: cleanNumber(line.conv_simplification_to_metric),
                  import: IMPORT_REGEX.test(line.exportsimports),
                  partnerGrouping: cleanText(line.partner_grouping),
                  region: cleanText(line.tax_region),
                  simplifiedProduct: cleanText(line.product_simplification),
                };

                if (!data.factor) {
                  console.error(line, data);
                  throw new Error("Error while processing factor.");
                }

                INDEX_METRIC2.add(data);
              });

              return callback();
            });
          },
        },
        next,
      );
    },
    processNormalizedUnits: next => {
      // Retrieving flows
      console.log("Retrieving flows...");
      return database.cypher(QUERY_GET_FLOWS, (err, rows) => {
        if (err) return next(err);

        for (let i = 0, l = rows.length; i < l; i++) {
          const row = rows[i];

          if (i % 5000 === 0) console.log(`  Processed ${i} out of ${l} flows.`);

          // 1) First we need to normalize the unit
          row.unit = row.rawUnit;
          const normalizeOrtho = INDEX_ORTHOGRAPHIC.get(row.rawUnit);
          let normalizeSimpl = undefined;
          if (normalizeOrtho) {
            row.unit = normalizeOrtho.orthographic;
            normalizeSimpl = INDEX_SIMPLIFICATION.get(normalizeOrtho.orthographic);
            if (normalizeSimpl) row.unit = normalizeSimpl.simplification;
          }
          row.normalizedUnit = row.unit;

          // 2) We try to solve metric2
          const metric2Data = INDEX_METRIC2.get(row);

          if (metric2Data) {
            METRIC2_MATCHES++;

            // Updating normalized unit
            row.normalizedUnit = metric2Data.normalized;

            const update = {
              id: database.int(row.id),
              properties: {
                unit: row.unit,
                normalizedUnit: row.normalizedUnit,
              },
            };

            // Special values
            if (row.normalizedUnit === "kg") {
              update.properties.quantity_kg = row.quantity * metric2Data.factor;
            } else if (row.normalizedUnit === "pièces") {
              update.properties.quantity_nbr = row.quantity * metric2Data.factor;
            } else if (row.normalizedUnit === "litres") {
              update.properties.quantity_litre = row.quantity * metric2Data.factor;
            }

            UPDATE_BATCH.push(update);

            continue;
          }

          // 3) We try to solve level 2
          const metric1Data = INDEX_METRIC1.get(row.unit);

          if (metric1Data) {
            METRIC1_MATCHES++;

            // Updating normalized unit
            row.normalizedUnit = metric1Data.normalized;

            const update = {
              id: database.int(row.id),
              properties: {
                unit: row.unit,
                normalizedUnit: row.normalizedUnit,
              },
            };

            // Special values
            if (row.normalizedUnit === "kg") {
              update.properties.quantity_kg = row.quantity * metric1Data.factor;
            } else if (row.normalizedUnit === "pièces") {
              update.properties.quantity_nbr = row.quantity * metric1Data.factor;
            } else if (row.normalizedUnit === "litres") {
              update.properties.quantity_litre = row.quantity * metric1Data.factor;
            }

            UPDATE_BATCH.push(update);

            continue;
          }

          if ((normalizeSimpl || normalizeOrtho) && !metric2Data && !metric1Data) {
            if (normalizeSimpl) SIMPLIFICATION_MATCHES++;
            else ORTHOGRAPHIC_MATCHES++;

            UPDATE_BATCH.push({
              id: database.int(row.id),
              properties: {
                unit: row.unit,
                normalizedUnit: row.normalizedUnit,
              },
            });
          }
        }

        return next();
      });
    },
    updateDatabase: next => {
      console.log("Updating the database...");

      database.cypher({ query: QUERY_UPDATE_FLOWS, params: { batch: UPDATE_BATCH } }, next, "WRITE");
    },
  },
  err => {
    database.close();

    if (err) return console.error(err);

    console.log(`${METRIC2_MATCHES} metric 2 matches.`);
    console.log(`${METRIC1_MATCHES} metric 1 matches.`);
    console.log(`${SIMPLIFICATION_MATCHES} simplification matches.`);
    console.log(`${ORTHOGRAPHIC_MATCHES} orthographic matches.`);
    console.log("Done!");
  },
);
