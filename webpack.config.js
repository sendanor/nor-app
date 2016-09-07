"use strict";

var webpack = require('webpack');

var path = require('path');

module.exports = {
	context: path.resolve(__dirname, './src/nor'),
	entry: {
		app: path.resolve(__dirname, './src/nor/index.js'),
		vendor: [
			'nor-is',
			'nor-debug',
			'nor-function',
			'nor-array',
			'jquery',
			'jquery-ui/sortable.js',
			'tv4',
			'tv4.async-jquery',
			'datatables.net',
			'bootstrap',
			'angular',
			'angular-sanitize',
			'angular-route',
			'angular-ui-router',
			'angular-ui-sortable',
			'angular-ui-ace',
			'angular-datatables',
			'angular-dragdrop',
			'ng-prettyjson-js',
			'ng-prettyjson-css',
			'ng-prettyjson/src/ng-prettyjson-tmpl.js'
		]
	},
	output: {
		path: path.resolve(__dirname, './build'),
		filename: 'app.bundle.js',
	},
	plugins: [
		new webpack.ProvidePlugin({
		//	tv4: "tv4",
		//	'window.ace': "ace/ace",
			$: "jquery",
			jQuery: "jquery"
		//	angular: "angular"
		}),
		new webpack.optimize.CommonsChunkPlugin(/* chunkName= */"vendor", /* filename= */"vendor.bundle.js")
		/*,
		new webpack.optimize.UglifyJsPlugin({
			mangle: {
				except: ['$super', '$', 'exports', 'require']
			}
		})*/
	],
	resolve: {
		alias: {
			'tv4.async-jquery': 'tv4/tv4.async-jquery.js',
			'ng-prettyjson-js': 'ng-prettyjson/src/ng-prettyjson.js',
			'ng-prettyjson-css': 'ng-prettyjson/src/ng-prettyjson.css',
			'jquery-ui': 'jquery-ui/ui/widgets',
			'jquery-ui-css': 'jquery-ui/../../themes/base'
		}
	},
	module: {
		loaders: [
			{
				test: /\.css$/,
				loader: 'style!css!sass'
			},
			{
				test: /template\.html$/,
				loader: 'ngtemplate!html'
			},
			{
				test: /index\.html$/,
				loader: 'html'
			},
			{
				test: /tv4\.async-jquery\.js$/,
				loader: 'imports?$=jquery,tv4,window'
			},
			/*
			{
				test: require.resolve("jquery-ui/ui/widgets/sortable.js"),
				loader: 'imports'
			},
			*/
			{
				test: require.resolve("jquery"),
				loader: 'expose?jQuery'
			},
			{
				test: require.resolve("angular"),
				loader: 'imports?window,jQuery=jquery'
			},
			{
				test: require.resolve("angular-ui-sortable"),
				loader: 'imports?angular'
			},
			{
				test: require.resolve("angular-dragdrop"),
				loader: 'imports?angular'
			},
			{
				test: /ng-prettyjson\/src\/ng-prettyjson\.js$/,
				loader: 'imports?this=window'
			},
			{ test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
			{ test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
			{
				test: /\.png$/,
				loader: "url-loader",
				query: { mimetype: "image/png" }
			}
		]
	},
	node: {
		fs: "empty"
	},
	externals: {
		'ace': 'ace',
		'window': 'window'
	}
};
