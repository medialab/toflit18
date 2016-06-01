/**
 * TOFLIT18 Viz Model
 * ===================
 *
 */
import decypher from 'decypher';
import database from '../connection';

const {Expression, Query} = decypher;

//-- function to build expression for where statement for cypher query
//-- when national or local best guess selected

const Model = {

  /**
   * Building the (directions)--(country) network.
   */
  network(classification, callback) {
    database.cypher({query: queries.network, params: {classification}}, callback);
  }
};

export default Model;
