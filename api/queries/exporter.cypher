// name: sources
// Dumping the full sources
MATCH (flow:Flow)

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

SKIP {offset}
LIMIT {limit}
