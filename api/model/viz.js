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
import _, {omit, values, mapValues, groupBy, filter, forIn, sortBy} from 'lodash';

const {Expression, Query} = decypher;
 
const Model = {

  /**
   * Flows per year per data type.
   */
  flowsPerYearPerDataType(dataType, callback) {

    const query = new Query();
    if (dataType === 'direction' || dataType === 'sourceType') {

      //direction or sourceType requested
      query.match('(f:Flow)');
      query.where(`has(f.${dataType}) AND f.year >= ${config.api.limits.minYear}`);
      query.return(`f.${dataType} AS dataType, f.year AS year, count(f) AS flows`);
      query.orderBy('f.year, dataType');
    }
    else {
      // a classification
      const [
        ,
        classificationType,
        classificationId
      ] = dataType.match(/(\w+)_(\d+)/) || [];

      if (classificationType) {
        query.start(`n=node(${classificationId})`);
        query.match(`(n)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:${_.capitalize(classificationType)})`);
        query.with('gc.name AS name, c.name AS sc');
        query.match('(f:Flow)');
        query.where(`f.${classificationType} = sc  AND f.year >= ${config.api.limits.minYear}`);
        query.return('name AS dataType, count(f) AS flows, f.year AS year');
        query.orderBy('f.year, dataType');
      }
      else {
        throw new Error('wrong parameter');
      }
    }

    database.cypher(query.build(), function(err, result) {
      if (err) return callback(err);

      const data = _(result)
        .groupBy('dataType')
        .mapValues((rows, key) => {
          return {
            name: key,
            data: rows.map(e => _.pick(e, ['year', 'flows']))
          };
        })
        .values();

      return callback(null, data);
    });
  },

  /**
   * Available data per year.
   */
  availableDataTypePerYear(dataType, callback) {

    const query = new Query();
    if (dataType === 'direction' || dataType === 'sourceType') {
      //direction or sourceType requested
      query.match('(f:Flow)');
      query.where(`has(f.${dataType})  AND f.year >= ${config.api.limits.minYear}`);
      query.with(`size(collect(DISTINCT f.${dataType})) AS data, f.year AS year`);
      query.return('year, data');
      query.orderBy('year');
    }
    else {
      // a classification
      const [
        ,
        classificationType,
        classificationId
      ] = dataType.match(/(\w+)_(\d+)/) || [];

      if (classificationType) {
        query.start(`n=node(${classificationId})`);
        query.match(`(n)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:${_.capitalize(classificationType)})`);
        query.with('gc.name AS name, c.name AS sc');
        query.match('(f:Flow)');
        query.where(`f.${classificationType} = sc  AND f.year >= ${config.api.limits.minYear}`);
        query.with('size(collect(DISTINCT name)) AS data, f.year AS year');
        query.return('year, data');
        query.orderBy('year');
      }
      else {
        throw new Error('wrong parameter');
      }
    }

    database.cypher(query.build(), function(err, result) {
      if (err) return callback(err);
      return callback(null, result);
    });
  },

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
    if (direction && direction !== '$all$') {
      query.match('(d:Direction)');
      where.and('id(d) = {direction}');
      where.and('f.direction = d.name');
      query.params({direction});
    }

    //-- Import/Export
    if (kind === 'import')
      where.and('f.import');
    else if (kind === 'export')
      where.and('not(f.import)');

    if (sourceType && sourceType != "National best guess" && sourceType != "Local best guess") {
      where.and(`f.sourceType = "${sourceType}"`);
    }

    // NOTE: country must come first for cardinality reasons
    if (countryClassification) {
      where.and('f.country IN countries');
    }
    if (productClassification) {
      where.and('f.product IN products');
    }

    if (!where.isEmpty())
      query.where(where);

    //-- Returning data
    if (sourceType === 'National best guess') {
      query.return('f.year AS year, collect(distinct(f.direction)) as nb_direction, CASE WHEN (1787 = f.year OR f.year = 1788) AND size(collect(distinct(f.sourceType))) >= 2 THEN collect(f) ELSE null  END as flows, CASE  WHEN f.year = 1750 THEN size(filter(x in collect(f.sourceType) where x="National par direction"))  WHEN f.year < 1787 THEN size(filter(x in collect(f.sourceType) where x="Object général"))   WHEN 1789 <= f.year THEN size(filter(x in collect(f.sourceType) where x="Résumé"))   ELSE null   END as count, CASE  WHEN f.year = 1750 AND f.sourceType="National par direction" THEN sum(f.value)  WHEN f.year < 1787 AND f.sourceType="Object général" THEN sum(f.value)  WHEN 1789 <= f.year AND f.sourceType="Résumé" THEN sum(f.value) ELSE null END as value');
    }
    else if (sourceType === 'Local best guess') {
      query.return('count(f) AS count, sum(f.value) AS value, f.year AS year, collect(distinct(f.direction)) as nb_direction, collect(distinct(f.sourceType)) as sourceType, CASE WHEN 1749 <= f.year <= 1751 AND size(collect(distinct(f.sourceType))) >= 2 THEN collect(f) ELSE null END as flows');
    }
    else if (sourceType) {
      query.return('count(f) AS count, sum(f.value) AS value, f.year AS year,  collect(distinct(f.direction)) as nb_direction, f.sourceType');
    }
    else {
      query.return('count(f) AS count, sum(f.value) AS value, f.year AS year,  collect(distinct(f.direction)) as nb_direction');
    }

    query.orderBy('f.year');

    console.log(query.build())
    database.cypher(query.build(), function(err, data) {
      // console.log("nb flows before processing : ", data)
      if (sourceType === 'National best guess' || sourceType === 'Local best guess') {

        // add flows we kept to render the line
        let flowsKept = [];

        // process element with flows non null
        let flows = filter(data, (d) => { 
          if (d.flows !== null) 
            return d;
          else {
            // add flows to flowsKept
            flowsKept.push(d);
          } 
        })

        if (flows.length === 0) {
          console.log("no duplicate flows.length empty, nb flows = ", flowsKept.length);
        }
        else {
          // process the flow if directions detected
          let flowsWithDirections = filter(flows, (d) => { 
            if (d.nb_direction.length > 0)
              return d;
            else
              flowsKept.push(d);
            })

          if (flowsWithDirections.length === 0) {
            console.log("no direction, nb flows = ", flowsKept.length);
          }
          else {
            console.log("there are possibly duplicates cases : ", flowsWithDirections.length)
            
            // process all flows groups detected by year
            flowsWithDirections.forEach((elem) => {

              let groupElemForProcess = [];
              let groupElemWithoutDirection = [];

              elem.flows.forEach((d) => {

                // add only elem with direction properties
                if (d.properties.direction) {
                  groupElemForProcess.push(d.properties);
                }
                else
                  groupElemWithoutDirection.push(d);
              })
              console.log("groupElemWithoutDirection", groupElemWithoutDirection.length);



              // group by elem by direction (it's already by year)
              let groupElemGB2 = groupBy(groupElemForProcess, 'direction');
              console.log("groupElemGB2 len : ", Object.keys(groupElemGB2).length, Object.keys(groupElemGB2));

              let localSourceType = [];
              if (product) {
                // console.log("there is duplicate in product")
                forIn(groupElemGB2, function (value, key) {
                  let groupProduct = groupBy(value, 'product');
                  // console.log("groupProduct", groupProduct);
                  forIn(groupElemGB2, function (value, key) {
                    // console.log("value", value);
                    value.forEach(d => {
                      // console.log("d", d.sourceType);
                      if (sourceType === 'Local best guess' && d.sourceType !== 'National par direction')
                        localSourceType.push(d)

                      if (sourceType === 'National best guess' && d.sourceType !== 'Résumé')
                        localSourceType.push(d)
                    })
                  });
                });
              }
              else {
                // check if there are many sourceTypes
                forIn(groupElemGB2, function (value, key) {
                  // console.log(key, value.length);
                  value.forEach((d) => {
                    if (sourceType === 'Local best guess' && d.sourceType !== 'National par direction')
                      localSourceType.push(d)

                    if (sourceType === 'National best guess' && d.sourceType !== 'Résumé')
                      localSourceType.push(d)
                    ;
                  }) 
                })
              }

              console.log("localSourceType", localSourceType.length)
               
              function sumValue() {
                for (let i=0, len = localSourceType.length; i < len; i++ ) {
                  if (i != len - 1)
                    localSourceType[i].value += localSourceType[i+1].value;
                  else
                    return localSourceType[i].value
                }
              }
              
              const value2 = sumValue()
              // console.log("value2", value2);
              // console.log("localSourceType.length", localSourceType.length)
              if (localSourceType.length > 0) {
                let flowsAddedToData = {}
                flowsAddedToData.count = localSourceType.length;
                flowsAddedToData.value = value2;
                flowsAddedToData.year = localSourceType[0].year;
                //console.log("flowsAddedToData.year", flowsAddedToData.year);
                flowsAddedToData.nb_direction = [direction];
                flowsKept.push(flowsAddedToData);
              }
            })
          }
        } 
        flowsKept = sortBy(flowsKept, 'year');
        data = flowsKept;
      }

      console.log("data before display", data.length);
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
