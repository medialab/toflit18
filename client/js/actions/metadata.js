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
  const cursor = tree.select(ROOT),
        selectors = tree.select([...ROOT, 'selectors']);

  cursor.set('dataType', selected);


  cursor.set('perYear', null);
  cursor.set('flowsPerYear', null);

  if (!selected)
    return;

  // Loading data from server
  const type = selected.id ?
    `${selected.model}_${selected.id}` :
    selected.value;

  let sourceType,
      direction,
      productClassification,
      product, 
      countryClassification,
      country,
      kind;

  if (selectors.get('sourceType') !== null)
    sourceType = selectors.get('sourceType').value;
  else
    sourceType = null;

  if (selectors.get('direction') !== null) {
    direction = selectors.get('direction').id;
  }
  else
    direction = null;

  if (selectors.get('productClassification') !== null) {
    productClassification = selectors.get('productClassification').id;
  }
  else
    productClassification = null;

  if (selectors.get('product') !== null) {
    product = selectors.get('product').id;
  }
  else
    product = null;

  if (selectors.get('countryClassification') !== null) {
    countryClassification = selectors.get('countryClassification').id;
  }
  else
    countryClassification = null;

  if (selectors.get('country') !== null) {
    country = selectors.get('country').id;
  }
  else
    country = null;

  if (selectors.get('kind') !== null) {
    kind = selectors.get('kind').id;
  }
  else
    kind = null;

  const params = {
    sourceType: sourceType,
    direction: direction,
    productClassification: productClassification,
    product: product,
    countryClassification: countryClassification,
    country: country,
    kind: kind
  }

  tree.client.flowsPerYear({params: {type}, data: params}, function(err, data) {
    if (err)
      return;

    // aggregation perYear
    let perYear=[]
    _(data.result)
        .map(e=> e.data)
        .flatten()
        .map(d => d.year)
        .groupBy()
        .forEach( (v,k) => perYear.push({year:+k, data:_.isArray(v) ? v.length : 0}))
        .value()
        
    cursor.set('perYear', perYear);

    // Don't ask for data we don't need
    if (selected.id && selected.groupsCount > config.metadataGroupMax)
      return;

    cursor.set('flowsPerYear', data.result);
  });
}

/**
 * Updating a selector.
 */
function fetchGroups(tree, cursor, id) {
  tree.client.groups({params: {id}}, function(err, data) {
    if (err) return;

    cursor.set(data.result);
  });
}

export function updateSelector(tree, name, item) {
  const selectors = tree.select([...ROOT, 'selectors']),
        groups = tree.select([...ROOT, 'groups']);

  // Updating the correct selector
  selectors.set(name, item);

  // If we updated a classification, we need to reset some things
  if (/classification/i.test(name)) {
    const model = name.match(/(.*?)Classification/)[1];

    selectors.set(model, null);
    groups.set(model, []);

    if (item)
      fetchGroups(tree, groups.select(model), item.id);
  }
}

export function addChart(tree) {
  console.log("addChart")
  const cursor = tree.select(ROOT),
        selectors = tree.select([...ROOT, 'selectors']);

  
}