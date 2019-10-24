const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const packageFile = require('../../package.json');

module.exports = {
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.pug$/,
            include: path.join(__dirname, '../../app'),
            exclude: /node_modules/,
            use: [{
              loader: 'apply-loader',
              options: {
                obj: {},
              },
            },
            {
              loader: 'pug-loader',
            }],
          },
          {
            test: /\.(html)$/,
            use: {
              loader: 'html-loader',
            },
          },
          {
            test: /\.s?css$/i,
            sideEffects: true,
            use: [
              'style-loader',
              'css-loader',
              'sass-loader',
            ],
          },
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            use: [{
              loader: 'babel-loader',
            }],
          },
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            exclude: /node_modules/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'img/[name].[hash:8].[ext]',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../../app/index.pug'),
      inject: true,
    }),
    new CopyWebpackPlugin([{
      from: path.join(__dirname, '../../statics/images/*'),
      to: 'img/',
      flatten: true,
    }]),
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin({ port: 3000 }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageFile.version),
    }),
    // new BundleAnalyzerPlugin({ openAnalyzer: false }),
  ],
  mode: 'development',
  devtool: 'inline-source-map',
  entry: path.resolve(__dirname, '../../app/root.module.js'),
  output: {
    path: path.resolve(__dirname, '../../dist'),
    filename: 'app.bundle.js',
    publicPath: '/',
  },
  devServer: {
    contentBase: path.join(__dirname, '../../dist'),
    compress: true,
    port: 3000,
    host: '0.0.0.0',
    hot: true,
    allowedHosts: [ '.phage.bcgsc.ca' ],
    publicPath: '/',
    historyApiFallback: true,
  },
};
