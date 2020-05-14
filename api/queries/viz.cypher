// name: network
// Building a network between directions and classified countries.
//------------------------------------------------------------------------------
MATCH
	(n:Classification)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:Country),
  (f:Flow)
WHERE n.id=$classification AND f.country = c.name AND exists(f.direction)
RETURN
	gc.name AS country,
    f.direction AS direction,
  	count(f) AS count
