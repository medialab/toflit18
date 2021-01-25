// name: ortho
MATCH (c:Classification)
WHERE c.model = "product" AND c.slug = "orthographic_normalization"
WITH c
MATCH
  (f:Flow),
  (f:Flow)-[:TRANSCRIBED_FROM]->(s:Source),
  (f:Flow)-[:TO|:FROM]->(d:Region),
  (f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(ci:ClassifiedItem)<-[:HAS]-(c)
WHERE
  s.type = "Local" AND
  exists(f.value)
RETURN
  f.year AS year,
  d.name AS bureau,
  ci.name AS product,
  sum(f.value) AS value,
  count(f) AS count,
  CASE WHEN f.import THEN 1 ELSE 0 END AS import
ORDER BY bureau, import, year, product;

// name: simplification
MATCH (c:Classification)
WHERE c.model = "product" AND c.slug = "simplification"
WITH c
MATCH
  (f:Flow),
  (f:Flow)-[:TRANSCRIBED_FROM]->(s:Source),
  (f:Flow)-[:TO|:FROM]->(d:Region),
  (f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(ci:ClassifiedItem)<-[:HAS]-(c)
WHERE
  s.type = "Local" AND
  exists(f.value)
RETURN
  f.year AS year,
  d.name AS bureau,
  ci.name AS product,
  sum(f.value) AS value,
  count(f) AS count,
  CASE WHEN f.import THEN 1 ELSE 0 END AS import
ORDER BY bureau, import, year, product;

// name: sitc
MATCH (c:Classification)
WHERE c.model = "product" AND c.slug = "sitc_fr"
WITH c
MATCH
  (f:Flow),
  (f:Flow)-[:TRANSCRIBED_FROM]->(s:Source),
  (f:Flow)-[:TO|:FROM]->(d:Region),
  (f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(ci:ClassifiedItem)<-[:HAS]-(c)
WHERE
  s.type = "Local" AND
  exists(f.value)
RETURN
  f.year AS year,
  d.name AS bureau,
  ci.name AS product,
  sum(f.value) AS value,
  count(f) AS count,
  CASE WHEN f.import THEN 1 ELSE 0 END AS import
ORDER BY bureau, import, year, product;

//-------------------------------------------------------------------

// name: other-ortho
MATCH (c:Classification)
WHERE c.model = "product" AND c.slug = "orthographic_normalization"
WITH c
MATCH
  (f:Flow),
  (f:Flow)-[:TRANSCRIBED_FROM]->(s:Source),
  (f:Flow)-[:TO|:FROM]->(d:Region),
  (f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(ci:ClassifiedItem)<-[:HAS]-(c)
WHERE
  s.type <> "Local" AND
  exists(f.value)
RETURN
  s.type AS source,
  f.year AS year,
  d.name AS bureau,
  ci.name AS product,
  sum(f.value) AS value,
  count(f) AS count,
  CASE WHEN f.import THEN 1 ELSE 0 END AS import
ORDER BY bureau, import, year, product;

// name: other-simplification
MATCH (c:Classification)
WHERE c.model = "product" AND c.slug = "simplification"
WITH c
MATCH
  (f:Flow),
  (f:Flow)-[:TRANSCRIBED_FROM]->(s:Source),
  (f:Flow)-[:TO|:FROM]->(d:Region),
  (f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(ci:ClassifiedItem)<-[:HAS]-(c)
WHERE
  s.type <> "Local" AND
  exists(f.value)
RETURN
  s.type AS source,
  f.year AS year,
  d.name AS bureau,
  ci.name AS product,
  sum(f.value) AS value,
  count(f) AS count,
  CASE WHEN f.import THEN 1 ELSE 0 END AS import
ORDER BY bureau, import, year, product;

// name: other-sitc
MATCH (c:Classification)
WHERE c.model = "product" AND c.slug = "sitc_fr"
WITH c
MATCH
  (f:Flow),
  (f:Flow)-[:TRANSCRIBED_FROM]->(s:Source),
  (f:Flow)-[:TO|:FROM]->(d:Region),
  (f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(ci:ClassifiedItem)<-[:HAS]-(c)
WHERE
  s.type <> "Local" AND
  exists(f.value)
RETURN
  s.type AS source,
  f.year AS year,
  d.name AS bureau,
  ci.name AS product,
  sum(f.value) AS value,
  count(f) AS count,
  CASE WHEN f.import THEN 1 ELSE 0 END AS import
ORDER BY bureau, import, year, product;

