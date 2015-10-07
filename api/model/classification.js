/**
 * TOFLIT18 Classification Model
 * ==============================
 *
 */
import database from '../connection';
import {classification as queries} from '../queries';
import {groupBy, find} from 'lodash';

/**
 * Helpers.
 */
function makeTree(list, tree) {
  if (!tree) {
    const root = find(list, {source: true});
    tree = {...root};
  }

  tree.children = list.filter(e => e.parent === tree.id);

  tree.children.forEach(e => makeTree(list, e));

  return tree;
}

/**
 * Model.
 */
const model = {

  // Retrieving the list of every classifications
  getAll(callback) {
    return database.cypher(queries.getAll, function(err, results) {
      if (err) return callback(err);

      const classifications = results.map(row => {
        return {
          ...row.classification.properties,
          id: row.classification._id,
          author: row.author,
          parent: row.parent,
          nb_groups: row.nb_groups
        };
      });

      const groupedByModel = groupBy(classifications, c => c.model.toLowerCase());

      const tree = {
        product: makeTree(groupedByModel.product),
        country: makeTree(groupedByModel.country)
      };

      return callback(null, tree);
    });
  },

  // Retrieving a sample of the classification's groups
  groups(id, opts, callback) {
    return database.cypher({query: queries.groups, params: {id}}, function(err, results) {

      const groups = results.map(row => {
        return {
          ...row.group.properties,
          id: row.group._id
        };
      });

      return callback(null, groups);
    });
  }
};

export default model;
