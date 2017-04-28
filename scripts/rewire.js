/* eslint no-console: 0 */
/**
 * TOFLIT18 Review Script
 * =======================
 *
 * Adhoc attempt to produce a review for upper classifications rewiring.
 */
import yargs from 'yargs';
import {stringify} from 'csv';
import async from 'async';
import path from 'path';
import fs from 'fs';
import {classification as queries} from '../api/queries';
import database from '../api/connection';
import _ from 'lodash';

import {
  applyOperations,
  solvePatch,
  rewire,
  rewireReport
} from '../lib/patch';

const cypher = database.cypher.bind(database);

const argv = yargs
  .option('c', {
    alias: 'classification',
    describe: 'The Neo4j id of the classification to patch.',
    type: 'number'
  })
  .option('o', {
    alias: 'output',
    describe: 'The output file.'
  })
  .option('p', {
    alias: 'patch',
    describe: 'The Neo4j id of the classification to use as patch.',
    type: 'number'
  })
  .option('r', {
    alias: 'rewire',
    describe: 'The Neo4j id of the classification to rewire.',
    type: 'number'
  })
  .demand(['c', 'p', 'r'])
  .help('h')
  .alias('h', 'help')
  .argv;

const PATCH_ID = argv.patch,
      OUTPUT = argv.output || path.join(__dirname, '..', '.output'),
      CLASSIFICATION_ID = argv.classification,
      REWIRE_ID = argv.rewire;

console.log(`Patching classification id n°${CLASSIFICATION_ID} with classification id n°${PATCH_ID}`);
console.log(`To rewire classification id n°${REWIRE_ID}`);
console.log('Parsing...');

async.waterfall([

  // Fetching necessary data
  next => {
    async.parallel({
      classification: async.apply(cypher, {query: queries.allGroupsToSource, params: {id: CLASSIFICATION_ID}}),
      patch: async.apply(cypher, {query: queries.allGroupsToSource, params: {id: PATCH_ID}})
    }, next);
  },

  // Applying patch
  (data, next) => {

    // Computing operations
    const operations = solvePatch(data.classification, data.patch);

    // Computing a virtual updated version of the classification
    const updatedClassification = applyOperations(data.classification, operations);

    // Fetching upper groups
    cypher({query: queries.upperGroups, params: {id: REWIRE_ID}}, function(err, upperGroups) {
      if (err) return next(err);

      const links = rewire(
        upperGroups,
        data.classification,
        updatedClassification,
        operations
      );

      return next(null, data.patch, {
        operations,
        links,
        virtual: updatedClassification
      });
    });
  },

  // Reviewing
  (patch, review, next) => {
    console.log('Reviewing...');

    let existingGroupsInPatch = _(patch)
      .map('group')
      .uniq()
      .compact()
      .value();

    existingGroupsInPatch = new Set(existingGroupsInPatch);

    // const relevantRewires = _.find(review.rewires, rewire => rewire.id === REWIRE_ID);

    const {links, virtual} = review;

    const report = rewireReport(links);

    const headers = [
      'item',
      'group',
      'status',
      'beforeItems',
      'afterItems',
      'obsolete',
      'imprimatur'
    ];

    const rows = [],
          doneItems = new Set();

    //-- 1) Ambiguous rewires
    _(report)
      .forEach(l => {

        if (doneItems.has(l.group))
          return;

        rows.push([
          l.group,
          l.uppers.map(i => `[${i}]`).join(' '),
          'ambiguous',
          l.beforeItems.map(i => `[${i}]`).join(' '),
          l.afterItems.map(i => `[${i}]`).join(' '),
          l.afterItems.length ? 'no' : 'yes',
          ''
        ]);

        doneItems.add(l.group);
      });

    //-- 2) Correct rewires
    _(links)
      .filter(l => l.shouldExist)
      .forEach(l => {

        if (doneItems.has(l.group))
          return;

        rows.push([
          l.group,
          l.upper,
          'rewire',
          l.beforeItems.map(i => `[${i}]`).join(' '),
          l.afterItems.map(i => `[${i}]`).join(' '),
          l.afterItems.length ? 'no' : 'yes',
          ''
        ]);

        doneItems.add(l.group);
      });

    database.cypher({query: queries.allGroups, params: {id: REWIRE_ID}}, (err, classification) => {
      if (err) return next(err);

      //-- 3) Existing
      _(classification)
        .forEach(row => {

          if (doneItems.has(row.item))
            return;

          rows.push([
            row.item,
            row.group || '',
            'existing',
            '',
            '',
            existingGroupsInPatch.has(row.item) ? 'no' : 'yes',
            ''
          ]);

          doneItems.add(row.item);
        });

      //-- 4) New groups
      _(virtual)
        .filter(row => !!row.group)
        .forEach(row => {

          if (doneItems.has(row.group))
            return;

          rows.push([
            row.group,
            '',
            'new',
            '',
            '',
            row.item ? 'no' : 'yes',
            ''
          ]);

          doneItems.add(row.group);
        });

      console.log('Processed items:', doneItems.size);
      console.log('Virtual size:', virtual.length);

      ['ambiguous', 'rewire', 'existing', 'new'].forEach(type => {
        const nb = rows.filter(row => row[2] === type).length;

        console.log('  -- ' + type + ': ' + nb);
      });

      const obsoletes = rows.filter(row => row[5] === 'yes').length;

      console.log('  -- obsolete: ' + obsoletes);

      console.log('Writing...');
      stringify([headers, ...rows], {delimiter: ','}, next);
    });
  },

  // Writing
  (csv, next) => fs.writeFile(path.join(OUTPUT, 'rewired.csv'), csv, next)
], err => err && console.error(err));
