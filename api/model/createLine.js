/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import decypher from 'decypher';
import database from '../connection';
import {tokenizeTerms} from '../../lib/tokenizer';
import {connectedComponents} from '../../lib/graph';
import config from '../../config.json';
import {viz as queries} from '../queries';
import _, {omit, values} from 'lodash';

const {Expression, Query} = decypher;

const ModelCreateLine = {

  /**
   * Line creation.
   */
  createLine(params, callback) {
    const {
      sourceType,
      direction,
      kind,
      productClassification,
      product,
      countryClassification,
      country
    } = params;

    // Building the query
    const query = new Query(),
          where = new Expression(),
          withs = [];

    //-- Do we need to match a product?
    if (productClassification) {
      query.match('(pc)-[:HAS]->(pg)-[:AGGREGATES*1..]->(pi)');

      const whereProduct = new Expression('id(pc) = {productClassification}');
      query.params({productClassification});

      if (product) {
        whereProduct.and('id(pg) = {product}');
        query.params({product});
      }

      withs.push('products');
      query.where(whereProduct);
      query.with('collect(pi.name) AS products');
    }

    //-- Do we need to match a country?
    if (countryClassification) {
      query.match('(cc)-[:HAS]->(cg)-[:AGGREGATES*1..]->(ci)');

      const whereCountry = new Expression('id(cc) = {countryClassification}');
      query.params({countryClassification});

      if (country) {
        whereCountry.and('id(cg) = {country}');
        query.params({country});
      }

      query.where(whereCountry);
      query.with(withs.concat('collect(ci.name) AS countries').join(', '));
    }

    //-- Basic match
    query.match('(f:Flow)');

    //-- Should we match a precise direction?
    if (direction && direction !== '$all$' ) {
      query.match('(d:Direction)');
      where.and('id(d) = {direction}');
      where.and('f.direction = d.name');
      query.params({direction});
    }

    //-- Import/Export
    if (kind === 'import' )
      where.and('f.import');
    else if (kind === 'export')
      where.and('not(f.import)');

    if (sourceType && sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
      where.and(`f.sourceType = "${sourceType}"`);
    }

    if (sourceType === 'National best guess') {
       where.and('f.sourceType IN ["Objet Général", "Résumé", "National par direction"]');
    }

    if (sourceType === 'Local best guess') {
       where.and('f.sourceType IN ["Local","National par direction"] and f.year <> 1749 and f.year <> 1751');
    }

    // NOTE: country must come first for cardinality reasons
    if (countryClassification) {
      where.and('f.country IN countries');
    }

    if (productClassification) {
      where.and('f.product IN products');
    }

    if (!where.isEmpty())
      query.where(where);

    //-- Returning data

    if (sourceType && sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
      query.return('count(f) AS count, sum(toFloat(f.value)) AS value, f.year AS year,  collect(distinct(f.direction)) as nb_direction, f.sourceType');
      query.orderBy('f.year');
    }
    else if (sourceType === 'National best guess') {
      query.with('f.year AS year, collect(f) as flows_by_year, collect(distinct(f.sourceType)) as source_types');
      query.with('year, CASE  WHEN size(source_types)>1 and "Objet Général" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Objet Général") WHEN size(source_types)>1 and "Résumé" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Résumé") WHEN size(source_types)>1 and "National par direction" in source_types THEN filter(fb in flows_by_year where fb.sourceType="National par direction") ELSE flows_by_year END as flowsbyyear UNWIND flowsbyyear as fs');
      query.return('year, fs.sourceType, count(fs) as count, sum(toFloat(fs.value)) as value, collect(distinct(fs.direction)) as nb_direction');
      query.orderBy('year');
    }
    else if (sourceType === 'Local best guess') {
      query.with(' f.year AS year, collect(f) as flows_by_year, collect(distinct(f.sourceType)) as source_types');
      query.with(' year, CASE  WHEN size(source_types)>1 and "Local" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Local") WHEN size(source_types)>1 and "National par direction" in source_types THEN filter(fb in flows_by_year where fb.sourceType="National par direction") ELSE flows_by_year END as flowsbyyear UNWIND flowsbyyear as fs');
      query.return('year, fs.sourceType, count(fs) as count, sum(toFloat(fs.value)) as value, collect(distinct(fs.direction)) as nb_direction');
      query.orderBy('year');
    }
    else {
      query.return('count(f) AS count, sum(toFloat(f.value)) AS value, f.year AS year,  collect(distinct(f.direction)) as nb_direction');
      query.orderBy('f.year');
    }

    console.log("query.build()", query.build())
    database.cypher(query.build(), function(err, data) {

      if (err) return callback(err);

      return callback(null, data);
    });
  }
};

export default ModelCreateLine;
