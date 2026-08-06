import createApp from "./app";
createApp().then((app) => {
  const port = process.env.NODE_PORT;
  app.listen(port, function () {
    console.log("Express server listening on port " + port);
  });
});
