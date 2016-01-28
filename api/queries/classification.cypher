// name: info
// Retrieving basic information about the desired classification.
//------------------------------------------------------------------------------
START c=node({id})
RETURN c AS classification;

// name: getAll
// Retrieving every classifications.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:CREATED_BY]->(a:User)
MATCH (c)-[:BASED_ON*0..1]->(p:Classification)
WHERE id(c) <> id(p) OR NOT (c)-[:BASED_ON]->()
OPTIONAL MATCH (p)-[:HAS]->(item)
OPTIONAL MATCH (c)-[:HAS]->(group)-[:AGGREGATES]->(item)

WITH c, a, p, collect({group: group, item: item}) AS links

WITH
  c,
  a.name AS author,
  id(p) AS parent,
  size(filter(x IN links WHERE x.group IS NULL)) AS unclassifiedItemsCount,
  size(links) AS itemsCount,
  links

UNWIND links AS link

RETURN
  c AS classification,
  author,
  parent,
  unclassifiedItemsCount,
  itemsCount,
  count(DISTINCT link.group) AS groupsCount;

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
