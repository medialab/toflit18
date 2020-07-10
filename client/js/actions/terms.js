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
import {regexIdToString, stringToRegexLabel} from '../lib/helpers';

const scaleCategory20 = scaleOrdinal(schemeCategory20);

const ROOT = ['explorationTermsState'];

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
function fetchGroups(tree, cursor, id, callback) {
  tree.client.groups({params: {id}}, function(err, data) {
    if (err) return callback ? callback(err) : null;

    cursor.set(data.result.map(d => ({...d, value: d.id})));
    if (callback) callback();
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
      fetchGroups(tree, groups.select(model), item);
  }
}

export function addChart(tree) {
  const cursor = tree.select(ROOT),
        groups = cursor.get('groups');

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
    if (v && (k === 'child' || k === 'country'))
      paramsRequest[k] = v.map(id => {
        // Detect custom regex values:
        const regex = regexIdToString(id);
        if (regex) {
          return {
            id: -1,
            name: stringToRegexLabel(regex, 'country'),
            value: regex
          };
        }
        return (groups[k] || []).find(o => o.id === id);
      }).filter(o => o);
    else
      paramsRequest[k] = v;
  });

  const classification = cursor.get('classification');

  if (!classification)
    return;

  cursor.set('loading', true);

  tree.client.terms({params: {id: classification}, data: paramsRequest}, function(err, data) {
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
      edge.size = edge.flows;
    });

    cursor.set('graph', data.result);
  });
}

export function selectNodeSize(tree, key) {
  tree.set(ROOT.concat('nodeSize'), key);
}

export function selectEdgeSize(tree, key) {
  tree.set(ROOT.concat('edgeSize'), key);
}

export function selectLabelSizeRatio(tree, key) {
  tree.set(ROOT.concat('labelSizeRatio'), key);
}

export function selectLabelThreshold(tree, key) {
  tree.set(ROOT.concat('labelThreshold'), key);
}

export function checkDefaultState(tree, defaultState) {
  for (const key in defaultState) {
    const path = key.split('.');
    const val = tree.get([...ROOT, ...path]);

    if (!val) {
      tree.set([...ROOT, ...path], defaultState[key]);
    }
  }
}

export function checkGroups(tree, callback) {
  const cursor = tree.select(ROOT);
  let loading = 0;
  const handleFetched = () => {
    if (!(--loading) && callback) callback();
  };

  ['country', 'child'].forEach(type => {
    const classification = cursor.get('selectors', type + 'Classification');
    const groups = cursor.select('groups', type);

    if (classification && !(groups.get() || []).length) {
      loading++;
      fetchGroups(tree, groups, classification, handleFetched);
    }
  });

  if (!loading && callback) callback();
}
