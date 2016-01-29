/* eslint no-console: 0 */
/**
 * TOFLIT18 Review Script
 * =======================
 *
 * Adhoc attempt to produce a review for upper classifications rewiring.
 */
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

const INPUT = path.join(__dirname, '..', '..', 'toflit18_data', 'base', 'pierre', 'bdd_marchandises_normalisees_orthographique.csv'),
      OUTPUT = path.join(__dirname, '..', '.output', 'simplification.csv'),
      CLASSIFICATION_ID = 2;

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

    const links = review.rewires[0].links,
          upperId = review.rewires[0].id,
          virtual = review.virtual;

    // TODO: refactor this with proper objects rather than with this array madness

    // const reviewHeaders = [
    //   'cluster',
    //   'before_items',
    //   'after_items',
    //   'orthographic_normalization',
    //   'simplification',
    //   'imprimatur'
    // ];

    // const links = review
    //   .rewires[0]
    //   .links
    //   .filter(link => !link.shouldExist)
    //   .map(link => {

    //     return [
    //       link.cluster,
    //       link.beforeItems.map(i => `[${i}]`).join(' '),
    //       link.afterItems.map(i => `[${i}]`).join(' '),
    //       link.group,
    //       link.upper,
    //       ''
    //     ];
    //   });

    // const reportHeaders = [
    //   'group',
    //   'uppers',
    //   'beforeItems',
    //   'afterItems',
    //   'choice',
    //   'imprimatur'
    // ];

    const report = rewireReport(links);

    // const report = rewireReport(links).map(row => {
    //   return [
    //     row.group,
    //     row.uppers.map(i => `[${i}]`).join(' '),
    //     row.beforeItems.map(i => `[${i}]`).join(' '),
    //     row.afterItems.map(i => `[${i}]`).join(' '),
    //     '',
    //     ''
    //   ];
    // });

    const headers = [
      'orthographic_pierre',
      'simplification',
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
  (csv, next) => fs.writeFile(OUTPUT, csv, next)
], err => err && console.error(err));
