/**
 * TOFLIT18 Globals Actions
 * =========================
 *
 * Actions related to the globals' view.
 */
import {scaleCategory20, scaleLinear} from 'd3-scale';
import {six as palette} from '../lib/palettes';
import {max, uniq, values} from 'lodash';

const ROOT = ['states', 'exploration', 'globals'];

/**
 * Selecting a country classification.
 */
export function selectClassification(tree, classification) {
  const cursor = tree.select([...ROOT, 'network']);

  cursor.set('classification', classification);
  cursor.set('graph', null);

  if (!classification)
    return;

  cursor.set('loading', true);

  // Fetching data
  tree.client.network({params: {id: classification.id}}, function(err, data) {
    cursor.set('loading', false);

    if (err) return;

    // Treating
    const nodes = {},
          edges = [];

    data.result.forEach(function(row) {
      const directionId = '$d$' + row.direction,
            countryId = '$c$' + row.country;

      if (!nodes[directionId])
        nodes[directionId] = {
          id: directionId,
          label: row.direction,
          color: palette[0],
          size: 1,
          x: Math.random(),
          y: Math.random(),
        };

      if (!nodes[countryId])
        nodes[countryId] = {
          id: countryId,
          label: row.country,
          color: palette[1],
          size: 1,
          x: Math.random(),
          y: Math.random(),
        };

      edges.push({
        id: 'e' + edges.length,
        size: row.count,
        source: directionId,
        target: countryId
      });
    });

    cursor.set('graph', {nodes: values(nodes), edges});
  });
}

/**
 * Selecting a product classification.
 */
export function selectTerms(tree, classification) {
  const cursor = tree.select([...ROOT, 'terms']);

  cursor.set('classification', classification);
  cursor.set('graph', null);

  if (!classification)
    return;

  cursor.set('loading', true);

  tree.client.terms({params: {id: classification.id}}, function(err, data) {
    cursor.set('loading', false);

    if (err)
      return;

    const colorScale = scaleCategory20()
      .domain(uniq(data.result.nodes.map(node => node.community)));

    const maxPosition = max(data.result.nodes, 'position').position;

    const colorScalePosition = scaleLinear()
      .domain([0, maxPosition])
      .range(['red', 'white']);

    data.result.nodes.forEach(node => {
      node.size = 1;
      node.color = node.community === -1 ? '#ACACAC' : colorScale(node.community);
      node.positionColor = colorScalePosition(node.position);
      node.x = Math.random();
      node.y = Math.random();
    });

    data.result.edges.forEach(edge => {
      edge.size = edge.weight;
    });

    cursor.set('graph', data.result);
  });
}

/**
 * Selecting a colorization.
 */
export function selectColorization(tree, colorization) {
  const cursor = tree.select([...ROOT, 'terms', 'colorization']);

  cursor.set(colorization);
}
