/* Sendanor App REST Module default route */
"use strict";

// Dependencies
var debug = require('nor-debug');
//var express = require('express');
var ref = require('nor-ref');
var Routes = require('../lib/nopg/Routes.js');
var nopg = require('nor-nopg');

/** Returns title of route */
function get_title(route) {
	return route.charAt(0).toUpperCase() + route.slice(1);
}

/** Returns `function(req, res)` which uses promises */
function api_builder(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	var base_path = opts.base_path || "api";

	debug.assert(opts.pg).is('string');

	var routes = opts.routes || [];

	return function(req, res) {
		return nopg.transaction(opts.pg, function(tr) {
			debug.assert(tr).is('object');
			var routes_tr = new Routes(tr);
			return routes_tr.getRoute(req.url).then(function(route) {

				var user;
				if(req.session && (req.session.user !== undefined)) {
					user = req.session.user;
				}

				var url = req.url;
				if( (url.length >= 1) && (url[0]==='/')) {
					url = url.slice(1);
				}

				return {
					'$ref': ref(req, base_path, url),
					'$resource': url,
					'$user': user,
					'$route': Routes.prepareRoute(req, route),
					'$app': {
						'name': opts && opts.$parent && opts.$parent.name || 'unnamed-app',
						'menu': routes.filter(function(route_name) {

							var logged_in = req.session && req.session.user ? true : false;

							if(route_name === "index") {
								return false;
							}

							if(logged_in) {
								if(route_name === "login") {
									return false;
								}
								return true;
							} else {
								if(route_name === "login") {
									return true;
								}
							}

						}).map(function(route_name) {
							return {'$ref': ref(req, base_path, route_name), 'href':'/'+route_name, 'title': get_title(route_name)};
						})
					},
					'title': route.title || 'Resource ' + req.url,
					'content': ''
				};
			});
		}); // nopg.transaction
	};
}

// Exports
module.exports = {
	'$get': api_builder,
	'$post': api_builder
};
