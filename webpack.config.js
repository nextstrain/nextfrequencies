/* eslint no-console: off */
const path = require("path");
const webpack = require("webpack");
const CompressionPlugin = require('compression-webpack-plugin');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

/* Webpack config generator */

const generateConfig = ({extensionPath, devMode=false, customOutputPath, analyzeBundle=false}) => {
  console.log(`Generating webpack config. Extensions? ${!!extensionPath}. devMode: ${devMode}`);

  /* which directories should be parsed by babel and other loaders? */
  const directoriesToTransform = [path.join(__dirname, 'src')];

  /* plugins */
  /* inject strings into the client-accessible process.env */
  const pluginProcessEnvData = new webpack.DefinePlugin({
    "process.env": {
      NODE_ENV: devMode ? JSON.stringify("development") : JSON.stringify("production")    }
  });
  /* gzip everything - https://github.com/webpack-contrib/compression-webpack-plugin */
  const pluginCompress = new CompressionPlugin({
    filename: "[path].gz[query]",
    algorithm: "gzip",
    test: /\.(js|css|html)$/,
    threshold: 4096
  });
  const pluginHtml = new HtmlWebpackPlugin({
    filename: 'index.html',
    template: './src/index.html'
  });
  const cleanWebpackPlugin = new CleanWebpackPlugin({
    cleanStaleWebpackAssets: true
  });
  const plugins = devMode ? [
    new webpack.HotModuleReplacementPlugin(),
    pluginProcessEnvData,
    pluginHtml,
    cleanWebpackPlugin
  ] : [
    pluginProcessEnvData,
    pluginCompress,
    pluginHtml,
    cleanWebpackPlugin
  ];

  const entry = [
    "babel-polyfill",
    "./src/index.js"
  ];
  if (devMode) {
    entry.splice(1, 0, "webpack-hot-middleware/client");
  }
  /* Where do we want the output to be saved?
   * For development we use the (virtual) "devel" directory
   * Else we must choose to save it in the CWD or the source
   */
  const outputPath = devMode ?
    path.resolve(__dirname, "devel") : // development: use the (virtual) "devel" directory
    customOutputPath ?
      path.resolve(customOutputPath, "dist") :
      path.resolve(__dirname, "dist");
  console.log(`Webpack writing output to: ${outputPath}`);


  const config = {
    mode: devMode ? 'development' : 'production',
    context: __dirname,
    // Better to get a proper full source map in dev mode, this one is pretty fast on rebuild
    devtool: !devMode ? undefined : "eval-source-map",
    entry,
    output: {
      path: outputPath,
      filename: `auspice.bundle.js`,
      publicPath: "/dist/"
    },
    node: {
      fs: 'empty'
    },
    plugins,
    optimization: {
      minimize: !devMode
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: [
            /node_modules\/(core-js|regenerator-runtime)/
          ],
          options: {
            cwd: path.resolve(__dirname)
          }
        },
        {
          test: /\.css$/,
          use: ["style-loader", "css-loader"]
        },
        {
          test: /\.(gif|png|jpe?g|svg|woff2?|eot|otf|ttf)$/i,
          use: "file-loader"
        }
      ]
    }
  };

  return config;
};

module.exports = {default: generateConfig};
