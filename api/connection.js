/**
 * TOFLIT18 Database Connection
 * =============================
 *
 * Connection to the project's Neo4j database.
 */
import {db as config} from '../config.json';
const neo4j = require('neo4j-driver').v1;

// Authentication
const auth = neo4j.auth.basic(config.user, config.password);

// Driver
const driver = neo4j.driver(`bolt://${config.host}:${config.port}`, auth);

driver.onError = err => {
  console.error('Neo4j driver error', err);
  process.exit(1);
};

// Database abstraction
const DB = {
  cypher(body, callback) {
    let query,
        params = {};

    if (typeof body === 'string') {
      query = body;
    }
    else {
      query = body.query;
      params = body.params;
    }

    const session = driver.session('READ');

    return session
      .run(query, params)
      .then(result => {
        session.close();
        return callback(null, result.records.map(record => record.toObject()));
      })
      .catch(err => callback(err));
  }
};


export default DB;
