/* Sendanor App Module */
"use strict";

// Dependencies
var debug = require('nor-debug');
var express = require('express');
var api_builder = require('./api.js');

/** Returns Express application instance */
function app_builder(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.api).ignore(undefined).is('object');
	var api_opts = opts.api || {};
	api_opts.$parent = opts;

	var app = express();
	var api = api_builder(api_opts);

	app.use(express.static(__dirname + '/public'));
	app.use('/api', api);

	return app;
}

// Exports
module.exports = app_builder;
