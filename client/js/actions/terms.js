/**
 * TOFLIT18 Globals Actions
 * =========================
 *
 * Actions related to the globals' view.
 */
import {
  scaleOrdinal,
  schemeCategory20
} from 'd3-scale';

import {uniq, forIn} from 'lodash';

const scaleCategory20 = scaleOrdinal(schemeCategory20);

const ROOT = ['states', 'exploration', 'terms'];

/**
 * Selecting a product classification.
 */
export function selectTerms(tree, classification) {
  const cursor = tree.select(ROOT);

  cursor.set('classification', classification);
  cursor.set(['selectors', 'childClassification'], null);
  cursor.set(['selectors', 'child'], null);
  cursor.set(['groups', 'child'], []);
  cursor.set('graph', null);
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
    groups.set(model, []);

    if (item)
      fetchGroups(tree, groups.select(model), item.id);
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
    if (k === 'sourceType')
      paramsRequest[k] = v.value;
    else
      paramsRequest[k] = v.id;
  });

  const classification = cursor.get('classification');

  if (!classification)
    return;

  cursor.set('loading', true);

  tree.client.terms({params: {id: classification.id}, data: paramsRequest}, function(err, data) {
    cursor.set('loading', false);

    if (err)
      return;

    if (data) {
      cursor.set('data', data.result.data);
    }

    const colorScale = scaleCategory20
      .domain(uniq(data.result.nodes.map(node => node.community)));

    data.result.nodes.forEach(node => {
      node.size = node.flows;
      node.communityColor = node.community === -1 ? '#ACACAC' : colorScale(node.community);
      node.x = Math.random();
      node.y = Math.random();
    });

    data.result.edges.forEach(edge => {
      edge.size = edge.weight;
    });

    cursor.set('graph', data.result);
  });
}

export function selectNodeSize(tree, key) {
  tree.set(ROOT.concat('nodeSize'), key);
}

export function updateDate(tree, dateChoosen) {
  const cursor = tree.select(ROOT),
        selectors = cursor.select('selectors');

  const date = selectors.get(dateChoosen);

  return date;
}
