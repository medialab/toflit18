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
  flowsPerYearPerDataType(dataType,callback) {

    const query = new Query();
    if(dataType==="direction"||dataType==="sourceType")
    {
      //direction or sourceType requested
      query.match("(f:Flow)")
      query.where(`has(f.${dataType})`)
      query.return(`f.${dataType} AS dataType, f.year AS year,count(f) AS flows`)
      query.orderBy(`f.year,dataType`)
    }
    else
    {
      // a classification
      const [dump,classificationType,classificationId]=dataType.match(/(\w+)_(\d+)/) || [];
      if(classificationType)
      {
        query.start(`n=node(${classificationId})`);
        query.match(`(n)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:${_.capitalize(classificationType)})`);
        query.with("gc.name AS name, c.name AS sc");
        query.match("(f:Flow)");
        query.where(`f.${classificationType} = sc`);
        query.return("name AS dataType,count(f) AS flows,f.year AS year");
        query.orderBy(`f.year,dataType`);

      }
      else
        through(new Error("wrong parameter"));
    }

    database.cypher(query.build(), function(err, result) {
      if (err) return callback(err);

      const data = _(result)
        .groupBy('dataType')
        .mapValues((dataType_values,key) => {
          return {name:key,data:dataType_values.map(e => _.pick(e,["year","flows"]))}
          })
        .values();

      return callback(null, data);
    });
  },

  /**
   * Available directions by year.
   */
  availableDataTypePerYear(dataType,callback) {

    const query = new Query();
    if(dataType==="direction"||dataType==="sourceType")
    {
      //direction or sourceType requested
      query.match('(f:Flow)');
      query.where(`has(f.${dataType})`);
      query.with(`size(collect(DISTINCT f.${dataType})) AS data, f.year AS year`);
      query.return("year, data")
      query.orderBy("year")
    }
    else
    {
      // a classification
      const [dump,classificationType,classificationId]=dataType.match(/(\w+)_(\d+)/) || [];
      if(classificationType)
      {
        query.start(`n=node(${classificationId})`);
        query.match(`(n)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:${_.capitalize(classificationType)})`);
        query.with("gc.name AS name, c.name AS sc");
        query.match("(f:Flow)");
        query.where(`f.${classificationType}=sc`);
        query.with(`size(collect(DISTINCT f.${classificationType})) AS data, f.year AS year`);
        query.return("year, data")
        query.orderBy("year")

      }
      else
        through(new Error("wrong parameter"));
    }

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

    if (where.string)
      query.where(where.string);

    //-- Returning data
    query.return('count(f) AS count, sum(f.value) AS value, f.year AS year');
    query.orderBy('f.year');

    // TODO: drop
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
