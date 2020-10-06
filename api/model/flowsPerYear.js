/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import config from "config";
import decypher from "decypher";
import database from "../connection";
import _ from "lodash";
import filterItemsByIdsRegexps from "./utils";

const { Expression, Query } = decypher;

const limits = config.get("api.limits");

const ModelFlowsPerYear = {
  /**
   * Flows per year per data type.
   */
  flowsPerYearPerDataType(dataType, params, callback) {
    const { sourceType, direction, kind, product, partner } = params;

    let { productClassification, partnerClassification } = params;

    let twofoldProduct = false,
      twofoldPartner = false;

    const query = new Query(),
      where = new Expression(),
      withs = new Set();
    // handle clasification dataType
    if (dataType !== "direction" && dataType !== "sourceType") {
      // a classification
      const [, classificationType, classificationId] = dataType.match(/([A-Za-z]+)_(\w+)/) || [];

      if (classificationType === "product") {
        productClassification = classificationId;

        if (params.productClassification) twofoldProduct = true;
      } else {
        partnerClassification = classificationId;

        if (params.partnerClassification) twofoldPartner = true;
      }

      dataType = classificationType;
    }

    //-- Do we need to match a product?
    if (productClassification && !twofoldProduct) {
      query.match("(pc:Classification)-[:HAS]->(pg:ClassifiedItem)-[:AGGREGATES*0..]->(pi)<-[:OF]-(f:Flow)");

      const whereProduct = new Expression("pc.id = $productClassification");
      query.params({ productClassification });

      if (product) {
        const productFilter = filterItemsByIdsRegexps(product, "pg");

        whereProduct.and(productFilter.expression);
        query.params(productFilter.params);
      }

      withs.add("f");
      query.where(whereProduct);

      if (dataType === "product") {
        withs.add("classificationGroupName");
        query.with("f, pg.name as classificationGroupName");
      } else {
        query.with("f");
      }
    }

    // NOTE: twofold classification
    if (productClassification && twofoldProduct) {
      query.match(
        "(pc:Classification)-[:HAS]->(pg:ClassifiedItem)-[:AGGREGATES*0..]->(pi)<-[:OF]-(f:Flow), (ppg:ClassifiedItem)-[:AGGREGATES*0..]->(pg)",
      );

      const whereProduct = new Expression("pc.id = $productClassification");
      query.params({ productClassification });

      if (product) {
        const productFilter = filterItemsByIdsRegexps(product, "ppg");

        whereProduct.and(productFilter.expression);
        query.params(productFilter.params);
      }

      withs.add("f");
      query.where(whereProduct);

      if (dataType === "product") {
        withs.add("classificationGroupName");
        query.with("f, pg.name as classificationGroupName");
      } else {
        query.with("f");
      }
    }

    //-- Do we need to match a partner?
    if (partnerClassification && !twofoldPartner) {
      query.match("(cc)-[:HAS]->(cg:ClassifiedItem)-[:AGGREGATES*0..]->(ci)-[:FROM|:TO]-(f:Flow)");
      const wherePartner = new Expression("cc.id = $partnerClassification");
      query.params({ partnerClassification });

      if (partner) {
        const partnerFilter = filterItemsByIdsRegexps(partner, "cg");

        wherePartner.and(partnerFilter.expression);
        query.params(partnerFilter.params);
      }

      query.where(wherePartner);
      withs.add("f");

      if (dataType === "partner") {
        query.with([...withs].concat("cg.name as classificationGroupName").join(", "));
        withs.add("classificationGroupName");
      } else query.with([...withs].join(", "));
    }

    // NOTE: twofold classification
    if (partnerClassification && twofoldPartner) {
      query.match(
        "(cc:Classification)-[:HAS]->(cg:ClassifiedItem)-[:AGGREGATES*0..]->(ci)-[:FROM|:TO]-(f:Flow), (ccg:ClassifiedItem)-[:AGGREGATES*0..]->(cg)",
      );
      const wherePartner = new Expression("cc.id = $partnerClassification");
      query.params({ partnerClassification });

      if (partner) {
        const partnerFilter = filterItemsByIdsRegexps(partner, "ccg");

        wherePartner.and(partnerFilter.expression);
        query.params(partnerFilter.params);
      }

      query.where(wherePartner);

      withs.add("f");

      if (dataType === "partner") {
        query.with([...withs].concat("cg.name as classificationGroupName").join(", "));
        withs.add("classificationGroupName");
      } else query.with([...withs].join(", "));
    }

    // Add a  match flow if not only done
    if (dataType === "direction" || dataType === "sourceType") query.match("(f:Flow)");

    //-- direction
    if (direction && direction !== "$all$") {
      query.match("(d:Direction)");
      where.and("d.id = $direction");
      where.and("f.direction = d.name");
      query.params({ direction });
    }

    //-- Import/Export
    if (kind === "import") where.and("f.import");
    else if (kind === "export") where.and("not(f.import)");

    if (dataType === "sourceType" || dataType === "direction") where.and(`exists(f.${dataType})`);

    where.and("f.year >= $limitMinYear");
    query.params({ limitMinYear: database.int(limits.minYear) });

    // manage special sourceType
    if (sourceType && !sourceType.includes("best guess")) {
      where.and("f.sourceType IN $sourceType");
      query.params({ sourceType: [sourceType] });
    }
    if (sourceType && sourceType.includes("best guess")) {
      where.and(`f.${_.camelCase(sourceType)} = true`);
    }

    if (!where.isEmpty()) query.where(where);

    let dataTypeField;
    // dataType resolution
    if (dataType === "sourceType" || dataType === "direction") dataTypeField = "f." + dataType;
    else dataTypeField = "classificationGroupName";

    query.return(dataTypeField + " AS dataType, count(f) AS flows, f.year AS year");
    query.orderBy("f.year, dataType");

    database.cypher(query.build(), function(err, result) {
      if (err) return callback(err);

      const data = _(result)
        .groupBy("dataType")
        .mapValues((rows, key) => {
          return {
            name: key,
            data: rows.map(e => _.pick(e, ["year", "flows"])),
          };
        })
        .values();

      return callback(null, data);
    });
  },
};

export default ModelFlowsPerYear;
