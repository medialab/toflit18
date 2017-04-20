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
NEO4J_PATH=/opt/neo4j-community-2.2.3

# Stopping the neo4j service
service neo4j-service stop &&

# Erasing the current database
rm -rf $NEO4J_PATH/data/toflit.graph.db &&

# Creating the new database
rm -rf graph.db &&
$NEO4J_PATH/bin/neo4j-import --into graph.db --nodes ./.output/nodes.csv --relationships ./.output/edges.csv &&

# Replacing the database
mv graph.db $NEO4J_PATH/data/toflit.graph.db &&
chown -R neo4j:neo4j $NEO4J_PATH/data/toflit.graph.db &&

# Restarting the database
service neo4j-service start

# Building indices
npm run indices
