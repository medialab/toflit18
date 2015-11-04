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
    this.externalNodes = {};
    this.edges = [];
    this.unlinks = [];
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

  update(id, data) {
    if (!isPlainObject(data))
      throw Error('Neo4j.Batch.update: data is not an object.');

    let node = this.externalNodes[id];

    if (!node) {
      node = {id};
      this.externalNodes['e' + id] = node;
    }

    node.data = data;
    return this;
  }

  relate(a, predicate, b, data=null) {

    if (!/i/.test('' + a)) {
      const id = 'e' + a;

      if (!this.externalNodes[id])
        this.externalNodes[id] = {id: a};
      a = id;
    }

    if (!/i/.test('' + b)) {
      const id = 'e' + b;

      if (!this.externalNodes[id])
        this.externalNodes[id] = {id: b};
      b = id;
    }

    this.edges.push({from: a, to: b, predicate, data});
    return this;
  }

  unlink(a, predicate, b) {
    if (!/i/.test('' + a)) {
      const id = 'e' + a;

      if (!this.externalNodes[id])
        this.externalNodes[id] = {id: a};
      a = id;
    }

    if (!/i/.test('' + b)) {
      const id = 'e' + b;

      if (!this.externalNodes[id])
        this.externalNodes[id] = {id: b};
      b = id;
    }

    this.unlinks.push({from: a, to: b, predicate});
  }

  compile() {

    // Building the necessary queries
    const lines = [],
          params = {};

    //-- External nodes
    Object.keys(this.externalNodes).forEach(k => {
      const n = this.externalNodes[k],
            name = `n${k}`,
            propName = `p${k}`;

      lines.push(`START ${name}=(${n.id})`);

      if (n.data) {
        params[propName] = n.data;
        lines.push(`SET ${name} += {${propName}}`);
      }
    });

    //-- Nodes
    Object.keys(this.nodes).forEach(k => {
      const n = this.nodes[k],
            name = `n${k}`,
            propName = `p${k}`;

      lines.push(`CREATE (${name} {${propName}})`);

      n.labels.forEach(l => lines.push(`SET ${name}:\`${l}\``));
      params[propName] = n.data;
    });

    //-- Unlinks
    this.unlinks.forEach((edge, i) => {
      lines.push(`MATCH (n${edge.from})-[r${i}:\`${edge.predicate}\`]->(n${edge.to})`);
      lines.push(`DELETE r${i}`);
    });

    //-- Edges
    this.edges.forEach(edge => {
      lines.push(`CREATE (n${edge.from})-[:\`${edge.predicate}\`]->(n${edge.to})`);
    });

    return {query: lines.join('\n') + ';', params};
  }

  commit(callback) {
    return this.connection.cypher(this.compile(), callback);
  }
}
