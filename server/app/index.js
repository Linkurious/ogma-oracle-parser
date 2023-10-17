module.exports = function (config) {
  const express = require('express');
  const bodyParser = require('body-parser');
  const oracledb = require('oracledb');
  const cors = require('cors');

  const dbConfig = require('../config/dbconfig.js');
  const app = express();
  oracledb.getConnection({
    user: dbConfig.user,
    password: dbConfig.password,
    connectString: dbConfig.connectString,
  })
    .then((conn) => {
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(cors());


      app.get('/', (req, res) => {
        const sql = `select from_city, from_airport, to_city, to_airport, stops, distance_in_km
        from graph_table (
          openflights_graph
          match (c1 is city)<-[l1 is located_in]-(a1)-[r is route]->(a2)-[l2 is located_in]->(c2 is city)
          columns (c1.city as from_city, c2.city as to_city, a1.name as from_airport, a2.name as to_airport, r.distance_in_km as distance_in_km, r.stops as stops)
        )
        `;
        return conn.execute(sql)
          .then((result) => {
            console.log(result.rows[0]);
            res
              .json(result);
          })
          .catch((e) => {
            console.log(e);
            res
              .status(500)
              .send(e);
          });
      });

      app.get('/id', (req, res) => {
        const sql = `select source
        from graph_table (
          openflights_graph
          match (c1 is city)<-[l1 is located_in]-(a1)-[r is route]->(a2)-[l2 is located_in]->(c2 is city)
          columns (
            EDGE_ID(c1) as source
            )
        )`
        return conn.execute(sql)
        .then((result) => {
          console.log(result.rows[0])
          res
            .json(result);
        })
        .catch((e) => {
          console.log(e);
          res
            .status(500)
            .send(e);
        });
      })

      app.post('/query', (req, res) => {
        return conn.execute(req.body.sql)
          .then((result) => {
            return res
              .json(result);
          })
          .catch((e) => {
            console.log(e);
            res
              .status(500)
              .send(e);
          });
      });

      // app.get('/all', (req, res) => {
      //   const sql = `select * from graph_table`;
      //   return conn.execute(sql)
      //     .then((result) => {
      //       res
      //         .json(result);
      //     })
      //     .catch((e) => {
      //       console.log(e);
      //       res
      //       .status(500)
      //       .send(e)
      //     });
      // });


    });
  return app;
};
