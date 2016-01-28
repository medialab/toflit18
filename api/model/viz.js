/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import decypher from 'decypher';
import database from '../connection';
import {viz as queries} from '../queries';
import _ from 'lodash';

const {Query} = decypher;

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
  availableDataTypePerYear(dataType,callback) {

    const query = new Query();
    query.match('(f:Flow)');
    query.with(`collect(DISTINCT f.${dataType}) AS dataTypes, f.year AS year`);
    query.return("year, dataTypes")
    query.orderBy("year")

    database.cypher(query.build(), function(err, result) {
      if (err) return callback(err);
      return callback(null, result);
    });
  },

  /**
   * Line creation.
   */
  createLine(params, callback) {
    const {
      direction,
      kind,
      productClassification,
      product,
      countryClassification,
      country
    } = params;

    // Building the query
    const query = new Query(),
          init = query.segment(),
          withs = [],
          starts = [];

    // TODO: refactor and move to decypher?
    const Where = function() {
      this.string = '';

      this.and = function(clause) {
        if (this.string)
          this.string += ' AND ';
        this.string += clause;
      };
    };

    const where = new Where();

    //-- Do we need to match a product?
    if (productClassification) {
      starts.push('pc=node({productClassification})');
      query.match('(pc)-[:HAS]->(pg)-[:AGGREGATES*1..]->(pi)');

      if (product)
        query.where('id(pg) = {product}', {product});

      withs.push('pi');
      query.with('pi');
    }

    //-- Do we need to match a country?
    if (countryClassification) {
      starts.push('cc=node({countryClassification})');
      query.match('(cc)-[:HAS]->(cg)-[:AGGREGATES*1..]->(ci)');

      if (country)
        query.where('id(cg) = {country}', {country});

      query.with(withs.concat('ci').join(', '));
    }

    if (starts.length)
      init.start(starts, {productClassification, countryClassification});

    //-- Basic match
    query.match('(f:Flow)');

    //-- Should we match a precise direction?
    if (direction && direction !== '$all$') {
      query.match('(d:Direction)');
      where.and('id(d) = {direction}');
      where.and('f.direction = d.name');
      query.params({direction});
    }

    //-- Import/Export
    if (kind === 'import')
      where.and('f.import');
    else if (kind === 'export')
      where.and('not(f.import)');

    if (productClassification)
      where.and('f.product = pi.name');
    if (countryClassification)
      where.and('f.country = ci.name');

    query.where(where.string);

    //-- Returning data
    query.return('count(f) AS count, sum(f.value) AS value, f.year AS year');
    query.orderBy('f.year');

console.log(query.compile());
    database.cypher(query.build(), function(err, data) {
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
