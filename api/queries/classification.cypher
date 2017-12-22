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
WITH c, a, p, count(item) AS itemsCount
OPTIONAL MATCH (c)-[:HAS]->(group)
WITH c, a, p, itemsCount, count(group) AS groupsCount
OPTIONAL MATCH (p)-[:HAS]->(item)
WHERE NOT (c)-[:HAS]->()-[:AGGREGATES]->(item)
RETURN
  c AS classification,
  a.name AS author,
  id(p) AS parent,
  itemsCount,
  groupsCount,
  count(item) AS unclassifiedItemsCount
ORDER BY id(c);

// name: rawGroups
// Retrieving every groups for the given classification.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)-[:HAS]->(group)
RETURN id(group) AS id, group.name AS name
ORDER BY lower(group.name);

//name: group
// Retrieving every items for a given group in a classification
//------------------------------------------------------------------------------
MATCH  (group)-[:AGGREGATES*1..]->(item)<-[:HAS]-(ci)
WHERE id(group)={id} AND id(ci)={queryItemFrom}
WITH group, item 
ORDER BY item.name =~{queryItem} DESC, item.name ASC
WITH group, collect({name:item.name,matched:item.name =~{queryItem}}) AS items
RETURN group, items[{offsetItem}..{limitItem}] as items, size(items) as nbItems, size(filter(item in items where item.matched)) as nbMatchedItems


// name: groups
// Retrieving a sample of groups for the given classification.
//------------------------------------------------------------------------------
MATCH (cg)-[:HAS]->(group)-[:AGGREGATES]->(item)
WHERE  id(cg)={id} AND group.name =~ {queryGroup}
WITH group, item
ORDER BY item.name
RETURN group, collect({name:item.name})[{offsetItem}..{limitItem}] as items, size(collect(item)) as nbItems
ORDER BY {orderBy}
SKIP {offset}
LIMIT {limit}

// name: groupsFrom
// Retrieving a sample of groups for the given classification but listing items from an upper classification.
//------------------------------------------------------------------------------
MATCH (cg)-[:HAS]->(group)-[:AGGREGATES*1..]->(item)<-[:HAS]-(ci)
WHERE  id(cg)={id} AND group.name =~ {queryGroup} AND id(ci)={queryItemFrom}
WITH group, item
ORDER BY item.name
RETURN group, collect({name:item.name})[{offsetItem}..{limitItem}] as items, size(collect(item)) as nbItems
ORDER BY {orderBy}
SKIP {offset}
LIMIT {limit}


// name: searchGroups
// Searching a sample of groups for the given classification.
//------------------------------------------------------------------------------
MATCH (cg)-[:HAS]->(group)-[:AGGREGATES]->(item)
WHERE id(cg)={id} AND group.name =~ {queryGroup} 
      AND item.name =~ {queryItem}
WITH distinct group
SKIP {offset}
LIMIT {limit}

OPTIONAL MATCH (group)-[:AGGREGATES]->(item)
WITH group, item 
ORDER BY item.name =~{queryItem} DESC, item.name ASC
WITH group, collect({name:item.name,matched:item.name =~{queryItem}}) AS items
RETURN group, items[{offsetItem}..{limitItem}] as items, size(items) as nbItems, size(filter(item in items where item.matched)) as nbMatchedItems
ORDER BY {orderBy}

// name: searchGroupsFrom
// Searching a sample of groups for the given classification but listing items from an upper classification.
//------------------------------------------------------------------------------
MATCH (cg)-[:HAS]->(group)-[:AGGREGATES*1..]->(item)<-[:HAS]-(ci)
WHERE id(cg)={id} AND group.name =~ {queryGroup} 
     AND item.name =~ {queryItem} and id(ci)={queryItemFrom}
WITH distinct group
SKIP {offset}
LIMIT {limit}

OPTIONAL MATCH (group)-[:AGGREGATES*1..]->(item)<-[:HAS]-(ci)
WHERE id(ci)={queryItemFrom}
WITH group, item 
ORDER BY item.name =~{queryItem} DESC, item.name ASC
WITH group, collect({name:item.name,matched:item.name =~{queryItem}}) AS items
RETURN group, items[{offsetItem}..{limitItem}] as items, size(items) as nbItems, size(filter(item in items where item.matched)) as nbMatchedItems
ORDER BY {orderBy}
// name: searchGroupsSource
// Searching a sample of groups for the given source classification.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)-[:HAS]->(group)
WHERE group.name =~ {queryGroup}
WITH group
ORDER BY group.name
SKIP {offset}
LIMIT {limit}

RETURN group, [] as items, 0 as nbItems;

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

// name: allGroupsToSource
// Retrieving every groups for the given classification but mapped to the
// source products themselves.
//------------------------------------------------------------------------------
MATCH (item:Product)
OPTIONAL MATCH (item)<-[:AGGREGATES*1..]-(group:ClassifiedItem)<-[:HAS]-(c)
WHERE id(c) = {id}
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

