// name: network
// Building a network between directions and classified countries.
//------------------------------------------------------------------------------
START n=node({classification})
MATCH (n)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:Country)
WITH gc.name AS country, c.name AS sc
MATCH (f:Flow)
WHERE f.country = sc AND has(f.direction)
RETURN
  country,
  f.direction AS direction,
  count(f) AS count;
