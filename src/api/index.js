/* Sendanor App REST Module Root */
"use strict";

// Dependencies
var debug = require('nor-debug');
var express = require('express');

/** Returns `function(req, res)` which uses promises */
function api_builder(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};

	return function(req, res) {
		return {
			'$ref': req.url,
			'app': {
				'name': opts && opts.$parent && opts.$parent.name || 'unnamed-app'
			}
		};
	};
}

// Exports
module.exports = api_builder;
