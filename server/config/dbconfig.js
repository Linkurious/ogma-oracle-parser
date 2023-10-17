require('dotenv').config();
const env = process.env.NODE_ENV || 'dev';
let host = '';
let user = '';
let password = '';

  if (env === 'dev') {
    host = process.env.DB_HOST_DEV;
    user = process.env.DB_USER_DEV;
    password = process.env.DB_PASS_DEV;
  } else {
    host = process.env.DB_HOST_PROD;
    user = process.env.DB_USER_PROD;
    password = process.env.DB_PASS_PROD;
  }
  const port = process.env.DB_PORT;
  const service = process.env.DB_SERVICE;
  const connectString = host + ':' + port + '/' + service;

module.exports = {
  user: user,
  password: password,
  connectString: connectString,
};
