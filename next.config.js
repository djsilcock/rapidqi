/* eslint-env node */
require("dotenv").config();
process.env.ROOT_DIR = __dirname;
const lodash = require("lodash");
const secrets = require("./vault");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true"
});
const withTM = require("next-transpile-modules")(["swr"]);
module.exports = withBundleAnalyzer(
  withTM({
    webpack: function(config, { defaultLoaders, isServer, webpack }) {
      lodash.set(config, ["resolve", "alias", "qiapp"], __dirname);
      if (isServer) {
        config.plugins.push(new webpack.DefinePlugin(secrets));
      }
      config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));
      config.module.rules.push({
        test: /\.ifdef\.js/,
        use: [
          defaultLoaders.babel,
          {
            loader: "ifdef-loader",
            options: { isServer }
          }
        ]
      });
      config.module.rules.push({
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader"
      });
      config.module.rules.push({
        test: /\.val\.js/,
        use: [
          defaultLoaders.babel,
          {
            loader: "val-loader",
            options: { isServer }
          }
        ]
      });
      return config;
    }
  })
);
