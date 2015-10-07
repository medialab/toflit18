/**
 * TOFLIT18 Client Helpers
 * ========================
 *
 * Miscellaneous client helper functions.
 */
export function flattenTree(branch, list=[], level=0) {

  if (!Object.keys(branch).length)
    return list;

  list.push({...branch, level});

  (branch.children || []).forEach(c => flattenTree(c, list, level + 1));

  return list;
}
