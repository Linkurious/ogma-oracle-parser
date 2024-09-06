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
```

### Create the database container using startup scripts

Now, you can use `Podman` to:

- pull the Oracle Database Free 23ai **full** container image from the [Oracle Container Registry](https://container-registry.oracle.com/)
- setup the DB user login/password
- load a sample dataset
- create a property graph on top of the sample dataset

```sh
# Make sure you are in the right directory
cd ~/ogma-oracle-parser/example/database

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
```

```sql
show user

select 1;
```

Logout if everything looks fine.

```sql
quit
```

As `GRAPH_USER` you can check that the property graph was created:

```sh
podman exec -it 23aifree sqlplus graphuser/Welcome_1234#@freepdb1
```

```sql
select * from graph_table (
   openflights_graph
   match (a is airport)-[e]->(b is city)
   columns (a.name as airport, a.iata as iata, b.city as city)
)
fetch first 10 rows only;
```

Logout if everything looks fine.

```sql
quit
```

Congratulations! You have completed the first step.

## Start the Server

```sh
# Make sure you are in the right directory
cd ~/ogma-oracle-parser/example/server
```

You will need to provide your Ogma API key to be able to install Ogma via npm install.
Either by modifying the `package.json`, either by running:

```sh
npm install --save https://get.linkurio.us/api/get/npm/ogma/<VERSION>/?secret=<YOUR_API_KEY>
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

Open a new SSH connection to your compute instance.

```sh
# Make sure you are in the right directory
cd ~/ogma-oracle-parser/example/client
```

Same as for server, you will need to install Ogma by providing your `API_KEY`. Then you can just proceed:

```sh
npm install --save https://get.linkurio.us/api/get/npm/ogma/<VERSION>/?secret=<YOUR_API_KEY>
```

Then:

```sh
npm install
npm run dev
```

Alternately, if you want to expose the client app from remote, then:

```sh
npm install
npm run dev -- --host
```

You now have a frontend running on `http://<host>:5173/`. It displays the graph. You can check the properties of nodes and edges properties by clicking on the node or edge. A double-click on a node expands it with one hop.

Enjoy!
