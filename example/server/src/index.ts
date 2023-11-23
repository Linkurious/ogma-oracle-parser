import createApp from './app';
const app = createApp();
const port = process.env.NODE_PORT;

app.listen(port, function () {
  console.log('Express server listening on port ' + port);
});
