/**
 * TOFLIT18 Classification Patching Utilities
 * ===========================================
 *
 * Functions dealing with classifications' integrity checking and patch
 * application.
 */
import _, {
  difference,
  indexBy,
  intersection,
  find,
  first,
  sortBy
} from 'lodash';

// TODO: boss level => splits
// TODO: check link inconsistencies: group -> n items only allowed
// TODO: check consistency: null -> item / group -> null
// TODO: quid of dropped groups?

/**
 * Searching for inconsistencies in the patch.
 */
export function checkConsistency(patch) {

  // Searching for items present more than once
  return _(patch)
    .groupBy('item')
    .pairs()
    .map(([item, groups], index) => ({item, groups, index}))
    .filter(({groups}) => groups.length > 1)
    .value();
}

/**
 * Diffing items from one version of the classification to another.
 */
export function checkIntegrity(oldItems, newItems) {
  return {
    extraneous: difference(newItems, oldItems),
    missing: difference(oldItems, newItems)
  };
}

/**
 * Solving a classification patch.
 *
 * Note: the classifications should be provided as an array of items.
 * [
 *   {group: 'fruits', item: 'mango'},
 *   {group: null, item: 'orange'},
 *   {group: 'colors', item: null}
 * ]
 *
 * Note: the output is an array of operations.
 * [
 *   // 1) Group renames
 *   {type: 'renameGroup', from: 'a', to: 'b'}
 *
 *   // 2) Group additions
 *   {type: 'addGroup', name: 'c'}
 *
 *   // 3) Item moves
 *   {type: 'moveItem', from: 'group-a', to: 'group-b', item: 'whatever'}
 * ]
 */
const LIMBO = '$$limbo$$';

const grouper = (data) => {
  return _(data)
    .groupBy(row => row.group || LIMBO)
    .mapValues((group, k) => {
      if (k === LIMBO)
        return null;

      return group.map(row => row.item);
    })
    .value();
};

const indexer = (data) => {
  return _(data)
    .indexBy('item')
    .mapValues('group')
    .value();
}

export function applyPatch(classification, patch) {
  const grouped = grouper(classification),
        patchGrouped = grouper(patch),
        groups = Object.keys(grouped),
        patchedGroups = Object.keys(patchGrouped),
        items = indexer(classification),
        patchedItems = indexer(patch),
        operations = [];

  //-- Finding added groups
  const addedGroups = new Set(difference(patchedGroups, groups));

  //-- Finding renamed groups & adding related operations
  const renamedGroups = new Set(),
        itemsAddedToExistingGroups = new Set();

  addedGroups.forEach(function(p) {
    const pg = patchGrouped[p];

    // Finding the equivalent group in the current version
    const k = items[find(pg, i => !!items[i])],
          g = grouped[k];

    if (!g || !pg)
      return;

    if (intersection(g, pg).length === g.length) {
      operations.push({
        type: 'renameGroup',
        from: k,
        to: p
      });

      const addedItems = difference(pg, g);

      renamedGroups.add(p);

      addedItems.forEach(function(item) {
        itemsAddedToExistingGroups.add(item);
      });
    }
  });

  //-- Adding operations for added groups
  addedGroups.forEach(g => {
    if (!renamedGroups.has(g))
      operations.push({type: 'addGroup', name: g})
  });

  //-- Finding moving items
  for (let item in patchedItems) {
    const newGroup = patchedItems[item],
          currentGroup = items[item];

    if (newGroup !== currentGroup &&
        (!renamedGroups.has(newGroup) || itemsAddedToExistingGroups.has(item)))
      operations.push({
        type: 'moveItem',
        from: currentGroup || null,
        to: newGroup,
        item
      });
  }

  return operations;
}