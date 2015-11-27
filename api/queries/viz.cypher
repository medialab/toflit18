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

// name: line
// Retrieving a basic line.
//------------------------------------------------------------------------------
MATCH (d:Direction)<-[:FROM|:TO]-(f:Flow)
WHERE id(d) = {direction}
RETURN
  count(f) AS value,
  f.year AS year
ORDER BY f.year;
