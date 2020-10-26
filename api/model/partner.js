/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import decypher from "decypher";
import database from "../connection";
import filterItemsByIdsRegexps from "./utils";
import camelCase from "lodash/camelCase";

const { Expression, Query } = decypher;

//-- function to build expression for where statement for cypher query
//-- when national or local best guess selected

const ModelNetwork = {
  /**
   * Building the (directions)--(partner) network.
   */
  network(classification, params, callback) {
    const { sourceType, kind, dateMin, dateMax, productClassification, product } = params;

    const query = new Query(),
      where = new Expression(),
      match = [];

    //-- Do we need to match a product?
    if (productClassification) {
      // Adding the product filter in the main query
      match.push("(f:Flow)-[:OF]->(product)");
      where.and(new Expression("product IN products"));

      query.match("(product:Product)<-[:AGGREGATES*1..]-(pci:ClassifiedItem)<-[:HAS]-(pc:Classification)");
      const whereProduct = new Expression("pc.id = $productClassification");
      query.params({ productClassification });
      if (product) {
        const productFilter = filterItemsByIdsRegexps(product, "pci");
        whereProduct.and(productFilter.expression);
        query.params(productFilter.params);
      }
      query.where(whereProduct);
      query.with("collect(product) AS products");
    }

    // start query from partner classification
    // define import export edge type filter
    let exportImportFilter = ":FROM|:TO";
    if (kind === "import") exportImportFilter = ":FROM";
    else if (kind === "export") exportImportFilter = ":TO";
    match.push(
      `(f:Flow)-[${exportImportFilter}]->(:Partner)<-[:AGGREGATES*1..]-(cci:ClassifiedItem)<-[:HAS]-(cc:Classification)`,
    );
    const wherePartner = new Expression("cc.id = $classification");
    query.params({ classification });

    where.and(wherePartner);

    //-- Do we need to match a source type?
    if (sourceType) {
      if (!sourceType.toLowerCase().includes("best guess")) {
        match.push("(f:Flow)-[:TRANSCRIBED_FROM]->(s:Source)");
        where.and("s.type IN $sourceType");
        query.params({ sourceType: [sourceType] });
      } else {
        where.and(`f.${camelCase(sourceType)} = true`);
      }
    }

    if (match.length > 0) query.match(match);
    //restrict flows to those which has direction
    where.and("exists(f.direction)");

    if (dateMin) {
      where.and("f.year >= $flowYearMin");
      query.params({ flowYearMin: database.int(dateMin) });
    }

    if (dateMax) {
      where.and("f.year <= $flowYearMax");
      query.params({ flowYearMax: database.int(dateMax) });
    }

    if (!where.isEmpty()) query.where(where);

    query.return("cci.name as partner, f.direction AS direction, count(f) AS count, sum(f.value) AS value");

    database.cypher(query.build(), function(err, data) {
      if (err) return callback(err);
      if (!data.length) return callback(null, null);

      return callback(null, data);
    });
  },
};

export default ModelNetwork;
