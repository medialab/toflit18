/**
 * TOFLIT18 Data Actions
 * ======================
 *
 * Actions in charge of data retrieval etc.
 */
export function expandBrowserGroups(tree, classification) {
  const rows = tree.select('states', 'classification', 'browser', 'rows'),
        current = rows.get();

  if (classification.nb_groups <= current.length)
    return;

  return tree.client.groups(
    {params: {id: classification.id}, data: {offset: current.length}},
    function(err, data) {
      if (err) return;

      rows.concat(data.result);
    }
  );
}

export function searchBrowserGroups(tree, id, query) {

  console.log(query)
  return tree.client.searchGroups(
    {params: {id: id, query}},
    function(err, data) {
      if (err) return;

      tree.set(['states', 'classification', 'browser', 'rows'], data.result);
    }
  );
}
