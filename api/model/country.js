/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import decypher from 'decypher';
import database from '../connection';

const {Expression, Query} = decypher;

//-- function to build expression for where statement for cypher query
//-- when national or local best guess selected

const ModelNetwork = {

  /**
   * Building the (directions)--(country) network.
   */
  network(classification, params, callback) {

    const {
      sourceType,
      kind,
      dateMin,
      dateMax,
      productClassification,
      product
    } = params;

    const query = new Query(),
          where = new Expression(),
          match = [];

    // start query from country classification
    // define import export edge type filter
    let exportImportFilter = ':FROM|:TO';
    if (kind === 'import')
      exportImportFilter = ':FROM';
    else if (kind === 'export')
      exportImportFilter = ':TO';
    match.push(`(f:Flow)-[${exportImportFilter}]->(:Country)<-[:AGGREGATES*1..]-(cci:ClassifiedItem)<-[:HAS]-(cc:Classification)`);
    const whereCountry = new Expression('id(cc) = {classification}');
    query.params({classification: database.int(classification)});

    where.and(whereCountry);

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

    //-- Do we need to match a source type?
    if (sourceType) {
      match.push('(f:Flow)-[:TRANSCRIBED_FROM]->(s:Source)');

      if (sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
       where.and('s.type = {sourceType}');
       query.params({sourceType});
      }
      else if (sourceType === 'National best guess') {
       where.and('s.type IN ["Objet Général", "Résumé", "National toutes directions tous partenaires", "Tableau des quantités"]');
      }
      else if (sourceType === 'Local best guess') {
       where.and('s.type IN ["Local","National toutes directions tous partenaires"] and f.year <> 1749 and f.year <> 1751');
      }
    }

    if (match.length > 0)
      query.match(match);
    //restrict flows to those which has direction
    where.and('exists(f.direction)');

    if (dateMin)
        where.and('f.year >= ' + dateMin);

    if (dateMax)
        where.and('f.year <= ' + dateMax);

    if (!where.isEmpty())
        query.where(where);

    query.return('cci.name as country, f.direction AS direction, count(f) AS count, sum(f.value) AS value');

    database.cypher(query.build(), function(err, data) {
      if (err) return callback(err);
      if (!data.length) return callback(null, null);

      return callback(null, data);
    });
  }
};

export default ModelNetwork;
