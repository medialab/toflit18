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
          kind,
          dateMin,
          dateMax,
          productClassification,
          product
        } = params;

    const query = new Query(),
          where = new Expression(),
          matchs = [];


    // start query from country classification
    // define import export edge type filter
    let exportImportFilter = ':FROM|:TO';
    if (kind === 'import')
      exportImportFilter = ':FROM';
    else if (kind === 'export')
      exportImportFilter = ':TO';
    matchs.push(`(f:Flow)-[${exportImportFilter}]->(:Country)<-[:AGGREGATES*1..]-(cci:ClassifiedItem)<-[:HAS]-(cc:Classification)`);
    const whereCountry = new Expression('id(cc) = {classification}');
    query.params({classification});

    where.and(whereCountry);

    //-- Do we need to match a product?
    if (productClassification) {
      matchs.push('(f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(pci:ClassifiedItem)<-[:HAS]-(pc:Classification)');
      const whereProduct = new Expression('id(pc) = {productClassification}');
      query.params({productClassification});

      if (product) {
        whereProduct.and('id(pci) = {product}');
        query.params({product});
      }
      where.and(whereProduct);
    }

    if (matchs.length > 0)
      query.match(matchs);
    //restrict flows to those which has direction
    where.and('has(f.direction)');

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
