// name: network
// Building a network between regions and classified partners.
//------------------------------------------------------------------------------
MATCH
	(n:Classification)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:Partner),
  (f:Flow)
WHERE n.id=$classification AND f.partner = c.name AND exists(f.region)
RETURN
	gc.name AS partner,
    f.region AS region,
  	count(f) AS count
