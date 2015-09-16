/**
 * TOFLIT18 Client Actions
 * ========================
 *
 * Functions used to update the tree.
 */
export function attemptLogin(tree) {
  tree.apply('counter', (c=0) => c + 20);
}
