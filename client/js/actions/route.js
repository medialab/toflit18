/**
 * TOFLIT18 Route Actions
 * ========================
 */

/**
 * Changing the current route
 */
export function changeRoute(tree, newRoute) {
  tree.set('route', newRoute);
}

/**
 * Changing the current subroute
 */
export function changeSubroute(tree, newSubroute) {
  tree.set('subroute', newSubroute);
}
