
// Stream a CLOB and builds up a String piece-by-piece
function readClob(clob) {
  return new Promise((resolve, reject) => {
    let myclob = ""; // or myblob = Buffer.alloc(0) for BLOBs
    // node-oracledb's lob.pieceSize is the number of bytes retrieved
    // for each readable 'data' event.  The default is lob.chunkSize.
    // The recommendation is for it to be a multiple of chunkSize.
    // clob.pieceSize = 100; // fetch smaller chunks to demonstrate repeated 'data' events
    clob.setEncoding('utf8');  // set the encoding so we get a 'string' not a 'buffer'
    clob.on('error', (err) => {
      // console.log("clob.on 'error' event");
      reject(err);
    });
    clob.on('data', (chunk) => {
      // Build up the string.  For larger LOBs you might want to print or use
      // each chunk separately
      // console.log("clob.on 'data' event.  Got %d bytes of data", chunk.length);
      myclob += chunk; // or use Buffer.concat() for BLOBS
    });
    clob.on('end', () => {
      // console.log("clob.on 'end' event");
      clob.destroy();
    });
    clob.on('close', () => {
      resolve(myclob);
    });

  });
}



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
      app.post('/clob-query', (req, res) => {
        return conn.execute(req.body.sql)
          .then(result => readClob(result.rows[0][0]))
          .then((result) => {
            return res.json(result);
          })
          .catch((e) => {
            console.log(e);
            res
              .status(500)
              .send(e);
          });
      });
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
