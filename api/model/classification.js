/**
 * TOFLIT18 Classification Model
 * ==============================
 *
 */
import database from '../connection';
import {classification as queries} from '../queries';

const model = {
  test(callback) {
    database.cypher(queries.test, callback);
  }
};

export default model;
