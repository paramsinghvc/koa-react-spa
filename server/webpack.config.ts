import webpack from "webpack";
import path from "path";
import { CleanWebpackPlugin } from "clean-webpack-plugin";

const config: webpack.Configuration = {
  entry: path.resolve(__dirname, "./index.ts"),
  mode: process.env.NODE_ENV === "development" ? "development" : "production",
  target: "node",
  devtool: "source-map",
  node: {
    __dirname: false,
    __filename: true
  },
  watchOptions: {
    ignored: ["**/*.json"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              context: __dirname,
              configFile: "tsconfig.json"
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({ "global.GENTLY": false }),
    new CleanWebpackPlugin({
      verbose: true
    })
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "server.bundle.js",
    path: path.resolve(__dirname, "dist")
  }
};

export default config;
