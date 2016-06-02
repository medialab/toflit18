/**
 * TOFLIT18 Globals Actions
 * =========================
 *
 * Actions related to the globals' view.
 */
import {scaleCategory20, scaleLinear} from 'd3-scale';
import {max, uniq, forIn} from 'lodash';

const ROOT = ['states', 'exploration', 'terms'];

/**
 * Selecting a product classification.
 */
export function selectTerms(tree, classification) {
  const cursor = tree.select(ROOT);

  cursor.set('classification', classification);
  cursor.set('graph', null);
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

export function updateSelector(tree, name, item) {
  const selectors = tree.select([...ROOT, 'selectors']),
        groups = tree.select([...ROOT, 'groups']);

  // Updating the correct selector
  selectors.set(name, item);

  // If we updated a classification, we need to reset some things
  if (/classification/i.test(name)) {
    const model = name.match(/(.*?)Classification/)[1];

    selectors.set(model, null);
    groups.set('country', []);

    if (item) {
      fetchGroups(tree, groups.select('country'), item.id);
    }
  }
}

export function addChart(tree) {
  const cursor = tree.select(ROOT);

  cursor.set('graph', null);

  // set params for request
  const params = {},
        paramsRequest = {};

  // get selectors choosen
  forIn(cursor.get('selectors'), (v, k) => {
    if (v) {
      params[k] = v;
    }
  });

  // keep only params !== null for request
  forIn(params, (v, k) => { 
    k === 'sourceType' ?
    paramsRequest[k] = v.value : paramsRequest[k] = v.id; 
  });

  const classification = cursor.get('classification');

  if (!classification)
    return;

  cursor.set('loading', true);

  tree.client.terms({params: {id: classification.id}, data: paramsRequest}, function(err, data) {
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
  const cursor = tree.select(ROOT),
        selectors = cursor.select('selectors');

  const date = selectors.get(dateChoosen);

  return date;
}
