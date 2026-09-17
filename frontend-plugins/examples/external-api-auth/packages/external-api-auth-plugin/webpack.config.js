import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

import { config as loadDotenv } from "dotenv";
import moduleFederation from "@module-federation/enhanced";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import webpack from "webpack";

const require = createRequire(import.meta.url);
const { dependencies } = require("./package.json");
const { ModuleFederationPlugin } = moduleFederation;
const dirname = path.dirname(fileURLToPath(import.meta.url));
const localExternalApiBaseUrl = "http://localhost:3000";

loadDotenv({
  path: path.join(dirname, ".env"),
  quiet: true
});

const metatellClientId = process.env.METATELL_CLIENT_ID?.trim();
const externalApiBaseUrl =
  process.env.METATELL_EXTERNAL_API_BASE_URL?.trim() || localExternalApiBaseUrl;

if (!metatellClientId) {
  throw new Error(
    "METATELL_CLIENT_ID is required. Copy .env.example to .env in the external-api-auth-plugin package or set METATELL_CLIENT_ID before building."
  );
}

export default {
  devServer: {
    static: {
      directory: path.join(dirname, "./dist")
    },
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    port: 3004
  },
  entry: path.resolve(dirname, "./src/index.ts"),
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.(ts|tsx)$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
              "@babel/preset-typescript"
            ]
          }
        }
      },
      {
        resolve: {
          fullySpecified: false
        },
        test: /\.m?js$/,
        type: "javascript/auto"
      },
      {
        test: /\.module\.(scss|css)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              modules: {
                exportLocalsConvention: "camelCaseOnly",
                localIdentName: "[name]__[local]__[hash:base64:5]",
                mode: "local",
                namedExport: false
              }
            }
          },
          "sass-loader"
        ]
      },
      {
        include: /node_modules/,
        test: /\.(scss|css)$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|svg|eot|ttf|woff|woff2)$/i,
        type: "asset"
      }
    ]
  },
  output: {
    clean: true,
    filename: "assets/javascripts/[name]-[contenthash].js",
    path: path.resolve(dirname, "./dist"),
    publicPath: "auto"
  },
  plugins: [
    new ModuleFederationPlugin({
      dts: false,
      exposes: {
        "./CustomOverlay": "./src/components/CustomOverlay/index.ts"
      },
      filename: "remoteEntry.js",
      manifest: true,
      name: process.env.VERSION_ID,
      shared: {
        react: {
          requiredVersion: dependencies.react,
          singleton: true
        },
        "react-dom": {
          requiredVersion: dependencies["react-dom"],
          singleton: true
        }
      }
    }),
    new HtmlWebpackPlugin({
      chunks: ["main"],
      filename: "index.html",
      template: "index.html",
      title: "External API Auth"
    }),
    new MiniCssExtractPlugin({
      filename: "assets/stylesheets/[name]-[contenthash].css",
      ignoreOrder: true
    }),
    new webpack.DefinePlugin({
      "process.env.METATELL_CLIENT_ID": JSON.stringify(metatellClientId),
      "process.env.METATELL_EXTERNAL_API_BASE_URL": JSON.stringify(externalApiBaseUrl),
      "process.env.VERSION_ID": JSON.stringify(process.env.VERSION_ID)
    })
  ],
  resolve: {
    extensionAlias: {
      ".js": [".ts", ".tsx", ".js"],
      ".jsx": [".tsx", ".jsx"]
    },
    extensions: [".tsx", ".ts", ".jsx", ".js", ".json", ".css", ".scss"]
  }
};
