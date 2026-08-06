# CLI Tool

The `@linkurious/ogma-oracle-parser` package includes a powerful command-line interface (CLI) tool called `ogma-oracle-types` that helps you automatically generate TypeScript type definitions for your Oracle Property Graph schema. This tool connects directly to your Oracle Database 23ai instance, introspects the property graph structure, and generates type-safe definitions that you can use in your Ogma applications.

## Why Use the CLI Tool?

Working with graph databases often involves dealing with dynamic data structures. The CLI tool bridges this gap by:

- **Type Safety**: Automatically generates TypeScript types for your nodes and edges, providing compile-time safety and IntelliSense support
- **Schema Discovery**: Connects to your Oracle Database and introspects the actual property graph schema
- **Consistency**: Ensures your frontend types match your database schema exactly
- **Productivity**: Eliminates manual type definition work and reduces errors
- **Integration**: Generated types work seamlessly with Ogma's RawGraph format

## Installation

The CLI tool is available when you install the package:

```sh
npm install @linkurious/ogma-oracle-parser
```

You can then run it using `npx`:

```sh
npx ogma-oracle-types
```

Or install it globally:

```sh
npm install -g @linkurious/ogma-oracle-parser
ogma-oracle-types
```

## Available Commands

### `help` - Interactive Help Menu

Display an interactive help menu to learn about the CLI tool:

```sh
npx ogma-oracle-types help
```

The help command provides an interactive menu with the following topics:

- **Usage Instructions**: Learn how to use the CLI commands
- **Build Command**: Detailed information about generating types
- **Environment Variables**: How to configure connection defaults

### `build` - Generate TypeScript Types

Generate TypeScript type definitions for your Oracle Property Graph:

```sh
npx ogma-oracle-types build
```

This command will:

1. Prompt you interactively for database connection details
2. Connect to your Oracle Database 23ai instance
3. Introspect the property graph schema
4. Generate TypeScript type definitions
5. Save the types to a file

#### Interactive Prompts

When you run the `build` command, you'll be asked for:

- **User**: The database user (default: `system`)
- **Password**: The user's password (default: `oracle`)
- **Port**: The database port (default: `1521`)
- **Service**: The database service name (default: `orcl`)
- **Host**: The database host (default: `localhost`)
- **Output File**: Where to save the generated types (default: `./types.ts`)

## Configuration with Environment Variables

To streamline the workflow and avoid entering connection details repeatedly, you can create a `.env` file in your project root. The CLI will automatically read these values and use them as defaults in the interactive prompts.

### Example `.env` File

Create a `.env` file with the following structure:

```env
DB_HOST=localhost
DB_USER=graphuser
DB_PASS=Welcome_1234#
DB_PORT=1521
DB_SERVICE=freepdb1
OUTPUT_FILE=./generated-types.ts
```

### Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | Database host address | `localhost` |
| `DB_USER` | Database user | `system` |
| `DB_PASS` | Database password | `oracle` |
| `DB_PORT` | Database port | `1521` |
| `DB_SERVICE` | Database service name | `orcl` |
| `OUTPUT_FILE` | Output file path for generated types | `./types.ts` |

**Security Note**: Always add `.env` to your `.gitignore` file to prevent committing sensitive credentials to version control.

## Generated Type Structure

The CLI tool generates comprehensive TypeScript types based on your property graph schema. Here's what gets generated:

### Node and Edge Data Types

For each vertex and edge label in your graph, a data type is created:

```ts
export type AirportData = {
  TIMEZONE: number;
  TZDBTIME: string;
  DST: string;
  NAME: string;
};

export type RouteData = {
  DISTANCE: number;
  AIRLINE: string;
};
```

### Raw Graph Interfaces

For each property graph in your database, an interface extending Ogma's `RawGraph` is created:

```ts
export interface OpenflightsGraph extends RawGraph {
  nodes: RawNode<AirportData | CityData>[];
  edges: RawEdge<RouteData | LocatedInData>[];
}
```

### Type Maps

The CLI generates type maps that associate labels with their data types:

```ts
export type OpenflightsMap = {
  graph: OpenflightsGraph;
  nodeLabels: {
    airport: AirportData;
    city: CityData;
  };
  edgeLabels: {
    route: RouteData;
    locatedIn: LocatedInData;
  };
};
```

### Global Graph Type Map

A comprehensive map of all graphs in your database:

```ts
export type GraphTypeMap = {
  Openflights: OpenflightsMap;
  Bank: BankMap;
};
```

## Using Generated Types

Once you've generated the types, you can use them throughout your application for type-safe graph operations.

### Type-Safe Data Fetching

```ts
import { GraphTypeMap } from "./generated-types";
import axios from "axios";

function fetchSubGraph<T extends keyof GraphTypeMap>(graphType: T) {
  return axios
    .get<GraphTypeMap[T]["graph"]>(`/nodes`)
    .then(({ data }) => {
      return data;
    });
}

// TypeScript knows the exact structure of the returned graph
const airportGraph = await fetchSubGraph("Openflights");
```

### Type-Safe Node Access

```ts
import { GraphTypeMap } from "./generated-types";
import Ogma from "@linkurious/ogma";

const ogma = new Ogma({ container: "graph-container" });

fetchSubGraph("Openflights").then((data) => {
  ogma.setGraph(data);

  // Type-safe access to node properties
  ogma.getNodes().forEach((node) => {
    const nodeData = node.getData() as GraphTypeMap["Openflights"]["nodeLabels"]["airport"];
    console.log(nodeData.NAME); // TypeScript knows this property exists
  });
});
```

### Type-Safe Property Access

```ts
import type { AirportData, RouteData } from "./generated-types";

function renderAirport(airport: AirportData) {
  return `
    <div>
      <h3>${airport.NAME}</h3>
      <p>Timezone: ${airport.TIMEZONE}</p>
      <p>DST: ${airport.DST}</p>
    </div>
  `;
}

function calculateRouteDistance(route: RouteData): number {
  return route.DISTANCE;
}
```

## Workflow Best Practices

### 1. Initial Setup

When starting a new project:

```sh
# Create .env file with your database credentials
echo "DB_HOST=localhost
DB_USER=graphuser
DB_PASS=your_password
DB_PORT=1521
DB_SERVICE=freepdb1
OUTPUT_FILE=./src/types/oracle-graph-types.ts" > .env

# Add .env to .gitignore
echo ".env" >> .gitignore

# Generate types
npx ogma-oracle-types build
```

### 2. Schema Changes

Whenever your property graph schema changes (new node/edge types, property changes):

```sh
# Regenerate types to stay in sync
npx ogma-oracle-types build
```

Consider adding this to your development workflow or CI/CD pipeline.

### 3. Version Control

Commit the generated types file to version control so your team has consistent type definitions:

```sh
git add src/types/oracle-graph-types.ts
git commit -m "Update Oracle graph types"
```

### 4. Integration with Build Process

Add type generation to your `package.json` scripts:

```json
{
  "scripts": {
    "generate-types": "ogma-oracle-types build",
    "prebuild": "npm run generate-types",
    "build": "tsc && vite build"
  }
}
```

## Troubleshooting

### Connection Issues

If you can't connect to the database:

1. **Check Credentials**: Verify your username and password
2. **Verify Service**: Ensure the service name is correct (often `freepdb1` for Oracle 23ai Free)
3. **Network Access**: Confirm the host and port are accessible
4. **Firewall**: Check if port 1521 is open

### Permission Errors

If you get permission errors:

- Ensure your database user has access to the property graphs
- The user needs `SELECT` privileges on the graph tables
- For the `graphuser` example, ensure it was created with proper grants

### Output File Issues

If the CLI can't write the output file:

- Check the directory exists (create it if needed)
- Verify write permissions for the output path
- Use an absolute path if relative paths cause issues

### Type Generation Errors

If generated types seem incorrect:

- Verify your property graph is properly defined in the database
- Check that vertex and edge tables have proper schemas
- Re-run the generation after schema changes

## Advanced Usage

### Custom Type Transformations

The generated types use a naming convention that transforms Oracle labels to TypeScript types:

- `AIRPORT` → `AirportData`
- `ROUTE` → `RouteData`
- `located_in` → `LocatedInData`

The transformation:
1. Converts to camelCase
2. Capitalizes the first letter
3. Appends "Data" suffix

### Multiple Graphs

If your database has multiple property graphs, the CLI will generate types for all of them. You can then choose which graph types to use in your application:

```ts
import type { GraphTypeMap } from "./generated-types";

// Work with different graphs
type AirportGraphType = GraphTypeMap["Openflights"]["graph"];
type BankGraphType = GraphTypeMap["Bank"]["graph"];
```

### Type Augmentation

You can extend the generated types with additional computed properties:

```ts
import type { AirportData } from "./generated-types";

interface ExtendedAirportData extends AirportData {
  displayName: string;
  isInternational: boolean;
}

function enrichAirport(airport: AirportData): ExtendedAirportData {
  return {
    ...airport,
    displayName: `${airport.NAME} (${airport.TZDBTIME})`,
    isInternational: airport.TIMEZONE !== 0
  };
}
```

## Example Complete Workflow

Here's a complete example of using the CLI in a project:

```sh
# 1. Install dependencies
npm install @linkurious/ogma @linkurious/ogma-oracle-parser oracledb

# 2. Configure environment
cat > .env << EOF
DB_HOST=localhost
DB_USER=graphuser
DB_PASS=Welcome_1234#
DB_PORT=1521
DB_SERVICE=freepdb1
OUTPUT_FILE=./src/types/graph-types.ts
EOF

# 3. Generate types
npx ogma-oracle-types build

# 4. Use in your application
```

```ts
// src/app.ts
import Ogma from "@linkurious/ogma";
import { getRawGraph } from "@linkurious/ogma-oracle-parser";
import oracledb from "oracledb";
import type { GraphTypeMap } from "./types/graph-types";

// Connect to database
const conn = await oracledb.getConnection({
  user: "graphuser",
  password: "Welcome_1234#",
  connectString: "localhost:1521/freepdb1"
});

// Create Ogma instance
const ogma = new Ogma({ container: "graph-container" });

// Fetch and display graph with type safety
const query = `
  SELECT v, e
  FROM graph_table (
    openflights_graph
    MATCH (v1 is airport)-[e is route]->(v2 is airport)
    COLUMNS (VERTEX_ID(v1) as v, EDGE_ID(e) as e)
  )
  FETCH FIRST 100 ROWS ONLY
`;

const graph = await getRawGraph<GraphTypeMap["Openflights"]["graph"]>(conn, query);
await ogma.setGraph(graph);
await ogma.layouts.force();

// Type-safe node access
ogma.getNodes().forEach(node => {
  const data = node.getData();
  console.log(`Airport: ${data.NAME}`);
});
```

## CLI Source Code

The CLI tool is built using:

- **Commander**: For command-line argument parsing
- **Inquirer**: For interactive prompts
- **Chalk**: For colored terminal output
- **oracledb**: For Oracle Database connectivity
- **dotenv**: For environment variable management

The source code is available in the [`cli`](../cli/) directory:

- [cli.ts](../cli/cli.ts) - Main CLI application
- [generate-types.ts](../cli/generate-types.ts) - Type generation logic

## See Also

- [Getting Started Guide](./getting-started.md) - Learn how to use the parser
- [API Documentation](./api/classes/OgmaOracleParser.md) - Full API reference
- [Example Application](./example.md) - Complete working example
