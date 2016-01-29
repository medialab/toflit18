START n=node(5) 
MATCH (n)-[:HAS]->(g)-[:AGGREGATES*0..]->(p:Product)
WHERE g.name="6"
with g as class,p
MATCH (gc)-[:AGGREGATES*0..]->(c:Country)
WHERE id(gc)=455996
with class,p,c,collect(c.name) as countries,gc
MATCH (p)<-[:OF]-(f:Flow {sourceType:"Local"})
WHERE f.country in countries
return class,gc,count(f)

MATCH (gc)-[:AGGREGATES*0..]->(c:Country)
WHERE id(gc)=455996
with c,gc
MATCH (f)-[:FROM|:TO]->(c)
with f,gc as class
MATCH (n)-[:HAS]->(g)-[:AGGREGATES*0..]->(p:Product)<-[:OF]-(f)
WHERE id(n)=5 AND g.name="6"
return class,g,count(f)
