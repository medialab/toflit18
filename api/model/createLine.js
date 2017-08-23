/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import decypher from 'decypher';
import database from '../connection';

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
          match = [];

    // import export
    // define import export edge type filter
    let exportImportFilterDirection = ':FROM|:TO';
    let exportImportFilterCountry = ':FROM|:TO';
    if (kind === 'import') {
      exportImportFilterDirection = ':TO';
      exportImportFilterCountry = ':FROM';
      // add a where clause an flow import index to match flows which doesn't have a country or direction link
      where.and('f.import');
    }
    else if (kind === 'export') {
      exportImportFilterDirection = ':FROM';
      exportImportFilterCountry = ':TO';
      // add a where clause an flow import index to match flows which doesn't have a country or direction link
      where.and('NOT f.import');
    }

    //-- Should we match a precise direction?
    if (direction && direction !== '$all$') {
      match.push(`(d:Direction)<-[${exportImportFilterDirection}]-(f:Flow)`);
      where.and('id(d) = {direction}');
      query.params({direction: database.int(direction)});
    }

    //-- Do we need to match a product?
    if (productClassification) {
      match.push('(f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(pci:ClassifiedItem)<-[:HAS]-(pc:Classification)');
      const whereProduct = new Expression('id(pc) = {productClassification}');
      query.params({productClassification: database.int(productClassification)});

      if (product) {
        whereProduct.and('id(pci) = {product}');
        query.params({product: database.int(product)});
      }
      where.and(whereProduct);
    }

    //-- Do we need to match a country?
    if (countryClassification) {
      // define import export edge type filter
      match.push(`(f:Flow)-[${exportImportFilterCountry}]->(c:Country)`);
      match.push('(c:Country)<-[:AGGREGATES*1..]-(cci:ClassifiedItem)<-[:HAS]-(cc:Classification)');

      const whereCountry = new Expression('id(cc) = {countryClassification}');
      query.params({countryClassification: database.int(countryClassification)});

      if (country) {
        whereCountry.and('id(cci) = {country}');
        query.params({country: database.int(country)});
      }

      where.and(whereCountry);
    }

    //-- Do we need to match a source type
    if (sourceType) {
      match.push('(f:Flow)-[:TRANSCRIBED_FROM]->(s:Source)');

      if (sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
       where.and('s.type = {sourceType}');
       query.params({sourceType});
      }
      else if (sourceType === 'National best guess') {
       where.and('s.type IN ["Objet Général", "Résumé", "National par direction", "Tableau des quantités"]');
      }
      else if (sourceType === 'Local best guess') {
       where.and('s.type IN ["Local","National par direction"] and f.year <> 1749 and f.year <> 1751');
      }
    }

    if (match.length > 0)
      query.match(match);
    else
      query.match('(f:Flow)');

    if (!where.isEmpty())
      query.where(where);

    //-- Returning data

    if (sourceType && sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
      query.return('count(f) AS count, sum(toFloat(f.value)) AS value, f.year AS year,  collect(distinct(f.direction)) as nb_direction, f.sourceType');
      query.orderBy('f.year');
    }
    else if (sourceType === 'National best guess') {
      query.with('f.year AS year, collect(f) as flows_by_year, collect(distinct(f.sourceType)) as source_types');
      query.with('year, CASE  WHEN size(source_types)>1 and "Objet Général" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Objet Général") WHEN size(source_types)>1 and "Tableau des quantités" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Tableau des quantités") WHEN size(source_types)>1 and "Résumé" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Résumé") WHEN size(source_types)>1 and "National par direction" in source_types THEN filter(fb in flows_by_year where fb.sourceType="National par direction") ELSE flows_by_year END as flowsbyyear UNWIND flowsbyyear as fs');
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

    database.cypher(query.build(), function(err, data) {

      if (err) return callback(err);

      return callback(null, data);
    });
  }
};

export default ModelCreateLine;
