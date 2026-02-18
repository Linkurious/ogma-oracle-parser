# Example

We provide a complete example on how to setup your Oracle AI Database as a graph database, connect to it, retrieve elements and display them in Ogma. And the best is that you can make it work in minutes.
Let's get started:

```sh
git clone https://github.com/Linkurious/ogma-oracle-parser.git
tree ogma-oracle-parser
```

## Setup the Database

### Before you set up the database instance

The `database` subfolder contains a curated [OpenFlights](https://openflights.org/) dataset about airports and flights connecting airports. You need to `unzip` the dataset first.

```sh
cd ogma-oracle-parser/example/database
sh ./deflate-db.sh
ls -l dataset
```

### Create the database container using startup scripts

Now, you can use `Podman` to:

- pull the *Oracle AI Database Free 26ai **full** Container Image* from the [Oracle Container Registry](https://container-registry.oracle.com/)
- setup the DB user login/password
- load a sample dataset
- create a property graph on top of the sample dataset

Make sure you are in the right directory.

```sh
cd ~/ogma-oracle-parser/example/database
```

Clean up existing containers if necessary.

```sh
podman rmi --force -a
podman images
```

Now pull the latest *Oracle AI Database 26ai Free Container Image*.  
Make sure you have enough space left in the home directory of your host machine. The image size is ~10GB.

Create a named volume:

```sh
podman volume create oradata
```

```sh
podman run --privileged -d --name aifree \
 -p 1521:1521 \
 --env-file .env \
 -e ORACLE_PDB=freepdb1 \
 -v oradata:/opt/oracle/oradata:rw \
 -v ./startup:/opt/oracle/scripts/startup \
 -v ./dataset:/home/oracle/dataset:rw \
 -v ./scripts:/home/oracle/scripts:rw \
 container-registry.oracle.com/database/free:latest
```

Note: It takes about 3-4 minutes to have the container up and running. Make sure to replace the `ORACLE_PWD` and `GRAPH_PWD` passwords at a later stage.

You can check the container using:

```sh
podman ps
podman logs aifree
```

You now have a container running that exposes the standard Oracle AI Database port `1521` on which you can execute SQL requests.

Open a shell in the container:

```sh
podman exec -it aifree bash
# If bash isn’t present:
podman exec -it aifree sh
```

To test the connection to the pluggable database from inside the container, do the following:

```sh
sqlplus system/Welcome_1234#@freepdb1
```

```sql
select 1;
```

To test the connection to the pluggable database from the host, do the following:

```sh
podman exec -it aifree sqlplus system/Welcome_1234#@freepdb1
```

```sql
select 1;
```

Logout if everything looks fine.

```sql
quit
```

```sh
# Exit the container
exit
```

As `GRAPH_USER` you can check that:

1. the sample data is properly loaded and
2. the SQL Property Graph was created.

```sh
podman exec -it aifree sqlplus graphuser/Welcome_1234#@freepdb1
```

```sql
-- Find the tables you created
select table_name from user_tables order by 1;

-- All tables should have some thousands of records
select count(*) from openflights_airports;
select count(*) from openflights_cities;
select count(*) from openflights_routes;

-- Query the SQL Property Graph and return some properties
select
  *
from
  graph_table (
    openflights_graph
    match (a is airport)-[e]->(b is city)
    columns (
      a.name as airport,
      a.iata as iata,
      b.city as city
  )
)
fetch first 10 rows only;

-- A SQL Property Graph query returning the vertices and edges, looks like the following:
select
  *
from
  graph_table (
    openflights_graph
    match (a is airport)-[e]->(b is city)
    columns (
      vertex_id(a) as v1,
      edge_id(e) as e,
      vertex_id(b) as v2
  )
)
fetch first 10 rows only;
```

Note: The vertex and edge IDs are required to visualize the graph.

Logout if everything looks fine.

```sql
quit
```

Congratulations! You have completed the first step.

## Build the client app

As frontend we deploy an express application.  
Open a new SSH connection to your compute instance.

Make sure you are in the right directory.

```sh
cd ~/ogma-oracle-parser/example/client
```

You need to provide your Ogma API key as `<YOUR_API_KEY>` and the Ogma version number as `<VERSION>` to be able to install Ogma via `npm install`. You can do this either directly in `package.json`, or by running the following command:

```sh
npm install --save https://get.linkurio.us/api/get/npm/ogma/<VERSION>/?secret=<YOUR_API_KEY>
```

Then:

```sh
npm install
npm run build
```

That's it! You have completed the second step too.

Now we need to start the server in order to access the client app.

## Start the Server

Make sure you are in the right directory.

```sh
cd ~/ogma-oracle-parser/example/server
```

The rest is the same as for the client; you  need to install Ogma by providing your `<YOUR_API_KEY>` and specifying `<VERSION>` .

```sh
npm install --save https://get.linkurio.us/api/get/npm/ogma/<VERSION>/?secret=<YOUR_API_KEY>
```

Then:

```sh
npm install
npm run start
```

You now have an the client app that retrieves airports and flight routes by querying the SQL Property Graph in your database:

- `[GET] /nodes/:type` Returns 300 nodes of a certain type. Type must match with the labels passed in your `CREATE PROPERTY GRAPH` call.\
  Examples: `/nodes/airport`, `/nodes/city`.
- `[GET] /edges/:types/:pageStart/:maxResults` Returns all edges of a certain type.\
  Examples: `/edges/located_in/0/100`, `/edges/route/100/100`.
- `[GET] /node/:id` Returns the node corresponding to `id`. ID must be of the form: `LABEL-ID`.\
  Examples: `/node/airport:130`, `/node/city:1000`.
- `[GET] /edge/:id` Returns the edge corresponding to `id`.\
  Examples: `/edge/located_in:1000`, `/edge/route:101`.
- `[GET /expand/:id` Returns all the neighbors of the node referred by `id`.\
  Examples: `/expand/airport:8`, `/expand/city:2`.

## Use the client app

You can now navigate to `http://localhost:1337` and see the graph displayed. Or to your remote server IP address if you are running it on a remote server.

- You can click on a node to see its properties.
- You can double-click on a node to expand it with one hop.
- You can click on an edge to see its properties.

<video controls>
  <source src="/video.webm" type="video/webm">
  Your browser does not support the video tag.
</video>
