# `@linkurious/ogma-oracle-parser`

![@linkurious/ogma-oracle-parser Logo](https://raw.githubusercontent.com/Linkurious/ogma-oracle-parser/develop/logo.svg)

Seamless communication between [Ogma](https://doc.linkurious.com/ogma/latest/) and [Oracle Database 23ai SQL Property Graphs](https://docs.oracle.com/en/database/oracle/property-graph/24.3/spgdg/sql-property-graph.html).

If you don't have an Ogma licence, [contact us](https://doc.linkurious.com/ogma/latest/contact.html).

# Features

- **Parse Oracle Graph Responses**: Seamlessly convert Oracle Database 23ai Property Graph query results into Ogma's RawGraph format
- **Type-Safe Development**: Generate TypeScript type definitions for your graph schema using the built-in CLI tool
- **Flexible ID Mapping**: Customize how Oracle graph IDs map to Ogma node/edge IDs
- **Full Schema Support**: Automatically handles vertices, edges, and their properties

# Getting started

Please check our [getting started](https://linkurious.github.io/ogma-oracle-parser/getting-started.html) section on the documentation website.

## CLI Tool

This package includes a powerful CLI tool to generate TypeScript types for your Oracle Property Graphs:

```sh
npx ogma-oracle-types build
```

The CLI tool will:
- Connect to your Oracle Database 23ai instance
- Introspect your property graph schema
- Generate TypeScript type definitions for type-safe development

For more information, see the [CLI Tool documentation](https://linkurious.github.io/ogma-oracle-parser/cli.html).

# How to contribute?

This is an open source project maintained by Linkurious, if you want to contribute, you can submit a PR and we'll exmine it.

# Licence

Apache 2.0
