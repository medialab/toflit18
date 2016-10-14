<h1 id="main">Organizing the reversible chain of transformations<br><em>From trade statistics records to datascapes</em></h1>

<p align="center">
  Paul Girard & Guillaume Plique<br>
  Sciences Po médialab
</p>

<p align="center">
  TODO: titre workshop, Neurbauer, dates
</p>

===

## SciencesPo médialab

* Designing digital methods
* Mixing qualitative & quantitative approaches
* Developing software for social sciences & humanities

TODO: logo

===

## RICardo: the 19th century

<p align="center"><em>year by year</em><br> 
1787 ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ 1938</p>

===

## RICardo: Bilateral trade

Trade flows between ~~countries~~ entities  
**A <⋅⋅> B**

===

<p align="center" style="margin: 0;">
![bilateral trade data model](./assets/bilateraltrade.svg)<!-- .element: style="width:50%; background-color: black; margin-top: 0;"-->
</p>

===

## RICardo: Total trade

Trade flows between entity A and the world  
**A <⋅⋅> W**

===

## Toflit18: the 18th century

<p align="center"><em>year by year</em><br>

1719 ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ ⋅ 1839</p>

===

## TOFLIT18: French trade

Trade flows between France and other countries<br>
**France <⋅⋅> A,B,C**<br>
*as reported by France*

===

## TOFLIT18: products

#### Top 50 TOFLIT18 products

<p class="smaller">
Articles réunis ⋅ Indigo ⋅ Mercerie ⋅ Eau de vie ⋅ Librairie ⋅ Vinaigre ⋅ Cacao ⋅ Suif ⋅ Beurre ⋅ Alun ⋅ Liqueurs ⋅ Sel ⋅ Fromage ⋅ Rocou ⋅ Confitures ⋅ Acier ⋅ Fer ; en barres ⋅ Thé ⋅ Huile d'olive ⋅ Porcelaine ⋅ Poivre ⋅ Farine ⋅ Miel ⋅ Chandelle ⋅ Huile ; d'olive ⋅ Fayance ⋅ Savon ⋅ Amidon ⋅ Ris ⋅ Verdet ⋅ Bierre ⋅ Cochenille ⋅ Légumes ⋅ Bijouterie ⋅ Garance ⋅ Horlogerie ⋅ Chocolat ⋅ Meubles ⋅ Quinquina ⋅ Amandes ⋅ Crin ⋅ Papier ; blanc ⋅ Planches ; de sapin ⋅ Jambons ⋅ Lard ⋅ Drogues réunies ⋅ Argenterie ⋅ Bougie ⋅ Gaudron ⋅ Cuivre...
</p>

===

## From sources to data

archived books > pictures > **?** > researchers

===

## Transcription

TODO: image d'un stagiaire

===

## Data cleaning

Open Refine clustering copie d'écran

===

## Data troubleshooting

Data quality automatic checks
Quantitative analysis to feed qualitative cleaning

===

## TOFLIT18 - The republican calendar

===

## Ricardo doublons

Exemple de rapport.csv

===

## Data versionning

git: a software source code version constrol system 
Applied to data corpus management
Implies textual formats for data files

===

## Textual formats
textual format ease computational treatments
CSV, Json, xml are textual formats
No, xls, xlsx and odt are not textual formats.

===

<!-- .slide: data-background-image="./assets/github_toflit18.png"-->

===

<!-- .slide: data-background-image="./assets/github_data.png"-->

===

<!-- .slide: data-background-image="./assets/internetarchive_statisticalabstract.png"-->
<a href="https://archive.org/stream/statisticalabstr2318grea#page/166/mode/2up" target="_blank" style="background:black; padding:20px">Statistical abstract, P. 166 @ Internet Archive</a>

===

## Data Care

Towards data quality
Mixing qualitative and quantitative approach
\#bullshit alert

===

## From data to database
\#téléologie
database leverage access to data
database choices depends on data usages

===

![RICardo database schema](./assets/ricardo_schema.svg)

===

## network database for a flexible classifications system

schema neo4J Agent Smith

===

## Classifications
Comment faire en sorte que le truc soit utilisable par plusieurs chercheurs 
+ rewire

===

## RICardo database volumetry

- 294,138 flows
- 1,492 RICentities
- 152 years
- 120 currencies
- 7,206 exchange rates to £
- 73 source types (919 volumes)

===

## TOFLIT18 database volumetry

- 419,729 flows
- 47,732 products
- 843 countries
- 51 custom french bureaux
- 120 years
- 807 source volumes

===

## Exploring complexity through a datascape

- Dedicated interactive data visualisations
- Propose different focus on the database
- Handle complexity through dynamic exploration
  
<small>**Leclercq, C. and Girard, P.** (2013). *The Experiments in Art and Technology Datascape*. Collections Électroniques de l’INHA. Actes de Colloques et Livres En Ligne de l’Institut National D’histoire de L’art. INHA http://inha.revues.org/4926 (accessed 27 October 2015). </small>

===

## Building a datascape

Workshop called *«data sprints»* with:

- historians
- economists 
- developers
- designers

Addressing **content**, **implementation** and **design** issues  
 at the same time, in the same place. 

===

## Exploratory Data Analysis

> « The greatest value of a picture is when it
forces us to notice what we never expected to
see. »  
John W. Tukey
  
<small>**Tukey, J. W.** (1977). *Exploratory Data Analysis*. Addison-Wesley Publishing Company.</small>

===

## Check the data (again?)

Remember the currency issue.
Here is how we discovered it.
(slide ricardo)

===

## The pipeline loop

archived books > pictures > excel > csv > database > data viz > csv

===

## Metadata views: scarce data aggregation

metadata ricardo (slide ricardo)
metadata toflit screencapture

===

## Ricardo tour

===

## TOFLIT18 tour

===

### Produce your own understanding of 18/19th century World trade

<a href="http://ricardo.medialab.sciences-po.fr" target="_blank">http://ricardo.medialab.sciences-po.fr</a>

<a href="http://toflit18.medialab.sciences-po.fr" target="_blank">http://toflit18.medialab.sciences-po.fr</a>

===

## Conclusion

Datascape rulez the world !

===

## Open Science

- download the visualizations' datasets in csv
- complete datasets to be released in 2017
- RICardo source code: [github.com/medialab/ricardo](https://github.com/medialab/ricardo)
- TOFLIT18 source code: [github.com/medialab/toflit18](https://github.com/medialab/toflit18)
- this presentation: [http://medialab.github.io/toflit18/chicago](https://medialab.github.io/toflit18/chicago)    

===

## Bibliography & Links (1/2)

<p class="smaller">
Dedinger, Béatrice, and Paul Girard. 2016. <em>‘Exploring Trade Globalization in the Long Run : The RICardo Project’</em>. Historical Methods.
<br>
[http://ricardo.medialab.sciences-po.fr](http://ricardo.medialab.sciences-po.fr).
</p>

<p class="smaller">
Girard, Paul, Béatrice Dedinger, Donato Ricci, Benjamin Ooghe-Tabanou, Mathieu Jacomy, Guillaume Plique, and Grégory Tible. 2016. <em>‘RICardo Project : Exploring XIX Century International Trade’. In . Kraków, Poland.</em>
<br>
[http://ricardo.medialab.sciences-po.fr/Girardetal_RICardo_dh2016_en.pdf](http://ricardo.medialab.sciences-po.fr/Girardetal_RICardo_dh2016_en.pdf).
</p>

===

## Bibliography & Links (2/2)

<p class="smaller">
Latour, Bruno. 1993. <em>‘Le Topofil de Boa-Vista. La Référence Scientifique: Montage Photophilosophique’</em>. Raisons Pratiques 4: 187–216.
</p>

<p class="smaller">
Latour, Bruno, Pablo Jensen, Tommaso Venturini, Sébastian Grauwin, and Dominique Boullier. 2012. <em>‘“The Whole Is Always Smaller than Its Parts” - a Digital Test of Gabriel Tardes’ Monads’</em>. The British Journal of Sociology 63 (4): 590–615. doi:10.1111/j.1468-4446.2012.01428.x.
</p>

<p class="smaller">
Tukey, John Wilder. 1977. <em>Exploratory Data Analysis</em>. Addison-Wesley Publishing Company.
</p>

