/**
 * TOFLIT18 Indicators Actions
 * ============================
 *
 * Actions related to the indicators' view.
 */
import config from '../../config.json';

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

  if (!selected)
    return;

  // Loading data from server
  const type = selected.id ?
    `${selected.model}_${selected.id}` :
    selected.value;

  tree.client.perYear({params: {type}}, function(err, data) {
    if (err)
      return;

    cursor.set('perYear', data.result);
  });

  // Don't ask for data we don't need
  if (selected.id && selected.groupsCount > config.metadataGroupMax)
    return;

  tree.client.flowsPerYear({params: {type}}, function(err, data) {
    if (err)
      return;

    cursor.set('flowsPerYear', data.result);
  });
}
