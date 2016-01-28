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
  },

  /**
   * Source types.
   */
  sourceTypes(callback) {
    return database.cypher(queries.sourceTypes, function(err, result) {
      if (err) return callback(err);

      return callback(null, result.map(row => row.type));
    });
  }
};

export default Model;
