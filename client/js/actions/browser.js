/**
 * TOFLIT18 Browser Actions
 * =========================
 *
 * Actions related to the classification browser.
 */
import {enpoint} from '../../config.json';
import {saveAs} from 'browser-filesaver';

/**
 * Selecting a classification
 */
export function select(tree, id) {
  const state = tree.select('states', 'classification', 'browser');

  state.set('selected', id);
  state.set('rows', []);

  // Fetching the necessary rows
  tree.client.groups({params: {id}}, function(err, data) {
    if (err) return;

    state.set('rows', data.result);
  });
}


/**
 * Expand the rows displayed on screen.
 */
export function expand(tree, classification) {
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

/**
 * Searching something specific.
 */
export function search(tree, id, query) {
  return tree.client.groups(
    {params: {id: id}, data: {query}},
    function(err, data) {
      if (err) return;

      tree.set(['states', 'classification', 'browser', 'rows'], data.result);
    }
  );
}

/**
 * Download a classification as a CSV file.
 */
export function download(tree, id) {
  const flag = tree.select('flags', 'downloading');

  flag.set(true);
  tree.client.export({params: {id}}, function(err, data) {
    flag.set(false);

    if (err) return;

    // Downloading the csv file
    const {result: {filename, csv}} = data,
          blob = new Blob([csv], {type: 'text/csv;charset=utf-8'});

    return saveAs(blob, filename);
  });
}
