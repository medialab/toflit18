#!/bin/bash
#
# TOFLIT18 Make Neo4j Script
# ===========================
#
# Helper that will erase the current neo4j database and
# re-create it with the latest version of the data.
#
# Note: this is outadated!
#

# Variables
TOFLIT18_NEO4J_PATH=/home/pgi/dev/toflit18/neo4j-community-3.1.7

npm run import -- -- --path ../toflit18_data/

# Stopping the neo4j service
$TOFLIT18_NEO4J_PATH/bin/neo4j stop

# Erasing the current database
rm -rf $TOFLIT18_NEO4J_PATH/data/graph.db &&

# Creating the new database
rm -rf graph.db &&
$TOFLIT18_NEO4J_PATH/bin/neo4j-import --into graph.db --nodes ./.output/nodes.csv --relationships ./.output/edges.csv &&

# Replacing the database
sudo mv graph.db $TOFLIT18_NEO4J_PATH/data/graph.db &&
sudo chown -R neo4j:adm $TOFLIT18_NEO4J_PATH/data/databases/graph.db &&

# Restarting the databse
$TOFLIT18_NEO4J_PATH/bin/neo4j start

# Building indices
npm run indices
