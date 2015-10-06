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
  getAll(callback) {
    return database.cypher(queries.getAll, function(err, results) {
      if (err) return callback(err);

      const classifications = results.map(row => {
        return {
          ...row.classification.properties,
          id: row.classification._id,
          author: row.author,
          parent: row.parent
        };
      });

      const groupedByModel = groupBy(classifications, c => c.model.toLowerCase());

      const tree = {
        product: makeTree(groupedByModel.product),
        country: makeTree(groupedByModel.country)
      };

      return callback(null, tree);
    });
  }
};

export default model;
