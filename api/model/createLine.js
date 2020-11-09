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

const ModelCreateLine = {
  /**
   * Line creation.
   */
  createLine(params, callback) {
    const { sourceType, direction, kind, productClassification, product, partnerClassification, partner } = params;

    // Building the query
    const query = new Query(),
      where = new Expression(),
      match = [];

    // import export
    // define import export edge type filter
    let exportImportFilterDirection = ":FROM|:TO";
    let exportImportFilterPartner = ":FROM|:TO";
    if (kind === "import") {
      exportImportFilterDirection = ":TO";
      exportImportFilterPartner = ":FROM";
      // add a where clause an flow import index to match flows which doesn't have a partner or direction link
      where.and("f.import");
    } else if (kind === "export") {
      exportImportFilterDirection = ":FROM";
      exportImportFilterPartner = ":TO";
      // add a where clause an flow import index to match flows which doesn't have a partner or direction link
      where.and("NOT f.import");
    }

    //-- Do we need to match a product?
    if (productClassification) {
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

      query.params({ productClassification });
    }

    //-- Do we need to match a partner?
    if (partnerClassification) {
      // Adding the partner filter in the main query
      match.push(`(f:Flow)-[${exportImportFilterPartner}]->(partner)`);
      where.and(new Expression("partner IN partners"));

      query.match("(partner:Partner)<-[:AGGREGATES*1..]-(cci:ClassifiedItem)<-[:HAS]-(cc:Classification)");
      const wherePartner = new Expression("cc.id = $partnerClassification");
      query.params({ partnerClassification });
      if (partner) {
        const partnerFilter = filterItemsByIdsRegexps(partner, "cci");
        wherePartner.and(partnerFilter.expression);
        query.params(partnerFilter.params);
      }
      query.where(wherePartner);

      if (productClassification) {
        query.with("collect(partner) AS partners, products");
      } else {
        query.with("collect(partner) AS partners");
      }
    }

    //-- Should we match a precise direction?
    if (direction && direction !== "$all$") {
      match.push(`(d:Direction)<-[${exportImportFilterDirection}]-(f:Flow)`);
      where.and("d.id = $direction");
      query.params({ direction });
    }

    //-- Do we need to match a source type
    if (sourceType) {
      if (!sourceType.toLowerCase().includes("best guess")) {
        match.push("(f:Flow)-[:TRANSCRIBED_FROM]->(s:Source)");
        where.and("s.type IN $sourceType");
        query.params({ sourceType: [sourceType] });
      } else where.and(`f.${camelCase(sourceType)} = true`);
    }

    if (match.length > 0) query.match(match);
    else query.match("(f:Flow)");

    // filter out absurd values
    where.and("(NOT EXISTS(f.absurdValue) OR f.absurdValue<>'absurd')");
    where.and("(NOT EXISTS(f.absurdQuantity) OR f.absurdQuantity<>'absurd')");

    if (!where.isEmpty()) query.where(where);

    //-- Returning data
    const shares = "sum(value) AS value_share, sum(kg) AS kg_share, sum(litre) AS litre_share, sum(nbr) AS nbr_share";

    query.with([
      "f",
      "CASE WHEN exists(f.value) AND f.value > 0 THEN 1 ELSE 0 END AS value",
      "CASE WHEN exists(f.quantity_kg) AND f.quantity_kg > 0 THEN 1 ELSE 0 END AS kg",
      "CASE WHEN exists(f.quantity_litre) AND f.quantity_litre > 0 THEN 1 ELSE 0 END AS litre",
      "CASE WHEN exists(f.quantity_nbr) AND f.quantity_nbr > 0 THEN 1 ELSE 0 END AS nbr",
    ]);
    query.return(
      "count(f) AS count, sum(f.value) AS value, sum(f.quantity_kg) AS kg, sum(f.quantity_nbr) AS nbr, sum(f.quantity_litre) AS litre, f.year AS year,  collect(distinct(f.direction)) as nb_direction, f.sourceType, " +
        shares,
    );
    query.orderBy("f.year");

    database.cypher(query.build(), function(err, data) {
      if (err) return callback(err);

      return callback(null, data);
    });
  },
};

export default ModelCreateLine;
