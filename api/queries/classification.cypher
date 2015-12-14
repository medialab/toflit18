// name: info
// Retrieving basic information about the desired classification.
//------------------------------------------------------------------------------
START c=node({id})
RETURN c AS classification;

// name: getAll
// Retrieving every classifications.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:CREATED_BY]->(a:User)
OPTIONAL MATCH (c)-[:BASED_ON]->(p:Classification)
OPTIONAL MATCH (c)-[:HAS]->(group)

WITH c, a, p, count(group) AS groupsCount
OPTIONAL MATCH (p)-[:HAS]->(item)
OPTIONAL MATCH (item)<-[ra:AGGREGATES]-(group)<-[:HAS]-(c)

WITH c, a, p, groupsCount, collect([item, ra IS NULL]) AS items

WITH c, a, p, groupsCount,
  size(items) AS itemsCount,
  size(filter(x IN items WHERE x[1])) AS unclassifiedItemsCount

RETURN
  c AS classification,
  a.name AS author,
  id(p) AS parent,
  groupsCount,
  itemsCount,
  unclassifiedItemsCount;

// name: rawGroups
// Retrieving every groups for the given classification.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)-[:HAS]->(group)
RETURN id(group) AS id, group.name AS name
ORDER BY lower(group.name);

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
  id(group) AS groupId,
  item.name AS item,
  id(item) AS itemId;

// name: upper
// Retrieving every classifications based on the given one.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)<-[:BASED_ON]-(upper)
RETURN upper;

// name: upperGroups
// Retrieving upper groups of a classification with the associated items.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)-[:HAS]->(group)-[:AGGREGATES]->(item)
RETURN group.name AS group, collect(item.name) AS items;

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
