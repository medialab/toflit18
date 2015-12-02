/**
 * TOFLIT18 Globals Actions
 * =========================
 *
 * Actions related to the globals' view.
 */
import {values} from 'lodash';

const ROOT = ['states', 'exploration', 'globals'];

export function selectClassification(tree, classification) {
  const cursor = tree.select([...ROOT, 'network']);

  cursor.set('classification', classification);
  cursor.set('graph', null);
  cursor.set('loading', true);

  if (!classification)
    return;

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
          kind: 'direction',
          size: 1,
          x: Math.random(),
          y: Math.random(),
        };

      if (!nodes[countryId])
        nodes[countryId] = {
          id: countryId,
          label: row.country,
          kind: 'country',
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
