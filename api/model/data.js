/**
 * TOFLIT18 Data Model
 * ====================
 *
 * Accessing generic data from the database.
 */
import database from "../connection";
import { data as queries } from "../queries";
import { sortBy, camelCase, capitalize } from "lodash";
import filterItemsByIdsRegexps from "./utils";
import { interpolate, Query, Expression } from "decypher";


function addClassificationFilter(model, classificationVariable, classification, itemVariable, itemValues) {
  const match = `(f:Flow)-[${model == 'product' ? ':OF' : ':FROM|:TO'}]->(${model}:${capitalize(model)})<-[:AGGREGATES*1..]-(${itemVariable}:ClassifiedItem)<-[:HAS]-(${classificationVariable}:Classification)`;
  const where = new Expression(`${classificationVariable}.id = $${classificationVariable}`);
  let params ={ [classificationVariable]:classification };
  if (itemValues) {
    const filter = filterItemsByIdsRegexps(itemValues, itemVariable);
    where.and(filter.expression);
    params = {...params, ...filter.params};
  }
  return {match, where, params}
}
function retrieveClassificationNodes(model, classificationVariable, classification, itemVariable) {
  let optionalMatch, where, params = null;
  if (!["product_source", "partner_source"].includes(classification)){
    optionalMatch = `(f:Flow)-[${model == 'product' ? ':OF' : ':FROM|:TO'}]->(:${capitalize(model)})<-[:AGGREGATES*1..]-(${itemVariable}:ClassifiedItem)<-[:HAS]-(${classificationVariable}:Classification)`;
    where = new Expression(`${classificationVariable}.id = $${classificationVariable}`);
    params ={ [classificationVariable]:classification };
  }
  else 
    optionalMatch = `(f:Flow)-[${model == 'product' ? ':OF' : ':FROM|:TO'}]->(${itemVariable}:${capitalize(model)})`;

  return {optionalMatch, where, params}
}

const flowsQuery = (params) => {
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
    columns
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

  //-- Do we need to filter by a product?
  if (productClassification) {
    const {match, where, params} = addClassificationFilter("product",'pc',productClassification, productClassification, product)
    query.match(match)
    query.where(where);
    query.params(params);
  }

  //-- Do we need to filter by a partner?
  if (partnerClassification) {
    const {match, where, params} = addClassificationFilter("partner",'cc',partnerClassification, partnerClassification, partner)
    query.match(match)
    query.where(where);
    query.params(params);
  }


  //-- Should we match a precise direction?
  if (direction && direction !== "$all$") {
    match.push(`(d:Direction)<-[${exportImportFilterDirection}]-(f:Flow)`);
    where.and("d.id = $direction");
    query.params({ direction });
  }

  //-- Do we need to match a source type
  match.push("(f:Flow)-[trans:TRANSCRIBED_FROM]->(s:Source)");
  if (sourceType) {
    if (!sourceType.toLowerCase().includes("best guess")) {
      where.and("s.type IN $sourceType");
      query.params({ sourceType: [sourceType] });
    } else where.and(`f.${camelCase(sourceType)} = true`);
  }

  if (dateMin) { 
    where.and("f.year >= $dateMin");
    query.params({dateMin: +dateMin})
  }
  if (dateMax) { 
    where.and("f.year <= $dateMax");
    query.params({dateMax: +dateMax})
  }
  if (valueMin) { 
    where.and("f.value >= $valueMin");
    query.params({valueMin: +valueMin})
  }
  if (valueMax) { 
    where.and("f.value <= $valueMax");
    query.params({valueMax: +valueMax})
  }

  if (match.length > 0) query.match(match);
  else query.match("(f:Flow)");

  if (!where.isEmpty()) query.where(where);

  return query;
}

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
  countFlows(params, callback) {
    
    const query = flowsQuery(params);
    
    //-- Returning data
    query.return("count(f) as nbFlows");

    return database.cypher(query.build(), function(err, result) {
      if (err) return callback(err);

      return callback(null, result);
    });
  },
  flows(params, callback) {
    
    const query = flowsQuery(params);
    const {
      sourceType,
      direction,
      kind,
      productClassification,
      product,
      partnerClassification,
      partner,
      limit,
      skip,
      orders,
      columns
    } = params;
    //-- Returning data
    
    const fieldsDefinitions = (fieldname) => {
      const fields = {
      kg: "f.quantity_kg",
      nb: "f.quantity_nbr",
      litre: "f.quantity_litre",
      source: "s.name",
      path: "s.path",
      sheet: "trans.sheet",
      line: "trans.line"
      };
      // first option, special cases listed in fields
      if (fields[fieldname]) return fields[fieldname];
      // second option, classification cases 
      if (fieldname.startsWith('product_') || fieldname.startsWith('partner_')) return `${fieldname}.name`;
      // finally let's try a flow metadata
      return `f.${fieldname}`; 
    };
    const fields = columns && columns.length > 0 ? columns : ['product', 'value'];
      // should we match classification to feed columns
    fields.filter(n => n.startsWith('product_') || n.startsWith('partner_')).forEach((c,i)=>{
      const model = c.split('_')[0];
      const {optionalMatch, where, params} = retrieveClassificationNodes(model,`classif${i}`,c, c);
      if (optionalMatch)
        query.optionalMatch(optionalMatch)
      if (where)
        query.where(where);
      if(params)
        query.params(params);
    })

    query.return(
      fields.map(fieldname => `${fieldsDefinitions(fieldname)} as ${fieldname}`).join(", "),
    );
    if (orders && orders.length > 0)
     query.orderBy(orders.map(s => {
      //don't clean text on numbers...
      if (['value', 'kg', 'nb', 'litre', 'unitPrice', 'import'].includes(s.key))
        return `${fieldsDefinitions(s.key)} ${s.order}`
      else
        return  `apoc.text.clean(${fieldsDefinitions(s.key)}) ${s.order}`}).join(', '));
    if (skip) query.skip(''+skip);
    if (limit) query.limit(''+limit);
    return database.cypher(query.build(), function(err, result) {
      if (err) return callback(err);

      return callback(null, result.map((row,i) => ({rowIndex:(skip||0)+i+1, ...row})));
    });
  },
    /**
   * Commits.
   */
  lastCommits(callback) {
    return database.cypher(queries.lastCommits, callback);
  },
};

export default Model;
