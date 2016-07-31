/* Passport authentication routes */

"use strict";

var debug = require('nor-debug');
var HTTPError = require('nor-express/src/HTTPError.js');
var passport = require('nor-passport');
var ref = require('nor-ref');

/** Do logout */
function do_logout(opts) {
	return function do_logout_(req, res) {
		req.logout();
		res.redirect( ref(req, 'api/auth') );
	};
}

/** */
function get_auth_status(opts) {
	return function get_auth_status_(req/*, res*/) {
		debug.log('get_auth_status()');
		var result = {};
		result.$ref = ref(req, 'api/auth');
		if(req.user) {
			result.title = 'Login';
			result.content = 'You are logged in.';
			result.links = {
				"logout": {'$ref': ref(req, 'api/auth/logout')}
			};
		} else {
			result.title = 'Login';
			result.$type = 'form';
			result.$target = ref(req, 'api/auth/local');
			result.content = [
				{'type':'text','name':'email', 'label':'Email'},
				{'type':'password','name':'password', 'label':'Password'}
			];
		}
		return result;
	};
}

/** */
function do_passport_local(opts) {
	return function do_passport_local_(req, res) {
		debug.log('do_passport_local()');
		return passport.authenticate('local', {
			failureRedirect: ref(req, 'api/auth/errors/401'),
			successRedirect: ref(req, 'api/auth')
		})(req, res);
	};
}

var routes = module.exports = {};

/** Root of auth features */
routes.$get = get_auth_status;

/** Local user accounts */
routes.local = {
	"$use": do_passport_local
};

/** Logout route */
routes.logout = {
	"$get": do_logout,
	"$post": do_logout
};

var ref = require('nor-ref');

/** Errors */
routes.errors = {};

routes.errors.$get = function(opts) {
	return function(req/*, res*/) {
		return {'$ref': ref(req, 'api/auth/errors') };
	};
};

/** 401 HTTP error */
routes.errors['401'] = {
	$get: function(opts) {
		return function(/*req, res*/) {
			throw new HTTPError(401);
		};
	}
};

/* EOF */
