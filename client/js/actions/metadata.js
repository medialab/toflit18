/**
 * TOFLIT18 Indicators Actions
 * ============================
 *
 * Actions related to the indicators' view.
 */

const ROOT = ['states', 'exploration', 'metadata'];

export function select(tree, value) {
  const cursor = tree.select(ROOT);
  cursor.set('dataType', value);
}
