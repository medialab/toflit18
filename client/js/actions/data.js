/**
 * TOFLIT18 Data Actions
 * ======================
 *
 * Actions in charge of data retrieval etc.
 */
export function expandBrowserGroups(tree, id) {
  const rows = tree.select('states', 'classification', 'browser', 'rows'),
        current = rows.get();

  return tree.client.groups(
    {params: {id}, data: {offset: current.length}},
    function(err, data) {
      if (err) return;

      rows.concat(data.result);
    }
  );
}
