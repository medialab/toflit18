/**
 * TOFLIT18 Session Actions
 * =========================
 *
 * Actions related to the login or the user session.
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
  const flags = tree.select('flags', 'login');

  // Already attempting to log?
  if (flags.get('loading'))
    return;

  flags.set('loading', true);
  tree.client.login({data: {name, password}}, function(err, data) {
    flags.set('loading', false);

    if (err) {
      flags.set('failed', true);
      return;
    }

    flags.set('failed', false);
    tree.set('user', data.result);
  });
}
