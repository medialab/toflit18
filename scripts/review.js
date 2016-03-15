/* eslint no-console: 0 */
/**
 * TOFLIT18 Review Script
 * =======================
 *
 * Adhoc attempt to produce a review for upper classifications rewiring.
 */
import yargs from 'yargs';
import {parse, stringify} from 'csv';
import async from 'async';
import path from 'path';
import fs from 'fs';
import model from '../api/model/classification';
import {cleanText} from '../lib/clean';
import {rewireReport} from '../lib/patch';
import {classification as queries} from '../api/queries';
import database from '../api/connection';
import _ from 'lodash';

const argv = yargs
  .option('c', {
    alias: 'classification',
    describe: 'The Neo4j id of the classification to patch.'
  })
  .option('o', {
    alias: 'output',
    describe: 'The output file.'
  })
  .option('p', {
    alias: 'patch',
    describe: 'The CSV patch to apply to the given classification.'
  })
  .option('r', {
    alias: 'rewire',
    describe: 'The Neo4j id of the classification to rewire.'
  })
  .demand(['c', 'p', 'r'])
  .help('h')
  .alias('h', 'help')
  .argv;

const INPUT = argv.patch,
      OUTPUT = argv.output || path.join(__dirname, '..', '.output'),
      CLASSIFICATION_ID = argv.classification,
      REWIRE_ID = argv.rewire;

console.log(`Patching classification id n°${CLASSIFICATION_ID} with "${INPUT}"`);
console.log(`To rewire classification id n°${REWIRE_ID}`);
console.log('Parsing...');

async.waterfall([

  // Parsing
  next => parse(fs.readFileSync(INPUT, 'utf-8'), {delimiter: ','}, next),

  // Applying patch
  (csv, next) => {
    console.log('Applying patch...');

    const patch = _(csv)
      .drop(1)
      .map(row => {
        return {
          item: cleanText(row[0]) || null,
          group: cleanText(row[1]) || null
        };
      })
      .value();

    model.review(CLASSIFICATION_ID, patch, function(err, review) {
      if (err) return next(err);

      return next(null, patch, review);
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

    const relevantRewires = _.find(review.rewires, rewire => rewire.id === REWIRE_ID);

    const links = relevantRewires.links,
          upperId = relevantRewires.id,
          virtual = review.virtual;

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
      })
      .value();

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
      })
      .value();

    database.cypher({query: queries.allGroups, params: {id: upperId}}, (err, classification) => {
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
        })
        .value();

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
        })
        .value();

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
