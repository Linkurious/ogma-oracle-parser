# Example

We provide a complete example on how to setup your Oracle Database as a graph database, connect to it, retrieve elements and display them in Ogma. And the best is that you can make it work in minutes.
Let's get started:

```sh
git clone https://github.com/Linkurious/ogma-oracle-parser.git
# git clone https://github.com/karinpatenge/ogma-oracle-parser.git
tree ogma-oracle-parser
```

## Setup the Database

### Before you set up the database instance

The `database` subfolder contains a curated [OpenFlights](https://openflights.org/) dataset about airports and flights connecting airports. You need to `unzip` the dataset first.

```sh
cd ogma-oracle-parser/example/database
sh ./deflate-db.sh
ll dataset
cd ~
```

### Create the database container using startup scripts

Now, you can use `Podman` to:

- pull the Oracle Database Free 23ai **full** container image from the [Oracle Container Registry](https://container-registry.oracle.com/)
- setup the DB user login/password
- load a sample dataset
- create a property graph on top of the sample dataset

```sh
# Clean up existing containers
podman rmi --force -a

# Pull a new Oracle Database 23ai Free container image
podman run --privileged -d --name 23aifree \
 -p 1521:1521 \
 -e ORACLE_PWD=Welcome_1234# \
 -e ORACLE_PDB=freepdb1 \
 -e GRAPH_USER=graphuser \
 -e GRAPH_PWD=Welcome_1234# \
 -v oracle_data:/opt/oracle/oradata \
 -v ./startup:/opt/oracle/scripts/startup \
 -v ./dataset:/home/oracle/dataset:rw \
 -v ./scripts:/home/oracle/scripts:rw \
 container-registry.oracle.com/database/free:latest
```

Note: It takes about 3-4 minutes to have the container up and running. Make sure to replace the `ORACLE_PWD` and `GRAPH_PWD` passwords at a later stage.

You can check the container using:

```sh
podman ps
podman logs 23aifree
```

You now have a container running that exposes the standard Oracle Database port `1521` on which you can execute SQL requests. To test the connection to the database, do the following:

```sh
podman exec -it 23aifree sqlplus pdbadmin/Welcome_1234#@freepdb1
show user
select 1;
quit
```

or as `GRAPH_USER`

```sh
podman exec -it 23aifree sqlplus graphuser/Welcome_1234#@freepdb1
show user
select 1;
quit
```

Congratulations! You have completed the first step.

## Start the Server

```sh
cd ~/ogma-oracle-parser/example/server
```

You will need to provide your Ogma API key to be able to install Ogma via npm install.
Either by modifying the `package.json`, either by running:

```sh
npm install --save https://get.linkurio.us/api/get/npm/ogma/<VERSION>/?secret=<YOUR_API_KEY>

npm install --save https://get.linkurio.us/api/get/npm/ogma/5.1.4/?secret=lk-dls-12c45a9746d6edf15797b0808071395dc9c89e335
```

Then:

```sh
npm install
npm run start
```

You now have an express app that answers to a few routes by querying your SQL database:

- `[GET] /nodes/:type` Returns all nodes of a certain type. Type must match with the labels passed in your `CREATE PROPERTY GRAPH` call.
- `[GET] /edges/:types` Returns all edges of a certain type.
- `[GET] /node/:id` Returns the node corresponding to `id`. ID must be of the form: `LABEL-ID`.
- `[GET] /edge/:id` Returns the edge corresponding to `id`
- `[GET /expand/:id` Returns all the neighbors of the node referred by `id`.

## Start the Frontend

```sh
cd example/client
```

Same as for server, you will need to install Ogma by providing your `API_KEY`. Then you can just proceed:

```sh
npm install
npm run dev
```

You now have a frontend running on `http://localhost:5174/`. It displays the graph. You can check the properties of nodes and edges properties by clicking on the node or edge. A double-click on a node expands it with one hop.

Enjoy!
