# Example

We provide a complete example on how to setup your graph database, connect to it, retrieve elements and display them in Ogma. And the best is that you can make it work in minutes.
Let's get started:

```sh
git clone https://github.com/Linkurious/ogma-oracle-parser.git
cd ogma-oracle-parser
```

## Setup the Database

The simplest way is to use the `docker-compose` file we provide, which will:

- pull the Oracle Database 23c docker image
- setup the users login/password
- load a database
- create a property graph

But first you will need to unzip the dataset.

```sh
cd example/compose-stack
./deflate-db.sh
docker compose up
```

And you are done ! You now have a container exposing the port `1521` on which you can execute SQL requests.

## Start the server

```sh
cd example/server
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
- `[GET] /node/:id` Returns the node corresponding to `id`. Id must be of the form: `LABEL-ID`.
- `[GET] /edge/:id` Returns the edge corresponding to `id`
- `[GET /expand/:id` Returns all the neighbors of the node refered by `id`.

## Start the frontend

```sh
cd example/client
```

Same as for server, you will need to install Ogma by providing your `API_KEY`. Then you can just proceed:

```sh
npm install
npm run dev
```

You now have a frontend running on `http://localhost:5174/` which displays the graph, allows you to look into nodes/edges properties by clicking on it, and expand nodes by double clicking on it.

Enjoy!
