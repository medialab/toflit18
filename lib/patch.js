/**
 * TOFLIT18 Classification Patching Utilities
 * ===========================================
 *
 * Functions dealing with classifications' integrity checking and patch
 * application.
 */
import _, {difference, indexBy} from 'lodash';

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
 */
const grouper = (data) => {
  return _(data)
    .groupBy('group')
    .mapValues(group => {
      return group ?
        group.map(row => row.item) :
        [];
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

  //-- 1) Finding added groups
  const addedGroups = new Set(difference(patchedGroups, groups));
  addedGroups.forEach(g => operations.push({type: 'addGroup', name: g}));

  //-- 2) Finding item moves
  for (let item in patchedItems) {
    const newGroup = patchedItems[item],
          currentGroup = items[item];

    if (newGroup !== currentGroup)
      operations.push({
        type: 'moveItem',
        from: currentGroup,
        to: newGroup,
        item
      });
  }

  return operations;
}
