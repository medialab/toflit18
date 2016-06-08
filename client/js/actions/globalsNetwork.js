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

/**„„
 * Selecting a colorization.
 */
export function selectPonderation(tree, ponderation) {
  const cursor = tree.select(ROOT);

  cursor.set('ponderation', ponderation);

  const data = cursor.get('graphResultAPI');
  let edgeSize = null;

  // Treating
  const nodes = {},
        edges = [];

  data.forEach(function(row) {
    if (ponderation === 'flows')
      edgeSize = row.count;
    else
      edgeSize = row.value;

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
      size: edgeSize,
      source: directionId,
      target: countryId
    });
  });

  cursor.set('graph', {nodes: values(nodes), edges});
}

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
    if (k === 'dataType')
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
    if (data)
      cursor.set('graphResultAPI', data.result);

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
  console.log("name, item", name, item);
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
