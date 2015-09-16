/**
 * TOFLIT18 Client Actions
 * ========================
 *
 * Functions used to update the tree.
 */

/**
 * Checking the user session
 */
export function checkSession(tree) {
  tree.client.session(function(err, data) {
    if (data)
      tree.set('user', data.result);
  });
}

/**
 * Simple attempt to log
 */
export function attemptLogin(tree, name, password) {
  const flag = tree.select('flags', 'login');

  // Already attempting to log?
  if (flag.get())
    return;

  flag.set(true);
  tree.client.login({data: {name, password}}, function(err, data) {
    flag.set(false);

    if (err)
      return;

    tree.set('user', data.result);
  });
}
