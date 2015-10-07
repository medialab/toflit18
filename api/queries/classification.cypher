// name: getAll
// Retrieving every classifications.
MATCH (c:Classification)-[:CREATED_BY]->(a:User)
OPTIONAL MATCH (c)-[:BASED_ON]->(p:Classification)
OPTIONAL MATCH (c)-[:HAS]->(group)
RETURN
  c AS classification,
  a.name AS author,
  id(p) AS parent,
  count(group) AS nb_groups;

// name: groups
START c=node({id})
MATCH (c)-[:HAS]->(group)
RETURN group AS group
ORDER BY group.name
SKIP {offset}
LIMIT {limit};

// name: export
START c=node({id})
MATCH (c)-[:BASED_ON]->(p:Classification)-[:HAS]->(item)
OPTIONAL MATCH (c)-[:HAS]->(group:ClassifiedItem)-[:AGGREGATES]->(item)
RETURN
  c.slug AS name,
  p.slug AS parent,
  c.model AS model,
  group.name AS group,
  item.name AS item,
  group.note AS note,
  item:OutsiderClassifiedItem AS outsider;
