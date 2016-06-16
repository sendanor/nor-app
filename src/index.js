/* Sendanor App Module */
"use strict";

// Dependencies
var debug = require('nor-debug');
var express = require('express');
var session = require('express-session')
var api_builder = require('./api.js');

/** Returns Express application instance */
function app_builder(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.api).ignore(undefined).is('object');
	debug.assert(opts.routePaths).ignore(undefined).is('array');
	debug.assert(opts.routes).ignore(undefined).is('array');

	opts.routePaths = opts.routePaths || [];
	opts.routes = opts.routes || [];

	var api_opts = opts.api || {};
	api_opts.$parent = opts;
	api_opts.routePaths = opts.routePaths;
	api_opts.routes = opts.routes;

	var app = express();

	var session_config = opts.session || {};
	app.use(session(session_config))

	var api = api_builder(api_opts);

	// Serve static files
	app.use(express.static(__dirname + '/public'));

	// Serve API application
	app.use('/api', api);

	// Enable serving our Angular App for each route
	opts.routes.forEach(function(route) {
		app.get('/'+route, function(req, res) {
			res.sendFile(__dirname + '/public/index.html');
		});
	});

	return app;
}

// Exports
module.exports = app_builder;
