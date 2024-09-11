import express from "express";
import createApp from "./app";
const app = createApp();
const port = process.env.NODE_PORT;
app.use(
  "/",
  express.static("/home/leo/Documents/dev/oracle/example/client/dist")
);

app.listen(port, function () {
  console.log("Express server listening on port " + port);
});
