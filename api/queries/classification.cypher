// name: getAll
// Retrieving every classifications.
MATCH (c:Classification)-[:CREATED_BY]->(a:User)
OPTIONAL MATCH (c)-[:BASED_ON]->(p:Classification)
RETURN c AS classification, a.name AS author, id(p) AS parent
ORDER BY c.name;
