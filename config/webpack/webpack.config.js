const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const packageFile = require('../../package.json');

const BASE_DIR = path.resolve(__dirname, '../..');
const APP_PATH = path.resolve(BASE_DIR, 'app');

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
            test: [/\.jsx?$/, /\.tsx?$/],
            exclude: /node_modules/,
            use: [{
              loader: 'babel-loader',
            }],
          },
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.svg$/],
            exclude: /node_modules/,
            loader: 'file-loader',
            options: {
              name: 'img/[name].[hash:8].[ext]',
            },
          },
          {
            test: /\.woff(2)?$/,
            use: [
              {
                loader: 'file-loader',
                options: {
                  name: 'font/[hash].[ext]',
                },
              },
            ],
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': APP_PATH,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, '../../statics/index.html'),
      inject: true,
    }),
    new CopyWebpackPlugin([{
      from: path.join(__dirname, '../../statics/images/*'),
      to: 'img/',
      flatten: true,
    },
    {
      from: path.join(__dirname, '../../statics/favicon/*'),
      flatten: true,
    },
    ]),
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin({ port: 3000 }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageFile.version),
    }),
    new MomentLocalesPlugin(),
    // new BundleAnalyzerPlugin({
    //   defaultSizes: 'gzip',
    //   excludeAssets: '.*\.hot-update\.js',
    // }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  mode: 'development',
  devtool: 'inline-source-map',
  entry: path.resolve(__dirname, '../../app/root.module.js'),
  output: {
    path: path.resolve(__dirname, '../../dist'),
    chunkFilename: '[name].[chunkhash].chunk.js',
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  devServer: {
    contentBase: path.join(__dirname, '../../dist'),
    compress: true,
    port: 3000,
    host: process.env.HOSTNAME || '0.0.0.0',
    hot: true,
    allowedHosts: ['.phage.bcgsc.ca'],
    publicPath: '/',
    historyApiFallback: true,
  },
};
