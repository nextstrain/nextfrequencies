/**
 * This file is largely copy & paste from the auspice server.
 * We shoud consider refactoring the auspice server slightly
 * such that we import helper functions here.
 */

/* eslint no-console: off */
const path = require("path");
const express = require("express");
const chalk = require('chalk');
const expressStaticGzip = require("express-static-gzip");
const version = require("./package.json").version;

/* Basic server set up */
const app = express();
app.set('port', process.env.PORT || 4000);
app.set('host', process.env.HOST || "localhost");

const baseDir = path.resolve(__dirname);
console.log(`Serving index / favicon etc from  "${baseDir}"`);
app.get("/favicon.png", (req, res) => {res.sendFile(path.join(baseDir, "favicon.png"));});

app.use("/dist", expressStaticGzip(path.join(baseDir, "dist"), {maxAge: '30d'}));

app.get("*", (req, res) => {
  res.sendFile(path.join(baseDir, "dist/index.html"), {headers: {"Cache-Control": "no-cache, no-store, must-revalidate"}});
});

const server = app.listen(app.get('port'), app.get('host'), () => {
  console.log("\n\n---------------------------------------------------");
  const host = app.get('host');
  const {port} = server.address();
  console.log(chalk.blueBright("Access the client at: ") + chalk.blueBright.underline.bold(`http://${host}:${port}`));
  console.log(`Serving nextfrequences version ${version}`);
  console.log("---------------------------------------------------\n\n");
});

