/**
 * TOFLIT18 Indicators Actions
 * ============================
 *
 * Actions related to the indicators' view.
 */
const ROOT = ['states', 'exploration', 'indicators'],
      MAXIMUM_LINES = 6;

/**
 * Updating a selector.
 */
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

function fetchGroups(tree, cursor, id) {
  tree.client.groups({params: {id}}, function(err, data) {
    if (err) return;

    cursor.set(data.result);
  });
}

/**
 * Add a line to the graph.
 */
export function addLine(tree) {
  const cursor = tree.select(ROOT);

  // Cannot have more than the maximum lines
  if (cursor.get('lines').length >= MAXIMUM_LINES)
    return;

  // Loading
  cursor.set('creating', true);

  const selectors = cursor.get('selectors');

  // Adding the line
  cursor.push('lines', {params: selectors});

  // Getting the index of the line
  const index = cursor.get('lines').length - 1;

  // Cleaning the selectors
  // for (const k in selectors)
  //   cursor.set(['selectors', k], null);

  // Building payload
  const payload = {};

  for (const k in selectors)
    if (!!selectors[k])
      payload[k] = selectors[k].id;

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
