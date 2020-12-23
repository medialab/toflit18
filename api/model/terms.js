/**
 * TOFLIT18 Viz ModelTerms
 * =======================
 *
 */
import decypher from "decypher";
import database from "../connection";
import { UndirectedGraph } from "graphology";
import louvain from "graphology-communities-louvain";
import { tokenizeTerms } from "../../lib/tokenizer";
import _ from "lodash";

import filterItemsByIdsRegexps from "./utils";

const { Expression, Query } = decypher;

const ModelTerms = {
  terms(classification, params, callback) {
    const {
      sourceType,
      direction,
      kind,
      partner,
      child,
      dateMin,
      dateMax,
      partnerClassification,
      childClassification,
    } = params;

    const query = new Query(),
      where = new Expression(),
      match = [];

    //-- Do we need to match a partner?
    if (partnerClassification) {
      // define import export edge type filter
      let exportImportFilter = ":FROM|:TO";
      if (kind === "import") exportImportFilter = ":FROM";
      else if (kind === "export") exportImportFilter = ":TO";
      // Adding the partner filter in the main query
      match.push(`(f:Flow)-[${exportImportFilter}]->(partner)`);
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
      query.with("collect(partner) AS partners");
    }

    //-- Do we need to match a product?
    if (classification !== "product_source") {
      match.push("(f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(pci:ClassifiedItem)<-[:HAS]-(pc:Classification)");
      const whereProduct = new Expression("pc.id = $classification");
      query.params({ classification });
      where.and(whereProduct);
    } else {
      match.push("(f:Flow)-[:OF]->(pci:Product)");
    }

    //-- Should we match a precise direction?
    if (direction && direction !== "$all$") {
      // define import export edge type filter
      let exportImportFilter = ":FROM|:TO";
      if (kind === "import") exportImportFilter = ":TO";
      else if (kind === "export") exportImportFilter = ":FROM";
      match.push(`(d:Direction)<-[${exportImportFilter}]-(f:Flow)`);
      where.and("d.id = $direction");
      query.params({ direction });
    }

    //-- Do we need to match a child classification item?
    if (childClassification && child) {
      match.push("(pci)<-[:AGGREGATES*1..]-(chci:ClassifiedItem)<-[:HAS]-(chc:Classification)");
      const childFilter = filterItemsByIdsRegexps(child, "chci");

      where.and(childFilter.expression);
      query.params(childFilter.params);
      where.and("chc.id = {childClassification}");
      query.params({ childClassification });
    }

    //-- Do we need to match a source type?
    if (sourceType) {
      if (!sourceType.toLowerCase().includes("best guess")) {
        match.push("(f:Flow)-[:TRANSCRIBED_FROM]->(s:Source)");
        where.and("s.type IN $sourceType");
        query.params({ sourceType: [sourceType] });
      } else {
        where.and(`f.${_.camelCase(sourceType)} = true`);
      }
    }

    if (dateMin) {
      where.and("f.year >= $flowYearMin");
      query.params({ flowYearMin: dateMin });
    }

    if (dateMax) {
      where.and("f.year <= $flowYearMax");
      query.params({ flowYearMax: dateMax });
    }
    // filter out absurd values
    where.and("(NOT EXISTS(f.absurdObservation) OR f.absurdObservation<>'absurd')");
    
    if (match.length > 0) query.match(match);

    if (!where.isEmpty()) query.where(where);

    query.return("pci.name AS term, count(f) AS flows, sum(f.value) AS value");

    // Querying the database
    database.cypher(query.build(), function(err, data) {
      if (err) return callback(err);

      if (!data.length) return callback(null, null);

      // Building the graph
      let edgeId = 0;

      const graph = new UndirectedGraph();

      // Iterating
      data.forEach(row => {
        const terms = tokenizeTerms(row.term);

        terms.forEach((term, i) => {
          if (!graph.hasNode(term)) {
            graph.addNode(term, {
              id: term,
              label: term,
              flows: row.flows,
              value: row.value,
              position: i,
            });
          } else {
            graph.updateNodeAttribute(term, "flows", x => x + row.flows);
            graph.updateNodeAttribute(term, "value", x => x + row.value);
            graph.updateNodeAttribute(term, "position", x => Math.min(x, i));
          }

          // Retrieving last node
          if (!!i) {
            const lastTerm = terms[i - 1];

            if (!graph.hasEdge(lastTerm, term)) {
              graph.addEdgeWithKey(edgeId, lastTerm, term, {
                value: row.value,
                flows: row.flows,
              });

              edgeId++;
            } else {
              graph.updateEdgeAttribute(lastTerm, term, "value", x => x + row.value);
              graph.updateEdgeAttribute(lastTerm, term, "flows", x => x + row.flows);
            }
          }
        });
      });

      // Detecting communities using Louvain's algorithm
      const communities = louvain(graph);

      const useful = _(communities)
        .values()
        .countBy()
        .toPairs()
        .sortBy(([, count]) => -count)
        .take(20)
        .map(([community]) => community)
        .value();

      const usefulSet = new Set(useful);

      graph.nodes().forEach(node => {
        const community = communities[node];

        graph.setNodeAttribute(node, "community", usefulSet.has(community) ? community : -1);

        // Degree
        graph.setNodeAttribute(node, "degree", graph.degree(node));
      });

      const exportData = graph.edges().map(edge => {
        return {
          source: graph.source(edge),
          target: graph.target(edge),
          flows: graph.getEdgeAttribute(edge, "flows"),
        };
      });

      return callback(null, {
        data: exportData,
        nodes: graph.nodes().map(node => graph.getNodeAttributes(node)),
        edges: graph.edges().map(edge => {
          return {
            id: edge,
            source: graph.source(edge),
            target: graph.target(edge),
            value: graph.getEdgeAttribute(edge, "value"),
            flows: graph.getEdgeAttribute(edge, "flows"),
          };
        }),
      });
    });
  },
};

export default ModelTerms;
