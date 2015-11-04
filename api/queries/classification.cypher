// name: getWithGroups
// Retrieving basic information about the classification plus its groups.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)-[:HAS]->(group)
RETURN
  c AS classification,
  collect(group) AS groups;

// name: getAll
// Retrieving every classifications.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:CREATED_BY]->(a:User)
OPTIONAL MATCH (c)-[:BASED_ON]->(p:Classification)
OPTIONAL MATCH (c)-[:HAS]->(group)

WITH c, a, p, count(group) AS groupsCount
OPTIONAL MATCH (p)-[:HAS]->(item)
WITH c, a, p, groupsCount, count(item) AS itemsCount
OPTIONAL MATCH (p)-[:HAS]->(item)
WHERE NOT (item)<-[:AGGREGATES]-()<-[:HAS]-(c)
WITH c, a, p, groupsCount, itemsCount, count(item) AS unclassifiedItemsCount

RETURN
  c AS classification,
  a.name AS author,
  id(p) AS parent,
  groupsCount,
  itemsCount,
  unclassifiedItemsCount;

// name: groups
// Retrieving a sample of groups for the given classification.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)-[:HAS]->(group)
WITH group
ORDER BY group.name
SKIP {offset}
LIMIT {limit}

OPTIONAL MATCH (group)-[:AGGREGATES]->(item)
WITH group, item ORDER BY item.name
WITH group, collect(item.name) AS items

RETURN group, items;

// name: searchGroups
// Searching a sample of groups for the given classification.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)-[:HAS]->(group)
WHERE group.name =~ {query}
WITH group
ORDER BY group.name
SKIP {offset}
LIMIT {limit}

OPTIONAL MATCH (group)-[:AGGREGATES]->(item)
WITH group, item ORDER BY item.name
WITH group, collect(item.name) AS items

RETURN group, items;

// name: allGroups
// Retrieving every groups for the given classification.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)-[:BASED_ON]->(:Classification)-[:HAS]->(item)
OPTIONAL MATCH (c)-[:HAS]->(group:ClassifiedItem)-[:AGGREGATES]->(item)
RETURN
  group.name AS group,
  item.name AS item;

// name: export
// Exporting data about the given classification in order to produce a CSV file.
//------------------------------------------------------------------------------
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
