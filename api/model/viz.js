/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import cypher from 'cypher-query';
import database from '../connection';
import {viz as queries} from '../queries';
import _ from 'lodash';

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
    const query = cypher();

    // TODO: refactor

    //-- Do we need to match both a country and a product?
    if (params.country && params.product) {
      query.start('c=node({country}), p=node({product})', {
        country: params.country,
        product: params.product
      });

      query.match('(d:Direction)<-[:FROM|:TO]-(f:Flow)');
      query.where('(f)-[:FROM|:TO]->(:Country)<-[:AGGREGATES*0..]-(c) AND (f)-[:OF]->(:Product)<-[:AGGREGATES*0..]-(p)');
    }

    //-- Do we need to match only a country
    else if (params.country) {
      query.start('c=node({country})', {country: params.country});
      query.match('(d:Direction)<-[:FROM|:TO]-(f:Flow)-[:FROM|:TO]->(:Country)<-[:AGGREGATES*0..]-(c)');
    }

    //-- Do we need to match only a product
    else if (params.product) {
      query.start('p=node({product})', {product: params.product});
      query.match('(d:Direction)<-[:FROM|:TO]-(f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*0..]-(p)');
    }

    else {
      query.match('(d:Direction)<-[:FROM|:TO]-(f:Flow)');
    }

    //-- Should we match a precise direction?
    if (params.direction && params.direction !== '$all$')
      query.where('id(d) = {direction}', {direction: params.direction});

    //-- Import/Export
    if (params.kind === 'import')
      query.where('f.import');
    else if (params.kind === 'export')
      query.where('not(f.import)');

    //-- Returning data
    query.return('count(f) AS count, sum(f.value) AS value, f.year AS year');
    query['order by']('f.year');

    database.cypher({query: query.compile(), params: query.params()}, function(err, data) {
      if (err) return callback(err);

      return callback(null, data);
    });
  },

  /**
   * Building the (directions)--(country) network.
   */
  network(classification, callback) {
    database.cypher({query: queries.network, params: {classification}}, callback);
  }
};

export default Model;
