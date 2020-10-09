/* eslint no-console: 0 */
/**
 * TOFLIT18 Database Connection
 * =============================
 *
 * Connection to the project's Neo4j database.
 */
import CONFIG from "config";
import neo4j from "neo4j-driver/lib/v1";
import { Node } from "neo4j-driver/lib/v1/graph-types";
import Integer from "neo4j-driver/lib/v1/integer";

const config = CONFIG.get("db");

// Authentication
const auth = neo4j.auth.basic(config.user, config.password);

// Driver
const driver = neo4j.driver(`bolt://${config.host}:${config.port}`, auth, { disableLosslessIntegers: true });

driver.onError = err => {
  console.error("Neo4j driver error", err);
  process.exit(1);
};

// Helpers
function nodeToObject(node) {
  return {
    id: node.properties.id,
    properties: node.properties,
    labels: node.labels,
  };
}

function recordToObject(record) {
  const object = record.toObject();

  for (const k in object) {
    const value = object[k];

    if (value instanceof Node) object[k] = nodeToObject(value);
    else if (value instanceof Integer) object[k] = value.toNumber();
  }

  return object;
}

// Database abstraction
const DB = {
  close() {
    return driver.close();
  },
  cypher(body, callback, sessionType) {
    let query,
      params = {};

    if (typeof body === "string") {
      query = body;
    } else {
      query = body.query;
      params = body.params;
    }

    const session = driver.session(sessionType || "READ");

    return session
      .run(query, params)
      .then(result => {
        session.close();
        return callback(null, result.records.map(recordToObject));
      })
      .catch(err => callback(err));
  },
  int: neo4j.int,
};

export default DB;
