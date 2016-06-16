/* Sendanor App REST Module */
"use strict";

// Dependencies
var is = require('nor-is');
var debug = require('nor-debug');
var express = require('express');
var merge = require('merge');
var FS = require('fs');
var _Q = require('q');
var HTTPError = require('./HTTPError.js');
var bodyParser = require('body-parser');

/** Handle promise based functions */
function route_builder(f) {
	debug.assert(f).is('function');
	return function(req, res) {
		debug.assert(req).is('object');
		debug.assert(res).is('object');
		_Q.fcall(function() {
			return f(req, res);
		}).then(function(body) {
			debug.assert(body).is('object');
			res.json(body);
		}).fail(function(err) {

			if(err instanceof HTTPError) {
				res.status(err.code);
				res.json({
					'error': ''+err.message,
					'code': err.code
				});
				return;
			} else {
				res.status(500);
			}

			if(process.env.NODE_ENV === 'production') {
				res.json({
					'error': 'Internal API Error'
				});
			} else {
				res.json({
					'error': ''+err,
					'stack': err.stack
				});
			}
			debug.error(err);
		}).done();
	};
}

/** Require if exists */
function require_if_exists(path) {
	if(FS.existsSync(path)) {
		return require(path);
	}
}

function merge_settled_results(results) {
	var body = {};
	results.forEach(function(result) {
		debug.log('result = ', result);
		debug.assert(result).is('object');
		if(result.state === "fulfilled") {
			debug.assert(result.value).is('object');
			Object.keys(result.value).forEach(function(key) {
				if(body.hasOwnProperty(key)) {
					if(is.array(result.value[key])) {
						if(is.array(body[key])) {
							body[key] = body[key].concat(result.value[key]);
						} else {
							body[key] = result.value[key];
						}
					} else if(is.object(result.value[key])) {
						body[key] = merge(body[key], result.value[key]);
					} else {
						body[key] = result.value[key];
					}
				} else {
					body[key] = result.value[key];
				}
			});
		} else {
			if(!body.errors) {
				body.errors = [];
			}
			body.errors.push(result.reason);
		}
	});
	if(body.errors) {
		debug.error("errors: ", body.errors);
		throw new TypeError("Internal API Route Error");
	}
	return body;
}

/** Returns object which contains all route interfaces compined as one function call */
function get_routes(routes, paths) {
	debug.assert(paths).is('array');
	debug.assert(routes).is('array');

	debug.log('paths = ', paths, '\nroutes = ', routes);

	var result = {
		'$get': {},
		'$post': {}
	};

	paths.forEach(function(path) {
		var d = require_if_exists(path +'/_default.js');

		if(d) {
			debug.log('Detected: ', path +'/_default.js');
		}

		routes.forEach(function(route) {
			var r = require_if_exists(path +'/' + route + '.js');

			if(d) {
				debug.log('Detected: ', path +'/' + route + '.js');
			}

			if((d===undefined) && (r===undefined)) {
				return;
			}

			if(!result.$get.hasOwnProperty(route)) {
				result.$get[route] = [];
			}

			var result_route = result.$get[route];
			if(d && result_route.indexOf(d) < 0) {
				result_route.push(d);
			}
			if(r && result_route.indexOf(r) < 0) {
				result_route.push(r);
			}
		});
	});

	routes.forEach(function(route) {
		var funcs = result.$get[route];

		result.$get[route] = function(opts) {
			var handlers = funcs.map(function(func) {
				if(is.func(func)) {
					return func;
				} else if(is.obj(func)) {
					if(is.func(func.$get)) {
						return func.$get;
					}
				}
			}).filter(function(func) {
				return is.func(func);
			}).map(function(func) {
				return func(opts);
			});

			return function(req, res) {

				debug.log(route + ': Route has ' + handlers.length + ' GET handlers');

				var promises = handlers.map(function(handler) {
					return _Q.when( handler(req, res) );
				});

				debug.log(route + ': Created ' + promises.length + ' promises for route.');
				return _Q.allSettled(promises).then( merge_settled_results );

			};
		};

		result.$post[route] = function(opts) {

			var handlers = funcs.map(function(func) {
				if(is.func(func)) {
					return;
				} else if(is.obj(func)) {
					if(is.func(func.$post)) {
						return func.$post;
					}
				}
			}).filter(function(func) {
				return is.func(func);
			}).map(function(func) {
				return func(opts);
			});

			return function(req, res) {

				debug.log(route + ': Route has ' + handlers.length + ' GET handlers');

				var promises = handlers.map(function(handler) {
					return _Q.when( handler(req, res) );
				});

				debug.log(route + ': Created ' + promises.length + ' promises for route.');
				return _Q.allSettled(promises).then( merge_settled_results );

			};
		};

	});

	return result;
}

/** Returns Express application instance */
function app_builder(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.routePaths).ignore(undefined).is('array');
	debug.assert(opts.routes).ignore(undefined).is('array');
	opts.routePaths = opts.routePaths || [];
	opts.routes = opts.routes || [];

	opts.routePaths.unshift(__dirname + '/routes');

	debug.log('opts.routes = ', opts.routes);
	debug.log('opts.routePaths = ', opts.routePaths);

	var urlencoded_parser = bodyParser.urlencoded({ extended: false });
	var json_parser = bodyParser.json();

	var app = express();
	var routes = get_routes(opts.routes, opts.routePaths);

	debug.assert(routes).is('object');
	debug.assert(routes.$get).is('object');
	debug.assert(routes.$post).is('object');

	debug.log('routes.$get = ', routes.$get);
	debug.log('routes.$post = ', routes.$post);

	Object.keys(routes.$get).forEach(function(route) {
		var path = '/';
		if(route !== "index") {
			path += route;
		}
		debug.log('Added route for '+ path);
		app.get(path, route_builder(routes.$get[route](opts)) );
	});

	Object.keys(routes.$post).forEach(function(route) {
		var path = '/';
		if(route !== "index") {
			path += route;
		}
		debug.log('Added POST route for '+ path);
		app.post(path, urlencoded_parser, json_parser, route_builder(routes.$post[route](opts)) );
	});

	return app;
}

// Exports
module.exports = app_builder;
