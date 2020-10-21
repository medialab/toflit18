/**
 * TOFLIT18 Data Model
 * ====================
 *
 * Accessing generic data from the database.
 */
import database from "../connection";
import { data as queries } from "../queries";
import { sortBy, camelCase } from "lodash";
import filterItemsByIdsRegexps from "./utils";
import { interpolate, Query, Expression } from "decypher";

const Model = {
  /**
   * Directions.
   */
  directions(callback) {
    return database.cypher(queries.directions, callback);
  },

  /**
   * Source types.
   */
  sourceTypes(callback) {
    return database.cypher(queries.sourceTypes, function(err, result) {
      // add national best guess Source Type
      result.push({ type: "Best Guess national product x partner" });
      result.push({ type: "Best Guess national partner" });
      result.push({ type: "Best Guess tax department product x partner" });
      result.push({ type: "Best Guess national tax department" });
      result = sortBy(result, "type");
      if (err) return callback(err);

      return callback(
        null,
        result.map(row => row.type),
      );
    });
  },

  /**
   * Flows.
   */
  flows(params, callback) {
    const {
      sourceType,
      direction,
      kind,
      productClassification,
      product,
      partnerClassification,
      partner,
      dateMin,
      dateMax,
      valueMin,
      valueMax,
    } = params;

    // build flows query
    const query = new Query(),
      where = new Expression(),
      match = [];

    //--  import export
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
      // match.push("(f:Flow)-[:OF]->(product)");
      // where.and(new Expression("product IN products"));

      query.match(
        "(f:Flow)-[:OF]->(product:Product)<-[:AGGREGATES*1..]-(classifiedProduct:ClassifiedItem)<-[:HAS]-(pc:Classification)",
      );
      const whereProduct = new Expression("pc.id = $productClassification");
      query.params({ productClassification });
      if (product) {
        const productFilter = filterItemsByIdsRegexps(product, "classifiedProduct");
        whereProduct.and(productFilter.expression);
        query.params(productFilter.params);
      }
      query.where(whereProduct);

      query.params({ productClassification });
    }

    //-- Do we need to match a partner?
    if (partnerClassification) {
      // Adding the partner filter in the main query
      // match.push(`(f:Flow)-[${exportImportFilterPartner}]->(partner)`);
      // where.and(new Expression("partner IN partners"));

      query.match(
        `(f:Flow)-[${exportImportFilterPartner}]->(partner:Partner)<-[:AGGREGATES*1..]-(classifiedPartner:ClassifiedItem)<-[:HAS]-(cc:Classification)`,
      );
      const wherePartner = new Expression("cc.id = $partnerClassification");
      query.params({ partnerClassification });
      if (partner) {
        const partnerFilter = filterItemsByIdsRegexps(partner, "classifiedPartner");
        wherePartner.and(partnerFilter.expression);
        query.params(partnerFilter.params);
      }
      query.where(wherePartner);

      // if (productClassification) {
      //   query.with("collect(partner) AS partners, products");
      // } else {
      //   query.with("collect(partner) AS partners");
      // }
    }

    //-- Should we match a precise direction?
    if (direction && direction !== "$all$") {
      match.push(`(d:Direction)<-[${exportImportFilterDirection}]-(f:Flow)`);
      where.and("d.id = $direction");
      query.params({ direction });
    }

    //-- Do we need to match a source type
    match.push("(f:Flow)-[:TRANSCRIBED_FROM]->(s:Source)");
    if (sourceType) {
      if (!sourceType.includes("best guess")) {
        where.and("s.type IN $sourceType");
        query.params({ sourceType: [sourceType] });
      } else where.and(`f.${camelCase(sourceType)} = true`);
    }

    if (dateMin) where.and("f.");

    if (match.length > 0) query.match(match);
    else query.match("(f:Flow)");

    if (!where.isEmpty()) query.where(where);

    //-- Returning data
    const shares = "sum(value) AS value_share, sum(kg) AS kg_share, sum(litre) AS litre_share, sum(nbr) AS nbr_share";
    const fieldsDefinitions = {
      value: "toFloat(f.value)",
      kg: "toFloat(f.quantity_kg)",
      nb: "toFloat(f.quantity_nbr)",
      litre: "toFloat(f.quantity_litre)",
      year: "f.year",
      direction: "f.direction",
      sourceType: "f.sourceType",
      classifiedProduct: "classifiedProduct.name",
      classifiedPartner: "classifiedPartner.name",
      source: "s.name",
    };
    const fields = [
      "product",
      product ? "classifiedProduct" : null,
      "import",
      "year",
      "direction",
      "partner",
      partner ? "classifiedPartner" : null,
      "value",
      "source",
    ].filter(f => f);

    query.return(
      fields.map(fieldname => `${fieldsDefinitions[fieldname] || `f.${fieldname}`} as ${fieldname}`).join(", "),
    );
    query.orderBy("f.year, f.direction, f.product, f.partner");

    console.log(query.interpolate());
    return database.cypher(query.build(), function(err, result) {
      if (err) return callback(err);

      return callback(null, result);
    });
  },
};

export default Model;
