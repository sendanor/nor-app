"use strict";

var debug = require('nor-debug');
var PATH = require('path');
var ref = require('nor-ref');
var ARRAY = require('nor-array');

/** NoPg Route operations
 * @param tr {object} NoPG (Transaction) Object
 */
function Routes(tr, type_name) {
	debug.assert(tr).is('object');
	debug.assert(type_name).ignore(undefined).is('string');
	this._tr = tr;
	this._typeName = type_name || 'Route';
}

/** Returns stripped route object for export usage */
Routes.prepareRoute = function(req, obj) {
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
	return tmp;
};

/** Returns the default title for path */
Routes.getDefaultTitle = function(path) {
	debug.assert(path).is('string');
	path = PATH.basename(PATH.normalize(path));
	return path.charAt(0).toUpperCase() + path.slice(1);
};

/** Returns the path of the parent route */
Routes.getParentPath = function(path) {
	debug.assert(path).is('string');
	return PATH.dirname(PATH.normalize(path));
};

/** Returns normalized path */
Routes.getNormalizedPath = function(path) {
	debug.assert(path).is('string');
	return PATH.normalize(path);
};

/** Returns promise of new Route object for `path`.
 * @param path {string} Path of the route, eg. `/path/to/operation`.
 */
Routes.prototype.createRoute = function(path) {
	var self = this;

	debug.assert(path).is('string');
	path = Routes.getNormalizedPath(path);

	/** */
	function createRouteWith(parent) {

		var data = {
			"path": path,
			"title": Routes.getDefaultTitle(path),
			"icon": "file-o"
		};

		if(parent) {
			debug.assert(parent).is('object');
			debug.assert(parent.$id).is('uuid');
			data.parent = parent.$id;
		}

		return self._tr.create(self._typeName)(data).then(function(tr) {
			var route = tr.fetch();
			debug.assert(route).is('object');
			return route;
		});

	}

	if(path !== '/') {
		var parent_path = Routes.getParentPath(path);
		return self.getRoute(parent_path).then(function(parent) {
			debug.assert(parent).is('object');
			return createRouteWith(parent);
		});
	}

	return createRouteWith();

};

/** Returns promise of Route object for `path`. If it doesn't exist yet, one is created.
 * @param path {string} Path of the route, eg. `/path/to/operation`.
 */
Routes.prototype.getRoute = function(path) {
	var self = this;

	debug.assert(path).is('string');
	path = Routes.getNormalizedPath(path);

	return self._tr.searchSingle(self._typeName)({
		'path': path
	}).then(function(tr) {
		var route = tr.fetch();
		if(!route) {
			return self.createRoute(path);
		}
		return route;
	});
};

// Exports
module.exports = Routes;
