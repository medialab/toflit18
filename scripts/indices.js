/* eslint no-console: 0 */
/**
 * TOFLIT18 Export Script
 * =======================
 *
 * Script aiming at exporting raw CSV data from the datascape's Neo4j database.
 */
import database from "../api/connection";
import async from "async";

console.log("Creating indices in the Neo4j database...");

const indices = [
  { type: "index", label: "Flow", property: "region" },
  { type: "index", label: "Flow", property: "partner" },
  { type: "index", label: "Flow", property: "sourceType" },
  { type: "index", label: "Flow", property: "product" },
  { type: "index", label: "Flow", property: "year" },
  { type: "index", label: "Flow", property: "import" },
  { type: "index", label: "Flow", property: "bestGuessNationalProductXPartner" },
  { type: "index", label: "Flow", property: "bestGuessNationalPartner" },
  { type: "index", label: "Flow", property: "bestGuessNationalProduct" },
  { type: "index", label: "Flow", property: "bestGuesRegionProductXPartner" },
  { type: "index", label: "Flow", property: "bestGuessNationalRegion" },
  { type: "index", label: "Source", property: "type" },
  { type: "unique", label: "User", property: "name" },
  { type: "unique", label: "Product", property: "id" },
  { type: "unique", label: "Partner", property: "id" },
  { type: "unique", label: "ClassifiedItem", property: "id" },
  { type: "unique", label: "Item", property: "id" },
  { type: "unique", label: "Classification", property: "id" },
  { type: "unique", label: "Direction", property: "id" },
];

async.eachSeries(
  indices,
  function(schema, next) {
    let query = `CREATE INDEX ON :${schema.label}(${schema.property});`;
    if (schema.type === "unique") {
      query = `CREATE CONSTRAINT ON (n:${schema.label}) ASSERT n.${schema.property} IS UNIQUE;`;
    }

    database.cypher({ query }, function(err) {
      if (err) return next(err);

      console.log(`  -- Index on :${schema.label}(${schema.property}) created!`);

      return next();
    });
  },
  function(err) {
    database.close();

    if (err) console.error(err);
  },
);
