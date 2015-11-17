/**
 * TOFLIT18 Misc Model
 * ====================
 *
 */
import database from '../connection';
import {misc as queries} from '../queries';

const Model = {

  /**
   * Available directions by year.
   */
  availableDirectionsPerYear(callback) {
    database.cypher(queries.availableDirectionsPerYear, function(err, result) {
      if (err) return callback(err);

      const data = result.map(function(row) {
        return {
          year: row.year,
          directions: row.directions.map(d => ({id: d._id, name: d.properties.name}))
        };
      });

      return callback(null, data);
    });
  }
};

export default Model;
