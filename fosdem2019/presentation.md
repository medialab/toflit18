
# Using networks to study 18th century French trade
Paul Girard [@paulanomalie](http://twitter.com/paulanomalie)  
Guillaume Plique [@yomguithereal](https://twitter.com/yomguithereal)  
  
[Sciences Po, médialab, Paris, France](http://medialab.sciencespo.fr) - [ANR TOFLIT18](https://toflit18.hypotheses.org/)  
[FOSDEM'19, Graph dev room, February the 2nd 2019](https://fosdem.org/2019/schedule/event/graph_french_trade_study/)

---
## 18th c. French trade statistics

France started to compile **statistics about its trade in 1716**.  
The "Bureau de la Balance du Commerce" (Balance of Trade's Office) centralized local reports of imports/exports by commodities produced by french tax regions.  
Many statistical manuscript volumes produced by this process have been preserved in French archives.

---
![one TOFLIT18 source](./assets/toflit18_source.png)
---
<blockquote>
This communication will relate how and why we used network technologies to create a **research instrument**¹ based on the transcriptions of those archives in the TOFLIT18² research project. 
</blockquote>

¹ *To explore visually 18th century French trade*  
² *Transformations of the french economy through the lens of international trade*
---
<blockquote>
Our corpus is composed of  
<span class="fragment">+500k yearly trade transactions </span>   
<span class="fragment">of one commodity</span>  
<span class="fragment">between a French local tax region or a foreign country</span>  
<span class="fragment">between 1718 and 1838.</span> 
</blockquote>

---
### 18th century

<p align="center">
<em>year by year</em><br>

1718 ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ 1838</p>

---

### French trade flows
<p align="center">

French cities *<⋅⋅⋅⋅ flow ⋅⋅⋅⋅>* countries<br>

547,937 trade flows



</p>
---
<span class="fragment"></span>
<blockQuote>
We had to design  
a classification system  
to reduce the heterogeneity of the commodity names.
</blockQuote>
---
## Products

**Top 50 products on 55,804**

<p class="smaller">
Articles réunis ⋅ Indigo ⋅ Mercerie ⋅ Eau de vie ⋅ Librairie ⋅ Vinaigre ⋅ Cacao ⋅ Suif ⋅ Beurre ⋅ Alun ⋅ Liqueurs ⋅ Sel ⋅ Fromage ⋅ Rocou ⋅ Confitures ⋅ Acier ⋅ Fer ; en barres ⋅ Thé ⋅ Huile d'olive ⋅ Porcelaine ⋅ Poivre ⋅ Farine ⋅ Miel ⋅ Chandelle ⋅ Huile ; d'olive ⋅ Fayance ⋅ Savon ⋅ Amidon ⋅ Ris ⋅ Verdet ⋅ Bierre ⋅ Cochenille ⋅ Légumes ⋅ Bijouterie ⋅ Garance ⋅ Horlogerie ⋅ Chocolat ⋅ Meubles ⋅ Quinquina ⋅ Amandes ⋅ Crin ⋅ Papier ; blanc ⋅ Planches ; de sapin ⋅ Jambons ⋅ Lard ⋅ Drogues réunies ⋅ Argenterie ⋅ Bougie ⋅ Gaudron ⋅ Cuivre...
</p>
---

## Orthographic clustering

<p class="smaller">
Articles réunis ⋅ Indigo ⋅ Mercerie ⋅ Eau de vie ⋅ Librairie ⋅ Vinaigre ⋅ Cacao ⋅ Suif ⋅ Beurre ⋅ Alun ⋅ Liqueurs ⋅ Sel ⋅ Fromage ⋅ Rocou ⋅ Confitures ⋅ Acier ⋅ Fer ; en barres ⋅ Thé ⋅ **Huile d'olive** ⋅ Porcelaine ⋅ Poivre ⋅ Farine ⋅ Miel ⋅ Chandelle ⋅ **Huile ; d'olive** ⋅ Fayance ⋅ Savon ⋅ Amidon ⋅ Ris ⋅ Verdet ⋅ Bierre ⋅ Cochenille ⋅ Légumes ⋅ Bijouterie ⋅ Garance ⋅ Horlogerie ⋅ Chocolat ⋅ Meubles ⋅ Quinquina ⋅ Amandes ⋅ Crin ⋅ Papier ; blanc ⋅ Planches ; de sapin ⋅ Jambons ⋅ Lard ⋅ Drogues réunies ⋅ Argenterie ⋅ Bougie ⋅ Gaudron ⋅ Cuivre...
</p>
---

## Thematic clustering

<p class="smaller">
Articles réunis ⋅ Indigo ⋅ Mercerie ⋅ **Eau de vie** ⋅ Librairie ⋅ Vinaigre ⋅ Cacao ⋅ Suif ⋅ Beurre ⋅ Alun ⋅ **Liqueurs** ⋅ Sel ⋅ Fromage ⋅ Rocou ⋅ Confitures ⋅ Acier ⋅ Fer ; en barres ⋅ Thé ⋅ Huile d'olive ⋅ Porcelaine ⋅ Poivre ⋅ Farine ⋅ Miel ⋅ Chandelle ⋅ Huile ; d'olive ⋅ Fayance ⋅ Savon ⋅ Amidon ⋅ Ris ⋅ Verdet ⋅ **Bierre** ⋅ Cochenille ⋅ Légumes ⋅ Bijouterie ⋅ Garance ⋅ Horlogerie ⋅ Chocolat ⋅ Meubles ⋅ Quinquina ⋅ Amandes ⋅ Crin ⋅ Papier ; blanc ⋅ Planches ; de sapin ⋅ Jambons ⋅ Lard ⋅ Drogues réunies ⋅ Argenterie ⋅ Bougie ⋅ Gaudron ⋅ Cuivre...
</p>
---

## Classification tree

hierarchic: progressive aggregation 
concurrent: alternative ways to aggregate
  
```python
source  
	orthographic normalization # same word different spelling  
		simplication  # different word same meaning
			# thematic classifications
			Medicinal products  
			Hamburg classification  
			Canada  
			Eden treaty  
			Grains  
			Coton  
			SITC  
				SITC FR  
				SITC EN
```         
---
<blockQuote>
Our research instruments provides  
exploratory data analysis  
to economic historians.
</blockQuote>
---

## Démo time
[http://toflit18.medialab.sciences-po.fr](http://toflit18.medialab.sciences-po.fr)

With more content related findings
at Digital Humanities 2019, Rotterdam, NL  
  
*I hope, paper under review.*
---


<blockQuote>
We used a graph database, **[neo4j](https://neo4j.com/)**  
to modelize our data  
as a trade network  
where trade flows are edges between trade partners.
</blockQuote>

---

#### why ? 
- trade flows actually forms a network
- to dynamicaly aggregate flows by any classification
- to be able to change classifications without having to reindex
- because we used it with pleasure [see FOSDEM 2016](https://archive.fosdem.org/2016/schedule/event/graph_processing_mysql_to_graph/)

---
## network as a data model

![neo4j data model](./assets/neo4j-schema.png)
---
<center>
![CARTESIAN PRODUCT](./assets/cartesianProducts.png)
</center>
---

```
MATCH  (pc)-[:HAS]->(pg)-[:AGGREGATES*1..]->(pi)  
WHERE id(pc) = 12 AND id(pg) = 657832  
WITH collect(pi.name) AS products  
	MATCH (cc)-[:HAS]->(cg)-[:AGGREGATES*1..]->(ci)  
	WHERE id(cc) = 16 AND id(cg) = 658498  
	WITH products, collect(ci.name) AS countries  
		MATCH (f:Flow)  
		WHERE  
			f.sourceType = "Local"  
			AND f.country IN countries   
			AND f.product IN products  
		RETURN  count(f) AS count, sum(toFloat(f.value)) AS value, f.year AS year,  collect(distinct(f.direction)) as nb_direction, f.sourceType
		ORDER BY f.year;
```
---

screenshot git commit

---
<blockquote>
- to be able to change classifications without having to reindex
</blockquote>

---
This horrible solution implies to first index in the flow nodes the values of the product's node.  
Thanks god only at source level  
It's a bad workaround leveraging lucene indeces hidden inside Neo4J instead of using graph traversals.
Traversal of what ?
Of our flow node.
Our top degree node in our data model graph.
---
<blockQuote>
Our classification system introduces the need for hyperedges.
</blockQuote>
This is the keyword which helped us find [the good path](https://neo4j.com/docs/stable/cypher-cookbook-hyperedges.html).
---

```
MATCH 
	(d:Direction)<-[:FROM|:TO]-(f:Flow), (f:Flow)-[:OF]->(:Product)<-[:AGGREGATES*1..]-(pci:ClassifiedItem)<-[:HAS]-(pc:Classification), 
	(f:Flow)-[:FROM|:TO]->(c:Country), 
	(c:Country)<-[:AGGREGATES*1..]-(cci:ClassifiedItem)<-[:HAS]-(cc:Classification),
	(f:Flow)-[:TRANSCRIBED_FROM]->(s:Source)
WHERE 
	id(d) = 23124 AND (id(pc) = 12 AND (id(pci) IN [657832])) AND (id(cc) = 16 AND (id(cci) IN [658498])) AND s.type = "Local"
RETURN 
	count(f) AS count, sum(toFloat(f.value)) AS value, f.year AS year,  collect(distinct(f.direction)) as nb_direction
ORDER BY f.year;
```
---

> Exploratory data analysis  
on top of the neo4J database  
using JavaScript technologies

---

- *[Decypher](https://github.com/Yomguithereal/decypher)*
- Express *[dolman](https://github.com/Yomguithereal/dolman)*
- *[graphology](https://github.com/graphology/)*
- React
- *[Baobab](https://github.com/Yomguithereal/baobab)*
- *[SigmaJS](https://github.com/sigmajs)*

[@yomguithereal](https://twitter.com/yomguithereal) and [@jacomyal](https://twitter.com/jacomyal) on the team.

---

> Home brewed  
Open Source  
Data Science

http://github.com/medialab/toflit18

And soon all the data on github in a datapackage format.

---

> graph model is not only a convenient way to store and query our data
---
> but also a powerful visual object  
---
> to explore trade geographical structures 
---
<!-- .slide: data-background-image="./assets/locations.png"-->
> [Locations](http://toflit18.medialab.sciences-po.fr/#/exploration/network)
---

> Seen recently on Twitter

<p lang="en" dir="ltr">Shifted Maps - Revealing spatio-temporal topologies in movement data. Check out our <a href="https://twitter.com/visapnet?ref_src=twsrc%5Etfw">@visapnet</a> paper on this hybrid visualization technique integrating maps and network diagrams. By <a href="https://twitter.com/HeikeOtten_?ref_src=twsrc%5Etfw">@HeikeOtten_</a> <a href="https://twitter.com/len_hil?ref_src=twsrc%5Etfw">@len_hil</a> <a href="https://twitter.com/tillnm?ref_src=twsrc%5Etfw">@tillnm</a> <a href="https://twitter.com/borism?ref_src=twsrc%5Etfw">@borism</a> and <a href="https://twitter.com/nrchtct?ref_src=twsrc%5Etfw">@nrchtct</a> 
 </p>&mdash; Till Nagel (@tillnm) <a href="https://twitter.com/tillnm/status/1089994498229366784?ref_src=twsrc%5Etfw">28 janvier 2019</a>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

---
> and trade products' specialization patterns.
---
<!-- .slide: data-background-image="./assets/semicolons_in_source.png"-->
---
> ; represents 
handwritten {  
used in archive sources  
to spare time and ink  
by using general to specific  
aggregation


---

> But manual transcriptions  
and maybe 18th century  
reporting practices  
were not applied equally

---
> ; have been replaced  
by glue-words when aggregated 
products name in sources  
by the **Ortographic normalization**
classification

---
> Thus we compute a  
[Product's terms](https://github.com/medialab/toflit18/blob/master/lib/tokenizer.js)  
[Co-occurences network]()
---
> we might use Stochastic Block modeling  
as a clustering algorithm  
analysing bidirectional generic-specific terms' relationships 
---
> A great way to  
discover bottom-up  
thematic ontology
---
<blockQuote>

</blockQuote>

<blockQuote>
We will finally show how graph model was not only a convenient way to store and query our data but also a poweful visual object to explore trade geographical structures and trade products' specialization patterns.
</blockQuote>
