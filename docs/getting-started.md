# Getting Started

You have an Oracle AI Database 26ai and want to display SQL Property Graphs? Great! Let's see how to achieve that with [Ogma](https://doc.linkurious.com/ogma/latest/), a powerful and blazing fast graph visualization library.

## Create your Oracle AI Database 26ai Free instance

You can have a look at our [example](./example), which allows you to visualize a sample SQL Property Graph in minutes using Podman.

Oracle provides great resources on how to create and use Property Graphs in your Oracle AI Database:

- [Quick Start guide for working with SQL Property Graphs](https://docs.oracle.com/en/database/oracle/property-graph/26.1/spgdg/sql-property-graph.html)
- [Oracle LiveLabs workshop: "Explore Operational Property Graphs in Oracle AI Database](https://livelabs.oracle.com/ords/r/dbpm/livelabs/view-workshop?wid=3978)
- [More related workshops on Oracle LiveLabs](https://livelabs.oracle.com/ords/r/dbpm/livelabs/livelabs-workshop-cards?p100_product=66)
- [Learn more about the support for Graphs in the Oracle AI Database](https://www.oracle.com/database/integrated-graph-database/)

## Functions in Oracle AI Database 26ai to return graph query results as JSON

OGMA accepts the result set from SQL graph query (returned nodes, edges, and their properties) in JSON format only. The transformation to JSON relies on the [DBMS_GVT PL/SQL package available on GitHub](https://github.com/oracle/apex/blob/24.2/plugins/region/graph-visualization/required-for-26ai/gvt_sqlgraph_to_json.sql).
The package and a PL/SQL helper function, `CUST_SQLGRAPH_JSON`, are created upon the creation of the Oracle Database container. (See the [scripts in this folder](https://github.com/Linkurious/ogma-oracle-parser/tree/develop/example/database/scripts)).

`GVT` is the abbreviation for `Graph Visualization Toolkit`.

Further details are available in:

- [Oracle Developer´s Guide for Property Graph](https://docs.oracle.com/en/database/oracle/property-graph/26.1/spgdg/visualizing-sql-graph-queries-using-apex-graph-visualization-plug.html)
- [Oracle Graph JavaScript API Reference for Property Graph Visualization](https://docs.oracle.com/en/database/oracle/property-graph/26.1/pgjsd/index.html).

## Retrieve your nodes/edges from the database in Node.js

First, install the Ogma, the Oracle AI Database 26ai connector and ogma-oracle-parser:

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

Now, we can use the `CUST_SQLGRAPH_JSON` function to retrieve the nodes and edges along with their properties from the IDs we got from the previous request:

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

`vlabel` and `elabel` are the labels you have passed to SQL in your `CREATE PROPERTY GRAPH` call. `-id` is the ID of your element in the table.
And that's it ! You have retrieved the nodes and edges of a Property Graph in the [Ogma format](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)

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
import { Ogma } from "@linkurious/ogma";
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

## Generate the typescript definition of your nodes and edges

This package provides a powerful CLI tool to generate TypeScript type definitions for your nodes and edges. The CLI connects to your Oracle Database, introspects the property graph schema, and generates type-safe definitions.

For comprehensive documentation about the CLI tool, see the [CLI Tool documentation](./cli.md).

### Quick Start

```sh
npx ogma-oracle-types build
```

The CLI will interactively prompt you for database connection details and generate types for your property graphs.

### Configuration with .env

You can create a `.env` file to provide default values for the connection prompts:

```sh
DB_HOST=localhost
DB_USER=graphuser
DB_PASS=Welcome_1234#
DB_PORT=1521
DB_SERVICE=freepdb1
OUTPUT_FILE=./types.ts
```

### Using Generated Types

Once generated, you can use the types with Ogma for type-safe graph operations:

```ts
import { GraphTypeMap } from "./generated-types";

function fetchSubGraph<T extends keyof GraphTypeMap>(graphType: T) {
  return axios.get<GraphTypeMap[T]["graph"]>(`nodes`).then(({ data }) => {
    return data;
  });
}
```

For more details including troubleshooting, advanced usage, and complete examples, see the [CLI Tool documentation](./cli.md).
