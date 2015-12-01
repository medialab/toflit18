/**
 * TOFLIT18 Browser Actions
 * =========================
 *
 * Actions related to the classification browser.
 */
import {enpoint} from '../../config.json';
import {saveAs} from 'browser-filesaver';
import history from '../history';

import {reset as resetModal} from './patch';

const PATH = ['states', 'classification', 'browser'];

/**
 * Selecting a classification
 */
export function select(tree, id) {
  const state = tree.select(PATH);

  state.set('selected', id);
  state.set('rows', []);
  state.set('query', '');
  state.set('loading', true);

  // Fetching the necessary rows
  tree.client.search({params: {id}}, function(err, data) {
    state.set('loading', false);

    if (err) return;

    state.set('rows', data.result);
  });
}


/**
 * Expand the rows displayed on screen.
 */
export function expand(tree, classification) {
  const state = tree.select(PATH),
        current = state.get('rows'),
        query = state.get('query');

  if (classification.nb_groups <= current.length)
    return;

  const data = {offset: current.length};

  if (query)
    data.query = query;

  return tree.client.search(
    {params: {id: classification.id}, data},
    function(err, data) {
      if (err) return;

      state.concat('rows', data.result);
    }
  );
}

/**
 * Searching something specific.
 */
export function search(tree, id, query) {
  const loading = tree.select(PATH.concat('loading'));

  loading.set(true);
  return tree.client.search(
    {params: {id: id}, data: {query}},
    function(err, data) {
      loading.set(false);
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

/**
 * Triggering a modal.
 */
export function modal(tree, type) {
  const modal = tree.select('states', 'classification', 'modal');

  modal.set('type', type);
  resetModal(tree);

  history.replaceState(null, '/classification/modal');
}
