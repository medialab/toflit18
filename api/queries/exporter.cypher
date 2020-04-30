// name: sources
// Dumping the full sources.
//------------------------------------------------------------------------------
MATCH (flow:Flow)

WITH flow SKIP $offset LIMIT $limit

OPTIONAL MATCH (flow)-[:OF]->(product:Product)
OPTIONAL MATCH (flow)-[transcription:TRANSCRIBED_FROM]->(source:Source)
OPTIONAL MATCH (flow)-[:FROM|:TO]-(country:Country)
OPTIONAL MATCH (flow)-[:FROM|:TO]-(direction:Direction)
OPTIONAL MATCH (flow)-[:FROM|:TO]-(office:Office)
OPTIONAL MATCH (flow)-[:TRANSCRIBED_BY]->(operator:Operator)
OPTIONAL MATCH (flow)-[:ORIGINATES_FROM]->(origin:Origin)

RETURN
  flow,
  product.name AS product,
  source,
  transcription,
  operator.name AS operator,
  direction.name AS direction,
  office.name AS office,
  country.name AS country,
  origin.name AS origin

// name: classifications
// Get all the classification for the given model.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:BASED_ON]->(p:Classification)
WHERE not(exists(c.source)) AND c.model IN $models
RETURN c AS classification, p.slug AS parent

// name: products
// Retrieving every source product.
//------------------------------------------------------------------------------
MATCH (p:Product)
RETURN p.name AS product, ["toflit18"] + [(p)-[:TRANSCRIBED_FROM]->(source)|source.name] AS sources

// name: countries
// Retrieving every source country.
//------------------------------------------------------------------------------
MATCH (c:Country)
RETURN c.name AS country

// name: classifiedItemsToSource
// Retrieving groups from a classification and mapping them to the sources.
//------------------------------------------------------------------------------
MATCH (c)-[:HAS]->(group:ClassifiedItem)
WHERE id(c)=$id
OPTIONAL MATCH (group)-[:AGGREGATES*]->(item:Item)
RETURN
  group.name AS group,
  item.name AS item

// name: classifiedItems
// Retrieving groups from a classification and mapping them to the matching items.
//------------------------------------------------------------------------------
MATCH (c)-[:BASED_ON]->(:Classification)-[:HAS]->(item)
WHERE id(c)=$id
OPTIONAL MATCH (c)-[:HAS]->(group:ClassifiedItem)-[:AGGREGATES]->(item)
RETURN
  group.name AS group,
  item.name AS item,
  group.note AS note

UNION ALL

MATCH (c)-[:HAS]->(group:ClassifiedItem)-[:AGGREGATES]->(item:OutsiderItem)-[:TRANSCRIBED_FROM]->(source:ExternalSource)
WHERE id(c)=$id
RETURN
  group.name AS group,
  item.name AS item,
  group.note AS note
