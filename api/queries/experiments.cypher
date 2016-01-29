START n=node(5)
MATCH (n)-[:HAS]->(g)-[:AGGREGATES*0..]->(p:Product)
WHERE g.name="6"
with g as class,p
MATCH (gc)-[:AGGREGATES*0..]->(c:Country)
WHERE id(gc)=455996
with class,p,c,collect(c.name) as countries
MATCH (p)<-[:OF]-(f:Flow {sourceType:"Local"})
WHERE f.country in countries
return class,count(f)
