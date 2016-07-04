/* Sendanor App REST Module */
"use strict";

// Dependencies
var is_production_mode = process.env.NODE_ENV === 'production';

var is = require('nor-is');
var ARRAY = require('nor-array');
var debug = require('nor-debug');
var express = require('express');
var merge = require('merge');
var FS = require('fs');
var _Q = require('q');
var HTTPError = require('./HTTPError.js');
var bodyParser = require('body-parser');
var parseStack = require('parse-stack');

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
					'$type': 'error',
					'title': ''+err.message,
					'content': {
						'name': 'HTTPError',
						'message': ''+err.message,
						'code': err.code,
						'stack': (is_production_mode ? undefined : parseStack(err))
					}
				});
				return;
			} else {
				res.status(500); // Internal Server Error
			}

			if(is_production_mode) {
				res.json({
					'$type': 'error',
					'title': 'Internal Server Error',
					'content': {
						'name': 'APIError',
						'message': 'There was an API error.'
					}
				});
			} else {
				var tmp = JSON.parse(JSON.stringify(err));
				tmp.$type = 'error';
				tmp.title = ''+err;
				tmp.content = {};
				tmp.content.message = ''+err.message;
				if(err.name) {
					tmp.content.name = ''+err.name;
				}
				if(err.fileName) {
					tmp.content.fileName = ''+err.fileName;
				}
				if(err.lineNumber) {
					tmp.content.lineNumber = ''+err.lineNumber;
				}
				if(err.stack) {
					try {
						tmp.content.stack = parseStack(err);
					} catch(error) {
						tmp.content.stack = ''+err.stack;
					}
				}
				res.json(tmp);
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
	ARRAY(results).forEach(function(result) {
		debug.log('result = ', result);
		debug.assert(result).is('object');
		if(result.state === "fulfilled") {
			debug.assert(result.value).is('object');
			ARRAY(Object.keys(result.value)).forEach(function(key) {
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
		if(is_production_mode) {
			debug.error("There was internal error(s): ", body.errors);
			throw new TypeError("Internal API Route Error");
		} else {
			if(body.errors.length === 1) {
				debug.error("There was internal error: ", body.errors);
				throw body.errors[0];
			} else {
				debug.error("There was internal errors: ", body.errors);
				throw body;
			}
		}
	}
	return body;
}

/** Returns true if value is not one of $get or $post */
function other_than_methods(value) {
	return (value !== '$get') && (value !== '$post');
}

// Initialize route handler array if doesn't exist
function register_raw_func(_raw, route, f, d) {
	debug.assert(_raw).is('object');
	debug.assert(route).is('string');
	debug.assert(f).is('defined');

	if(!_raw.hasOwnProperty(route)) {
		_raw[route] = [];
	}
	if(f && _raw[route].indexOf(f) < 0) {
		_raw[route].push(f);
	}

	// Childs
	if(is.obj(f)) {
		ARRAY(Object.keys(f)).filter(other_than_methods).forEach(function(key) {
			debug.log('key = ', key);
			if(d) {
				register_raw_func(_raw, route+'/'+key, d);
			}
			register_raw_func(_raw, route+'/'+key, f[key], d);
		});
	}

}

/** Returns object which contains all routes compined as one function call for each method and path
 * @param routes {Array} Each route name which should be enabled
 * @param paths {Array} Filesystem paths where to search for route files
 * @returns {object} Which has methods $get and $post as objects with each route associated with a handler function.
 */
function get_routes(routes, paths) {

	debug.assert(paths).is('array');
	debug.assert(routes).is('array');

	debug.log('paths = ', paths, '\nroutes = ', routes);

	var _raw = {};

	// Builds result object with each route module as handler functions
	ARRAY(paths).forEach(function(path) {
		var d = require_if_exists(path +'/_default.js');

		if(d) {
			debug.log('Detected: ', path +'/_default.js');
		}

		ARRAY(routes).forEach(function(route) {
			var r = require_if_exists(path +'/' + route + '.js');

			if(r) {
				debug.log('Detected: ', path +'/' + route + '.js');
			}

			// Skip if no handlers found
			if((d===undefined) && (r===undefined)) {
				return;
			}

			if(d) { register_raw_func(_raw, route, d); }
			if(r) { register_raw_func(_raw, route, r, d); }

		});

	});

	var result = {
		'$get': {},
		'$post': {}
	};

	// 
	ARRAY(Object.keys(_raw)).forEach(function(route) {
		var funcs = _raw[route];

		var _handlers = {
			"$get": funcs.map(function(func) {
				if(is.func(func)) {
					return func;
				} else if(is.obj(func)) {
					if(is.func(func.$get)) {
						return func.$get;
					}
				}
			}).filter(function(func) {
				return is.func(func);
			}),
			"$post": funcs.map(function(func) {
				if(is.func(func)) {
					return;
				} else if(is.obj(func)) {
					if(is.func(func.$post)) {
						return func.$post;
					}
				}
			}).filter(function(func) {
				return is.func(func);
			})
		};

		ARRAY(Object.keys(_handlers)).forEach(function(method) {
			result[method][route] = function(opts) {

				var handlers = _handlers[method].map(function(func) {
					return func(opts);
				});
				debug.log(route + ': Route has ' + handlers.length + ' '+method+' handlers');

				return function(req, res) {

					var promises = handlers.map(function(handler) {
						return _Q.when( handler(req, res) );
					});

					debug.log(route + ': Created ' + promises.length + ' promises for route.');
					return _Q.allSettled(promises).then( merge_settled_results );

				};
			};
		});

	});

	return result;
}

/** Returns Express application instance */
function app_builder(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};

	debug.assert(opts.routePaths).ignore(undefined).is('array');
	debug.assert(opts.routes).ignore(undefined).is('array');
	debug.assert(opts.documents).ignore(undefined).is('object');

	opts.routePaths = opts.routePaths || [];
	opts.routes = opts.routes || [];
	opts.routePaths.unshift(__dirname + '/routes');
	opts.documents = opts.documents || {};

	debug.log('opts.routes = ', opts.routes);
	debug.log('opts.routePaths = ', opts.routePaths);

	var urlencoded_parser = bodyParser.urlencoded({ extended: false });
	var json_parser = bodyParser.json();

	var app = express();
	var routes = get_routes(opts.routes, opts.routePaths);

	debug.assert(routes).is('object');
	debug.assert(routes.$get).is('object');
	debug.assert(routes.$post).is('object');

	//debug.log('routes.$get = ', routes.$get);
	//debug.log('routes.$post = ', routes.$post);

	ARRAY(Object.keys(routes)).forEach(function(type) {
		ARRAY(Object.keys(routes[type])).forEach(function(route) {
			var path = '/';
			if(route !== "index") {
				path += route;
			}
			if(type === '$get') {
				debug.log('Added GET route for '+ path);
				app.get(path, route_builder(routes.$get[route](opts)) );
			} else if(type === '$post') {
				debug.log('Added POST route for '+ path);
				app.post(path, urlencoded_parser, json_parser, route_builder(routes.$post[route](opts)) );
			}
		});
	});

	return app;
}

// Exports
module.exports = app_builder;
