const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.pug$/,
            include: path.join(__dirname, 'app'),
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
            test: /\.s?css$/,
            use: [
              MiniCssExtractPlugin.loader,
              'css-loader',
              'sass-loader',
            ],
          },
          {
            test: /\.js$/,
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
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'app/index.pug'),
      inject: true,
    }),
    new CopyWebpackPlugin([{
      from: path.join(__dirname, 'statics/images/*.png'),
      to: 'img/',
      flatten: true,
    }]),
    new webpack.ProvidePlugin({
      _: 'lodash',
    }),
    new webpack.HotModuleReplacementPlugin(),
    // new BundleAnalyzerPlugin(),
  ],
  mode: 'development',
  devtool: 'inline-source-map',
  entry: path.resolve(__dirname, 'app/root.module.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app.bundle.js',
    publicPath: '/',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 3000,
    hot: true,
    publicPath: '/',
    historyApiFallback: true,
  },
};
