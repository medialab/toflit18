// name: network
// Building a network between directions and classified partners.
//------------------------------------------------------------------------------
MATCH
	(n:Classification)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:Partner),
  (f:Flow)
WHERE n.id=$classification AND f.partner = c.name AND exists(f.direction)
RETURN
	gc.name AS partner,
    f.direction AS direction,
  	count(f) AS count
