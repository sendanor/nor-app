"use strict";

var debug = require('nor-debug');
//var PATH = require('path');
//var URL = require('url');
//var ref = require('nor-ref');
//var ARRAY = require('nor-array');

var nopgutils = require('./utils.js');

var Users = module.exports = {};

/** Returns stripped object for export usage */
Users.prepareUser = function prepare_doc(req, obj) {
	debug.assert(req).is('object');
	debug.assert(obj).is('object');
	obj = nopgutils.prepareDocument(req, obj);
	if(obj.hasOwnProperty('orig')) {
		delete obj.orig;
	}
	return obj;
};
