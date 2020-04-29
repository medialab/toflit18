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

const schema = [
  {type:'index', label:'Flow', property:'direction'},
  {type:'index', label:'Flow', property:'country'},
  {type:'index', label:'Flow', property:'sourceType'},
  {type:'index', label:'Flow', property:'product'},
  {type:'index', label:'Flow', property:'year'},
  {type:'index', label:'Flow', property:'import'},
  {type:'index', label:'Source', property:'type'},
  {type:'unique', label:'User', property:'name'},
];

async.eachSeries(indices, function(index, next) {
  const query = `CREATE INDEX ON :${schema.label}(${schema.property});`;
  if(shema.type === 'unique') {
    query = `CREATE CONSTRAINT ON (n:${schema.label}) ASSERT n.${schema.property} IS UNIQUE;`;
  }

  database.cypher(
    { query },
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
