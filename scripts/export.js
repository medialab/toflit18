/**
 * TOFLIT18 Export Script
 * =======================
 *
 * Script aiming at exporting raw CSV data from the datascape's Neo4j database.
 */
import database from '../api/connection';
import {exporter as queries} from '../api/queries';
import {parse, stringify} from 'csv';
import async from 'async';
import {default as h} from 'highland';
import {fill, indexBy} from 'lodash';
import fs from 'fs';

/**
 * Useful constants
 */
const LIMIT = 10000;
const ASYNC_NOOP = next => next();

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
  'problem',
  'import/export',
  'year',
  'direction',
  'bureau',
  'country',
  'origin',
  'note'
];

console.log('Exporting the Neo4j database...');

async.series([

  /**
   * Building the sources file.
   */
  function retrieveSources(callback) {
    const sourcesStream = h();

    sourcesStream
        .pipe(stringify({delimiter: ','}))
        .pipe(fs.createWriteStream('./.output/bdd_centrale.csv', 'utf-8'));

    sourcesStream.write(SOURCES_HEADERS);

    let skip = 0,
        batches = 0;

    async.forever(function(next) {
      database.cypher({query: queries.sources, params: {offset: skip, limit: LIMIT}}, function(err, data) {
        if (err) return next(err);

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
            (flow.unit_price && flow.value && flow.quantity) ? (flow.value - (flow.unit_price * flow.quantity)) : '',
            flow.import ? 'import' : 'export',
            flow.year,
            direction,
            office,
            country,
            origin,
            flow.note
          ]);
        }

        // Should we stop?
        if (!data.length || data.length < LIMIT)
          return next(new Error('end-of-results'));
        else
          return next();
      });
    }, function(err) {
      if (err.message === 'end-of-results')
        return callback();
      else
        return callback(err);
    });
  },

  /**
   * Retrieving the products' classification.
   */
  function retrieveProductsClassifications(callback) {
    let classifications,
        rows;

    console.log('Building products\' classifications...');

    async.series([
      function getProducts(next) {
        database.cypher(queries.products, function(err, data) {
          if (err) return next(err);

          rows = data.map(e => [e.product]);
          return next();
        });
      },
      function getClassifications(next) {
        database.cypher({query: queries.classifications, params: {models: ['product']}}, function(err, data) {
          if (err) return next(err);

          classifications = data.map(e => e.classification);
          return next();
        });
      },
      function buildRows(next) {
        async.eachSeries(classifications, function(classification, nextClassification) {
          database.cypher({query: queries.classifiedItemsToSource, params: {id: classification._id}}, function(err, data) {
            if (err) return next(err);

            const index = indexBy(data, 'item');

            for (let i = 0, l = rows.length; i < l; i++) {
              const row = rows[i],
                    sourceProduct = row[0];

              row.push((index[sourceProduct] || {}).group);
            }

            return nextClassification();
          });
        }, next);
      },
      function writeRows(next) {
        const stream = h(),
              writer = fs.createWriteStream('./.output/bdd_products.csv', 'utf-8');

        stream
          .pipe(stringify({delimiter: ','}))
          .pipe(writer);

        writer.on('finish', () => next());

        stream.write(['source'].concat(classifications.map(c => c.properties.slug)));

        for (let i = 0, l = rows.length; i < l; i++)
          stream.write(rows[i]);

        return stream.end();
      }
    ], callback);
  },

  /**
   * Retrieving the countries' classification.
   */
  function retrieveCountriesClassifications(callback) {
    let classifications,
        rows;

    console.log('Building countries\' classifications...');

    async.series([
      function(next) {
        database.cypher(queries.countries, function(err, data) {
          if (err) return next(err);

          rows = data.map(e => [e.country]);
          return next();
        });
      },
      function(next) {
        database.cypher({query: queries.classifications, params: {models: ['country']}}, function(err, data) {
          if (err) return next(err);

          classifications = data.map(e => e.classification);
          return next();
        });
      },
      function(next) {
        async.eachSeries(classifications, function(classification, nextClassification) {
          database.cypher({query: queries.classifiedItemsToSource, params: {id: classification._id}}, function(err, data) {
            if (err) return next(err);

            const index = indexBy(data, 'item');

            for (let i = 0, l = rows.length; i < l; i++) {
              const row = rows[i],
                    sourceProduct = row[0];

              row.push((index[sourceProduct] || {}).group);
            }

            return nextClassification();
          });
        }, next);
      },
      function(next) {
        const stream = h(),
              writer = fs.createWriteStream('./.output/bdd_countries.csv', 'utf-8');

        stream
          .pipe(stringify({delimiter: ','}))
          .pipe(writer);

        writer.on('finish', () => next());

        stream.write(['source'].concat(classifications.map(c => c.properties.slug)));

        for (let i = 0, l = rows.length; i < l; i++)
          stream.write(rows[i]);

        return stream.end();
      }
    ], callback);
  },

  /**
   * Creating one file per classification.
   */
  function oneByOneClassification(callback) {
    console.log('Creating one file per classification');

    database.cypher({query: queries.classifications, params: {models: ['country', 'product']}}, function(err, data) {
      if (err) return callback(err);

      const classifications = data.map(e => (e.classification.properties.parent = e.parent) && e.classification);

      async.eachSeries(classifications, function(classification, next) {
        database.cypher({query: queries.classifiedItems, params: {id: classification._id}}, function(err, rows) {
          if (err) return callback(err);

          let stream = h(),
              {model, slug, parent} = classification.properties;

          if (parent === 'sources')
            parent = model;

          const filename = `./.output/classification_${model}_${slug}.csv`;

          stream
            .pipe(stringify({delimiter: ','}))
            .pipe(fs.createWriteStream(filename,'utf-8'));

          stream.write([parent, slug, 'note', 'source']);

          rows.forEach(function(row) {
            stream.write([row.item, row.group, row.note, row.source]);
          });

          return next();
        });
      }, callback);
    });
  },

  /**
   * Composing the bdd_courante file.
   */
  function composing(callback) {
    console.log('Composing bdd_courante.csv...');

    const productsCsv = fs.readFileSync('./.output/bdd_products.csv', 'utf-8'),
          countriesCsv = fs.readFileSync('./.output/bdd_countries.csv', 'utf-8');

    async.parallel({
      products: next => parse(productsCsv, {delimiter: ','}, next),
      countries: next => parse(countriesCsv, {delimiter: ','}, next)
    }, function(err, classifications) {
      if (err) return callback(err);

      const indexes = {
        products: indexBy(classifications.products.slice(1), e => e[0]),
        countries: indexBy(classifications.countries.slice(1), e => e[0]),
      };

      const writeStream = h();

      writeStream
        .pipe(stringify({delimiter: ','}))
        .pipe(fs.createWriteStream('./.output/bdd_courante.csv', 'utf-8'));

      // Streaming the sources file
      const readStream = fs.createReadStream('./.output/bdd_centrale.csv')
        .pipe(parse({delimiter: ','}));

      let head = true;

      h(readStream)
        .each(line => {

          if (head) {
            writeStream.write(line
              .concat(classifications.products[0].slice(1).map(h => 'product_' + h))
              .concat(classifications.countries[0].slice(1).map(h => 'country_' + h))
            );
            head = false;
          }
          else {
            writeStream.write(line
              .concat((indexes.products[line[6]] || []).slice(1))
              .concat((indexes.countries[line[15]] || []).slice(1))
            );
          }
        })
        .on('end', callback);
    });
  }
], err => err && console.error(err));
