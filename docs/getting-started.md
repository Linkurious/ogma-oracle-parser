---
outline: deep
---

You have an Oracle SQL database and want to display it as a graph ? Great ! Let's see how to achieve that with [Ogma](https://doc.linkurious.com/ogma/latest/), a powerful and blazing fast graph visualization library.

## Create your Graph Database

You can have a look at our [example](./example), which allows you to visualize a sample property graph in minutes with Docker compose.

Oracle provides great tutorials/resources on how to create your graph database:

- [Tutorial](https://oracle-base.com/articles/23c/sql-property-graphs-and-sql-pgq-23c)
- [Quick start guide](https://docs.oracle.com/en/database/oracle/property-graph/23.4/spgdg/sql-property-graph.html#GUID-70485837-3FFC-4B1E-AD3E-B9B61AC525A1)

## Add some functions to Oracle Database 23c

Once you have your database is set, you will need to add [ORA_SQLGRAPH_TO_JSON](https://raw.githubusercontent.com/oracle/apex/23.2/plugins/region/graph-visualization/optional-23c-only/gvt_sqlgraph_to_json.sql) and [CUST_SQLGRAPH_JSON](https://docs.oracle.com/en//database/oracle/property-graph/23.3/spgdg/visualizing-sql-graph-queries-using-apex-graph-visualization-plug.html#GUID-A48C808E-52BD-4E6D-8AB9-4AF88811990D) functions to your Oracle Database 23c. This will allow you to select vertices/edges in your database in JSON format.

```sh
sqlplus -s USER/PASSWORD@localhost:1521/SESSION @/path/to/script/sqlgraph-to-json.sql
```

```sql
CREATE OR REPLACE FUNCTION CUST_SQLGRAPH_JSON (
  QUERY VARCHAR2
) RETURN CLOB
  AUTHID CURRENT_USER IS
  INCUR    SYS_REFCURSOR;
  L_CUR    NUMBER;
  RETVALUE CLOB;
BEGIN
  OPEN INCUR FOR QUERY;
  L_CUR := DBMS_SQL.TO_CURSOR_NUMBER(INCUR);
  RETVALUE := ORA_SQLGRAPH_TO_JSON(L_CUR);
  DBMS_SQL.CLOSE_CURSOR(L_CUR);
  RETURN RETVALUE;
END;
```

## Retrieve your nodes/edges from the Databse in NodeJS

First, install the ogma, the oracle connector and ogma-oracle-parser:

```sh
npm i oracledb @linkurious/ogma @linkurious/ogma-oracle-parser
```

Create your connection:

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

Now, we can use the `CUST_SQLGRAPH_JSON` to retrieve vertives/edges data from the ids we got from the previous request:

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

Where `vlabel` and `elabel` are the labels you have passed to SQL in your `CREATE PROPERTY GRAPH` call. `-id` is the id of your element in the table.
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

## Customize your nodes/edges ids

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

## Node and Edge data types

You can type the data of your nodes and edges by passing [ND](/api/classes/OgmaOracleParser.html#type-parameters) and [ED](/api/classes/OgmaOracleParser.html#type-parameters) value in the `OgmaOracleParser` constructor:

```ts
type NodeDataType = { name: string; id: number };
type EdgeDataType = { score: number };
const { parse, parseLob, getRawGraph } = new OgmaOracleParser<
  NodeDataType,
  EdgeDataType
>();
```
