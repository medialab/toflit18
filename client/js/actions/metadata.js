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

  // Loading data from server
  const type = selected.id ?
    `${selected.model}_${selected.id}` :
    selected.value;

  tree.client.perYear({params: {type}}, function(err, data) {
    if (err)
      return;

    cursor.set('perYear', data.result);
  });
}
