// name: sourcesPerDirections
// Return data concerning the available years per granularity (national/local)
// for each of the database's directions.
//------------------------------------------------------------------------------
MATCH (s:Source)<-[:TRANSCRIBED_FROM]-(f:Flow)-[:FROM|:TO]->(d:Direction)
WHERE s.type IN ["National par direction", "Local"]
RETURN
  d.name AS direction,
  f.year AS year,
  CASE s.type WHEN "Local" THEN "local" ELSE "national" END AS type,
  count(f) AS flows
ORDER BY f.year;

// name: availableDirectionsPerYear
// Retrieving the list of available directions per year of the database's flows.
//------------------------------------------------------------------------------
MATCH (d:Direction)<-[:FROM|:TO]-(f:Flow)
WITH collect(DISTINCT d) AS directions, f.year AS year
RETURN year, directions ORDER BY year;

// name: network
// Building a network between directions and classified countries.
//------------------------------------------------------------------------------
START n=node({classification})
MATCH (n)-[:HAS]->(gc)-[:AGGREGATES*0..]->(c:Country)
WITH gc.name AS country, c.name AS sc
MATCH (f:Flow)
WHERE f.country = sc AND has(f.direction)
RETURN
  country,
  f.direction AS direction,
  count(f) AS count;
