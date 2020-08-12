/**
 * TOFLIT18 Indicators Actions
 * ============================
 *
 * Actions related to the indicators' view.
 */
import specs from '../../specs.json';
import _, {forIn, compact} from 'lodash';
import {regexIdToString} from '../lib/helpers';

const ROOT = ['metadataState'];

function fetchGroups(tree, cursor, id, callback) {
  tree.client.groups({params: {id}}, function(err, data) {
    if (err) return;

    cursor.set(data.result.map(d => ({...d, value: d.id})));

    if (callback) callback();
  });
}

export function updateSelector(tree, name, item, callback) {

  // If `item` is an empty array, use `null` instead, for routing purpose:
  if (Array.isArray(item) && !item.length) item = null;

  const selectors = tree.select([...ROOT, 'selectors']),
        groups = tree.select([...ROOT, 'groups']),
        previousItem = selectors.get(name);

  // Updating the correct selector
  selectors.set(name, item);

  // If we updated a classification, we need to reset some things
  if (/classification/i.test(name)) {
    const model = name.match(/(.*?)Classification/)[1];

    if (item !== previousItem) {
      selectors.set(model, null);
      groups.set(model, []);
    }

    if (item)
      fetchGroups(tree, groups.select(model), item, callback);
  }
}

export function selectType(tree, selected) {
  const cursor = tree.select(ROOT),
        selectors = tree.select([...ROOT, 'selectors']),
        groups = tree.select([...ROOT, 'groups']),
        model = tree.get(...ROOT, 'dataModel');

  if (selected) {
    selectors.set(model + 'Classification', null);
    selectors.set(model, null);
    groups.set(model, []);

    fetchGroups(tree, groups.select(model), selected);
  }

  cursor.set('perYear', null);
  cursor.set('flowsPerYear', null);
  cursor.set('dataType', selected);
}

export function selectModel(tree, selected) {
  const cursor = tree.select(ROOT),
        classifications = tree.get('data', 'classifications', 'flat');

  if (selected) {
    if (selected.value === 'partner') {
      selectType(tree, classifications.partner[0]);
    }
    else if (selected.value === 'product') {
      selectType(tree, classifications.product[0]);
    }
    else {
      selectType(tree, null);
    }
  }

  cursor.set('dataModel', selected);
}

export function addChart(tree) {
  const cursor = tree.select(ROOT);

  const dataType = cursor.get('dataType'),
        dataModel = cursor.get('dataModel'),
        groups = cursor.get('groups'),
        classifications = tree.get('data', 'classifications', 'flat'),
        fullDataType = dataModel && dataType && classifications[dataModel].find(o => o.id === dataType);

  // Can't load data without a selected model:
  if (!dataModel) return;

  // Can't load data when there is a model and a type, but the full data type hasn't been loaded yet:
  if (dataType && !fullDataType) return;

  cursor.set('perYear', null);
  cursor.set('flowsPerYear', null);
  cursor.set('fileName', null);
  cursor.set('loading', true);

  // Loading data from server
  const type = fullDataType ?
    `${dataModel}_${fullDataType.id}` :
    dataModel;

    // set params for request
  const params = {},
        paramsRequest = {};

  // get selectors choosen
  forIn(cursor.get('selectors'), (v, k) => {
    if (v) {
      params[k] = v;
    }
  });

  // keep only params !== null for request
  forIn(params, (v, k) => {
     switch (k) {
        case 'product':
        case 'partner':
          paramsRequest[k] = compact((v || []).map(id => {
            // Detect custom regex values:
            const regex = regexIdToString(id);
            if (regex) {
              return {
                id: -1,
                value: regex,
                name: id
              };
            }
            return groups[k].find(o => o.id === id);
          }));
          break;
        default:
          paramsRequest[k] = v;
      }
  });

  tree.client.flowsPerYear({params: {type}, data: paramsRequest}, function(err, data) {
    cursor.set('loading', false);

    if (err)
      return;

    // Aggregation per year
    const perYear = [];

    _(data.result)
      .map(e => e.data)
      .flatten()
      .map(d => d.year)
      .groupBy()
      .forEach((v, k) => perYear.push({year: +k, data: _.isArray(v) ? v.length : 0}));

    cursor.set('perYear', perYear);

    // Don't ask for data we don't need
    if (dataType && data.result.length > specs.metadataGroupMax)
      return;

    cursor.set('flowsPerYear', data.result);
  });

  // set fileName form params selected
  let fileName = '';

  forIn(params, (v) => {
    if (v)
      fileName = fileName + v + ' - ';
  });

  cursor.set('fileName', fileName);
}
