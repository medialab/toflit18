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
    console.log("params", params);

    const {
          sourceType,
          direction,
          kind,
          country, 
          dateMin,
          dateMax,
          productClassification1,
          productClassification2,
        } = params;

    const query = new Query(),
          where = new Expression(),
          withs = [];

    // START n=node({classification})
    // MATCH (n)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:Country)
    // WITH gc.name AS country, c.name AS sc
    // MATCH (f:Flow)
    // WHERE f.country = sc AND has(f.direction)
    // RETURN
    //   country,
    //   f.direction AS direction,
    //   count(f) AS count;

    // start query from country classification
    query.match('(cc)-[:HAS]->(cg)-[:AGGREGATES*0..]->(ci)');
    const whereCountry = new Expression('id(cc) = ' + classification);
    query.where(whereCountry);
    query.with('collect(ci.name) AS countries');


    if (productClassification1 && !productClassification2) {
        query.match('(pc)-[:HAS]->(pg)-[:AGGREGATES*0..]->(pi)');

        const whereProduct = new Expression('id(pc) = ' + productClassification1);
        query.where(whereProduct);
        query.with('countries, collect(pi.name) AS products');
        query.params({productClassification1});
        withs.push('products');
    }

    if (productClassification1 && productClassification2) {
        query.match('(pc1)-[:HAS]->(pg1)-[:AGGREGATES*0..]->(pi1), (pc2)-[:HAS]->(pg2)-[:AGGREGATES*0..]->(pi2)');

        const whereProduct = new Expression('id(pc1) = ' + productClassification1 + ' AND id(pc2) = ' + productClassification2);
        query.where(whereProduct);

        query.with('countries, collect(pi1.name) AS products1, collect(pi2.name) AS products2');

        query.params({productClassification1});
        query.params({productClassification2});
    }

     query.match('(f:Flow)');
     if (productClassification1 && !productClassification2) {
        where.and('f.product in products');
     }
     if (productClassification1 && productClassification2) {
        where.and('f.product in products1 AND f.product in products2');
     }
     where.and('f.country in countries AND has(f.direction)');

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

    query.return('f.country as country, f.direction AS direction, count(f) AS count');

    console.log("query.build() flowsPerYearPerDataType", query.build())
    database.cypher(query.build(), function(err, data) {
            //console.log("data", data.length);

            if (err) return callback(err);
            if (!data.length) return callback(null, null);

            return callback(null, data);
    });
  }
};

export default ModelNetwork;
