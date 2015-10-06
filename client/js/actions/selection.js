/**
 * TOFLIT18 Selection Actions
 * ===========================
 *
 * Actions related to user selection.
 */
export function selectBrowserClassification(tree, id) {
  tree.set(['states', 'classification', 'browser', 'selected'], id);
}
