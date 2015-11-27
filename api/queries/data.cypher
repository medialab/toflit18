// name: directions
// Retrieving the list of the available directions.
//------------------------------------------------------------------------------
MATCH (d:Direction)
RETURN
  id(d) AS id,
  d.name AS name
ORDER BY d.name;
