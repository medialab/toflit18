/**
 * TOFLIT18 Indicators Actions
 * ============================
 *
 * Actions related to the indicators' view.
 */
import {six as palette} from '../lib/palettes';
import {find} from 'lodash';

const ROOT = ['states', 'exploration', 'indicators'],
      MAXIMUM_LINES = 6;

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

/**
 * Add a line to the graph.
 */
function findAvailableColor(existingLines) {
  const alreadyUsedColors = existingLines.map(line => line.color);

  return find(palette, color => {
    return !~alreadyUsedColors.indexOf(color);
  });
}

export function addLine(tree) {
  const cursor = tree.select(ROOT),
        lines = cursor.get('lines');

  // Cannot have more than the maximum lines
  if (lines.length >= MAXIMUM_LINES)
    return;

  // Loading
  cursor.set('creating', true);

  const selectors = cursor.get('selectors');

  // Adding the line
  const color = findAvailableColor(lines);
  cursor.push('lines', {color, params: selectors});

  // Getting the index of the line
  const index = cursor.get('lines').length - 1;

  // Cleaning the selectors
  // for (const k in selectors)
  //   cursor.set(['selectors', k], null);

  // Building payload
  const payload = {};

  for (const k in selectors)
    if (!!selectors[k]) {
      switch(k){
        case 'sourceType':
          payload[k] = selectors[k].value;
          break;
        case 'product':
        case 'country':
          payload[k] = selectors[k];
          break;
        default:
          payload[k] = selectors[k].id;
      } 
    
    }

  tree.client.viz({params: {name: 'line'}, data: payload}, function(err, data) {
    cursor.set('creating', false);

    if (err) return;

    cursor.set(['lines', index, 'data'], data.result);
  });
}

/**
 * Drop the given line.
 */
export function dropLine(tree, index) {
  tree.unset([...ROOT, 'lines', index]);
}
