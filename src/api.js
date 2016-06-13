/* Sendanor App REST Module */
"use strict";

// Dependencies
var debug = require('nor-debug');
var express = require('express');
var _Q = require('q');

var route_root = require('./api/index.js');

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
			res.json({
				'error': 'Internal API Error'
			});
			debug.error(err);
		}).done();
	};
}

/** Returns Express application instance */
function app_builder(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};

	var app = express();

	app.get('/', route_builder(route_root(opts)) );

	return app;
}

// Exports
module.exports = app_builder;
