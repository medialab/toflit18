// name: sources
// Dumping the full sources
MATCH (flow:Flow)

WITH flow SKIP {offset}

OPTIONAL MATCH (flow)-[:OF]->(product:Product)
OPTIONAL MATCH (flow)-[transcription:TRANSCRIBED_FROM]->(source:Source)
OPTIONAL MATCH (flow)-[:FROM|:TO]-(country:Country)
OPTIONAL MATCH (flow)-[:FROM|:TO]-(direction:Direction)
OPTIONAL MATCH (flow)-[:FROM|:TO]-(office:Office)
OPTIONAL MATCH (flow)-[:TRANSCRIBED_BY]->(operator:Operator)
OPTIONAL MATCH (flow)-[:ORIGINATES_FROM]->(origin:Origin)
OPTIONAL MATCH (flow)-[:VALUE_IN]->(unit:Unit)

RETURN
  flow,
  product.name AS product,
  source,
  transcription,
  operator.name AS operator,
  direction.name AS direction,
  office.name AS office,
  country.name AS country,
  origin.name AS origin,
  unit.name AS unit

LIMIT {limit};

// name: classifications
// Get all the classification for the given model
MATCH (c:Classification)
WHERE c.model IN {models}
RETURN c AS classification;

// name: products
MATCH (p:Product)
RETURN p.name AS product;

// name: countries
MATCH (c:Country)
RETURN c.name AS country;

// name: classifiedItemsToSource
START c=node({id})
MATCH (c)-[:HAS]->(group:ClassifiedItem)
OPTIONAL MATCH (group)-[:AGGREGATES*1..]->(item:Item)
RETURN group.name AS group, item.name AS item;

// name: classifiedItems
START c=node({id})
MATCH (c)-[:HAS]->(group:ClassifiedItem)
OPTIONAL MATCH (group)-[:AGGREGATES]->(item)
RETURN group.name AS group, item.name AS item, group.note AS note

UNION ALL

START c=node({id})
MATCH (c)-[:BASED_ON]->(cp:Classification)-[:HAS]->(item)
WHERE NOT (c)-[:AGGREGATES]->(item)
RETURN "" AS group, item.name AS item, "" AS note;
