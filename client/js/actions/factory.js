/**
 * TOFLIT18 Actions Factory
 * =========================
 *
 * Functions creating generic actions for convenience.
 */
export function linker(path) {
  return function(tree, val) {
    tree.set(path, val);
    return tree.commit();
  }
}
