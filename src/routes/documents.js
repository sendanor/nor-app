/* Documents route for nor-app */
"use strict";

// Dependencies
var HTTPError = require('nor-express/src/HTTPError.js');
var debug = require('nor-debug');
var express = require('express');
var ref = require('nor-ref');
var nopg = require('nor-nopg');

/** Create types */
function create_types(tr, docs) {
}

/** Initialize if uninitialized */
function check_if_initialized(tr) {
	return tr.searchTypes().then(function(tr) {
		var types = tr.fetch();
		return types.length >= 1;
	});
}

/** Initialize if uninitialized */
function initialize_types(pg, docs) {
	debug.assert(pg).is('string');
	debug.assert(docs).is('object');
	return check_if_initialized(tr).then(function(has_been_initialized) {
	});
}

/** Get login form
 * @returns `function(req, res)` which uses promises
 */
function get_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');

	// Initialize types if neccessary
	nopg.transaction(pg, function(tr) {
		return initialize_types(tr, opts.documents);
	}).fail(function(err) {
		debug.error(err);
	}).done();

	return function(req, res) {

		var logged_in = req.session && req.session.user ? true : false;

		if(!logged_in) {
			throw new HTTPError(403);
		}

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes().then(function(tr) {
				var types = tr.fetch();
				return {
					'title': 'Documents',
					'$type': 'table',
					'content': types
				};
			});
		});
	};
}

/** Get login form
 * @returns `function(req, res)` which uses promises
 */
function post_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req, res) {

		var data = req.body || {};
		debug.log('data = ', data);

		throw new HTTPError(501);

	};
}

// Exports
module.exports = {
	'$get': get_handler,
	'$post': post_handler
};
