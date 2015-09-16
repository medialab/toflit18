/**
 * TOFLIT18 Client Actions
 * ========================
 *
 * Functions used to update the tree.
 */
export function attemptLogin(tree, name, password) {
  const flag = tree.select('flags', 'login');

  // Already attempting to log?
  if (flag.get())
    return;

  flag.set(true);
  tree.client.log({data: {name, password}}, function(err, data) {
    flag.set(false);

    if (err)
      return;

    tree.set('user', data.result);
  });
}
