/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import async from 'async';
import cypher from 'cypher-query';
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
  },

  /**
   * Line creation.
   */
  createLine(params, callback) {

    // Building the query
    const query = cypher()
      .match('(d:Direction)<-[:FROM|:TO]-(f:Flow)');

    //-- 1) Should we match a precise direction?
    if (params.direction && params.direction !== '$all$')
      query.where('id(d) = {direction}', {direction: params.direction});

    //-- 2) Returning data
    query.return('count(f) AS count, sum(f.value) AS value, f.year AS year');
    query['order by']('f.year');

    database.cypher({query: query.compile(), params: query.params()}, function(err, data) {
      if (err) return callback(err);

      return callback(null, data);
    });
  }
};

export default Model;
