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
          product,
          dataType
        } = params;

    const query = new Query(),
          where = new Expression(),
          withs = [];

    console.log("product", product);

    // start query from country classification
    query.match('(cc)-[:HAS]->(cg)-[:AGGREGATES*0..]->(ci)');
    const whereCountry = new Expression('id(cc) = ' + classification);
    query.where(whereCountry);
    query.with('collect(ci.name) AS countries');

    if (productClassification) {
        query.match('(pc)-[:HAS]->(pg)-[:AGGREGATES*0..]->(pi)');

        const whereProduct = new Expression('id(pc) = ' + productClassification);
        query.params({productClassification});

        if (product) {
          console.log("product -----", product)
          whereProduct.and('id(pg) = ' + product);
          query.params({product});
        }

        withs.push('products');
        query.where(whereProduct);
        query.with('countries, collect(pi.name) AS products');
    }

     query.match('(f:Flow)');
     if (productClassification) {
        where.and('f.product in products');
     }
     where.and('f.country in countries');

     if (dataType)
      where.and('has(f.direction)');

    //-- Import/Export
    if (kind === 'import')
        where.and('f.import');
    else if (kind === 'export')
        where.and('not(f.import)');

    if (dateMin)
        where.and('f.year >= ' + dateMin);

    if (dateMax)
        where.and('f.year <= ' + dateMax);

    if (!where.isEmpty())
        query.where(where);

    query.return('f.country as country, f.direction AS direction, count(f) AS count, sum(f.value) AS value');

    console.log("query", query.build());
    database.cypher(query.build(), function(err, data) {

            if (err) return callback(err);
            if (!data.length) return callback(null, null);

            return callback(null, data);
    });
  }
};

export default ModelNetwork;
