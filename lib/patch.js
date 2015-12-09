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
  groupBy
} from 'lodash';

/**
 * Searching for inconsistencies in the patch.
 */
export function checkConsistency(patch) {

  // Searching for items present more than once
  return _(patch)
    .map((row, index) => ({...row, index}))
    .groupBy('item')
    .pairs()
    .filter(([, rows]) => rows.length > 1)
    .map(([item, rows]) => {
      return {
        item,
        groups: rows.map(row => ({group: row.group, line: row.index + 2}))
      };
    })
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
 * Note: the processus keeps track of already existing ids to speed up the
 * application of the resultant operations later.
 *
 * Note: the classifications should be provided as an array of items.
 * [
 *   {groupId: 1, itemId: 34, group: 'fruits', item: 'mango'},
 *   {groupId: 2, itemId: 35, group: null, item: 'orange'},
 *   {groupId: 3, itemId: 36, group: 'colors', item: null}
 * ]
 *
 * Note: the output is an array of operations.
 * [
 *   // 1) Group renames
 *   {groupId: 1, type: 'renameGroup', from: 'a', to: 'b'}
 *
 *   // 2) Group additions
 *   {type: 'addGroup', name: 'c'}
 *
 *   // 3) Item moves
 *   {
 *     type: 'moveItem',
 *     fromId: [id|null],
 *     toId: [id|null]
 *     from: 'group-a',
 *     to: 'group-b',
 *     item: 'whatever'
 *   }
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

export function solvePatch(classification, patch) {
  const grouped = grouper(classification),
        patchGrouped = grouper(patch),
        groups = Object.keys(grouped),
        patchedGroups = Object.keys(patchGrouped),
        items = indexer(classification),
        patchedItems = indexer(patch),
        operations = [];

  const existingGroupsIndex = _(classification)
    .filter(row => !!row.group)
    .indexBy('group')
    .mapValues('groupId')
    .value();

  const existingItemsIndex = _(classification)
    .indexBy('item')
    .mapValues('itemId')
    .value();

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
        id: existingGroupsIndex[k],
        type: 'renameGroup',
        from: k,
        to: p
      });

      const addedItems = difference(pg, g);

      renamedGroups.add(p);

      addedItems.forEach(item => itemsAddedToExistingGroups.add(item));
    }
  });

  //-- Operations for added groups
  addedGroups.forEach(g => {
    const groupItems = patchGrouped[g]
      .filter(item => {
        return !!item && (item in items);
      });

    if (groupItems.length && !renamedGroups.has(g))
      operations.push({type: 'addGroup', name: g});
  });

  //-- Finding moving items
  for (let item in patchedItems) {
    const newGroup = patchedItems[item],
          currentGroup = items[item];

    if (currentGroup !== undefined &&
        newGroup !== currentGroup &&
        (!renamedGroups.has(newGroup) || itemsAddedToExistingGroups.has(item)))
      operations.push({
        type: 'moveItem',
        fromId: existingGroupsIndex[currentGroup] || null,
        from: currentGroup || null,
        toId: existingGroupsIndex[newGroup] || null,
        to: newGroup,
        itemId: existingItemsIndex[item],
        item
      });
  }

  return operations;
}

/**
 * Applying virtually a classification patch.
 */
export function applyOperations(classification, operations) {
  const patchedClassification = classification.map(({item, group}) => ({item, group}));


  const groupedOperations = groupBy(operations, 'type');

  //-- Renamed groups
  const renamedGroups = groupedOperations.renameGroup.reduce(function(acc, o) {
    return {...acc, [o.from]: o.to};
  }, {});

  //-- Moved items
  const movedItems = indexBy(groupedOperations.moveItem, 'item');

  //-- Iterating over the classification to update it
  patchedClassification.forEach(function(row) {

    // Renamed group?
    if (renamedGroups[row.group])
      row.group = renamedGroups[row.group];

    // Moved item
    if (movedItems[row.item])
      row.group = movedItems[row.item].to;
  });

  return patchedClassification;
}
