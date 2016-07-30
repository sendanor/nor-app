/* Sendanor App Runner */

"use strict";

var APPNAME = process.env.APPNAME || 'nor-app';
var PORT = process.env.PORT || 3000;
var SESSION_SECRET = process.env.SESSION_SECRET || 'YmLV90WXHaLynw';
var PGCONFIG = process.env.PGCONFIG || undefined;

// FIXME: read possible default routes from filesystem, maybe?
var routes = ['index', 'database', 'login', 'logout'];
if(process.env.APPROUTES) {
	routes = process.env.APPROUTES.split(',');
}

var debug = require('nor-debug');
var express = require('express');
var nor_app = require('./index.js');

//debug.log('PGCONFIG = ', PGCONFIG);

var base_app = nor_app({
	'name': APPNAME,
	'pg': PGCONFIG,
	'routePaths': [],
	'routes': routes,
	'documents': {},
	'session': {
		'secret': SESSION_SECRET
	}
});

var app = express();

app.use(require('morgan')('dev'));

app.use(base_app);

//app.use(express.static(__dirname + '/public'));

app.listen(PORT, function () {
	console.log(APPNAME + ' listening on port ' + PORT);
});
