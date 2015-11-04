/**
 * Node-Neo4j Batch Abstraction
 * =============================
 *
 * A handy batch abstraction used to commit some writes to a Neo4j database
 * easily.
 */
import {isPlainObject} from 'lodash';

export default class Batch {
  constructor(connection) {

    // Keeping a reference to the given node-neo4j connection
    this.connection = connection;

    // Internal counters & indexes
    this.nodesCounter = 0;
    this.nodes = {};
    this.edges = [];
  }

  /**
   * Public methods.
   */
  save(data, labels=[]) {
    if (!isPlainObject(data))
      throw Error('Neo4j.Batch.save: data is not an object.');

    // Coercing labels to array
    labels = [].concat(labels);

    // Giving an id to the created node
    const id = `i${this.nodesCounter++}`;

    this.nodes[id] = {data, labels};

    return id;
  }

  relate(a, predicate, b, data=null) {
    this.edges.push({from: a, to: b, predicate, data});
    return this;
  }

  delete(target) {

  }

  commit(callback) {

    // Building the necessary queries
    const lines = [],
          params = {};

    //-- Nodes
    Object.keys(this.nodes).forEach(k => {
      const n = this.nodes[k],
            name = `n${k}`,
            propName = `p${k}`;

      lines.push(`CREATE (${name} {${propName}})`);

      n.labels.forEach(l => lines.push(`SET ${name}:\`${l}\``));
      params[propName] = n.data;
    });

    //-- Edges
    this.edges.forEach(edge => {
      lines.push(`CREATE (n${edge.from})-[:\`${edge.predicate}\`]->(n${edge.to})`);
    });

    return console.log(lines, params);
    // DONT FORGET THE FINAL ;
    this.connection.cypher({queries: this.queries}, callback);
  }
}
