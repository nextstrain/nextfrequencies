const webpack = require("webpack");
const path = require("path");
const generateWebpackConfig = require("./webpack.config.js").default;

/* webpack set up */
const webpackConfig = generateWebpackConfig({devMode: false});
const compiler = webpack(webpackConfig);

/* variables available to babel (which is called by webpack) */
process.env.BABEL_INCLUDE_TIMING_FUNCTIONS = false;
process.env.BABEL_ENV = "production";
process.env.BABEL_EXTENSION_PATH = undefined;

console.log("Running webpack compiler");
compiler.run((err, stats) => {
  if (err) {
    console.error(err);
    return;
  }
  if (stats.hasErrors()) {
    console.log(stats.toString({colors: true}));
    utils.error("Webpack built with errors. Exiting.");
  } else {
    console.log(stats.toString({colors: true}));
  }
});