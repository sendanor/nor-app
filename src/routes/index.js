/* Sendanor App REST Module Root */
"use strict";

// Dependencies
var debug = require('nor-debug');
//var express = require('express');
//var ref = require('nor-ref');

/** Returns `function(req, res)` which uses promises */
function api_builder(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(/*req, res*/) {
		return {
			'title': 'Index',
			'content': 'Sample content from nor-api module.'
		};
	};
}

// Exports
module.exports = api_builder;
