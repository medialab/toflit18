/**
 * TOFLIT18 Cypher Queries Endpoint
 * =================================
 *
 * Gathering the cypher queries used by the API.
 */
import classification from 'cypher!./classification.cypher';
import data from 'cypher!./data.cypher';
import exporter from 'cypher!./exporter.cypher';
import misc from 'cypher!./misc.cypher';
import user from 'cypher!./user.cypher';
import viz from 'cypher!./viz.cypher';

export {
  classification,
  data,
  exporter,
  misc,
  user,
  viz
};
