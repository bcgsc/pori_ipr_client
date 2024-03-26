const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const packageFile = require('../../package.json');

const BASE_DIR = path.resolve(__dirname, '../..');
const APP_PATH = path.resolve(BASE_DIR, 'app');

module.exports = (env) => ({
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
              {
                loader: 'sass-loader',
                options: {
                  sassOptions: { quietDeps: true },
                },
              },
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
            type: 'asset/resource',
            generator: {
              filename: 'img/[name].[hash:8].[ext]',
            },
          },
          {
            test: /\.woff(2)?$/,
            type: 'asset/resource',
            generator: {
              filename: 'font/[hash].[ext]',
            },
          },
          {
            test: /\.m?js/,
            resolve: {
              fullySpecified: false,
            },
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
          context: path.join(APP_PATH, 'statics/images'),
        },
        {
          from: path.join(APP_PATH, 'statics/favicon/*'),
          to: 'img/',
          context: path.join(APP_PATH, 'statics/favicon'),
        },
        {
          from: path.join(APP_PATH, 'ipr-env-config.js'),
          to: 'ipr-env-config.js',
        },
        {
          from: path.join(APP_PATH, 'index.css'),
          to: 'index.css',
        },
      ],
    }),
    new webpack.DefinePlugin({
      VERSION: JSON.stringify(packageFile.version),
    }),
    new CleanWebpackPlugin(),
    new BundleAnalyzerPlugin({
      analyzerMode: env && env.ANALYZE ? 'server' : 'disabled',
      defaultSizes: 'gzip',
      excludeAssets: '.*\.hot-update\.js',
    }),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      minSize: 1000 * 500,
    },
  },
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: path.resolve(APP_PATH, 'index.tsx'),
  output: {
    path: path.resolve(__dirname, '../../dist'),
    chunkFilename: '[name].[chunkhash].chunk.js',
    filename: '[name].bundle.js',
    publicPath: '', // makes scripts relative so base tag can work
  },
  devServer: {
    static: {
      directory: path.join(__dirname, '../../dist'),
      publicPath: '/',
    },
    port: 3000,
    host: 'localhost' || '0.0.0.0',
    hot: true,
    allowedHosts: ['.phage.bcgsc.ca'],
    historyApiFallback: true,
  },
});
