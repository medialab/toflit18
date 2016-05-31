/**
 * TOFLIT18 Globals Actions
 * =========================
 *
 * Actions related to the globals' view.
 */
import {scaleCategory20, scaleLinear} from 'd3-scale';
import {six as palette} from '../lib/palettes';
import {max, uniq, values, forIn} from 'lodash';

const ROOT = ['states', 'exploration', 'globals'];

/**
 * Selecting a country classification.
 */
export function selectClassification(tree, classification) {
  const cursor = tree.select([...ROOT, 'network']);

  cursor.set('classification', classification);
  cursor.set('graph', null);

  if (!classification)
    return;

  cursor.set('loading', true);

  // Fetching data
  tree.client.network({params: {id: classification.id}}, function(err, data) {
    cursor.set('loading', false);

    if (err) return;

    // Treating
    const nodes = {},
          edges = [];

    data.result.forEach(function(row) {
      const directionId = '$d$' + row.direction,
            countryId = '$c$' + row.country;

      if (!nodes[directionId])
        nodes[directionId] = {
          id: directionId,
          label: row.direction,
          color: palette[0],
          size: 1,
          x: Math.random(),
          y: Math.random(),
        };

      if (!nodes[countryId])
        nodes[countryId] = {
          id: countryId,
          label: row.country,
          color: palette[1],
          size: 1,
          x: Math.random(),
          y: Math.random(),
        };

      edges.push({
        id: 'e' + edges.length,
        size: row.count,
        source: directionId,
        target: countryId
      });
    });

    cursor.set('graph', {nodes: values(nodes), edges});
  });
}

/**
 * Selecting a product classification.
 */
export function selectTerms(tree, classification) {
  const cursor = tree.select([...ROOT, 'terms']);

  cursor.set('classification', classification);
  cursor.set('graph', null);

  // if (!classification)
  //   return;

  // cursor.set('loading', true);

  // tree.client.terms({params: {id: classification.id}}, function(err, data) {
  //   cursor.set('loading', false);

  //   if (err)
  //     return;

  //   const colorScale = scaleCategory20()
  //     .domain(uniq(data.result.nodes.map(node => node.community)));

  //   const maxPosition = max(data.result.nodes, 'position').position;

  //   const colorScalePosition = scaleLinear()
  //     .domain([0, maxPosition])
  //     .range(['red', 'blue']);

  //   data.result.nodes.forEach(node => {
  //     node.size = 1;
  //     node.communityColor = node.community === -1 ? '#ACACAC' : colorScale(node.community);
  //     node.positionColor = colorScalePosition(node.position);
  //     node.x = Math.random();
  //     node.y = Math.random();

  //     // if (!~node.community)
  //     //   node.hidden = true;
  //   });

  //   data.result.edges.forEach(edge => {
  //     edge.size = edge.weight;
  //   });

  //   cursor.set('graph', data.result);
  // });
}

/**
 * Selecting a colorization.
 */
export function selectColorization(tree, colorization) {
  const cursor = tree.select([...ROOT, 'terms', 'colorization']);

  cursor.set(colorization);
}

/**
 * Updating a selector.
 */
function fetchGroups(tree, cursor, id) {
  tree.client.groups({params: {id}}, function(err, data) {
    if (err) return;

    cursor.set(data.result);
  });
}

function buildDateMin() {
  const min = {};

  for (let i=1716; i < 1860; i++) {
    min[i] = true;
  }

  return min;
}

//dateMin ? dateMin : buildDateMin();


export function updateSelector(tree, name, item) {
  const cursor = tree.select([...ROOT, 'terms']),
        selectors = cursor.select('selectors'),
        groups = tree.select([...ROOT, 'groups']);

  // Updating the correct selector
  selectors.set(name, item);

  // If we updated a classification, we need to reset some things
  if (/classification/i.test(name)) {
    const model = name.match(/(.*?)Classification/)[1];

    selectors.set(model, null);
    groups.set(model, []);

    if (item)
      fetchGroups(tree, groups.select(model), item.id);
  }
}

export function addChart(tree) {
  const cursor = tree.select([...ROOT, 'terms']),
        selectors = cursor.select('selectors');

  console.log("selectors", cursor.get('selectors')); 

  // set params for request
  const params = {},
        paramsRequest = {};

  // get selectors choosen 
  forIn(cursor.get('selectors'), (v, k) => {
    if (v) {
      params[k] = v;
    }
  })

  // keep only params !== null for request
  forIn(params, (v, k) => { k === "sourceType" ? 
    paramsRequest[k] = v.value : paramsRequest[k] = v.id; 
  })   

  console.log("paramsRequest", paramsRequest);

  const classification = cursor.get('classification');

  console.log("classification", classification);

  if (!classification)
    return;

  cursor.set('loading', true);

  tree.client.terms({params: {id: classification.id}, data: paramsRequest}, function(err, data) {
    console.log("request OK");
    cursor.set('loading', false);

    if (err)
      return;

    const colorScale = scaleCategory20()
      .domain(uniq(data.result.nodes.map(node => node.community)));

    const maxPosition = max(data.result.nodes, 'position').position;

    const colorScalePosition = scaleLinear()
      .domain([0, maxPosition])
      .range(['red', 'blue']);

    data.result.nodes.forEach(node => {
      node.size = 1;
      node.communityColor = node.community === -1 ? '#ACACAC' : colorScale(node.community);
      node.positionColor = colorScalePosition(node.position);
      node.x = Math.random();
      node.y = Math.random();

      // if (!~node.community)
      //   node.hidden = true;
    });

    data.result.edges.forEach(edge => {
      edge.size = edge.weight;
    });

    cursor.set('graph', data.result);
  });
  
}



export function updateDate(tree, dateChoosen) {
  const cursor = tree.select([...ROOT, 'terms']),
        selectors = cursor.select('selectors');

  const date = selectors.get(dateChoosen);

  return date;
}