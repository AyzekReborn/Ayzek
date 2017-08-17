const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const path = require('path');

let mkConfig=require('./webpack.config.js').mkConfig;


const devServerConfig = {
  hot: true,
  inline: true,
  https: false,
  lazy: false,
  compress:true,
  contentBase: path.join(__dirname, '../../src/'),
  historyApiFallback: {
    disableDotRule: true
  }, // Need historyApiFallback to be able to refresh on dynamic route
    disableHostCheck: true,
  stats: {
    colors: true
  } // Pretty colors in console
};

try {
  const server = new WebpackDevServer(webpack(mkConfig({browser:true,dev:true,publicHost:'http://ide.f6cf.pw:3001'})), devServerConfig);
  server.listen(3001, '0.0.0.0');
} catch (e) {
  console.error(e);
}


