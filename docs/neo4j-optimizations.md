# Cypher queries optimizations

## Général

### Passage à Cypher > 3.x

En analysant les requêtes de l'application, je me suis rendu compte que celles-ci utilisent
une version de Cypher ancienne.

Voici les changements depuis la version 3.0 de Neo4j :

* Les paramètres des requêtes ne s'écrivent plus entre accolade (ie. `{param}`) mais préfixé avec un dollar (ie. `$param`)
* L'instruction `START` est dépréciée et doit être remplacé par une clause `WHERE`

### Requêtes paramétrés

Toutes les requêtes dans le package `queries` sont bien paramétrés, mais celles qui sont générées dans le package `models`
ne le sont pas (ou en parti).

Il est important d'utiliser les requêtes paramétrés pour éviter le re-calcul du plan d’exécution de la requête lorsqu'on change la valeur d'une clause `WHERE`. Or le calcul d'un plan d’exécution est une opération lourde.

Neo4j sauvegarde les plans d’exécution des requêtes en cache pour les réutiliser.

De plus cela permet aussi de simplifier le code vu que les requêtes ne changent pas, mais uniquement les paramètres.
ex: https://github.com/medialab/toflit18/blob/master/api/model/flowsPerYear.js#L189-L205

### Éviter les expressions régulières

Une partie des requêtes utilise des clauses `WHERE` avec des regex (et même des clause `ORDER BY` ...).
Il faut savoir que les regex sont consommatrices de resources de calcul et ne permettent pas l'usage des indexes.

Il est donc préférable d'éviter leur utilisation lorsque cela est possible.
Depuis Neo4j 3.1, les instruction `CONTAINS`, `STARTS WITH` et `END WITH` permettent dans la plupart des cas de s'abstraire
de l'utilisation des regex et de surcroit ces instructions peuvent s'appuyer sur des indexes.

Toutefois, ces instructions sont *case sensitive*.
Ainsi est-ce que la recherche case in-sensitive est nécessaire dans l'application ?

### Les requêtes sur les `Flow` et les indexes

La plupart des requêtes sur les `Flux` utilise des filtres sur les `Classification` (de produit, de pays) dont l'ID du noeud
est connu.

Ainsi le planneur de Neo4j commence par trouver ces noeuds, puis fait une traversé dans le graph pour trouver les noeuds
`Flows` et enfin applique les filtres sur ces derniers.

Or le plus filtrant est de d'abord filtrer les noeuds `Flux` sur l'un de ses attributs indéxés (ex l'attribut `year`),
puis de regarder s'ils sont liés aux noeuds de classification.


## Indexes et containts

### Users

Mettre en place une contrainte d'unicité sur le nom de l'utilisateur permettra :

* de s'assurer que la base est cohérente
* d'ajouté un indexe sur `name` qui accéléra les requêtes

```
CREATE CONSTRAINT ON (u:User) ASSERT u.name IS UNIQUE;
```

### Source

Il faut créer un indexe sur la propriété `type` du noeud `Source` :

```
CREATE INDEX ON :Source(type);
```

Ceci aidera les query du time series.
