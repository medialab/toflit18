/**
 * TOFLIT18 Session Actions
 * =========================
 *
 * Actions related to the login or the user session.
 */
import history from '../history';

/**
 * Checking the user session
 */
export function checkSession(tree) {
  tree.client.session(function(err, data) {
    if (data) {
      tree.set('user', data.result);
      history.replaceState(null, '/');
    }
  });
}

/**
 * Simple attempt to log
 */
export function login(tree, name, password) {
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
    history.replaceState(null, '/');
  });
}

/**
 * Logout
 */
export function logout(tree) {
  tree.client.logout(err => {
    location.reload();
  });
}
