/**
 * TOFLIT18 Viz ModelTerms
 * =======================
 *
 */
import decypher from 'decypher';
import database from '../connection';
import {UndirectedGraph} from 'graphology';
import {tokenizeTerms} from '../../lib/tokenizer';
import Louvain from '../../lib/louvain';
import _ from 'lodash';

const {Expression, Query} = decypher;

const ModelTerms = {
    terms(classification, params, callback) {

      const {
        sourceType,
        direction,
        kind,
        country,
        dateMin,
        dateMax,
        countryClassification
      } = params;

      const query = new Query(),
            where = new Expression(),
            match = [];

      //-- Do we need to match a product?
      match.push('(f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(pci:ClassifiedItem)<-[:HAS]-(pc:Classification)');

      const whereProduct = new Expression('id(pc) = {classification}');

      query.params({classification: database.int(classification)});

      where.and(whereProduct);

      //-- Should we match a precise direction?
      if (direction && direction !== '$all$') {
        // define import export edge type filter
        let exportImportFilter = ':FROM|:TO';
        if (kind === 'import')
          exportImportFilter = ':TO';
        else if (kind === 'export')
          exportImportFilter = ':FROM';
        match.push(`(d:Direction)<-[${exportImportFilter}]-(f:Flow)`);
        where.and('id(d) = {direction}');
        query.params({direction: database.int(direction)});
      }


      //-- Do we need to match a country?
      if (countryClassification) {
        // define import export edge type filter
        let exportImportFilter = ':FROM|:TO';
        if (kind === 'import')
          exportImportFilter = ':FROM';
        else if (kind === 'export')
          exportImportFilter = ':TO';
        match.push(`(f:Flow)-[${exportImportFilter}]->(:Country)<-[:AGGREGATES*1..]-(cci:ClassifiedItem)<-[:HAS]-(cc:Classification)`);

        const whereCountry = new Expression('id(cc) = {countryClassification}');
        query.params({countryClassification: database.int(countryClassification)});

        if (country) {
          whereCountry.and('id(cci) = {country}');
          query.params({country: database.int(country)});
        }

        where.and(whereCountry);
      }

      //-- Do we need to match a source type
      if (sourceType) {
        match.push('(f:Flow)-[:TRANSCRIBED_FROM]->(s:Source)');

        if (sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
         where.and('s.type = {sourceType}');
         query.params({sourceType});
        }
        else if (sourceType === 'National best guess') {
         where.and('s.type IN ["Objet Général", "Résumé", "National par direction"]');
        }
        else if (sourceType === 'Local best guess') {
         where.and('s.type IN ["Local","National par direction"] and f.year <> 1749 and f.year <> 1751');
        }
      }

      if (dateMin)
          where.and('f.year >= ' + dateMin);

      if (dateMax)
          where.and('f.year <= ' + dateMax);

      if (match.length > 0)
        query.match(match);

      if (!where.isEmpty())
        query.where(where);

      query.return('pci.name as term');

      // Querying the database
      database.cypher(query.build(), function(err, data) {
        if (err)
            return callback(err);

        if (!data.length)
          return callback(null, null);

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
                occurrences: 1,
                position: i
              });
            }
            else {
              graph.updateNodeAttribute(term, 'occurrences', x => x + 1);
              graph.updateNodeAttribute(term, 'position', x => Math.min(x, i));
            }

            // Retrieving last node
            if (!!i) {
              const lastTerm = terms[i - 1];

              if (!graph.hasEdge(lastTerm, term)) {
                graph.addEdgeWithKey(edgeId, lastTerm, term, {
                  weight: 1
                });

                edgeId++;
              }
              else {
                graph.updateEdgeAttribute(lastTerm, term, 'weight', x => x + 1);
              }
            }
          });
        });

        // Computing Louvain modularity
        const modularity = Louvain()
          .nodes(graph.nodes())
          .edges(graph.edges().map(edge => {
            return {
              source: graph.source(edge),
              target: graph.target(edge),
              weight: graph.getEdgeAttribute(edge, 'weight')
            };
          }));

        const communities = modularity();

        const useful = _(communities)
          .values()
          .countBy()
          .toPairs()
          .sortBy(([, count]) => -count)
          .take(20)
          .map(([community]) => +community)
          .value();

        const usefulSet = new Set(useful);

        graph.nodes().forEach(node => {
          const community = communities[node];

          graph.setNodeAttribute(node, 'community', usefulSet.has(community) ? community : -1);
        });

        const exportData = graph.edges().map(edge => {
          return {
            source: graph.source(edge),
            target: graph.target(edge),
            weight: graph.getEdgeAttribute(edge, 'weight')
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
              weight: graph.getEdgeAttribute(edge, 'weight')
            };
          })
        });
      });
    }
};

export default ModelTerms;
