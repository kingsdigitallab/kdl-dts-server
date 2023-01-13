#! /usr/bin/env node
const express = require("express");
const app = express();

const routes = require("../api_routes/routes");

app.all("*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

routes(app);

module.exports = app;
