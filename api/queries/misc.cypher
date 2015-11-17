// name: sankeyPrototype
// Dumping direction/countries pairs along with the count of matching flows.
//------------------------------------------------------------------------------
MATCH (d:Direction)<-[:FROM]-(f:Flow)-[:TO]->(c:Country)
RETURN
  d.name AS direction,
  c.name AS country,
  count(f) AS nb_flows,
  "export" AS type

UNION

MATCH (d:Direction)<-[:TO]-(f:Flow)-[:FROM]->(c:Country)
RETURN
  d.name AS direction,
  c.name AS country,
  count(f) AS nb_flows,
  "import" AS type;

// name: availableDirectionsPerYear
// Retrieving the list of available directions per year of the database's flows.
//------------------------------------------------------------------------------
MATCH (d:Direction)<-[:FROM|:TO]-(f:Flow)
WITH collect(DISTINCT d) AS directions, f.normalized_year AS year
RETURN year, directions ORDER BY year;
