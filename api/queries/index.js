/**
 * TOFLIT18 Cypher Queries Endpoint
 * =================================
 *
 * Gathering the cypher queries used by the API.
 */
import classification from "cypher-loader!./classification.cypher";
import data from "cypher-loader!./data.cypher";
import exporter from "cypher-loader!./exporter.cypher";
import user from "cypher-loader!./user.cypher";
import viz from "cypher-loader!./viz.cypher";

export { classification, data, exporter, user, viz };
