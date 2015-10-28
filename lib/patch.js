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
  sortBy
} from 'lodash';

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
  const renamedGroups = new Set();
  addedGroups.forEach(function(p) {
    const pg = patchGrouped[p],
          k = items[pg[0]],
          g = grouped[k];

    if (!g || !pg)
      return;

    if (intersection(g, pg).length === g.length) {
      operations.push({
        type: 'renameGroup',
        from: k,
        to: p
      });

      renamedGroups.add(p);
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

    if (newGroup !== currentGroup && !renamedGroups.has(newGroup))
      operations.push({
        type: 'moveItem',
        from: currentGroup,
        to: newGroup,
        item
      });
  }

  return operations;
}
