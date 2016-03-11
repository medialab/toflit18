# TOFLIT 18

Repository holding the source code of the TOFLIT18's datascape.

architecture : 
  
  - neo4J database v >2
  - API coded in node using [dolman](https://github.com/Yomguithereal/dolman) 
  - a web client coded in [react](https://github.com/facebook/react) and [baobab](https://github.com/Yomguithereal/baobab)
  - deployment scripts sweeten by [kotatsu](https://github.com/Yomguithereal/kotatsu)  

# install procedure

## node v5
You will need node.js
ideally use a node v5, a v0.12 should work.

## install dependencies

```bash
npm install
```

## edit configs

**server-side config**
```bash
cp config.example.json config.json
vi config.json
```

**client-side config**
```bash
cd client
cp config.example.json config.json
vi config.json
```

## building

**API**
```bash
npm run build
```

**client**
```bash
cd client
npm run build
```

**neo4J database**

You need to have access to the toflit18_data repository which is private for now.  
It consists in a collection of CSV files.  
Then you have to run the import script indicating the data folder.

```bash
git@github.com:medialab/toflit18_data.git
npm run import -- -- --path ../toflit18_data/
```

This step creates a .output folder :
```bash
ls .output/
edges.csv  nodes.csv  sessions
```

Now you need to ask neo4j to import those data.
```bash
service neo4j stop
neo4j-import --into /store/neo4j-data/toflit18-prod/ --nodes .output/nodes.csv  --relationships .output/edges.csv
chown -R neo4j:neo4j /store/neo4j-data/toflit18-prod
service neo4j start
```

## serve

### dev environnement

**API**
```bash
npm run dev
```

**client**
```bash
cd client
npm run dev
```

### prod environnement

**API**
using node directly
```bash
node build/toflit18.js 
```
using pm2
```bash
pm2 start --name toflit18_api build/toflit18.js 
```

**clent**
set a reverse proxy to the API port and serve client folder with your favorite webserver 

an example for ngnins
```nginx
server {
	listen       80;
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

## test 

test by opening server.domain.tld
