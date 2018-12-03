const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const AnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
  module: {
    rules: [
      {
        oneOf: [
          {
            test: /\.pug$/,
            include: path.join(__dirname, 'app'),
            exclude: /node_modules/,
            loaders: [
              'pug-loader',
            ],
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                babelrc: false,
                presets: [['@babel/preset-env', {
                  useBuiltIns: 'usage',
                }]],
              },
            },
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
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'app/index.pug'),
      inject: true,
    }),
    new AnnotatePlugin({
      add: true,
    }),
    new CopyWebpackPlugin([{
      from: path.join(__dirname, 'statics/images/*.png'),
      to: 'img/',
      flatten: true,
    }]),
    // new BundleAnalyzerPlugin(),
  ],
  entry: path.resolve(__dirname, 'app/root.module.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'app-bundle.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'app'),
    compress: true,
    port: 3000,
  },
};
