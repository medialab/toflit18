#!/bin/bash
#
# TOFLIT18 Make Neo4j Script
# ===========================
#
# Helper that will erase the current neo4j database and
# re-create it with the latest version of the data.
#

# Variables
NEO4J_PATH=~/app/neo4j-community-2.3.9

# Stopping the neo4j service
$NEO4J_PATH/bin/neo4j stop &&

# Erasing the current database
rm -rf $NEO4J_PATH/data/toflit.graph.db &&

# Creating the new database
rm -rf graph.db &&
$NEO4J_PATH/bin/neo4j-import --into graph.db --nodes ./.output/nodes.csv --relationships ./.output/edges.csv &&

# Replacing the database
mv graph.db $NEO4J_PATH/data/toflit.graph.db &&

# Restarting the databse
$NEO4J_PATH/bin/neo4j start &&

# Building indices
npm run indices
