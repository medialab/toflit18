/**
 * TOFLIT18 Browser Actions
 * =========================
 *
 * Actions related to the classification browser.
 */
import {saveAs} from 'browser-filesaver';
import history from '../history';

import {reset as resetModal} from './patch';

import {uniq} from 'lodash';

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
export function expand(tree, classification, queryGroup, queryItem) {
  const state = tree.select(PATH),
        current = state.get('rows');

  const comparedValue = classification.source ?
    classification.itemsCount :
    classification.groupsCount;

  // NOTE: this is hardcoded but can be found in the API's configuration
  if (queryGroup || queryItem && !(comparedValue % 200))
    return;

  if (comparedValue <= current.length)
    return;

  const data = {offset: current.length};

  if (queryGroup || queryItem) {
    data.queryGroup = queryGroup;
    data.queryItem = queryItem;
  }

  // change this function
  return tree.client.search(
    {params: {id: classification.id}, data},
    function(err, response) {
      if (err) return;

      state.concat('rows', response.result);
    }
  );
}

/**
 * Searching something specific.
 */
export function search(tree, id, queryGroup, queryItem) {
  const loading = tree.select(PATH.concat('loading'));

  loading.set(true);

  const source = tree.get(PATH.concat('current', 'source'));

  return tree.client.search(
    {params: {id}, data: {queryGroup, queryItem, source}},
    function(err, data) {

      loading.set(false);
      if (err) return;

      data.result.forEach(d => {
        d.items = uniq(d.items);
      });

      tree.set(PATH.concat(['queryGroup']), queryGroup);
      tree.set(PATH.concat(['queryItem']), queryItem);
      tree.set(PATH.concat(['rows']), data.result);
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
  const cursor = tree.select('states', 'classification', 'modal');

  cursor.set('type', type);
  resetModal(tree);

  history.replace({pathname: '/classification/modal'});
}

/**
 * Reset filters
 */
export function resetFilters(tree, id) {
  const loading = tree.select(PATH.concat('loading'));

  loading.set(true);

  // reset input fields
  if (document.getElementById('searchGroup').value !== null)
    document.getElementById('searchGroup').value = '';
  if (id !== 1 && id !== 10 && document.getElementById('searchItem').value !== null)
    document.getElementById('searchItem').value = '';

  // reset tree fields
  tree.set(['states', 'classification', 'browser', 'queryGroup'], '');
  tree.set(['states', 'classification', 'browser', 'queryItem'], '');

  return tree.client.search(
    {params: {id}, data: ''},
    function(err, data) {

      loading.set(false);
      if (err) return;

      tree.set(['states', 'classification', 'browser', 'rows'], data.result);
    }
  );
}
