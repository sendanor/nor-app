var webpack = require('webpack');

var path = require('path');

module.exports = {
	context: path.resolve(__dirname, './src/nor'),
	entry: {
		app: path.resolve(__dirname, './src/nor/index.js'),
		vendor: [
			'jquery',
			'tv4',
			'tv4.async-jquery',
			'datatables.net',
			'brace',
			'ng-prettyjson-js',
			'bootstrap',
			'angular',
			'angular-sanitize',
			'angular-route',
			'angular-ui-router',
			'angular-datatables',
		]
	},
	output: {
		path: path.resolve(__dirname, './build'),
		filename: 'app.bundle.js',
	},
	plugins: [
		new webpack.ProvidePlugin({
		//	tv4: "tv4",
		//	angular: "angular",
		//	$: "jquery",
			jQuery: "jquery"
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
			'ng-prettyjson-css': 'ng-prettyjson/src/ng-prettyjson.css'
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
				loader: 'imports-loader?$=jquery,tv4'
			},
			{
				test: /ng-prettyjson\/src\/ng-prettyjson\.js$/,
				loader: 'imports-loader?angular'
			},
			{ test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
			{ test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "file-loader" },
			{
				test: /\.png$/,
				loader: "url-loader",
				query: { mimetype: "image/png" }
			}
		]
	}
};