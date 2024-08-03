# Getting Started

You have an Oracle Database 23ai and want to display SQL Property Graphs? Great! Let's see how to achieve that with [Ogma](https://doc.linkurious.com/ogma/latest/), a powerful and blazing fast graph visualization library.

## Create your Oracle Database 23ai Free instance

You can have a look at our [example](./example), which allows you to visualize a sample property graph in minutes using Podman.

Oracle provides great tutorials/resources on how to create Property Graphs in your Oracle Database:

- [Tutorial](https://oracle-base.com/articles/23c/sql-property-graphs-and-sql-pgq-23c)
- [Quick Start guide for working with SQL Property Graphs](https://docs.oracle.com/en/database/oracle/property-graph/23.4/spgdg/sql-property-graph.html)

## Add some functions to Oracle Database 23ai

OGMA accepts the result set from SQL graph query (returned nodes, edges, and their properties) in JSON format only. This is supported by the `ORA_SQLGRAPH_TO_JSON` PL/SQL function, which is created using the following code:

```sh
sqlplus -s USER/PASSWORD@localhost:1521/SESSION @/path/to/script/gvt-sqlgraph-to-json.sql
```

It is the same code to [visualize SQL Property Graphs in Oracle Application Express](https://docs.oracle.com/en//database/oracle/property-graph/23.4/spgdg/getting-started-apex-graph-visualization-plug.html#GUID-22E17FA8-7808-47C2-B1ED-54842FA43A2A).

Additionally, in order to provide a SQL graph query cursor to the sample application, you need to create the following helper function:

```sh
sqlplus -s USER/PASSWORD@localhost:1521/SESSION @/path/to/script/cust-sqlgraph-json.sql
```

## Retrieve your nodes/edges from the database in Node.js

First, install the Ogma, the Oracle Database 23ai connector and ogma-oracle-parser:

```sh
npm i oracledb @linkurious/ogma @linkurious/ogma-oracle-parser
```

Create your DB connection:

```ts
const connectString = host + ":" + port + "/" + service;
oracledb.getConnection({
  user,
  password,
  connectString,
});
```

Then run your first command:

```ts
app.get("/nodes/:type", (req, res) => {
  const query = `select v
          from graph_table (
            openflights_graph
            match (v1 is ${req.params.type})
            columns (
              VERTEX_ID(v1) as v
            )
          )`;
  return conn.execute(query).then((r) => res.json(r));
});
```

You can see that the result should look like

```ts
{
  metadata: {
    name: 'V',
    dbType: [DbType DB_TYPE_JSON],
    nullable: true,
    dbTypeName: 'JSON',
    fetchType: [DbType DB_TYPE_JSON]
  },
  rows: [
    {
      GRAPH_OWNER: 'GRAPHUSER',
      GRAPH_NAME: 'OPENFLIGHTS_GRAPH',
      ELEM_TABLE: 'CITIES',
      KEY_VALUE: { ID: 1 }
    }
  ]
}
```

Now, we can use the `CUST_SQLGRAPH_JSON` to retrieve nodes/edges data from the IDs we got from the previous request:

```ts
import { parseLob } from "@linkurious/ogma-oracle-parser";
...

app.get("/nodes/:type", (req, res) => {
  const query = `select v
          from graph_table (
            openflights_graph
            match (v1 is ${req.params.type})
            columns (
              VERTEX_ID(v1) as v
            )
          )`;
  const pageStart = 0;
  const pageLength = 3200;
  return conn
    .execute<Lob[]>(
      `SELECT CUST_SQLGRAPH_JSON('${query}', ${pageStart}, ${pageLength}) AS COLUMN_ALIAS FROM DUAL`
    )
    .then((result) => {
      const { numResults, nodes, edges } = parseLob(result.rows[0][0]);
      return { nodes, edges };
    });
});
```

Now, what you get is this:

```ts
{
  nodes: [
    {
      id: 'vlabel-id',
      data: {
        ...
      }
    },
    ...
  ],
  edges: [
    {
      id: 'elabel-id',
      source: 'vlabel-id',
      target:'vlabel-id'
      data: {
        ...
      }
    },
    ...
  ]
}
```

Where `vlabel` and `elabel` are the labels you have passed to SQL in your `CREATE PROPERTY GRAPH` call. `-id` is the ID of your element in the table.
And that's it ! You now have retrieved nodes and edges in the [Ogma format](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)

The plugin also provides a [getRawGraph](/api/classes/OgmaOracleParser.html#getrawgraph) function that does all the work for you. You can use it like this:

```ts
import { getRawGraph } from "@linkurious/ogma-oracle-parser";
...

app.get("/nodes/:type", (req, res) => {
  const query = `select v
          from graph_table (
            openflights_graph
            match (v1 is ${req.params.type})
            columns (
              VERTEX_ID(v1) as v
            )
          )`;
  return getRawGraph(conn, query).then(({ nodes, edges }) => {
    return { nodes, edges };
  });
});
```

## Display your nodes in Ogma

Let' s assume you already have a client side project. Just install Ogma:

```sh
npm install @linkurious/ogma
```

Create your Ogma instance:

```ts
import Ogma from "@linkurious/ogma";
import axios from "axios";
const ogma = new Ogma({
  container: "id-of-your-container",
});

axios.get("http://url-to-node-server:port/nodes/VLABEL").then(({ data }) => {
  ogma.setGraph(data);
  return ogma.layouts.force();
});
```

And you are done !

## Customize your node/edge IDs

By default, the plugin transforms the `label:{"ID": id}` into `label-id`.
You can customize this behaviour by creating an instance of the [OgmaOracleParser](/api/classes/OgmaOracleParser.html#constructors) class"

```ts
import { OgmaOracleParser } from "@linkurious/ogma-oracle-parser";

const { parse, parseLob, getRawGraph } = new OgmaOracleParser({
  SQLIDtoId: (label, id) => `${label}-${id}`,
  SQLIDfromId: (id) => {
    const [label, id] = id.split("-");
    return `${label}:{"ID": ${id}}`;
  },
});
```

## Node and edge data types

You can type the data of your nodes and edges by passing [ND](/api/classes/OgmaOracleParser.html#type-parameters) and [ED](/api/classes/OgmaOracleParser.html#type-parameters) value in the `OgmaOracleParser` constructor:

```ts
type NodeDataType = { name: string; id: number };
type EdgeDataType = { score: number };
const { parse, parseLob, getRawGraph } = new OgmaOracleParser<
  NodeDataType,
  EdgeDataType
>();
```
