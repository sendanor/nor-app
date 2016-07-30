#!/usr/bin/env node

"use strict";

var _Q = require('q');
var PATH = require('path');
var ARRAY = require('nor-array');
var debug = require('nor-debug');
var ARGV = require('minimist')(process.argv.slice(2));

var PM2 = require('pm2');
var pm2 = {
	connect: _Q.denodeify(PM2.connect),
	disconnect: _Q.denodeify(PM2.disconnect),
	start: _Q.denodeify(PM2.start),
	list: _Q.denodeify(PM2.list),
	restart: _Q.denodeify(PM2.restart),
	reload: _Q.denodeify(PM2.reload),
	'delete': _Q.denodeify(PM2['delete']),
	stop: _Q.denodeify(PM2.stop)
};

var name = ARGV.name || process.env.APPNAME || 'nor-app';
var wrk_dir = PATH.resolve(process.cwd());
var home_dir = PATH.resolve(process.env.HOME || wrk_dir);
var src_dir = PATH.resolve(__dirname, '..');
var log_dir = ARGV.logdir || PATH.join(home_dir, '.nor-app', 'logs', name);

/** App commands as functions */
var COMMANDS = {};

/** Help command */
COMMANDS.usage = function do_usage() {
	console.log("USAGE: nor-app [ARG(s)] COMMAND(s)\n"+
		"\n"+
		" where COMMAND is:\n"+
		"    help  -- this help text\n"+
		"    start -- Start app\n"+
		"    stop  -- Stop app\n"+
		"\n"+
		" where ARG is:\n"+
		"    --name=NAME\n"+
		"    --logdir=DIR\n"
	);
};

/** Start app */
COMMANDS.start = function do_start() {
	return pm2.connect().then(function() {
		return pm2.start({
			"name": name,
			"script": PATH.join(src_dir, "app.js"),
			"watch": [src_dir],
			"ignore_watch" : [PATH.join(src_dir, "public")],
			"watch_options": {
				"followSymlinks": false
			},
			"env": {
				"NODE_ENV": "development",
			},
			"env_production" : {
				"NODE_ENV": "production"
			},
			"error_file"      : PATH.join(log_dir, "err.log"),
			"out_file"        : PATH.join(log_dir, "out.log"),
			"merge_logs"      : true
		});
	}).fin(function() {
		return pm2.disconnect();
	});
};

/** Stop app */
COMMANDS.stop = function do_stop() {
	//pm2 -s stop pm2.json && pm2 -s delete pm2.json
	return pm2.connect().then(function() {
		return pm2.stop(name);
	}).then(function() {
		return pm2['delete'](name);
	}).fin(function() {
		return pm2.disconnect();
	});
};

/** Restart app */
COMMANDS.restart = function do_stop() {
	//pm2 -s stop pm2.json && pm2 -s delete pm2.json
	return pm2.connect().then(function() {
		return pm2.restart(name);
	}).fin(function() {
		return pm2.disconnect();
	});
};

/** Reload app */
COMMANDS.reload = function do_stop() {
	//pm2 -s stop pm2.json && pm2 -s delete pm2.json
	return pm2.connect().then(function() {
		return pm2.reload(name);
	}).fin(function() {
		return pm2.disconnect();
	});
};

/** List apps */
COMMANDS.list = function do_list() {
	//pm2 -s stop pm2.json && pm2 -s delete pm2.json
	return pm2.connect().then(function() {
		return pm2.list().then(function(list) {
			console.log( list.map(function(item) {
				return item.pid + '\t' + item.name;
			}).join('\n') );
		});
	}).fin(function() {
		return pm2.disconnect();
	});
};

/** Run single command */
function run_command(command) {
	debug.assert(command).is('string');
	if(!COMMANDS.hasOwnProperty(command)) {
		return COMMANDS.usage();
	}
	return _Q.when(COMMANDS[command]());
}

/** Run array of commands */
function run_commands(commands) {
	debug.assert(commands).is('array');
	//debug.log('commands = ' , commands);
	return ARRAY(commands).map(function step_builder(command) {
		return function step() {
			return run_command(command);
		};
	}).reduce(_Q.when, _Q());
}

// Parse arguments and start command run
_Q.fcall(function() {
	var commands = [].concat(ARGV._ || []);
	//debug.log('commands = ' , commands);
	//debug.log('commands.length = ' , commands.length);
	if(commands.length === 0) {
		return run_commands(['usage']);
	}
	return run_commands(commands);
}).fail(function(err) {
	debug.error(err);
}).done();
