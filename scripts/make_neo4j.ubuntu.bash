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
TOFLIT18_NEO4J_PATH=/home/pgi/dev/toflit18/neo4j

npm run import -- -- --path ../toflit18_data/

# Stopping the neo4j service
bash $TOFLIT18_NEO4J_PATH/bin/neo4j stop &&
echo 'neo4j stopped'
# Erasing the current database
rm -rf $TOFLIT18_NEO4J_PATH/data/databases/graph.db &&

# Creating the new database
rm -rf graph.db &&
bash $TOFLIT18_NEO4J_PATH/bin/neo4j-import --into graph.db --nodes ./.output/nodes.csv --relationships ./.output/edges.csv &&

# Replacing the database
mv graph.db $TOFLIT18_NEO4J_PATH/data/databases/ &&
#sudo chown -R neo4j:neo4j $TOFLIT18_NEO4J_PATH/data/databases/graph.db &&

# Restarting the databse
bash $TOFLIT18_NEO4J_PATH/bin/neo4j start &&
echo 'neo4j started' &&
sleep 3 &&
# Building indices
npm run indices &&

# quantities
npm run quantities  -- -- --path ../toflit18_data/