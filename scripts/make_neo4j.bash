#!/bin/bash
#
# TOFLIT18 Make Neo4j Script
# ===========================
#
# Helper that will erase the current neo4j database and
# re-create it with the latest version of the data.
#

# Variables
NEO4J_PATH=/opt/neo4j-community-2.2.3

# Stopping the neo4j service
service neo4j-service stop &&

# Erasing the current database
rm -rf $NEO4J_PATH/data/graph.db &&

# Creating the new database
rm -rf graph.db &&
$NEO4J_PATH/bin/neo4j-import --into graph.db --nodes ./nodes.csv --relationships ./edges.csv &&

# Replacing the database
mv graph.db $NEO4J_PATH/data/ &&
chown -R neo4j:neo4j $NEO4J_PATH/data/graph.db &&

# Restarting the databse
service neo4j-service start
