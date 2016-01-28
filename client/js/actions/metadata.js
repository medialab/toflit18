/**
 * TOFLIT18 Indicators Actions
 * ============================
 *
 * Actions related to the indicators' view.
 */

const ROOT = ['states', 'exploration', 'metadata'];

/**
 * Selecting a data type.
 */
export function select(tree, selected) {
  const cursor = tree.select(ROOT);
  cursor.set('dataType', selected);

  // Deleting previous data
  cursor.set('perYear', null);
  cursor.set('flowsPerYear', null);

  // Loading data from server
  const type = selected.id ?
    `${selected.model}_${selected.id}` :
    selected.value;

  tree.client.perYear({params: {type}}, function(err, data) {
    if (err)
      return;

    cursor.set('perYear', data.result);
  });

  tree.client.flowsPerYear({params: {type}}, function(err, data) {
    if (err)
      return;

    cursor.set('flowsPerYear', data.result);
  });
}
