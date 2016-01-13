/**
 * TOFLIT18 Cypher Queries Endpoint
 * =================================
 *
 * Gathering the cypher queries used by the API.
 */
import decypher from 'decypher';

const {
  classification,
  data,
  exporter,
  misc,
  user,
  viz
} = decypher(__dirname);

export {
  classification,
  data,
  exporter,
  misc,
  user,
  viz
};
