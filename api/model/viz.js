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
function addParamsToWhere (params, expression) {
  const {
        sourceType,
        direction,
        kind,
        productClassification,
        product,
        countryClassification,
        country
      } = params;


  if (productClassification) {
    expression =  expression.concat(' and f.product IN products');
  }

  if (countryClassification) {
    expression =  expression.concat(' and f.country IN countries');
  }

  if (direction) {
    expression =  expression.concat(' and id(d) = ' + direction);
    expression =  expression.concat(' and f.direction = d.name');  
  }
  //-- Import/Export
  if (kind === 'import')
    expression =  expression.concat(' and f.import');
  else if (kind === 'export')
    expression =  expression.concat(' and not(f.import)');

  return expression;
}

const Model = {

  /**
   * Line creation.
   */
  createLine(params, callback) {
    const {
      sourceType,
      direction,
      kind,
      productClassification,
      product,
      countryClassification,
      country
    } = params;

    // Building the query
    const query = new Query(),
          where = new Expression(),
          withs = [];

    //-- Do we need to match a product?
    if (productClassification) {
      query.match('(pc)-[:HAS]->(pg)-[:AGGREGATES*1..]->(pi)');

      const whereProduct = new Expression('id(pc) = {productClassification}');
      query.params({productClassification});

      if (product) {
        whereProduct.and('id(pg) = {product}');
        query.params({product});
      }

      withs.push('products');
      query.where(whereProduct);
      query.with('collect(pi.name) AS products');
    }

    //-- Do we need to match a country?
    if (countryClassification) {
      query.match('(cc)-[:HAS]->(cg)-[:AGGREGATES*1..]->(ci)');

      const whereCountry = new Expression('id(cc) = {countryClassification}');
      query.params({countryClassification});

      if (country) {
        whereCountry.and('id(cg) = {country}');
        query.params({country});
      }

      query.where(whereCountry);
      query.with(withs.concat('collect(ci.name) AS countries').join(', '));
    }

    //-- Basic match
    query.match('(f:Flow)');

    //-- Should we match a precise direction?
    if (direction && direction !== '$all$' && sourceType !== 'National best guess' && sourceType !== 'Local best guess' ) {
      query.match('(d:Direction)');
      where.and('id(d) = {direction}');
      where.and('f.direction = d.name');
      query.params({direction});
    }

    if (direction) {
      query.match('(d:Direction)');
      query.params({direction});
    } 

    //-- Import/Export
    if (kind === 'import' && sourceType !== 'National best guess' && sourceType !== 'Local best guess' )
      where.and('f.import');
    else if (kind === 'export' && sourceType !== 'National best guess' && sourceType !== 'Local best guess')
      where.and('not(f.import)');

    if (sourceType && sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
      where.and(`f.sourceType = "${sourceType}"`);
    }

    if (sourceType === 'National best guess') {
      let expression = 'f.sourceType IN ["Objet Général", "Résumé", "National par direction"] and f.year <> 1749 and f.year <> 1751';
      const addParamsToExpression = addParamsToWhere(params, expression);

      let where = new Expression(addParamsToWhere(params, expression));

      query.where(where);
      query.with('f.year AS year, collect(f) as flows_by_year, collect(distinct(f.sourceType)) as source_types');
      query.with('year, CASE  WHEN size(source_types)>1 and "Objet Général" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Objet Général") WHEN size(source_types)>1 and "Résumé" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Résumé") WHEN size(source_types)>1 and "National par direction" in source_types THEN filter(fb in flows_by_year where fb.sourceType="National par direction") ELSE flows_by_year END as flowsbyyear UNWIND flowsbyyear as fs');
    }

    if (sourceType === 'Local best guess') {
      let expression = 'f.sourceType IN ["Local","National par direction"] and f.year <> 1749 and f.year <> 1751 ';
      const addParamsToExpression = addParamsToWhere(params, expression);

      let where = new Expression(addParamsToWhere(params, expression));

      query.where(where);
      query.with(' f.year AS year, collect(f) as flows_by_year, collect(distinct(f.sourceType)) as source_types');
      query.with(' year, CASE  WHEN size(source_types)>1 and "Local" in source_types THEN filter(fb in flows_by_year where fb.sourceType="Local") WHEN size(source_types)>1 and "National par direction" in source_types THEN filter(fb in flows_by_year where fb.sourceType="National par direction") ELSE flows_by_year END as flowsbyyear UNWIND flowsbyyear as fs');
    }

    // NOTE: country must come first for cardinality reasons
    if (countryClassification && sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
      where.and('f.country IN countries');
    }

    if (productClassification && sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
      where.and('f.product IN products');
    }

    if (!where.isEmpty())
      query.where(where);

    //-- Returning data

    if (sourceType && sourceType !== 'National best guess' && sourceType !== 'Local best guess') {
      query.return('count(f) AS count, sum(f.value) AS value, f.year AS year,  collect(distinct(f.direction)) as nb_direction, f.sourceType');
      query.orderBy('f.year');
    }
    else if (sourceType === 'National best guess' || sourceType === 'Local best guess') {
      query.return('year, fs.sourceType, count(fs) as count, sum(toFloat(fs.value)) as value, collect(distinct(fs.direction)) as nb_direction');
      query.orderBy('year');
    }
    else {
      query.return('count(f) AS count, sum(f.value) AS value, f.year AS year,  collect(distinct(f.direction)) as nb_direction');
      query.orderBy('f.year');
    }

    console.log("query.build()", query.build())
    database.cypher(query.build(), function(err, data) {

      if (err) return callback(err);

      return callback(null, data);
    });
  },

  /**
   * Building the (directions)--(country) network.
   */
  network(classification, callback) {
    database.cypher({query: queries.network, params: {classification}}, callback);
  },

  /**
   * Retrieve the network of terms for the given classification.
   */
  terms(classification, callback) {
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
