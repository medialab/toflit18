/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import decypher from 'decypher';
import database from '../connection';
import filterItemsByIdsRegexps from './utils';

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

    //-- Do we need to match a product?
    if (productClassification) {
      match.push('(f:Flow)-[:OF]->(product)');
      where.and(new Expression('product IN products'));

      query.match('(product:Product)<-[:AGGREGATES*1..]-(pci:ClassifiedItem)<-[:HAS]-(pc:Classification)')
      const whereProduct = new Expression('id(pc) = $productClassification');
      query.params({productClassification: database.int(productClassification)});
      if (product) {
        const productFilter = filterItemsByIdsRegexps(product, 'pci')
        whereProduct.and(productFilter.expression);
        query.params(productFilter.params);
      }
      query.where(whereProduct);
      query.with('collect(product) AS products');

      query.params({productClassification: database.int(productClassification)});
    }

    //-- Do we need to match a country?
    if (countryClassification) {
      // Adding the country filter in the main query
      match.push(`(f:Flow)-[${exportImportFilterCountry}]->(country)`);
      where.and(new Expression('country IN countries'));

      query.match(`(country:Country)<-[:AGGREGATES*1..]-(cci:ClassifiedItem)<-[:HAS]-(cc:Classification)`);
      const whereCountry = new Expression('id(cc) = $countryClassification');
      query.params({countryClassification: database.int(countryClassification)});
      if (country) {
        const countryFilter = filterItemsByIdsRegexps(country, 'cci')
        whereCountry.and(countryFilter.expression);
        query.params(countryFilter.params);
      }
      query.where(whereCountry);

      if(productClassification) {
        query.with('collect(country) AS countries, products');
      }
      else {
        query.with('collect(country) AS countries');
      }
    }

    //-- Should we match a precise direction?
    if (direction && direction !== '$all$') {
      match.push(`(d:Direction)<-[${exportImportFilterDirection}]-(f:Flow)`);
      where.and('id(d) = $direction');
      query.params({direction: database.int(direction)});
    }

    //-- Do we need to match a source type
    if (sourceType) {
      match.push('(f:Flow)-[:TRANSCRIBED_FROM]->(s:Source)');

      if (sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
       where.and('s.type IN $sourceType');
       query.params({sourceType:[sourceType]});
      }
      else if (sourceType === 'National best guess') {
       where.and('s.type IN $sourceType');
       query.params({sourceType:["Objet Général", "Résumé", "National toutes directions tous partenaires", "Tableau des quantités"]});
      }
      else if (sourceType === 'Local best guess') {
       where.and('s.type IN ["Local","National toutes directions tous partenaires"] and f.year <> 1749 and f.year <> 1751');
      }
    }

    if (match.length > 0)
      query.match(match);
    else
      query.match('(f:Flow)');

    if (!where.isEmpty())
      query.where(where);

    //-- Returning data
    const shares = 'sum(value) AS value_share, sum(kg) AS kg_share, sum(litre) AS litre_share, sum(nbr) AS nbr_share';

    if (sourceType && sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
      query.with([
        'f',
        'CASE WHEN exists(f.value) AND f.value > 0 THEN 1 ELSE 0 END AS value',
        'CASE WHEN exists(f.quantity_kg) AND f.quantity_kg > 0 THEN 1 ELSE 0 END AS kg',
        'CASE WHEN exists(f.quantity_litre) AND f.quantity_litre > 0 THEN 1 ELSE 0 END AS litre',
        'CASE WHEN exists(f.quantity_nbr) AND f.quantity_nbr > 0 THEN 1 ELSE 0 END AS nbr'
      ]);
      query.return('count(f) AS count, sum(toFloat(f.value)) AS value, sum(toFloat(f.quantity_kg)) AS kg, sum(toFloat(f.quantity_nbr)) AS nbr, sum(toFloat(f.quantity_litre)) AS litre, f.year AS year,  collect(distinct(f.direction)) as nb_direction, f.sourceType, ' + shares);
      query.orderBy('f.year');
    }
    else if (sourceType === 'National best guess') {
      query.with('f.year AS year, collect(f) as flows_by_year, collect(distinct(f.sourceType)) as source_types');
      query.with('year, CASE  WHEN size(source_types)>1 and "Objet Général" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Objet Général") WHEN size(source_types)>1 and "Tableau des quantités" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Tableau des quantités") WHEN size(source_types)>1 and "Résumé" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Résumé") WHEN size(source_types)>1 and "National toutes directions tous partenaires" in source_types THEN filter(fb in flows_by_year where fb.sourceType="National toutes directions tous partenaires") ELSE flows_by_year END as flowsbyyear UNWIND flowsbyyear as fs');
      query.with([
        'year',
        'fs',
        'CASE WHEN exists(fs.value) AND fs.value > 0 THEN 1 ELSE 0 END AS value',
        'CASE WHEN exists(fs.quantity_kg) AND fs.quantity_kg > 0 THEN 1 ELSE 0 END AS kg',
        'CASE WHEN exists(fs.quantity_litre) AND fs.quantity_litre > 0 THEN 1 ELSE 0 END AS litre',
        'CASE WHEN exists(fs.quantity_nbr) AND fs.quantity_nbr > 0 THEN 1 ELSE 0 END AS nbr'
      ]);
      query.return('year, fs.sourceType, count(fs) as count, sum(toFloat(fs.value)) as value, sum(toFloat(fs.quantity_kg)) AS kg, sum(toFloat(fs.quantity_nbr)) AS nbr, sum(toFloat(fs.quantity_litre)) AS litre, collect(distinct(fs.direction)) as nb_direction, ' + shares);
      query.orderBy('year');
    }
    else if (sourceType === 'Local best guess') {
      query.with(' f.year AS year, collect(f) as flows_by_year, collect(distinct(f.sourceType)) as source_types');
      query.with(' year, CASE  WHEN size(source_types)>1 and "Local" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Local") WHEN size(source_types)>1 and "National toutes directions tous partenaires" in source_types THEN filter(fb in flows_by_year where fb.sourceType="National toutes directions tous partenaires") ELSE flows_by_year END as flowsbyyear UNWIND flowsbyyear as fs');
      query.with([
        'year',
        'fs',
        'CASE WHEN exists(fs.value) AND fs.value > 0 THEN 1 ELSE 0 END AS value',
        'CASE WHEN exists(fs.quantity_kg) AND fs.quantity_kg > 0 THEN 1 ELSE 0 END AS kg',
        'CASE WHEN exists(fs.quantity_litre) AND fs.quantity_litre > 0 THEN 1 ELSE 0 END AS litre',
        'CASE WHEN exists(fs.quantity_nbr) AND fs.quantity_nbr > 0 THEN 1 ELSE 0 END AS nbr'
      ]);
      query.return('year, fs.sourceType, count(fs) as count, sum(toFloat(fs.value)) as value, sum(toFloat(fs.quantity_kg)) AS kg, sum(toFloat(fs.quantity_nbr)) AS nbr, sum(toFloat(fs.quantity_litre)) AS litre, collect(distinct(fs.direction)) as nb_direction, ' + shares);
      query.orderBy('year');
    }
    else {
      query.with([
        'f',
        'CASE WHEN exists(f.value) AND f.value > 0 THEN 1 ELSE 0 END AS value',
        'CASE WHEN exists(f.quantity_kg) AND f.quantity_kg > 0 THEN 1 ELSE 0 END AS kg',
        'CASE WHEN exists(f.quantity_litre) AND f.quantity_litre > 0 THEN 1 ELSE 0 END AS litre',
        'CASE WHEN exists(f.quantity_nbr) AND f.quantity_nbr > 0 THEN 1 ELSE 0 END AS nbr'
      ]);
      query.return('count(f) AS count, sum(toFloat(f.value)) AS value, sum(toFloat(f.quantity_kg)) AS kg, sum(toFloat(f.quantity_nbr)) AS nbr, sum(toFloat(f.quantity_litre)) AS litre, f.year AS year,  collect(distinct(f.direction)) as nb_direction, ' + shares);
      query.orderBy('f.year');
    }

    database.cypher(query.build(), function(err, data) {

      if (err) return callback(err);

      return callback(null, data);
    });
  }
};

export default ModelCreateLine;
