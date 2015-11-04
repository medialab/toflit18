/**
 * TOFLIT18 Classification Model
 * ==============================
 *
 */
import async from 'async';
import database from '../connection';
import {classification as queries} from '../queries';
import {searchRegex} from '../helpers';
import {stringify} from 'csv';
import {applyPatch, checkIntegrity} from '../../lib/patch';
import Batch from '../../lib/batch';
import {groupBy, find, map} from 'lodash';

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

function computeCompletion(items, unclassified) {
  return (
    100 - ((unclassified * 100) / items)
  ) | 0;
}

/**
 * Model.
 */
const Model = {

  //-- Retrieving the list of every classifications
  getAll(callback) {
    return database.cypher(queries.getAll, function(err, results) {
      if (err) return callback(err);

      const classifications = results.map(row => {
        return {
          ...row.classification.properties,
          id: row.classification._id,
          author: row.author,
          parent: row.parent,
          groupsCount: row.groupsCount,
          itemsCount: row.itemsCount,
          unclassifiedItemsCount: row.unclassifiedItemsCount,
          completion: computeCompletion(row.itemsCount, row.unclassifiedItemsCount)
        };
      });

      const groupedByModel = groupBy(classifications, c => c.model);

      const tree = {
        product: makeTree(groupedByModel.product),
        country: makeTree(groupedByModel.country)
      };

      return callback(null, tree);
    });
  },

  //-- Retrieving a sample of the classification's groups
  groups(id, opts, callback) {
    const query = queries[opts.query ? 'searchGroups' : 'groups'];

    return database.cypher(
      {
        query,
        params: {
          ...opts,
          id,
          query: searchRegex(opts.query)
        }
      },
      function(err, results) {
        if (err) return callback(err);

        const groups = results.map(row => {
          return {
            ...row.group.properties,
            items: row.items,
            id: row.group._id
          };
        });

        return callback(null, groups);
      }
    );
  },

  //-- Exporting to csv
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

        return callback(null, {csv, name, model});
      });
    });
  },

  //-- Review the given patch for the given classification
  review(id, patch, callback)  {
    return database.cypher({query: queries.allGroups, params: {id}}, function(err, classification) {
      if (err) return callback(err);
      if (!classification.length) return callback(null, null);

      // Checking integrity
      const integrity = checkIntegrity(
        map(classification, 'item'),
        map(patch, 'item')
      );

      // Applying the patch
      const operations = applyPatch(classification, patch);

      return callback(null, {integrity, operations});
    });
  },

  //-- Commit the given patch operations
  commit(id, operations, callback) {
    async.waterfall([

      function getRows(next) {
        return database.cypher({query: queries.allGroups, params: {id}}, next);
      },

      function computeBatch(classification, next) {
        const batch = new Batch(database);

        // Iterating through the patch's operations
        operations.forEach(function(operation) {

          // Add the correct label on top of this

          // 1) Creating a new group
          if (operation.type === 'addGroup') {
            batch.save({name: operation.name}, ['ClassifiedItem']);
          }

          // 2) Renaming a group

          // 3) Moving an item (deleting old relation before!)
        });

        batch.commit(Function.prototype);
        return next();
      }
    ], callback);
  }
};

export default Model;
