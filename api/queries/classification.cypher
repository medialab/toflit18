// name: test
// Retrieving a sample classification for testing purposes
MATCH (cp:ClassifiedProduct)<-[:HAS]-(:Classification {slug: "orthographic_normalization"})
RETURN cp
ORDER BY cp.name;
