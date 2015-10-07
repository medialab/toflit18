/**
 * TOFLIT18 Classification Model
 * ==============================
 *
 */
import database from '../connection';
import {classification as queries} from '../queries';
import {searchRegex} from '../helpers';
import {groupBy, find} from 'lodash';
import {stringify} from 'csv';

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
    return database.cypher({query: queries.groups, params: {id, ...opts}}, function(err, results) {
      if (err) return callback(err);

      const groups = results.map(row => {
        return {
          ...row.group.properties,
          id: row.group._id
        };
      });

      return callback(null, groups);
    });
  },

  // Searching for groups
  searchGroups(id, opts, callback) {
    return database.cypher(
      {
        query: queries.searchGroups,
        params: {...opts, id, query: searchRegex(opts.query)}
      },
      function(err, results) {
        if (err) return callback(err);

        const groups = results.map(row => {
          return {
            ...row.group.properties,
            id: row.group._id
          };
        });

        return callback(null, groups);
      }
    );
  },

  // Exporting to csv
  export(id, callback) {
    return database.cypher({query: queries.export, params: {id}}, function(err, results) {
      if (err) return callback(err);
      if (!results.length) return callback(null, null);

      const {name, parent, model} = results[0];

      const headers = [name, parent, 'note', 'outsider'];

      const rows = results.slice(1).map(function(row) {
        return [
          row.group,
          row.item,
          row.note,
          '' + row.outsider
        ];
      });

      return stringify([headers].concat(rows), {}, function(err, csv) {
        if (err) return callback(err);

        return callback(null, {csv, name, model: model.toLowerCase()});
      });
    });
  }
};

export default model;
