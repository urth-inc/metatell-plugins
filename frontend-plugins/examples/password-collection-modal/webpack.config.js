const webpack = require("webpack");
const process = require("process");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin =
  require("@module-federation/enhanced").ModuleFederationPlugin;

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const federationConfig = require("./configs/federationConfig");

module.exports = {
  entry: path.resolve(__dirname, "./src/index"),
  output: {
    publicPath: "auto",
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "./dist"),
    },
    port: 3004,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },

  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript",
            ],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.m?js$/,
        type: "javascript/auto",
        resolve: {
          fullySpecified: false,
        },
      },
      {
        test: /\.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: ["@babel/preset-react"],
        },
      },
      // CSS Modules Rule
      {
        test: /\.module\.(scss|css)$/,
        use: [
          { loader: MiniCssExtractPlugin.loader },
          {
            loader: "css-loader",
            options: {
              modules: {
                localIdentName: "[name]__[local]__[hash:base64:5]",
                exportLocalsConvention: "camelCase",
                mode: "local",
              },
            },
          },
          "sass-loader",
        ],
      },
      // Global CSS Rule
      {
        test: /\.(scss|css)$/,
        include: /node_modules/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        type: "asset",
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin(federationConfig),
    new HtmlWebpackPlugin({
      template: "public/index.html",
      title: "plugin",
      filename: "index.html",
      chunks: ["main"],
    }),
    new MiniCssExtractPlugin({
      filename: "assets/stylesheets/[name]-[contenthash].css",
      ignoreOrder: true,
    }),
    new webpack.DefinePlugin({
      "process.env.VERSION_ID": JSON.stringify(process.env.VERSION_ID),
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json", ".css", ".scss"],
  },
};
