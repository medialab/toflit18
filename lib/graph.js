/**
 * TOFLIT18 Graph Utilities
 * =========================
 *
 * Graph-related algorithms.
 */
export function connectedComponents(nodes) {
  const visited = new Set(),
        components = [];

  nodes.forEach(node => {
    if (visited.has(node.id))
      return;

    visited.add(node.id);

    const component = [node.id];

    const walk = neighbour => {
      if (visited.has(neighbour.id))
        return;

      visited.add(neighbour.id);

      component.push(neighbour.id);
      neighbour.neighbours.forEach(walk);
    };

    node.neighbours.forEach(walk);

    components.push(component);
  });

  return components;
}
