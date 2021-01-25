/* eslint no-console: 0 */
/**
 * TOFLIT18 Export Script
 * =======================
 *
 * Script aiming at exporting raw CSV data from the datascape's Neo4j database.
 */
import database from "../api/connection";
import { exporter as queries } from "../api/queries";
import { parse, stringify } from "csv";
import async from "async";
import { default as h } from "highland";
import _, { fill, keyBy, uniq } from "lodash";
import fs from "fs";

/**
 * Useful constants
 */
const LIMIT = 10000;

const SOURCES_HEADERS = [
  "line",
  "sheet",
  "source",
  "path",
  "sourcetype",
  "operator",
  "product",
  "quantity",
  "value",
  "rawUnit",
  "unit",
  "unitPrice",
  "problem",
  "import/export",
  "rawYear",
  "year",
  "customs region",
  "bureau",
  "partner",
  "origin",
  "note",
];

console.log("Exporting the Neo4j database...");

async.series(
  [
    /**
     * Building the sources file.
     */
    function retrieveSources(callback) {
      console.log("Building sources...");

      const sourcesStream = h();

      sourcesStream
        .pipe(stringify({ delimiter: "," }))
        .pipe(fs.createWriteStream("./.output/bdd_centrale.csv", "utf-8"));

      sourcesStream.write(SOURCES_HEADERS);

      let skip = 0,
        batches = 0;

      async.forever(
        function(next) {
          database.cypher({ query: queries.sources, params: { offset: skip, limit: LIMIT } }, function(err, data) {
            if (err) return next(err);

            batches++;
            skip += LIMIT;

            console.log(`  -- Sources batch done (${batches})!`);

            for (let i = 0, l = data.length; i < l; i++) {
              const flow = data[i].flow.properties,
                product = data[i].product,
                source = data[i].source.properties,
                operator = data[i].operator,
                transcription = data[i].transcription.properties,
                partner = data[i].partner,
                direction = data[i].direction,
                office = data[i].office,
                origin = data[i].origin;

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
                flow.rawUnit,
                flow.unit,
                flow.unitPrice,
                flow.unitPrice && flow.value && flow.quantity ? flow.value - flow.unitPrice * flow.quantity : "",
                flow.import ? "import" : "export",
                flow.rawYear,
                flow.year,
                direction,
                office,
                partner,
                origin,
                flow.note,
              ]);
            }

            // Should we stop?
            if (!data.length || data.length < LIMIT) return next(new Error("end-of-results"));
            else return next();
          });
        },
        function(err) {
          if (err.message === "end-of-results") return callback();
          else return callback(err);
        },
      );
    },

    /**
     * Retrieving the products' classification.
     */
    function retrieveProductsClassifications(callback) {
      let classifications, rows;

      console.log("Building products' classifications...");

      async.series(
        [
          function getProducts(next) {
            database.cypher(queries.products, function(err, data) {
              if (err) return next(err);

              rows = _(data)
                .map(row => {
                  return [row.sources.join(","), row.product];
                })
                .value();

              return next();
            });
          },
          function getClassifications(next) {
            database.cypher({ query: queries.classifications, params: { models: ["product"] } }, function(err, data) {
              if (err) return next(err);

              classifications = data.map(e => e.classification);
              return next();
            });
          },
          function buildRows(next) {
            async.eachSeries(
              classifications,
              function(classification, nextClassification) {
                database.cypher(
                  { query: queries.classifiedItemsToSource, params: { id: classification._id } },
                  function(err, data) {
                    if (err) return next(err);

                    const index = keyBy(data, "item");

                    for (let i = 0, l = rows.length; i < l; i++) {
                      const row = rows[i],
                        sourceProduct = row[1],
                        matching = index[sourceProduct] || {};

                      row.push(matching.group);
                    }

                    return nextClassification();
                  },
                );
              },
              next,
            );
          },
          function writeRows(next) {
            const stream = h(),
              writer = fs.createWriteStream("./.output/bdd_products.csv", "utf-8");

            stream.pipe(stringify({ delimiter: "," })).pipe(writer);

            writer.on("finish", () => next());

            stream.write(["sources", "product"].concat(classifications.map(c => c.properties.slug)));

            for (let i = 0, l = rows.length; i < l; i++) stream.write(rows[i]);

            return stream.end();
          },
        ],
        callback,
      );
    },

    /**
     * Retrieving the partners' classification.
     */
    function retrievePartnersClassifications(callback) {
      let classifications, rows;

      console.log("Building partners' classifications...");

      async.series(
        [
          function(next) {
            database.cypher(queries.partners, function(err, data) {
              if (err) return next(err);

              rows = data.map(e => [e.partner]);
              return next();
            });
          },
          function(next) {
            database.cypher({ query: queries.classifications, params: { models: ["partner"] } }, function(err, data) {
              if (err) return next(err);

              classifications = data.map(e => e.classification);
              return next();
            });
          },
          function(next) {
            async.eachSeries(
              classifications,
              function(classification, nextClassification) {
                database.cypher(
                  { query: queries.classifiedItemsToSource, params: { id: classification._id } },
                  function(err, data) {
                    if (err) return next(err);

                    const index = keyBy(data, "item");

                    for (let i = 0, l = rows.length; i < l; i++) {
                      const row = rows[i],
                        sourceProduct = row[0];

                      row.push((index[sourceProduct] || {}).group);
                    }

                    return nextClassification();
                  },
                );
              },
              next,
            );
          },
          function(next) {
            const stream = h(),
              writer = fs.createWriteStream("./.output/bdd_partners.csv", "utf-8");

            stream.pipe(stringify({ delimiter: "," })).pipe(writer);

            writer.on("finish", () => next());

            stream.write(["partner"].concat(classifications.map(c => c.properties.slug)));

            for (let i = 0, l = rows.length; i < l; i++) stream.write(rows[i]);

            return stream.end();
          },
        ],
        callback,
      );
    },

    /**
     * Creating one file per classification.
     */
    function oneByOneClassification(callback) {
      console.log("Creating one file per classification");

      database.cypher({ query: queries.classifications, params: { models: ["partner", "product"] } }, function(
        err1,
        data,
      ) {
        if (err1) return callback(err1);

        const classifications = data.map(e => (e.classification.properties.parent = e.parent) && e.classification);

        async.eachSeries(
          classifications,
          function(classification, next) {
            database.cypher({ query: queries.classifiedItems, params: { id: classification._id } }, function(
              err2,
              rows,
            ) {
              if (err2) return callback(err2);

              const stream = h(),
                { model, slug } = classification.properties;

              let parent = classification.properties.parent;

              if (parent === "sources") parent = model;

              const filename = `./.output/classification_${model}_${slug}.csv`;

              stream.pipe(stringify({ delimiter: "," })).pipe(fs.createWriteStream(filename, "utf-8"));

              stream.write([parent, slug, "note"]);

              // Distinct item lines
              rows = uniq(rows, row => row.item);

              rows.forEach(function(row) {
                stream.write([row.item, row.group, row.note]);
              });

              return next();
            });
          },
          callback,
        );
      });
    },

    /**
     * Composing the bdd_courante file.
     */
    function composing(callback) {
      console.log("Composing bdd_courante.csv...");

      const productsCsv = fs.readFileSync("./.output/bdd_products.csv", "utf-8"),
        partnersCsv = fs.readFileSync("./.output/bdd_partners.csv", "utf-8");

      async.parallel(
        {
          products: next => parse(productsCsv, { delimiter: "," }, next),
          partners: next => parse(partnersCsv, { delimiter: "," }, next),
        },
        function(err, classifications) {
          if (err) return callback(err);

          const indexes = {
            products: keyBy(classifications.products.slice(1), e => e[1]),
            partners: keyBy(classifications.partners.slice(1), e => e[0]),
          };

          const productPadding = fill(Array(classifications.products[0].length - 1), ""),
            partnerPadding = fill(Array(classifications.partners[0].length), "");

          const writeStream = h();

          writeStream
            .pipe(stringify({ delimiter: "," }))
            .pipe(fs.createWriteStream("./.output/bdd_courante.csv", "utf-8"));

          // Streaming the sources file
          const readStream = fs.createReadStream("./.output/bdd_centrale.csv").pipe(parse({ delimiter: "," }));

          let head = true;

          h(readStream)
            .each(line => {
              // NOTE: bad hard-coded indexes are bad.
              if (head) {
                writeStream.write(
                  line
                    .concat(classifications.products[0].slice(2).map(n => "product_" + n))
                    .concat(classifications.partners[0].slice(1).map(n => "partner_" + n)),
                );
                head = false;
              } else {
                writeStream.write(
                  line
                    .concat((indexes.products[line[6]] || productPadding).slice(2))
                    .concat((indexes.partners[line[18]] || partnerPadding).slice(1)),
                );
              }
            })
            .on("end", callback);
        },
      );
    },
  ],
  err => err && console.error(err),
);
