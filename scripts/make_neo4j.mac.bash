#!/bin/bash
#
# TOFLIT18 Make Neo4j Script
# ===========================
#
# Helper that will erase the current neo4j database and
# re-create it with the latest version of the data.
#

# Variables
NEO4J_PATH=~/app/neo4j-community-3.1.3

# Stopping the neo4j service
$NEO4J_PATH/bin/neo4j stop &&

# Erasing the current database
rm -rf $NEO4J_PATH/data/databases/toflit.graph.db &&

# Creating the new database
$NEO4J_PATH/bin/neo4j-admin import --database toflit.graph.db --nodes ./.output/nodes.csv --relationships ./.output/edges.csv &&

# Restarting the database
$NEO4J_PATH/bin/neo4j start &&
sleep 10 &&

# Building indices
npm run indices &&

# Cleaning up
rm import.report
