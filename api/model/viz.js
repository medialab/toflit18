/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import decypher from 'decypher';
import database from '../connection';
import {tokenizeTerms} from '../../lib/tokenizer';
import {connectedComponents} from '../../lib/graph';
import Louvain from '../../lib/louvain';
import config from '../../config.json';
import {viz as queries} from '../queries';
import _, {omit, values} from 'lodash';

const {Expression, Query} = decypher;

//-- function to build expression for where statement for cypher query
//-- when national or local best guess selected

const Model = {

  /**
   * Building the (directions)--(country) network.
   */
  network(classification, callback) {
    database.cypher({query: queries.network, params: {classification}}, callback);
  },

  /**
   * Retrieve the network of terms for the given classification.
   */
  terms(classification, params, callback) {
    console.log("params viz", params);

    const {
      sourceType,
      direction,
      kind,
      product,
      country
    } = params;

    let {
      productClassification,
      countryClassification
    } = params;

    database.cypher({query: queries.terms, params: {classification}}, function(err, rows) {
      if (err) return callback(err);
      if (!rows.length) return callback(null, null);

      const graph = {
        nodes: {},
        edges: {}
      };

      let edgeId = 0;

      rows.forEach(row => {
        const terms = tokenizeTerms(row.term);

        if (terms.length <= 1)
          return;

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
      const components = connectedComponents(values(graph.nodes));

      // Keeping only larger components
      let nodesToDrop = _(components)
        .filter(component => component.length < 4)
        .flatten()
        .value();

      nodesToDrop = new Set(nodesToDrop);

      // Dropping useless nodes
      graph.nodes = omit(graph.nodes, node => nodesToDrop.has(node.id));

      graph.edges = omit(graph.edges, edge => {
        return nodesToDrop.has(edge.source) ||
               nodesToDrop.has(edge.target);
      });

      // Computing Louvain modularity
      const modularity = Louvain()
        .nodes(values(graph.nodes).map(node => node.id))
        .edges(values(graph.edges));

      const communities = modularity();

      const useful = _(communities)
        .values()
        .countBy()
        .pairs()
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

      return callback(null, {
        nodes: values(graph.nodes),
        edges: values(graph.edges)
      });
    });
  }
};

export default Model;
