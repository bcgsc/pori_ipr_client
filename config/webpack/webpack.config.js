const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const DashboardPlugin = require('webpack-dashboard/plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const { GenerateSW } = require('workbox-webpack-plugin');
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
            test: /\.svg$/,
            use: ['@svgr/webpack'],
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
                  esModule: false,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.d.ts'],
    alias: {
      '@': APP_PATH,
    },
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(APP_PATH, 'statics/images/*'),
          to: 'img/',
          flatten: true,
        },
        {
          from: path.join(APP_PATH, 'statics/favicon/*'),
          to: 'img/',
          flatten: true,
        },
        {
          from: path.join(APP_PATH, 'ipr-env-config.js'),
          to: 'ipr-env-config.js',
        },
      ],
    }),
    new webpack.HotModuleReplacementPlugin(),
    new DashboardPlugin({ port: 3000 }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageFile.version),
    }),
    new MomentLocalesPlugin(),
    new CleanWebpackPlugin(),
    new GenerateSW({
      skipWaiting: true,
      clientsClaim: true,
      exclude: ['/\.map$/'],
    }),
    new BundleAnalyzerPlugin({
      defaultSizes: 'gzip',
      excludeAssets: '.*\.hot-update\.js',
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      minSize: 1000 * 600,
    },
    moduleIds: 'hashed',
  },
  mode: 'development',
  devtool: 'inline-source-map',
  entry: path.resolve(APP_PATH, 'index.tsx'),
  output: {
    path: path.resolve(__dirname, '../../dist'),
    chunkFilename: '[name].[chunkhash].chunk.js',
    filename: '[name].bundle.js',
    publicPath: '', // makes scripts relative so base tag can work
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
