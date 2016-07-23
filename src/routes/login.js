/* Sendanor App REST Module Root */
"use strict";

// Dependencies
var HTTPError = require('nor-express/src/HTTPError.js');
var debug = require('nor-debug');
//var express = require('express');
//var ref = require('nor-ref');

/** Get login form
 * @returns `function(req, res)` which uses promises
 */
function get_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		if(req.session && req.session.user) {
			return {
				'title': 'Login',
				'content': 'You are already logged in.'
			};
		}

		return {
			'title': 'Login',
			'$type': 'form',
			'content': [
				{'type':'text','name':'username', 'label':'Username'},
				{'type':'password','name':'password', 'label':'Password'}
			]
		};
	};
}

/** Get login form
 * @returns `function(req, res)` which uses promises
 */
function post_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		var data = req.body || {};
		debug.log('data = ', data);

		var username = data.username;
		var password = data.password;

		if((username === "demo") && (password === "test")) {
			req.session.user = username;
			return {'title': 'Login', 'content': 'Login was successful.','$user':username};
		} else {
			req.session.user = undefined;
			throw new HTTPError(401);
		}

	};
}

// Exports
module.exports = {
	'$get': get_handler,
	'$post': post_handler
};
