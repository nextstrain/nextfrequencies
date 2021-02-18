/* What variables does this config depend on?
 * process.env.BABEL_EXTENSION_PATH -- a resolved path
 * api.env -- this is process.env.BABEL_ENV if it exists (it should)
 */

module.exports = function babelConfig(api) {
  console.log(`Generating Babel Config`);
  const presets = [
    "@babel/env",
    "@babel/preset-react"
  ];
  const plugins = [
    ["@babel/plugin-proposal-decorators", { legacy: true }],
    ["@babel/plugin-proposal-class-properties", { "loose" : true }],
    "babel-plugin-syntax-dynamic-import",
    "@babel/plugin-transform-runtime",
    "react-hot-loader/babel"
  ];
  const ignore = [
    /\/node_modules\//,
  ]
  api.cache(true);
  return {
    presets,
    plugins,
    ignore,
    sourceType: "unambiguous"
  };
};