/**
 * TOFLIT18 Viz ModelTerms
 * =======================
 *
 */
import decypher from 'decypher';
import database from '../connection';
import {tokenizeTerms} from '../../lib/tokenizer';
// import {connectedComponents} from '../../lib/graph';
import Louvain from '../../lib/louvain';
import _, {values, forIn} from 'lodash';

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
              matchs = [];

        //-- Do we need to match a product?

        matchs.push('(f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(pci:ClassifiedItem)<-[:HAS]-(pc:Classification)');
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
          matchs.push(`(d:Direction)<-[${exportImportFilter}]-(f:Flow)`);
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
          matchs.push(`(f:Flow)-[${exportImportFilter}]->(:Country)<-[:AGGREGATES*1..]-(cci:ClassifiedItem)<-[:HAS]-(cc:Classification)`);

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
          matchs.push('(f:Flow)-[:TRANSCRIBED_FROM]->(s:Source)');

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

        if (matchs.length > 0)
          query.match(matchs);

        if (!where.isEmpty())
          query.where(where);

        query.return('pci.name as term');

  //       WITH group.name as term,sum(toFloat(f.value)) as value, count(f) as occ
  // RETURN term, value, occ

        database.cypher(query.build(), function(err, data) {
            if (err) return callback(err);
            if (!data.length) return callback(null, null);

            const graph = {
                nodes: {},
                edges: {}
            };

            let edgeId = 0;

            data.forEach(row => {

                const terms = tokenizeTerms(row.term);

                //if (terms.length <= 1)
                //return;

                terms.forEach((term, i) => {

                  // Creating the node if it does not exist yet
                  if (!graph.nodes[term]) {
                    graph.nodes[term] = {
                      id: term,
                      label: term,
                      occurrences: 1,
                      position: i,
                      degree: 0,
                      neighbours: []
                    };
                  }
                  else {
                    graph.nodes[term].occurrences++;
                    graph.nodes[term].position = Math.min(i, graph.nodes[term].position);
                  }

                  const node = graph.nodes[term];

                  // Retrieving last node
                  if (!!i) {
                    const lastNode = graph.nodes[terms[i - 1]],
                          hash = `~${lastNode.id}~->~${node.id}~`,
                          reverseHash = `~${node.id}~->~${lastNode.id}~`;

                    // Increasing degree
                    lastNode.degree++;
                    node.degree++;

                    // Creating a relationship or weighting it once more
                    const edge = graph.edges[hash] || graph.edges[reverseHash];

                    if (!edge) {
                      graph.edges[hash] = {
                        id: edgeId++,
                        weight: 1,
                        source: lastNode.id,
                        target: node.id
                      };

                      node.neighbours.push(lastNode);
                      lastNode.neighbours.push(node);
                    }
                    else {
                      edge.weight++;
                    }
                  }
                });
            });

            // Detecting components
            // const components = connectedComponents(values(graph.nodes));

            // Keeping only larger components
            // let nodesToDrop = _(components)
            //     .filter(component => component.length < 4)
            //     .flatten()
            //     .value();

            // nodesToDrop = new Set(nodesToDrop);

            // Dropping useless nodes
            //graph.nodes = omit(graph.nodes, node => nodesToDrop.has(node.id));

            // graph.edges = omit(graph.edges, edge => {
            //   return nodesToDrop.has(edge.source) ||
            //          nodesToDrop.has(edge.target);
            // });

            // Computing Louvain modularity
            const modularity = Louvain()
                .nodes(values(graph.nodes).map(node => node.id))
                .edges(values(graph.edges));

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

            values(graph.nodes).forEach(node => {
                const community = communities[node.id];

                node.community = usefulSet.has(community) ? community : -1;
                delete node.degree;
                delete node.neighbours;
            });

            // graph.edges = omit(graph.edges, edge => {
            //   return !usefulSet.has(graph.nodes[edge.source].community) ||
            //          !usefulSet.has(graph.nodes[edge.target].community);
            // });

            // graph.nodes = omit(graph.nodes, node => !usefulSet.has(node.community));

            const exportData = [];
            forIn(graph.edges, d => {
              exportData.push({weigth: d.weight, source: d.source, target: d.target});
            });

            return callback(null, {
                data: exportData,
                nodes: values(graph.nodes),
                edges: values(graph.edges)
            });
        });
    }
};

export default ModelTerms;
