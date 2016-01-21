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
import _ from 'lodash';

const INPUT = path.join(__dirname, '..', '..', 'toflit18_data', 'base', 'pierre', 'bdd_marchandises_normalisees_orthographique.csv'),
      OUTPUT = path.join(__dirname, '..', '.output', 'report.csv'),
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

    model.review(CLASSIFICATION_ID, patch, next);
  },

  // Reviewing
  (review, next) => {
    console.log('Reviewing...');

    const links = review.rewires[0].links;

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

    const reportHeaders = [
      'group',
      'uppers',
      'items',
      'choice',
      'imprimatur'
    ];

    const report = rewireReport(links).map(row => {
      return [
        row.group,
        row.uppers.map(i => `[${i}]`).join(' '),
        row.items.map(i => `[${i}]`).join(' '),
        '',
        ''
      ];
    });

    console.log('Writing...');
    stringify([reportHeaders, ...report], {delimiter: ','}, next);
  },

  // Writing
  (csv, next) => fs.writeFile(OUTPUT, csv, next)
], err => err && console.error(err));
