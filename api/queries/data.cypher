// name: directions
// Retrieving the list of the available directions.
//------------------------------------------------------------------------------
MATCH (d:Direction)
RETURN
  d.id AS id,
  d.name AS name
ORDER BY d.name

// name: sourceTypes
// Retrieving the list of the distinct source types.
//------------------------------------------------------------------------------
MATCH (s:Source)
RETURN DISTINCT s.type AS type
ORDER BY s.type
