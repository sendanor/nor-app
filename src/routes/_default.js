/* Sendanor App REST Module default route */
"use strict";

// Dependencies
var debug = require('nor-debug');
var express = require('express');
var ref = require('nor-ref');

/** Returns title of route */
function get_title(route) {
	return route.charAt(0).toUpperCase() + route.slice(1);
}

/** Returns `function(req, res)` which uses promises */
function api_builder(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	var base_path = opts.base_path || "api";

	var routes = opts.routes || [];

	return function(req, res) {

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
			'$app': {
				'name': opts && opts.$parent && opts.$parent.name || 'unnamed-app',
				'menu': routes.filter(function(route) {

					var logged_in = req.session && req.session.user ? true : false;

					if(route === "index") {
						return false;
					}

					if(logged_in) {
						if(route === "login") {
							return false;
						}
						return true;
					} else {
						if(route === "login") {
							return true;
						}
					}

				}).map(function(route) {
					return {'$ref': ref(req, base_path, route), 'href':'/'+route, 'title': get_title(route)};
				})
			},
			'title': 'Resource ' + req.url,
			'content': ''
		};
	};
}

// Exports
module.exports = {
	'$get': api_builder,
	'$post': api_builder
};
