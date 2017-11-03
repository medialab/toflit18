/**
 * TOFLIT18 Globals Actions
 * =========================
 *
 * Actions related to the globals' view.
 */
import {six as palette} from '../lib/palettes';
import {values, forIn} from 'lodash';

const ROOT = ['states', 'exploration', 'network'];

/**
 * Selecting a country classification.
 */
export function selectClassification(tree, classification) {
  const cursor = tree.select(ROOT);

  cursor.set('classification', classification);
}

/**
 * Selecting a node size.
 */
export function selectNodeSize(tree, key) {
  tree.set(ROOT.concat('nodeSize'), key);
}

/**
 * Selecting an edge size.
 */
export function selectEdgeSize(tree, key) {
  tree.set(ROOT.concat('edgeSize'), key);
}

/**
 * Adding a network.
 */
export function addNetwork(tree) {
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

  // Fetching data
  tree.client.network({params: {id: classification.id}, data: paramsRequest}, function(err, data) {
    cursor.set('loading', false);

    // NOTE: the API should probably return an empty array somehow
    const result = data.result || [];

    if (data)
      cursor.set('data', result);

    if (err) return;

    // Treating
    const nodes = {},
          edges = [];

    result.forEach(function(row) {

      const directionId = '$d$' + row.direction,
            countryId = '$c$' + row.country;

      if (!nodes[directionId]) {
        nodes[directionId] = {
          id: directionId,
          label: row.direction,
          community: 'direction',
          color: palette[0],
          size: row.count,
          flows: row.count,
          value: row.value,
          degree: 1,
          x: Math.random(),
          y: Math.random(),
        };
      }
      else {
        nodes[directionId].degree++;
        nodes[directionId].size += row.count;
        nodes[directionId].flows += row.count;
        nodes[directionId].value += row.value;
      }

      if (!nodes[countryId]) {
        nodes[countryId] = {
          id: countryId,
          label: row.country,
          community: 'country',
          color: palette[1],
          size: row.count,
          flows: row.count,
          value: row.value,
          degree: 1,
          x: Math.random(),
          y: Math.random(),
        };
      }
      else {
        nodes[countryId].degree++;
        nodes[countryId].size += row.count;
        nodes[countryId].flows += row.count;
        nodes[countryId].value += row.value;
      }

      edges.push({
        id: 'e' + edges.length,
        size: row.count,
        flows: row.count,
        value: row.value,
        source: directionId,
        target: countryId
      });
    });

    const kind = cursor.get('selectors', 'kind', 'id');

    const directed = kind === 'import' || kind === 'export';

    cursor.set('graph', {nodes: values(nodes), edges, directed});
  });
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

// see meta or indicator view to change and adapt this function
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

    if (item) {
      fetchGroups(tree, groups.select(model), item.id);
    }
  }
}

export function updateDate(tree, dateChoosen) {
  const cursor = tree.select(ROOT),
        selectors = cursor.select('selectors');

  const date = selectors.get(dateChoosen);

  return date;
}

export function selectLabelSizeRatio(tree, key) {
  tree.set(ROOT.concat('labelSizeRatio'), key);
}

export function selectLabelThreshold(tree, key) {
  tree.set(ROOT.concat('labelThreshold'), key);
}
