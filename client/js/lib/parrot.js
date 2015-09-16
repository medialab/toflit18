/**
 * Parrot Abstraction
 * ===================
 *
 * The parrot abstraction can sit upon the desired baobab tree and will fetch
 * data using a server API to fill the tree's with it whenever some specific
 * paths are accessed and returning unsatisfactory data.
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
 * @param {Baobab} tree      - The tree upon which we want to sit.
 * @param {object} defintion - The parrot's job definition.
 */
export default class Parrot {
  constructor(tree, definition) {

    // Properties
    this.tree = tree;
    this.rules = [];

    // Adding rules
    const rules = definition.rules || [];
    rules.forEach(rule => this.addRule(rule));

    // Hooking on the tree's get event
    this.listener = ({data: {solvedPath}}) => {

      // Filtering the relevant rules
      const relevantRules = this.rules.filter(function(rule) {
        return rule.path && compare(rule.path, solvedPath);
      });

      console.log(solvedPath, relevantRules);
    };

    tree.on('get', this.listener);
  }

  /**
   * Add a rule to the parrot.
   *
   * @param  {object} rule - The rule to add.
   * @return {Parrot}      - Itself for chaining purposes.
   */
  addRule(rule) {

    this.rules.push(rule);
    return this;
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
