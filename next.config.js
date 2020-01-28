
const path=require('path')
require('dotenv').config()
require('wave/postinstall')
module.exports = {
  webpack: function (config,{defaultLoaders,isServer,webpack}) {
	config.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
	config.module.rules.push({
      test: /\.ifdef\.js/,
      use: [
        defaultLoaders.babel,
        {
          loader: 'ifdef-loader',
          options: {isServer},
        },
      ],
    })
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    })
	config.module.rules.push({
      test: /\.val\.js/,
      use: [
        defaultLoaders.babel,
        {
          loader: 'val-loader',
          options: {isServer},
        },
      ],
    })
	config.module.rules.push({
      test: /\.encrypted.js$/,
      use: [
        defaultLoaders.babel,
        {
          loader: path.resolve('./lib/vault'),
          options: {isServer},
        },
      ],
    })
	config.module.rules.push({
      test: /\.encrypted.json$/,
      use: [
        'json-loader',
        {
          loader: path.resolve('./lib/vault'),
          options: {isServer},
        },
      ],
    })
	  
    return config
  }
}
