/* eslint no-console: 0 */
/**
 * TOFLIT18 Export Script
 * =======================
 *
 * Script aiming at exporting raw CSV data from the datascape's Neo4j database.
 */
import database from '../api/connection';
import async from 'async';

console.log('Creating indices in the Neo4j database...');

const indices = [
  'direction',
  'country',
  'sourceType',
  'product',
  'year',
  'import'
];

async.eachSeries(indices, function(prop, next) {
  database.cypher(
    {
      query: `CREATE INDEX ON :Flow(${prop});`,
    },
    function(err) {
      if (err) return next(err);

      console.log(`  -- Index on :flow(${prop}) created!`);

      return next();
    }
  );
}, function(err) {
  database.close();

  if (err) console.error(err);
});
