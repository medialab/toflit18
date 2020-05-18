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
 * Update some selector
 */
export function updateSelector(tree, key, value) {
  tree.select(PATH).set(key, value);

  // Some quite specific behaviours:
  // 1. It is possible to order by matched elements only when there is some queryItem:
  if (key === 'queryItem' && !value && tree.get(...PATH, 'orderBy') === 'nbMatches')
    tree.set([...PATH, 'orderBy'], 'size');
}

/**
 * Searching something specific.
 */
export function search(tree, paginate = false) {
  const state = tree.select(PATH),
        loading = state.select('loading'),
        reachedBottom = state.select('reachedBottom'),
        classification = state.get('current'),
        rows = state.get('rows');

  if (loading.get()) return;

  if (paginate && reachedBottom.get()) return;

  if (!paginate && reachedBottom.get()) reachedBottom.set(false);

  const data = {
    orderBy: state.get('orderBy'),
    queryItem: state.get('queryItem') || '',
    queryGroup: state.get('queryGroup') || '',
    source: state.get('current', 'source') || false
  };

  const selected = state.get('selected');
  const selectedParent = state.get('selectedParent');
  if (selectedParent)
    data.queryItemFrom = selectedParent;

  if (paginate) {
    const comparedValue = classification.source ?
      classification.itemsCount :
      classification.groupsCount;

    if (comparedValue <= rows.length)
      return;

    data.offset = rows.length;
  }

  loading.set(true);

  return tree.client.search(
    {params: {id: selected}, data},
    function(err, response) {
      loading.set(false);

      if (err) return;

      response.result.forEach(d => {
        d.items = uniq(d.items);
      });

      if (paginate)
        state.concat('rows', response.result);
      else
        state.set('rows', response.result);

      if (response.result.length < 200)
        reachedBottom.set(true);
    }
  );
}

/**
 * Selecting a classification
 */
export function select(tree, id) {
  const state = tree.select(PATH);

  state.set('selected', id);
  state.set('selectedParent', null);
  state.set('rows', []);
  state.set('query', '');

  if (id) {
    const selected = tree.get('data', 'classifications', 'index', id);
    state.set('selectedParent', (selected || {}).parent);
  }

  // Fetching the necessary rows
  search(tree);
}

/**
 * Selecting a classification parent
 */
export function selectParent(tree, id) {
  const state = tree.select(PATH);

  state.set('selectedParent', id);

  // Fetching the necessary rows
  search(tree);
}


/**
 * Expand the rows displayed on screen.
 */
export function expandGroup(tree, groupId) {
  const state = tree.select(PATH),
        group = state.get('rows', {id: groupId}),
        selectedParent = state.get('selectedParent'),
        queryItem = state.get('queryItem');

  if (group.items.length >= group.nbItems)
    return;

  const data = {
    limitItem: 50,
    offsetItem: group.items.length
  };

  if (queryItem)
    data.queryItem = queryItem;

  if (selectedParent)
    data.queryItemFrom = selectedParent;

  // change this function
  return tree.client.group(
    {params: {id: group.id}, data},
    function(err, response) {
      if (err) return;

      state.concat(['rows', {id: groupId}, 'items'], response.result.items);
    }
  );
}

/**
 * Download a classification as a CSV file.
 */
export function download(tree, id) {
  const flag = tree.select('ui', 'downloading');

  flag.set(true);
  tree.client.export({params: {id}}, (err, data) => {
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
 * ****
 * [jacomyal] WARNING:
 * This action does not work properly, since #/classification/modal seems not to
 * link to any specific view. I leave the code here, though, since there would
 * be an actual lot to remove (history.js, patch.js).
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
  tree.set(['states', 'classification', 'browser', 'reachedBottom'], false);
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
