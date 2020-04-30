// name: network
// Building a network between directions and classified countries.
//------------------------------------------------------------------------------
MATCH
	(n)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:Country),
  (f:Flow)
WHERE id(n)=$classification AND f.country = c.name AND exists(f.direction)
RETURN
	gc.name AS country,
    f.direction AS direction,
  	count(f) AS count
