var webpack = require("webpack");
var path = require('path');
var version = require("./package.json").version;
var banner = "/**\n" + " * vue-websocket v" + version + "\n" + " * https://github.com/deko96/vue-websocket\n" + " * Released under the MIT License.\n" + " */\n";

module.exports = [{
	devtool: "source-map",
	entry: "./src/index",
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: "vue-websocket.js",
		library: "VueWebSocket",
		libraryTarget: "umd"
	},

	plugins: [
		new webpack.DefinePlugin({
			"process.env": {
				NODE_ENV: JSON.stringify("production")
			}
		}),
		new webpack.BannerPlugin(banner)
	],

	module: {
		loaders: [{
				"test": /\.js?$/,
				"exclude": /node_modules/,
				"loader": "babel"
			},
			{
				"test": /\.vue$/,
				"loader": "vue"
			}
		]
	}
}];
