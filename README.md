# TOFLIT 18

Repository holding the source code of the TOFLIT18's datascape.

## Architecture

* Neo4j database v >= 3
* API coded for node.js using [express](http://expressjs.com/fr/) wrapped in a [dolman](https://github.com/Yomguithereal/dolman).
* A web client coded in [React](https://github.com/facebook/react) and using [Baobab](https://github.com/Yomguithereal/baobab) as its state manager.
* Scripts are run & built using [kotatsu](https://github.com/Yomguithereal/kotatsu).

## Folder structure

* **.output**: folder created when installing and serving as a convenient place to output/store various files such as CSV exports etc.
* **api**: folder holding the API's sources.
  * **controllers**: dolman controllers.
  * **model**: model files querying the Neo4j database.
  * **queries**: cypher queries used by the model.
  * *app.js*: file exporting the API express app.
  * *connection.js*: file exporting the Neo4j database connection.
  * *middlewares.js*: various express middlewares (authentication, mostly).
* **client**: folder holding the web client's sources.
  * **js**
    * **actions**: files describing the actions the UI can apply on the tree.
    * **cards**: experimental devcards files.
    * **components**: React components describing the UI.
    * **external**: external library files such as `sigma.js`.
    * **lib**: generic code used throughout the UI.
    * *client.js*: the API client.
    * *history.js*: file exporting the routing history.
    * *main.jsx*: endpoint of the app.
    * *monkeys.js*: functions used as monkeys for the Baobab tree.
    * *parrot.js*: parrot of the app (will fecth some amount of data automagically).
    * *state.js*: the Baobab state of the app.
  * **style**: CSS/SASS files of the web client.
* **docs**: miscellaneous markdown files describing some algorithms' processes.
* **lib**: generic code used by both the API and the client.
* **scripts**: scripts meant to be run through `npm run` in a shell.
* **test**: unit tests.

## Installation

### Neo4j

It is recommended that you install Neo4j v3.

Also, you should probably set the following parameter to ensure that long queries won't clog the server:

```
dbms.transaction.timeout=20s
```

### Node

It is recommended that you use at least the fifth version of Node.js, but any version down to `0.12.x` should work anyway.

### Installing dependencies

This will install dependencies for both the server and client side and create the `.output` folder.

```bash
npm install
```

### Editing config

**Server-side**

```bash
cp config.example.json config.json
vi config.json
```

**Client-side**

```bash
cd client
cp config.example.json config.json
vi config.json
```

### Building files for production

**Server-side**

This will output a file in `./build/toflit18.js` that you may run afterwards to start the API.

```bash
npm run build
```

**Client-side**

You'll then need to serve the `client` folder statically.

```bash
cd client
npm run build
```

### Building the Neo4j database

You need to have access to the `toflit18_data` repository which is private for now.

This repository consists in a collection of CSV files.

You therefore have to run the import script taking those source files in order to produce two other CSV files fit for a Neo4j import (`nodes.csv` & `edges.csv`).

```bash
npm run import -- -- --path ../toflit18_data/
```

After this command has run succesfully (it can take some times, ~5 min), you should have the two needed csv files in the `.output` folder:

```bash
ls .output/
edges.csv  nodes.csv
```

Then we need to stop the running Neo4j instance, create the new database by importing our two files, swap the new with the old version and restart the database.

```bash
neo4j-import --into graph.db --nodes .output/nodes.csv  --relationships .output/edges.csv
```

Once this is done, you must create proper indices in the database using the following command:

```
npm run indices
```

### Using Neo4J on a Docker container

You can use Neo4j on Docker by spawning a `neo4j:3.1.3` container with the `graph.db` directory mounted as following:

```bash
docker run \
  --detach \
  --name toflit-neo4j \
  --publish 7474:7474 \
  --publish 7687:7687 \
  --env NEO4J_AUTH=none \
  --volume /local/path/to/graph.db:/data/databases/graph.db \
  neo4j:3.1.3
```

## Serving

### Development

Both the API and the client use some amount of HMR to hot-reload the code so you don't have to restart it each time.

**Server-side**

```bash
npm run dev
```

**Client-side**

```bash
cd client
npm run dev
```

### Production

**Server-side**

```bash
# Using node
node build/toflit18.js
# Using pm2
pm2 start --name toflit18_api build/toflit18.js
```

**Client-side**

Use a reverse proxy for the API and serve the `client` folder statically with your favorite webserver.

The following is an example using `nginx`:

```nginx
server {
  listen 80;
  server_name  "server.domain.tld";

  ### ROOT
  root /store/toflit18/toflit18/client;
  index index.html;

  ### API
  location /api/ {
    proxy_pass http://server.domain.tld:4000/;
  }

  ### LOGS
  access_log /var/log/nginx/toflit18.medialab.access.log main;
  error_log /var/log/nginx/toflit18.medialab.error.log error;
}
```

## Commands

### Miscellaneous

```bash
# Export some data from the Neo4j database into CSV files
npm run export

# Lint the whole source code
npm run lint

# Starting the API without building it
npm run start

# Running the unit tests
npm test
```

### Rewiring

When one user want to modify one classification, it should :

1. first export one classification through npm run export.  
2. Then modify the classification csv by hand.
3. import the new version classification into the database (edit scripts/import.js)
4. generate the rewire csv file
     Using Neo4j ids.
     ```bash
     npm run rewire -- -- --classification 4 --patch 5 --rewire 6
     npm run rewire -- -- --help
     ```
5. edit this file, solve the ambigious cases and then you have a new version of the targeted classification (got to 3)
