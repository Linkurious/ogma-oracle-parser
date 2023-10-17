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
    });
  return app;
};
