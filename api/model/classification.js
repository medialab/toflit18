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
import Batch from '../../lib/batch';
import {groupBy, find, map} from 'lodash';
import {
  checkIntegrity,
  solvePatch,
  applyOperations,
  rewire
} from '../../lib/patch';

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

  /**
   * Retrieving the list of every classifications.
   */
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

  /**
   * Retrieving every one of the classification's groups.
   */
  groups(id, callback) {
    return database.cypher({query: queries.rawGroups, params: {id}}, function(err, result) {
      if (err) return callback(err);
      if (!result.length) return callback(null, null);

      return callback(null, result);
    });
  },

  /**
   * Retrieving a sample of the classification's groups.
   */
  search(id, opts, callback) {
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

  /**
   * Exporting to csv.
   */
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

      return stringify([headers].concat(rows), {}, function(e, csv) {
        if (e) return callback(e);

        return callback(null, {csv, name, model});
      });
    });
  },

  /**
   * Review the given patch for the given classification.
   */
  review(id, patch, callback) {
    return database.cypher({query: queries.allGroups, params: {id}}, function(err, classification) {
      if (err) return callback(err);
      if (!classification.length) return callback(null, null);

      // Checking integrity
      const integrity = checkIntegrity(
        map(classification, 'item'),
        map(patch, 'item')
      );

      // Applying the patch
      const operations = solvePatch(classification, patch);

      // Computing a virtual updated version of our classification
      const updatedClassification = applyOperations(classification, operations);

      // Retrieving upper classifications
      return database.cypher({query: queries.upper, params: {id}}, function(err, upper) {
        const ids = map(upper, c => c.upper._id);

        console.log(ids);
        return callback(null, {integrity, operations});
      });
    });
  },

  /**
   * Commit the given patch operations.
   */
  commit(id, operations, callback) {
    async.waterfall([

      function getData(next) {
        return database.cypher({query: queries.info, params: {id}}, next);
      },

      function computeBatch(result, next) {
        if (!result[0])
          return next(null, null);

        const batch = new Batch(database),
              classificationId = result[0].classification._id,
              newGroupsIndex = {};

        // Iterating through the patch's operations
        operations.forEach(function(operation) {

          // 1) Creating a new group
          if (operation.type === 'addGroup') {
            const groupNode = batch.save({name: operation.name}, 'ClassifiedItem');
            batch.relate(classificationId, 'HAS', groupNode);

            // Indexing
            newGroupsIndex[operation.name] = groupNode;
          }

          // 2) Renaming a group
          if (operation.type === 'renameGroup') {
            batch.update(operation.id, {name: operation.to});
          }

          // 3) Moving an item (deleting old relation before!)
          if (operation.type === 'moveItem') {
            const newTo = newGroupsIndex[operation.to],
                  newFrom = newGroupsIndex[operation.from];

            // NOTE: This could be factorized.

            // Dropping an item from its group
            if (operation.to === null && !newTo) {
              batch.unrelate(operation.fromId || newFrom, 'AGGREGATES', operation.itemId);
            }

            // Adding an item from limbo to a group
            else if (operation.from === null && !newFrom) {
              batch.relate(operation.toId || newTo, 'AGGREGATES', operation.itemId);
            }

            // Moving an item from group to group
            else {
              batch.unrelate(operation.fromId || newFrom, 'AGGREGATES', operation.itemId);
              batch.relate(operation.toId || newTo, 'AGGREGATES', operation.itemId);
            }
          }
        });

        batch.commit(next);
      }
    ], callback);
  }
};

export default Model;
