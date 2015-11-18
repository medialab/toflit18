// name: sources
// Dumping the full sources.
//------------------------------------------------------------------------------
MATCH (flow:Flow)

WITH flow SKIP {offset}

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

LIMIT {limit};

// name: classifications
// Get all the classification for the given model.
//------------------------------------------------------------------------------
MATCH (c:Classification)-[:BASED_ON]->(p:Classification)
WHERE not(has(c.source)) AND c.model IN {models}
RETURN c AS classification, p.slug AS parent;

// name: products
// Retrieving every source product.
//------------------------------------------------------------------------------
MATCH (p:Product)
OPTIONAL MATCH (p)-[:TRANSCRIBED_FROM]->(source)
RETURN p.name AS product, coalesce(source.name, "toflit18") AS source;

// name: countries
// Retrieving every source country.
//------------------------------------------------------------------------------
MATCH (c:Country)
RETURN c.name AS country;

// name: classifiedItemsToSource
// Retrieving groups from a classification and mapping them to the sources.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)-[:HAS]->(group:ClassifiedItem)
OPTIONAL MATCH (group)-[:AGGREGATES*1..]->(item:Item)
RETURN
  group.name AS group,
  item.name AS item;

// name: classifiedItems
// Retrieving groups from a classification and mapping them to the matching items.
//------------------------------------------------------------------------------
START c=node({id})
MATCH (c)-[:BASED_ON]->(:Classification)-[:HAS]->(item)
OPTIONAL MATCH (c)-[:HAS]->(group:ClassifiedItem)-[:AGGREGATES]->(item)
RETURN
  group.name AS group,
  item.name AS item,
  group.note AS note

UNION ALL

START c=node({id})
MATCH (c)-[:HAS]->(group:ClassifiedItem)-[:AGGREGATES]->(item:OutsiderItem)-[:TRANSCRIBED_FROM]->(source:ExternalSource)
RETURN
  group.name AS group,
  item.name AS item,
  group.note AS note;
