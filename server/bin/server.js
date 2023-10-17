const dotenv = require('dotenv').config();
const app = require('../app')(dotenv);
const port = process.env.NODE_PORT;

app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});
