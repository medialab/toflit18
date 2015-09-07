/**
 * TOFLIT18 Database Connection
 * =============================
 *
 * Connection to the project's Neo4j database.
 */
import neo4j from 'neo4j';
import {db as config} from '../config.json';

const DB = new neo4j.GraphDatabase({
  auth: {
    username: config.user,
    password: config.password
  },
  url: `http://${config.host}:${config.port}`
});

export default DB;
