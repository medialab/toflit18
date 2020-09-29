/**
 * TOFLIT18 Classification Patching Utilities
 * ===========================================
 *
 * Functions dealing with classifications' integrity checking and patch
 * application.
 */
import _, { difference, indexBy, intersection, find, groupBy, map, mapValues, union } from "lodash";

/**
 * Searching for inconsistencies in the patch.
 */
export function checkConsistency(patch) {
  // Searching for items present more than once
  return _(patch)
    .map((row, index) => ({ ...row, index }))
    .groupBy("item")
    .pairs()
    .filter(([, rows]) => rows.length > 1)
    .map(([item, rows]) => {
      return {
        item,
        groups: rows.map(row => ({ group: row.group, line: row.index + 2 })),
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
    missing: difference(oldItems, newItems),
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
const LIMBO = "$$limbo$$";

const grouper = data => {
  return _(data)
    .groupBy(row => row.group || LIMBO)
    .mapValues((group, k) => {
      if (k === LIMBO) return null;

      return group.map(row => row.item);
    })
    .value();
};

const indexer = data => {
  return _(data)
    .indexBy("item")
    .mapValues("group")
    .value();
};

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
    .indexBy("group")
    .mapValues("groupId")
    .value();

  const existingItemsIndex = _(classification)
    .indexBy("item")
    .mapValues("itemId")
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

    if (!g || !pg) return;

    if (intersection(g, pg).length === g.length) {
      operations.push({
        id: existingGroupsIndex[k],
        type: "renameGroup",
        from: k,
        to: p,
      });

      const addedItems = difference(pg, g);

      renamedGroups.add(p);

      addedItems.forEach(item => itemsAddedToExistingGroups.add(item));
    }
  });

  //-- Operations for added groups
  addedGroups.forEach(g => {
    const groupItems = patchGrouped[g].filter(item => {
      return !!item && item in items;
    });

    if (groupItems.length && !renamedGroups.has(g)) operations.push({ type: "addGroup", name: g });
  });

  //-- Finding moving items
  for (const item in patchedItems) {
    const newGroup = patchedItems[item],
      currentGroup = items[item];

    if (
      currentGroup !== undefined &&
      newGroup !== currentGroup &&
      (!renamedGroups.has(newGroup) || itemsAddedToExistingGroups.has(item))
    )
      operations.push({
        type: "moveItem",
        fromId: existingGroupsIndex[currentGroup] || null,
        from: currentGroup || null,
        toId: existingGroupsIndex[newGroup] || null,
        to: newGroup,
        itemId: existingItemsIndex[item],
        item,
      });
  }

  return operations;
}

/**
 * Applying virtually a classification patch.
 */
export function applyOperations(classification, operations) {
  const patchedClassification = classification.map(({ item, group }) => ({ item, group }));

  const { renameGroup = [], moveItem = [] } = groupBy(operations, "type");

  //-- Renamed groups
  const renamedGroups = {};

  renameGroup.forEach(o => (renamedGroups[o.from] = o.to));

  //-- Moved items
  const movedItems = indexBy(moveItem, "item");

  //-- Iterating over the classification to update it
  patchedClassification.forEach(function(row) {
    // Renamed group?
    if (renamedGroups[row.group]) row.group = renamedGroups[row.group];

    // Moved item
    if (movedItems[row.item]) row.group = movedItems[row.item].to;
  });

  return patchedClassification;
}

/**
 * Get affected groups from an operations list.
 */
export function getAffectedGroups(operations) {
  const affectedGroups = new Set();

  const { renameGroup = [], moveItem = [] } = groupBy(operations, "type");

  renameGroup.forEach(o => affectedGroups.add(o.from));
  moveItem.forEach(o => {
    if (o.from) affectedGroups.add(o.from);
    if (o.to) affectedGroups.add(o.to);
  });

  return affectedGroups;
}

/**
 * Rewiring a single upper classification.
 */
export function rewire(upper, C1, C2, operations) {
  const lowerToUpper = {},
    upperToLower = {},
    operationsMoves = {},
    groupsToItemsC1 = mapValues(groupBy(C1, "group"), rows => map(rows, "item")),
    groupsToItemsC2 = mapValues(groupBy(C2, "group"), rows => map(rows, "item")),
    alreadyDone = new Set(),
    links = [];

  let cluster = 0;

  // Added items should be dropped from the equation
  let addedItems = _(operations)
    .filter(o => o.type === "moveItem" && !o.from)
    .map("item")
    .value();

  addedItems = new Set(addedItems);

  // Indexing upper to lower
  upper.forEach(row => {
    upperToLower[row.group] = row.items;

    row.items.forEach(item => (lowerToUpper[item] = row.group));
  });

  // Indexing operations' targets
  operations.forEach(o => {
    // WARNING: double check this part
    if (o.type === "addGroup") return;

    if (o.from) {
      operationsMoves[o.from] = operationsMoves[o.from] || [];
      operationsMoves[o.from].push(o.to);
    }

    if (o.to) {
      operationsMoves[o.to] = operationsMoves[o.to] || [];
      operationsMoves[o.to].push(o.from);
    }
  });

  // Iterating through affected groups
  const affectedGroups = getAffectedGroups(operations);

  affectedGroups.forEach(function(affectedGroup) {
    if (alreadyDone.has(affectedGroup)) return;

    // Retrieve affected groups from C1 aggregated
    const upperGroup = lowerToUpper[affectedGroup];

    // The group has no existence in the upper classification
    if (!upperGroup) return;

    // Retrieving groups in C1 aggregated by such group
    const groups = upperToLower[upperGroup];

    // Retrieving items belonging to those groups
    const items = _(groups)
      .map(group => groupsToItemsC1[group])
      .flatten()

      // TODO: investigate the undefined
      .compact()
      .value();

    // Retrieving groups in C2 by checking the operations
    const complementaryGroups = _(groups)
      .map(group => operationsMoves[group])
      .compact()
      .flatten()
      .uniq()
      .value();

    const complementaryItems = _(complementaryGroups)
      .map(group => groupsToItemsC2[group])
      .flatten()

      // TODO: investigate the undefined
      .compact()
      .value();

    // Building sets
    const set1 = items;

    const set2 = _(items)
      .concat(complementaryItems)
      .uniq()
      .filter(item => !addedItems.has(item))
      .value();

    // Comparing sets
    const identicalSets = set1.length === set2.length && union(set1, set2).length === set1.length;

    // Associating groups
    const allGroups = _(groups)
      .concat(complementaryGroups)
      .uniq()

      // NOTE: drop this when the matter of null items is solved?
      .compact()
      .value();

    // Flagging the links
    allGroups.forEach(group => {
      links.push({
        cluster: "c" + cluster,
        shouldExist: identicalSets,
        beforeItems: groupsToItemsC1[group] || [],
        afterItems: groupsToItemsC2[group] || [],
        upper: upperGroup,
        group,
      });

      // Blacklisting groups so we don't do them again
      alreadyDone.add(group);
    });

    cluster++;
  });

  return links;
}

/**
 * Checking the rewire links to propose the user a straighforward report
 * concerning ambiguous cases.
 */
export function rewireReport(links) {
  const groupToUppers = {};

  _(links)
    .filter(l => !l.shouldExist && !!l.afterItems.length)
    .groupBy("group")
    .forEach((ls, group) => {
      groupToUppers[group] = {
        uppers: [],
        beforeItems: [],
        afterItems: [],
      };

      const target = groupToUppers[group];

      ls.forEach(l => {
        target.uppers.push(l.upper);

        const currentSet = target.afterItems;

        if (currentSet.length && currentSet.length !== l.afterItems.length) target.problem = true;

        target.afterItems = l.afterItems;

        if (l.beforeItems) target.beforeItems = l.beforeItems;
      });
    })
    .value();

  // Back to a list
  const report = Object.keys(groupToUppers).map(group => {
    return {
      group,
      ...groupToUppers[group],
    };
  });

  return report;
}
