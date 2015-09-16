/**
 * Parrot Abstraction
 * ===================
 *
 * The parrot abstraction can sit upon a baobab tree to oversee some of its
 * branches. If one of the branches returns unsatisfactory data, the parrot
 * will trigger automatically some API calls to retrieve the missing data.
 */

/**
 * Comparing a path with another specific path that was gotten in the tree.
 *
 * @param  {array}   path          - Path to compare.
 * @param  {array}   gottenPath    - Path that was gotten in the tree.
 * @return {boolean}               - Is one of the path relevant?
 */
function compare(path, gottenPath) {

  // Shortcut
  if (gottenPath.length < path.length)
    return false;

  // Comparing both paths
  for (let i = 0, l = path.length; i < l; i++)
    if (gottenPath[i] !== path[i])
      return false;

  return true;
}

/**
 * Parrot class
 *
 * @constructor
 * @param {Baobab} tree             - The tree upon which we want to sit.
 * @param {object} defintion        - The parrot's job definition.
 * @param {array}  definition.rules - The parrot's rules.
 *
 * Rules should be an object following the hereafter specification:
 *
 * {array}    path      - the path to oversee in the tree.
 * {function} get       - a function to call to retrieve the desired data.
 * {function} condition - can we get the desired data?
 * {function} expect    - what should we considered as desired data?
 * {array}    flag      - path of a boolean to toggle in the tree to
 *                        indicate we are in the fetching process.
 */
export default class Parrot {
  constructor(tree, definition) {

    // Properties
    this.tree = tree;
    this.rules = [];
    this.locks = {};

    // Adding rules
    const rules = definition.rules || [];
    rules.forEach(rule => this.rules.push([this.rules.length, rule]));

    // Hooking on the tree's get event
    this.listener = ({data: {data, solvedPath}}) => {

      // Filtering the relevant rules
      const relevantRules = this.rules.filter(([i, rule]) => {

        // If there is no path, we skip
        if (!rule.path)
          return false;

        // If the condition is not passed we skip
        if (typeof rule.condition === 'function' &&
            !rule.condition.call(this.tree, data))
          return false;

        // If the gotten data fulfilling expectations?
        if (typeof rule.expect === 'function' ? rule.expect(data) : !!data)
          return false;

        // Actually comparing the paths
        return compare(rule.path, solvedPath);
      });

      // Resolving actions
      relevantRules.forEach(([i, rule]) => {

        // If no fetcher were defined, we just stop there
        if (typeof rule.get !== 'function')
          return;

        // If said call has already been made, we don't trigger it twice
        if (this.locks[i])
          return;

        // TODO: deal with synchronous & non-promise cases
        const promise = rule.get();
        this.locks[i] = promise;

        // Toggling flag
        if (rule.flag)
          this.tree.set(rule.flag, true);

        // Upon completion, we will clear the lock
        const completion = () => {
          delete this.locks[i];

          // Resetting flag
          if (rule.flag)
            this.tree.set(rule.flag, false);
        };

        promise
          .then(completion)
          .fail(completion);
      });
    };

    tree.on('get', this.listener);
  }

  /**
   * Free the parrot from memory.
   */
  release() {
    this.tree.off('get', this.listener);
    delete this.tree;
    delete this.rules;
  }
}
