/* Sendanor App Module */
"use strict";

// Dependencies
var PATH = require('path');
var debug = require('nor-debug');
var express = require('express');
var session = require('express-session');
var merge = require('merge');
var api_builder = require('./api.js');

/** Returns Express application instance */
function app_builder(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.api).ignore(undefined).is('object');
	debug.assert(opts.routePaths).ignore(undefined).is('array');
	debug.assert(opts.routes).ignore(undefined).is('array');
	debug.assert(opts.documents).ignore(undefined).is('object');

	if(!opts.pg) {
		throw new TypeError("You must set PGCONFIG");
	}

	debug.assert(opts.pg).is('string');

	var documents = require(__dirname + '/types/documents/');

	opts.routePaths = opts.routePaths || [];
	opts.routes = opts.routes || [];
	opts.documents = merge(documents, opts.documents || {});

	var api_opts = opts.api || {};
	api_opts.$parent = opts;
	api_opts.routePaths = opts.routePaths;
	api_opts.routes = opts.routes;
	api_opts.documents = opts.documents;
	api_opts.pg = opts.pg;

	var passport = require('nor-passport');
	passport.setup({'pg': opts.pg});

	var NoPgStore = require('nor-nopg-store')(session);

	var app = express();

	var session_config = opts.session || {};
	session_config.store = new NoPgStore({"pg": opts.pg});
	app.use(session(session_config));

	app.use(passport.initialize());
	app.use(passport.session());

	var api = api_builder(api_opts);

	// Setup req.flags etc
	app.use(passport.setupHelpers({
		'default_flags': {
			'public': true
		}
	}));

	// Serve API application
	app.use('/api', api);

	// Enable serving our Angular App for each route
	opts.routes.forEach(function(route) {

		// This needs to be .use() instead of .get() so that sub routes work also!
		app.use('/'+route, function(req, res) {
			res.sendFile( PATH.resolve(__dirname, 'nor/layout/index.html') );
		});

		if(route === "index") {
			app.get('/', function(req, res) {
				res.redirect('/index');
			});
		}
	});


	// Serve static files
	app.use(express.static( PATH.resolve(__dirname, './public') ));
	app.use(express.static( PATH.resolve(__dirname, './../build') ));

	return app;
}

// Exports
module.exports = app_builder;
