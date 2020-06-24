/**
 * TOFLIT18 Indicators Actions
 * ============================
 *
 * Actions related to the indicators' view.
 */
import {six as palette} from '../lib/palettes';
import {find, pickBy} from 'lodash';

const ROOT = ['indicatorsState'],
      MAXIMUM_LINES = 6;

/**
 * Returns an isomorphic footprint for any line.
 */
export function getLineFootprint(line) {
  const KEYS = [
    'color',
    'country',
    'countryClassification',
    'direction',
    'kind',
    'product',
    'productClassification',
    'sourceType'
  ];

  return KEYS.map(key => line[key] || '').join('|')
}

/**
 * Updating a selector.
 */
function fetchGroups(tree, cursor, id) {
  tree.client.groups({params: {id}}, function(err, data) {
    if (err) return;

    cursor.set(data.result.map(d => ({...d, value: d.id})));
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

function findAvailableColor(existingLines) {
  const alreadyUsedColors = existingLines.map(line => line.color);

  return find(palette, color => {
    return !~alreadyUsedColors.indexOf(color);
  });
}

/**
 * Loads data for one line
 */
export function loadLine(tree, line) {
  const cursor = tree.select(ROOT),
    footprint = getLineFootprint(line);

  // Building payload
  const payload = {};

  for (const k in line) {
    switch (k) {
      case 'sourceType':
        payload[k] = line[k].value;
        break;
      case 'product':
      case 'country':
        payload[k] = line[k];
        break;
      default:
        payload[k] = line[k].id;
    }
  }

  cursor.set(['dataIndex', footprint], {loading: true});

  tree.client.viz({params: {name: 'line'}, data: payload}, function(err, data) {
    if (err) return;

    cursor.set(['dataIndex', footprint], data.result);
  });
}

/**
 * Add a line to the graph.
 */
export function addLine(tree) {
  const cursor = tree.select(ROOT),
        lines = cursor.get('lines') || [];

  // Cannot have more than the maximum lines
  if (lines.length >= MAXIMUM_LINES)
    return;

  const selectors = cursor.get('selectors');

  // Adding the line
  const color = findAvailableColor(lines);
  const line = pickBy({color, ...selectors});
  cursor.set('lines', lines.concat([line]));

  loadLine(tree, line);
}

/**
 * Drop the given line.
 */
export function dropLine(tree, index) {
  tree.unset([...ROOT, 'lines', index]);
}

/**
 * Check that each line has its data loaded, and loads it else.
 */
export function checkLines(tree) {
  const cursor = tree.select(ROOT),
        lines = cursor.get('lines') || [];

  lines.forEach(line => {
    const footprint = getLineFootprint(line);

    if (!cursor.get('dataIndex', footprint)) loadLine(tree, line);
  });
}
