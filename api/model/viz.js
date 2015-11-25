/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import database from '../connection';
import {viz as queries} from '../queries';
import _, {groupBy} from 'lodash';

const Model = {

  /**
   * Sources per directions.
   */
  sourcesPerDirections(callback) {
    database.cypher(queries.sourcesPerDirections, function(err, result) {
      if (err) return callback(err);

      const data = _(result)
        .groupBy('direction')
        .mapValues((v, name) => {
          const values = _(v)
            .groupBy('type')
            .mapValues(type => type.map(r => _.pick(r, ['year', 'flows'])))
            .value();

          return {
            name,
            ...({local: [], national: []}),
            ...values
          };
        })
        .values()
        .value();

      return callback(null, data);
    });
  },

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
