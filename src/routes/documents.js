/* Documents route for nor-app */
"use strict";

// Dependencies
var HTTPError = require('nor-express/src/HTTPError.js');
var ARRAY = require('nor-array');
var debug = require('nor-debug');
var ref = require('nor-ref');
var nopg = require('nor-nopg');
var _Q = require('q');

/** Returns true if type has been initialized */
function check_if_initialized(tr, name) {
	debug.assert(tr).is('object');
	return tr.searchTypes({"$name": name}).then(function(tr_) {
		var types = tr_.fetch();
		//debug.log('types = ', types);
		return types.length >= 1;
	});
}

/** Initialize new types */
function initialize_types(tr, docs) {
	debug.assert(tr).is('object');
	debug.assert(docs).is('object');
	return ARRAY(Object.keys(docs)).map(function(type) {
		return function step() {
			//debug.log('type = ', type);
			//debug.log('docs[type] = ', docs[type]);

			return check_if_initialized(tr, type).then(function(has_been_initialized) {
				if(has_been_initialized) {
					//debug.log(type + ': already exists');
					return;
				}
				return tr.declareType(type)(docs[type]).then(function(tr_) {
					tr_.fetch();
					debug.info(type + ': Initialized new document type');
				});
			});

		};
	}).reduce(_Q.when, _Q());
}

/** Prepare types for publification */
function prepare_type(req, type) {
	var tmp = JSON.parse(JSON.stringify(type));
	var meta = tmp.$meta;
	delete tmp.$events;
	delete tmp.$meta;
	// FIXME: This api/documents should use configuration paths
	tmp.$ref = ref(req, 'api/documents', tmp.$name);
	ARRAY(Object.keys(meta)).forEach(function(key) {
		tmp[key] = meta[key];
	});
	return tmp;
}

/** Prepare types for publification */
function prepare_types(req, types) {
	return ARRAY(types).map(prepare_type.bind(undefined, req)).valueOf();
}

/** Get document types
 * @returns `function(req, res)` which uses promises
 */
function get_types_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');

	// Initialize types if neccessary
	nopg.transaction(opts.pg, function(tr) {
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
					'$columns': ['$name', '$modified'],
					'content': prepare_types(req, types)
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

/** Get single document type
 * @returns `function(req, res)` which uses promises
 */
function get_type_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');
	return function(req, res) {

		var logged_in = req.session && req.session.user ? true : false;
		if(!logged_in) {
			throw new HTTPError(403);
		}

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		debug.assert(type).is('string');

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes({'$name': type}).then(function(tr) {
				var types = tr.fetch();
				var type = types.shift();

				if(!type) { throw new HTTPError(404); }

				// FIXME: This api/documents/:name/items should use configuration paths

				return {
					'title': 'Documents',
					'$type': 'record',
					'content': prepare_type(req, type),
					'documents': {
						'$ref': ref(req, 'api/documents', type.$name, 'documents')
					}
				};
			});
		});
	};
}

/** Get documents by type
 * @returns `function(req, res)` which uses promises
 */
function get_docs_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');

	return function(req, res) {

		var logged_in = req.session && req.session.user ? true : false;
		if(!logged_in) {
			throw new HTTPError(403);
		}

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		debug.assert(type).is('string');

		return nopg.transaction(opts.pg, function(tr) {
			return tr.search(type).then(function(tr) {
				var docs = tr.fetch();
				return {
					'title': 'Documents',
					'$type': 'table',
					'$columns': ['$id', '$name', '$modified'],
					'content': prepare_docs(req, docs)
				};
			});
		});
	};
}

// Exports
module.exports = {
	'$get': get_types_handler,
	'$post': post_handler,
	':type': {
		'$get': get_type_handler,
		'documents': {
			'$get': get_docs_handler
		}
	}
};
