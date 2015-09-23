/**
 * TOFLIT18 Export Script
 * =======================
 *
 * Script aiming at exporting raw CSV data from the datascape's Neo4j database.
 */
import database from '../api/connection';
import {exporter as queries} from '../api/queries';
import {stringify} from 'csv';
import async from 'async';
import {default as h} from 'highland';
import fs from 'fs';

const LIMIT = 10000;

const SOURCES_HEADERS = [
  'line',
  'sheet',
  'source',
  'path',
  'sourcetype',
  'operator',
  'product',
  'quantity',
  'value',
  'unit',
  'unit_price',
  'import/export',
  'year',
  'direction',
  'bureau',
  'country',
  'origin',
  'note'
];

console.log('Exporting the Neo4j database...');

async.waterfall([
  function retrieveSources(callback) {

    const sourcesStream = h();

    sourcesStream
        .pipe(stringify({delimiter: ','}))
        .pipe(fs.createWriteStream('./.output/sources.csv', 'utf-8'));

    sourcesStream.write(SOURCES_HEADERS);

    let skip = 0,
        batches = 0;

    async.forever(function(next) {
      database.cypher({query: queries.sources, params: {offset: skip, limit: LIMIT}}, function(err, data) {
        if (err) return next(err);
        if (!data.length || data.length < LIMIT)
          return next(new Error('end-of-results'));

        batches++;
        skip += LIMIT;

        console.log(`  -- Sources batch done (${batches})!`);

        for (let i = 0, l = data.length; i < l; i++) {
          let flow = data[i].flow.properties,
              product = data[i].product,
              source = data[i].source.properties,
              operator = data[i].operator,
              transcription = data[i].transcription.properties,
              country = data[i].country,
              direction = data[i].direction,
              office = data[i].office,
              origin = data[i].origin,
              unit = data[i].unit;

          sourcesStream.write([
            transcription.line,
            transcription.sheet,
            source.name,
            source.path,
            source.type,
            operator,
            product,
            flow.quantity,
            flow.value,
            unit,
            flow.unit_price,
            flow.import ? 'import' : 'export',
            flow.year,
            direction,
            office,
            country,
            origin,
            flow.note
          ]);
        }

        next();
      });
    }, function(err) {
      callback(err);
    });
  }
], err => err && console.error(err));
