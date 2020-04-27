// name: network
// Building a network between directions and classified countries.
//------------------------------------------------------------------------------
MATCH (n)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:Country)
WHERE id(n)=$classification
WITH gc.name AS country, c.name AS sc
MATCH (f:Flow)
WHERE f.country = sc AND exists(f.direction)
RETURN
  country,
  f.direction AS direction,
  count(f) AS count;
