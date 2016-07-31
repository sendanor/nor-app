#!/usr/bin/env node

"use strict";

var ARGV = require('minimist')(process.argv.slice(2));

var ARRAY = require('nor-array');
var debug = require('nor-debug');
var comname = __filename || 'nopg-adduser';
var NoPg = require('nor-nopg');
var path = require('path');
var util = require('util');
var crypt = require('crypt3/q');
var Q = require('q');
var PGCONFIG;

function do_usage() {
	console.log('USAGE: nor-app-useradd --email=EMAIL[ --password=PASSWORD]');
}

Q.fcall(function() {

	// PGCONFIG
	PGCONFIG = ARGV.pg || process.env.PGCONFIG || undefined;

	if(!PGCONFIG) {
		throw new TypeError("No pg configuration!");
	}

	comname = path.basename( comname );

	// -v -- enable verbose mode
	if(ARGV.v) {
		debug.setNodeENV('development');
	} else {
		debug.setNodeENV('production');
	}

	// Other options
	var keys = ['_', 'v'];
	var opts = {};
	ARRAY(Object.keys(ARGV)).forEach(function(key) {
		if(keys.indexOf(key) !== -1) {
			return;
		}
		if (key[0] === '-') {
			opts[ '$' + key.substr(1) ] = ARGV[key];
		} else {
			opts[key] = ARGV[key];
		}
	});

	// Add admin flags
	opts.flags = {'admin': true};

	debug.log('opts = ', opts);

	if(!opts.email) {
		return do_usage();
	}

	debug.assert(opts).is('object');
	debug.assert(opts.email).is('string');
	debug.assert(opts.password).ignore(undefined).is('string');

	if(!opts.password) {
		opts.password = Math.random().toString(36).substr(2, 10);
		console.log('Created password: ' + opts.password);
	}

	debug.assert(opts.password).is('string');

	// The action
	return crypt(opts.password).then(function(hashed_password) {
		opts.password = hashed_password;
		return NoPg.transaction(PGCONFIG, function(db) {
			return db.count("User")({'email': opts.email}).then(function(db) {
				var users = db.fetch();
				if(users !== 0) {
					throw new TypeError("Email reserved");
				}
				return db.create("User")(opts);
			}).then(function(db) {
				var u = db.fetch();
				console.log( 'User added with ' + JSON.stringify(u.$content, null, 2) );
			});
		});
	});

}).then(function() {
	process.exit(0);
}).fail(function(err) {
	debug.error(err);
	process.exit(1);
}).done();

/* EOF */
