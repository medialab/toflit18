/**
 * TOFLIT18 Data Model
 * ====================
 *
 * Accessing generic data from the database.
 */
import database from '../connection';
import {data as queries} from '../queries';

const Model = {

  /**
   * Directions.
   */
  directions(callback) {
    return database.cypher(queries.directions, callback);
  }
};

export default Model;
