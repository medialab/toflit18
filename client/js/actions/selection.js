/**
 * TOFLIT18 Selection Actions
 * ===========================
 *
 * Actions related to user selection.
 */
export function selectBrowserClassification(tree, id) {
  const state = tree.select('states', 'classification', 'browser');

  state.set('selected', id);

  // Fetching the necessary rows
  tree.client.groups({params: {id}}, function(err, data) {
    if (err) return;

    state.set('rows', data.result);
  });
}
