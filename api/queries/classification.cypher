// name: info
// Retrieving basic information about the desired classification.
//------------------------------------------------------------------------------
MATCH (c:Classification) WHERE c.id=$id
RETURN c AS classification

// name: getAll
// Retrieving every classifications.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:CREATED_BY]->(a:User)
OPTIONAL MATCH (c)-[:BASED_ON]->(p:Classification)
RETURN
	  c AS classification,
  	a.name AS author,
    p.id AS parent,
    size((p)-[:HAS]->()) AS itemsCount,
    size((c)-[:HAS]->()) AS groupsCount,
    size([(c)-[:HAS]->()-[:AGGREGATES]->()]) AS unclassifiedItemsCount
ORDER BY c.id

// name: rawGroups
// Retrieving every groups for the given classification.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:HAS]->(group) WHERE c.id=$id
RETURN group.id AS id, group.name AS name
ORDER BY apoc.text.clean(group.name)

// name: group
// Retrieving every items for a given group in a classification
//------------------------------------------------------------------------------
MATCH  (group:ClassifiedItem)-[:AGGREGATES]->(item) WHERE group.id=$id
WITH group, item.name AS name, item.name =~$queryItem AS matched
ORDER BY matched DESC, apoc.text.clean(name)
WITH group, collect({name:name, matched:matched}) AS items
RETURN group, items, size(items) as nbItems, size(filter(item in items where item.matched)) as nbMatchedItems

// name: groupFrom
// Retrieving every items for a given group in a classification but listing items from an upper classification
//------------------------------------------------------------------------------
MATCH  (group:ClassifiedItem)-[:AGGREGATES*1..]->(item)<-[:HAS]-(ci:Classification)
WHERE group.id=$id AND ci.id=$queryItemFrom
WITH group, item.name AS name, item.name =~$queryItem AS matched
ORDER BY matched DESC, apoc.text.clean(name)
WITH group, collect({name:name, matched:matched}) AS items
RETURN group, items[$offsetItem..$limitItem] as items, size(items) as nbItems, size(filter(item in items where item.matched)) as nbMatchedItems

// name: groups
// Retrieving a sample of groups for the given classification.
//------------------------------------------------------------------------------
MATCH (cg:Classification)-[:HAS]->(group)-[:AGGREGATES]->(item)
WHERE  cg.id=$id AND group.name =~ $queryGroup
WITH group, item
ORDER BY apoc.text.clean(item.name)
RETURN group, collect({name:item.name})[$offsetItem..$limitItem] as items, size((group)-[:AGGREGATES]->()) as nbItems

// name: groupsFrom
// Retrieving a sample of groups for the given classification but listing items from an upper classification.
//------------------------------------------------------------------------------
MATCH (cg:Classification)-[:HAS]->(group)-[:AGGREGATES*1..]->(item)<-[:HAS]-(ci:Classification)
WHERE  cg.id=$id AND group.name =~ $queryGroup AND ci.id=$queryItemFrom
WITH group, item
ORDER BY apoc.text.clean(group.name), apoc.text.clean(item.name)
RETURN group, collect({name:item.name})[$offsetItem..$limitItem] as items, size(collect(item)) as nbItems

// name: searchGroups
// Searching a sample of groups for the given classification.
//------------------------------------------------------------------------------
MATCH (cg:Classification)-[:HAS]->(group)-[:AGGREGATES]->(item)
WHERE
	cg.id=$id AND
	group.name =~ $queryGroup  AND
  item.name =~ $queryGroup
WITH distinct group
SKIP $offset
LIMIT $limit

MATCH (group)-[:AGGREGATES]->(item)
WITH group, item.name AS name, item.name =~$queryItem AS matched
ORDER BY matched DESC, apoc.text.clean(name)
WITH group, collect({name:name,matched:matched}) AS items
RETURN group, items[$offsetItem..$limitItem] as items, size(items) as nbItems, size(filter(item in items where item.matched)) as nbMatchedItems

// name: searchGroupsFrom
// Searching a sample of groups for the given classification but listing items from an upper classification.
//------------------------------------------------------------------------------
MATCH (cg:Classification)-[:HAS]->(group)-[:AGGREGATES*1..]->(item)<-[:HAS]-(ci:Classification)
WHERE cg.id=$id AND
	    group.name =~ $queryGroup AND
      item.name =~ $queryItem AND
      ci.id=$queryItemFrom
WITH distinct group
SKIP $offset
LIMIT $limit

OPTIONAL MATCH (group)-[:AGGREGATES*1..]->(item)<-[:HAS]-(ci:Classification)
WHERE ci.id=$queryItemFrom
WITH group, item.name AS name, item.name =~$queryItem AS matched
ORDER BY matched DESC, apoc.text.clean(name)
WITH group, collect({name:name,matched:matched}) AS items
RETURN group, items[$offsetItem..$limitItem] as items, size(items) as nbItems, size(filter(item in items where item.matched)) as nbMatchedItems


// name: searchGroupsSource
// Searching a sample of groups for the given source classification.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:HAS]->(group)
WHERE c.id=$id AND  group.name =~ $queryGroup
WITH group
ORDER BY apoc.text.clean(group.name)
SKIP $offset
LIMIT $limit

RETURN group, [] as items, 0 as nbItems

// name: allGroups
// Retrieving every groups for the given classification.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:BASED_ON]->(:Classification)-[:HAS]->(item)
WHERE c.id=$id
OPTIONAL MATCH (c)-[:HAS]->(group:ClassifiedItem)-[:AGGREGATES]->(item)
RETURN
  group.name AS group,
  group.id AS groupId,
  item.name AS item,
  item.id AS itemId

// name: allGroupsToSource
// Retrieving every groups for the given classification but mapped to the
// source products themselves.
//------------------------------------------------------------------------------
MATCH (item:Product)
OPTIONAL MATCH (item)<-[:AGGREGATES*1..]-(group:ClassifiedItem)<-[:HAS]-(c:Classification)
WHERE c.id = $id
RETURN
  group.name AS group,
  group.id AS groupId,
  item.name AS item,
  item.id AS itemId

// name: upper
// Retrieving every classifications based on the given one.
//------------------------------------------------------------------------------
MATCH (c:Classification)<-[:BASED_ON]-(upper)
WHERE c.id=$id
RETURN upper

// name: upperGroups
// Retrieving upper groups of a classification with the associated items.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:HAS]->(group)
WHERE c.id=$id
RETURN group.name AS group, [(group)-[:AGGREGATES]->(item) | item.name] AS items

// name: export
// Exporting data about the given classification in order to produce a CSV file.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:BASED_ON]->(p:Classification)-[:HAS]->(item)
WHERE c.id=$id
OPTIONAL MATCH (c)-[:HAS]->(group:ClassifiedItem)-[:AGGREGATES]->(item)
RETURN
  c.slug AS name,
  p.slug AS parent,
  c.model AS model,
  group.name AS group,
  item.name AS item,
  group.note AS note,
  item:OutsiderClassifiedItem AS outsider

