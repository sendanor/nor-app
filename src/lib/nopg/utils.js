"use strict";

var debug = require('nor-debug');
var PATH = require('path');
var URL = require('url');
var ref = require('nor-ref');
var ARRAY = require('nor-array');

var utils = module.exports = {};

/** Returns stripped object for export usage */
utils.prepareDocument = function prepare_doc(req, obj) {
	debug.assert(req).is('object');
	debug.assert(obj).is('object');
	var tmp = JSON.parse(JSON.stringify(obj));
	var content = tmp.$content;
	delete tmp.$events;
	delete tmp.$content;
	// FIXME: This api/database/types should use configuration paths
	tmp.$ref = ref(req, 'api/database/types', tmp.$type, 'documents', tmp.$id);
	if(content) {
		ARRAY(Object.keys(content)).forEach(function(key) {
			tmp[key] = content[key];
		});
	}
	var childs;
	if(tmp.hasOwnProperty('$documents')) {
		childs = tmp.$documents;
		Object.keys(childs).forEach(function(id) {
			var child = childs[id];
			childs[id] = prepare_doc(req, child);
		});
	}
	return tmp;
};
