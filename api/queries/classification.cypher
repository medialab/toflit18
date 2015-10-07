// name: getAll
// Retrieving every classifications.
MATCH (c:Classification)-[:CREATED_BY]->(a:User)
OPTIONAL MATCH (c)-[:BASED_ON]->(p:Classification)
RETURN c AS classification, a.name AS author, id(p) AS parent
ORDER BY c.name;

// name: groups
START c=node({id})
MATCH (c)-[:HAS]->(group)
RETURN group AS group
ORDER BY group.name
LIMIT 100;
