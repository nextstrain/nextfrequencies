/**
 * This file is largely copy & paste from the auspice server.
 * We shoud consider refactoring the auspice server slightly
 * such that we import helper functions here.
 */

/* eslint no-console: off */
const path = require("path");
const argparse = require('argparse');
const express = require("express");
const webpack = require("webpack");
const fs = require("fs");
const chalk = require('chalk');
const queryString = require("query-string");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const generateWebpackConfig = require("./webpack.config.js").default;
const version = require("./package.json").version;

const app = express();
app.set('port', process.env.PORT || 4000);
app.set('host', process.env.HOST || "localhost");

const baseDir = path.resolve(__dirname);
console.log(`Serving index / favicon etc from  "${baseDir}"`);
app.get("/favicon.png", (req, res) => {res.sendFile(path.join(baseDir, "favicon.png"));});

/* webpack set up */
const webpackConfig = generateWebpackConfig({devMode: true});
const compiler = webpack(webpackConfig);

/* variables available to babel (which is called by webpack) */
process.env.BABEL_INCLUDE_TIMING_FUNCTIONS = false;
process.env.BABEL_ENV = "development";

app.use((webpackDevMiddleware)(
  compiler,
  {logLevel: 'warn', publicPath: webpackConfig.output.publicPath}
));
app.use((webpackHotMiddleware)(
  compiler,
  {log: console.log, path: '/__webpack_hmr', heartbeat: 10 * 1000}
));

/* this must be the last "get" handler, else the "*" swallows all other requests */
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

const server = app.listen(app.get('port'), app.get('host'), () => {
  console.log("\n\n---------------------------------------------------");
  const host = app.get('host');
  const {port} = server.address();
  console.log(chalk.blueBright("Access the client at: ") + chalk.blueBright.underline.bold(`http://${host}:${port}`));
  console.log(`Serving nextfrequences version ${version}`);
  console.log("---------------------------------------------------\n\n");
});

