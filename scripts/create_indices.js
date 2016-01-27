/**
 * TOFLIT18 Export Script
 * =======================
 *
 * Script aiming at exporting raw CSV data from the datascape's Neo4j database.
 */
import database from '../api/connection';
import {indices as queries} from '../api/queries';
import async from 'async';

console.log('Creating indices on the Neo4j database...');



const indices=["direction","country","sourceType","product","year"];

async.eachSeries(indices,function(prop,next){
	database.cypher(
		{
			query:`CREATE INDEX ON :Flow(${prop});`,
		},
		function(err, results){
	      if (err) return next(err);
	      console.log(`index on :flow(${prop}) created`);
	      return next();
  		});
	},function(err){if(err) console.log(err);}
);


