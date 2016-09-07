/* Documents route for nor-app */
"use strict";

// Dependencies
var norUtils = require('nopg/src/norUtils.js');
var HTTPError = require('nor-express/src/HTTPError.js');
var ARRAY = require('nor-array');
var debug = require('nor-debug');
var ref = require('nor-ref');
var nopg = require('nor-nopg');
var URL = require('url');
var PATH = require('path');
var _Q = require('q');

var export_handlers = require('../lib/exports/');

/** Default limit of data in a collection searches */
var DEFAULT_SEARCH_LIMIT = 20;

/** Maximum limit of data in a collection searches */
var MAX_SEARCH_LIMIT = 1000;

/** Parse integer */
function parse_integer(value) {
	return parseInt(value, 10);
}

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
	debug.assert(req).is('object');
	debug.assert(type).is('object').instanceOf(nopg.Type);

	var tmp;
	try {
		tmp = JSON.parse(JSON.stringify(type));
	} catch(e) {
		debug.log('Failed to copy: ', type);
		throw e;
	}
	var meta = tmp.$meta;
	delete tmp.$events;
	delete tmp.$meta;
	// FIXME: This api/database/types should use configuration paths
	tmp.$ref = ref(req, 'api/database/types', tmp.$name);
	if(meta) {
		ARRAY(Object.keys(meta)).forEach(function(key) {
			tmp[key] = meta[key];
		});
	}

	return tmp;
}

/** Prepare methods for publification */
function prepare_method(req, method) {
	debug.assert(req).is('object');
	debug.assert(method).is('object').instanceOf(nopg.Method);
	var tmp;
	try {
		tmp = JSON.parse(JSON.stringify(method));
	} catch(e) {
		debug.log('Failed to copy: ', method);
		throw e;
	}
	var meta = tmp.$meta;
	delete tmp.$events;
	delete tmp.$meta;
	// FIXME: This api/database/methods should use configuration paths
	tmp.$ref = ref(req, 'api/database/types', method.$type, 'methods', tmp.$name);
	if(meta) {
		ARRAY(Object.keys(meta)).forEach(function(key) {
			tmp[key] = meta[key];
		});
	}
	return tmp;
}

/** Prepare types for publification */
function prepare_types(req, types) {
	return ARRAY(types).map(prepare_type.bind(undefined, req)).valueOf();
}

/** Prepare methods for publification */
function prepare_methods(req, methods) {
	return ARRAY(methods).map(prepare_method.bind(undefined, req)).valueOf();
}

/** Prepare document for publification */
function prepare_doc(req, doc) {
	var tmp = JSON.parse(JSON.stringify(doc));
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
}

/** Prepare docs for publification */
function prepare_docs(req, docs) {
	return ARRAY(docs).map(prepare_doc.bind(undefined, req)).valueOf();
}

/** Assert that we have logged in
 * @param required_flags {array} Optional array of flags, which at least one must match.
 */
function assert_logged_in(req, required_flags) {
	debug.assert(req).is('object');
	debug.assert(req.flags).ignore(undefined).is('object');
	debug.assert(required_flags).ignore(undefined).is('array');

	var flags = req.flags || {};

	var logged_in = flags.authenticated ? true : false;
	if(!logged_in) {
		throw new HTTPError(401);
	}

	if(required_flags && (required_flags.length >= 0)) {
		var value = ARRAY(required_flags).some(function(flag) {
			if(flags.hasOwnProperty(flag)) {
				return flags[flag] === true;
			}
		});
		if(!value) {
			throw new HTTPError(403);
		}
	}
}

/** Get document types
 * @returns `function(req, res)` which uses promises
 */
function get_types_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');
	debug.assert(opts.documents).is('object');

	// Initialize types if neccessary
	nopg.transaction(opts.pg, function(tr) {
		return initialize_types(tr, opts.documents);
	}).fail(function(err) {
		debug.error(err);
	}).done();

	return function(req/*, res*/) {

		assert_logged_in(req, [
			'admin',
			'database',
			'database_types'
		]);

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes().then(function(tr) {
				var types = tr.fetch();
				return {
					'$ref': ref(req, 'api/database/types'),
					'title': 'Types',
					'$type': 'table',
					'$columns': ['$name', '$modified'],
					'totalResults': types.length,
					'limit': types.length,
					'offset': 0,
					'content': prepare_types(req, types),
					'links': [
						{
							'$ref': ref(req, 'api/database/createType'),
							'title': 'Create new type',
							'icon': 'plus'
						}
					]
				};
			});
		});
	};
}

/** Get a form to create type
 * @returns `function(req, res)` which uses promises
 */
function get_create_type_form(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');

	return function(req/*, res*/) {

		assert_logged_in(req, [
			'admin',
			'database_create_type'
		]);

		//return nopg.transaction(opts.pg, function(tr) {
			return {
				'title': 'Create a new type',
				'$type': 'form',
				'$target': ref(req, 'api/database/createType'),
				'content': [
					{'type':'text','name':'$name', 'label':'Name'}
				]
			};
		//});
	};
}

/** Get a form to delete a type
 * @returns `function(req, res)` which uses promises
 */
function get_del_type_form(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');

	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_delete_type',
			'database_types_'+type+'_delete_type'
		]);

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes({'$name': type}).then(function(tr) {
				var types = tr.fetch();
				var type = types.shift();

				if(!type) { throw new HTTPError(404); }

				// FIXME: This api/database/:name/items should use configuration paths

				return {
					'$ref': ref(req, 'api/database/types', type.$name, 'delete'),
					'title': 'Delete a type',
					'$type': 'form',
					'$method': 'delete',
					'$target': ref(req, 'api/database/types', type.$name, 'delete'),
					'content': [
					]
				};
			});
		});
	};
}

/** Get single document type
 * @returns `function(req, res)` which uses promises
 */
function get_type_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_types',
			'database_types_'+type
		]);

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes({'$name': type}).searchMethods(type)({'$active': true}).then(function(tr) {
				var types = tr.fetch();
				var type = types.shift();
				if(!type) { throw new HTTPError(404); }

				var methods = tr.fetch() || [];

				// FIXME: This api/database/:name/items should use configuration paths

				return {
					'$ref': ref(req, 'api/database/types', type.$name),
					'title': 'Type '+type.$name,
					'$type': 'Type',
					'content': prepare_type(req, type),
					'links': [
						{
							'$ref': ref(req, 'api/database/types', type.$name, 'search'),
							'title': 'Search documents',
							'icon': 'search'
						},
						{
							'$ref': ref(req, 'api/database/types', type.$name, 'documents/create'),
							'title': 'Create new document',
							'icon': 'plus'
						},
						{
							'$ref': ref(req, 'api/database/types', type.$name, 'delete'),
							'title': 'Delete this type',
							'icon': 'trash-o'
						}
					],
					'methods': {
						'$ref': ref(req, 'api/database/types', type.$name, 'methods'),
						'content': prepare_methods(req, methods)
					}
				};
			});
		});
	};
}

/** Get a form to delete a doc
 * @returns `function(req, res)` which uses promises
 */
function get_del_doc_form(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');

	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		var id = params.id;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_delete_document',
			'database_types_'+type+'_delete_document',
		]);

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes({'$name':type}).initDocumentBuilder(type)().search(type)({'$id':id}, {'typeAwareness':true}).then(function(tr) {

				var type_obj = tr.fetchSingle();
				debug.assert(type_obj).is('object');

				var docs = tr.fetch();

				var doc = docs.shift();

				if(!doc) { throw new HTTPError(404); }

				return {
					'$ref': ref(req, 'api/database/types', type.$name, 'documents', doc.$id, 'delete'),
					'title': 'Delete a document '+doc.$id,
					'$type': 'form',
					'$method': 'delete',
					'$target': ref(req, 'api/database/types', type.$name, 'documents', doc.$id, 'delete'),
					'content': [
					]
				};
			});
		});
	};
}

/** Get single document
 * @returns `function(req, res)` which uses promises
 */
function get_doc_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		var id = params.id;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_types_'+type,
			'database_types_'+type+'_documents'
		]);

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes({'$name':type}).initDocumentBuilder(type)().search(type)({'$id':id}, {'typeAwareness':true}).then(function(tr) {

				var type_obj = tr.fetchSingle();
				debug.assert(type_obj).is('object');

				var docs = tr.fetch();

				var doc = docs.shift();

				if(!doc) { throw new HTTPError(404); }

				return {
					'title': 'Document ' + doc.$id,
					'type': prepare_type(req, type_obj),
					'$type': 'Document',
					'content': prepare_doc(req, doc),
					'links': [
						{
							'$ref': ref(req, 'api/database/types', doc.$type, 'search'),
							'title': 'Search documents',
							'icon': 'search'
						},
						{
							'$ref': ref(req, 'api/database/types', doc.$type, 'documents', doc.$id, 'delete'),
							'title': 'Delete this document',
							'icon': 'trash-o'
						}
					]
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

	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_types_'+type,
			'database_types_'+type+'_documents'
		]);

		debug.log('url = ', req.url);

		var parsed_url = URL.parse(req.url, true);
		debug.log('parsed_url = ', parsed_url);

		var query = parsed_url.query || {};
		debug.log('query = ', query);

		var search_opts = {'typeAwareness':true};

		search_opts.order = ['$created'];

		var limit = DEFAULT_SEARCH_LIMIT;
		if(opts.disableDefaultSearchLimit === true) {
			limit = 0; // 0 means no limit
		}
		if(query.hasOwnProperty('_limit')) {
			limit = parse_integer(query._limit) || DEFAULT_SEARCH_LIMIT;
			delete query._limit;
			if(limit < 1) {
				limit = 1;
			}
		}
		if(opts.disableMaxSearchLimit !== true) {
			if(limit > MAX_SEARCH_LIMIT) {
				limit = MAX_SEARCH_LIMIT;
			}
		}

		if(limit >= 1) {
			search_opts.limit = limit;

			var offset = 0;
			if(query.hasOwnProperty('_offset')) {
				offset = parse_integer(query._offset) || 0;
				delete query._offset;
			}
			search_opts.offset = offset;

			debug.log('search_opts.limit = ', search_opts.limit, ' type of ', typeof search_opts.limit);
		}

		var where;

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes({'$name':type}).searchMethods(type)({'$active': true}).then(function(tr) {
				var type_obj = tr.fetchSingle();
				debug.assert(type_obj).is('object');

				var methods = tr.fetch() || [];
				debug.assert(methods).is('array');

				var schema = type_obj.$schema || {};
				debug.assert(schema).is('object');
				var properties = schema.properties || {};
				debug.assert(properties).is('object');
				var columns = ['$id'].concat(Object.keys(properties)).concat(['$created', '$modified']);
				//debug.log('search_opts.limit = ', search_opts.limit, ' type of ', typeof search_opts.limit);
				return tr.count(type)(where).initDocumentBuilder(type)().search(type)(where, search_opts).then(function(tr) {
					var count = tr.fetch();
					var docs = tr.fetch();
					//debug.log('type of limit: ', typeof search_opts.limit);
					return {
						'title': 'Documents for '+type,
						'type': {
							'$type': "Type",
							'$ref': ref(req, 'api/database/types', type_obj.$name),
							'$title': 'Type '+type_obj.$name,
							'$name': type_obj.$name,
							'content': prepare_type(req, type_obj),
							'methods': {
								'$ref': ref(req, 'api/database/types', type_obj.$name, 'methods'),
								'content': prepare_methods(req, methods)
							}
						},
						'$type': 'table',
						'totalResults': count,
						'limit': limit,
						'offset': offset,
						'$columns': columns,
						'content': prepare_docs(req, docs),
						'links': [
							{
								'$ref': ref(req, 'api/database/types', type_obj.$name),
								'title': 'Type '+type_obj.$name,
								'icon': 'file-o'
							},
							{
								'$ref': ref(req, 'api/database/types', type_obj.$name, 'export/csv'),
								'title': 'Export as CSV',
								'target': '_self',
								'icon': 'cloud-download'
							},
							{
								'$ref': ref(req, 'api/database/types', type_obj.$name, 'export/xlsx'),
								'title': 'Export as XLSX',
								'target': '_self',
								'icon': 'cloud-download'
							},
							{
								'$ref': ref(req, 'api/database/types', type_obj.$name, 'export/all/csv'),
								'title': 'Export all as CSV',
								'target': '_self',
								'icon': 'cloud-download'
							},
							{
								'$ref': ref(req, 'api/database/types', type_obj.$name, 'export/all/xlsx'),
								'title': 'Export all as XLSX',
								'target': '_self',
								'icon': 'cloud-download'
							}
						]
					};
				});
			});
		});
	};
}

/** Export documents as csv
 * @returns `function(req, res)` which uses promises
 */
function export_docs_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');

	var get_docs_opts = JSON.parse(JSON.stringify(opts));
	get_docs_opts.disableDefaultSearchLimit = true;
	get_docs_opts.disableMaxSearchLimit = true;

	var get_docs = get_docs_handler(get_docs_opts);
	return function export_docs_handler_(req, res) {
		if(req.method !== 'GET') {
			throw new HTTPError(405);
		}

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

		var export_type = PATH.basename(req.url);
		var export_all = PATH.basename(PATH.dirname(req.url)) === "all";

		return _Q.when(get_docs(req, res)).then(function export_docs_handler__(body) {
			debug.log('body = ', body);

			debug.assert(body).is('object');

			var type_obj = body.type;
			debug.assert(type_obj).is('object');

			var content = body.content;
			debug.assert(content).is('array');

			var keys = ((!export_all) && type_obj && type_obj.content && type_obj.content.listFields) || norUtils.getKeys(content) || [];

			var data = [];

			// Add header
			data.push( ARRAY(keys).map(function(key) {
				var title = norUtils.getTitleFromPath(type_obj, key);
				return ''+title;
			}).valueOf() );

			// Add data
			ARRAY(content).forEach(function(obj) {
				var result = {};
				var paths = norUtils.getPathsFromData(obj);
				ARRAY(paths).forEach(function(path) {
					var key = path.join('.');
					var value = norUtils.getDataFromPath(obj, path);
					result[key] = value;
				});

				data.push( ARRAY(keys).map(function(key) {
					return ''+result[key];
				}).valueOf() );
			});

			if(Object.keys(export_handlers).indexOf(export_type) >= 0) {
				return export_handlers[export_type](req, res, data, type_obj);
			}

			throw new HTTPError(500, "Unsupported export type: " + export_type);
		});
	};
}

/** Create a new document type
 * @returns `function(req, res)` which uses promises
 */
function post_types_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		assert_logged_in(req, [
			'admin',
			'database_create_type'
		]);

		var data = req.body || {};
		debug.log('data = ', data);

		debug.assert(data).is('object');
		debug.assert(data.content).ignore(undefined).is('object');
		if(data.content) {
			debug.assert(data.content.$name).ignore(undefined).is('string');
		}
		debug.assert(data.$name).ignore(undefined).is('string');

		var content = data.content || {};
		debug.assert(content).is('object');

		var type = data.$name || content.$name;
		debug.assert(type).is('string');

		if(content.type === undefined) {
			content.type = 'object';
		}

		return nopg.transaction(opts.pg, function(tr) {
			return tr.declareType(type)(content).then(function(tr) {
				var obj = tr.fetch();
				return {
					'title': 'Declared a document type',
					'$status': 303,
					'$type': 'redirect',
					'content': prepare_type(req, obj),
					'$ref': ref(req, 'api/database/types', obj.$name)
				};
			});
		});

	};
}

/** Update document type
 * @returns `function(req, res)` which uses promises
 */
function post_type_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_update_type',
			'database_types_'+type+'_update_type'
		]);

		var data = req.body || {};
		debug.log('data = ', data);

		debug.assert(data).is('object');
		debug.assert(data.content).is('object');
		debug.assert(data.content.$name).is('string');

		var content = data.content;
		if(content.$name) {
			delete content.$name;
		}

		//if(content && content.$schema && content.$schema.properties && content.$schema.properties.name) {
		//	debug.log('input property name = ', content.$schema.properties.name);
		//}

		return nopg.transaction(opts.pg, function(tr) {
			return tr.declareType(type)(content).then(function(tr) {
				var obj = tr.fetch();
				//debug.log('result $schema = ', obj.$schema);
				return {
					'title': 'Declared a document type',
					'$status': 303,
					'$type': 'redirect',
					'content': prepare_type(req, obj),
					'$ref': ref(req, 'api/database/types', obj.$name)
				};
			});
		});

	};
}

/** Delete document type
 * @returns `function(req, res)` which uses promises
 */
function del_type_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_delete_type',
			'database_types_'+type+'_delete_type'
		]);

		return nopg.transaction(opts.pg, function(tr) {
			return tr.count(type)().then(function(tr) {
				var count = tr.fetch();
				debug.log('count = ', count);
				if(count !== 0) { throw new HTTPError(500, "Cannot delete type. You must remove documents first."); }
				return tr.deleteType(type).then(function() {
					//debug.log('result $schema = ', obj.$schema);
					return {
						'title': 'Type removed',
						'$type': 'Document',
						'content': {
							'$name': type
						}
					};
				});
			});
		});

	};
}

/** Returns form fields based on type object */
function get_form_fields(type) {
	debug.assert(type).is('object');
	var schema = type.$schema || {};
	var properties = schema.properties || {};

	var fields = [
	];

	ARRAY(Object.keys(properties)).forEach(function(key) {
		var prop = properties[key];

		if(prop.type === 'string') {
			fields.push({'type':'text','name':key, 'label':prop.title||key, 'description':prop.description||''});
		}
	});

	return fields;
}

/** Get a form to create a document
 * @returns `function(req, res)` which uses promises
 */
function get_create_doc_form(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');

	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_create_document',
			'database_types_'+type+'_create_document'
		]);

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes({'$name':type}).then(function(tr) {
				var obj = tr.fetchSingle();

				var fields = get_form_fields(obj);

				return {
					'title': 'Create a new document',
					'$type': 'form',
					'$target': ref(req, 'api/database/types', type, 'documents/create'),
					'content': fields
				};
			});
		});
	};
}

/** Create a new document
 * @returns `function(req, res)` which uses promises
 */
function post_docs_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_create_document',
			'database_types_'+type+'_create_document'
		]);

		var data = req.body || {};
		debug.log('data = ', data);

		debug.assert(data).is('object');
		debug.assert(data.content).ignore(undefined).is('object');

		var content = data.content || {};

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes({'$name':type}).then(function(tr) {
				var type_obj = tr.fetchSingle();
				var schema = type_obj.$schema || {};
				var properties = schema.properties || {};
				ARRAY(Object.keys(properties)).forEach(function(key) {
					if(data.hasOwnProperty(key)) {
						content[key] = data[key];
					}
				});

				return tr.create(type)(content).then(function(tr) {
					var obj = tr.fetch();
					return {
						'title': 'Created a document',
						'$status': 303,
						'$type': 'redirect',
						'content': prepare_doc(req, obj),
						'$ref': ref(req, 'api/database/types', obj.$type, 'documents', obj.$id)
					};
				});
			});
		});

	};
}

/** Update a document
 * @returns `function(req, res)` which uses promises
 */
function post_doc_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_update_document',
			'database_types_'+type+'_update_document'
		]);

		var id = params.id;
		debug.assert(id).is('uuid');

		var data = req.body || {};
		debug.log('data = ', data);

		debug.assert(data).is('object');
		debug.assert(data.content).is('object');

		var content = data.content;

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchSingle(type)({'$id':id}, {'typeAwareness':true}).then(function(tr) {
				var obj = tr.fetch();
				return tr.update(obj, content);
			}).then(function(tr) {
				var obj = tr.fetch();
				return {
					'title': 'Updated a document',
					'$status': 303,
					'$type': 'redirect',
					'content': prepare_doc(req, obj),
					'$ref': ref(req, 'api/database/types', obj.$type, 'documents', obj.$id)
				};
			});
		});

	};
}

/** Delete a document
 * @returns `function(req, res)` which uses promises
 */
function del_doc_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_delete_document',
			'database_types_'+type+'_delete_document'
		]);

		var id = params.id;
		debug.assert(id).is('uuid');

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchSingle(type)({'$id':id}, {'typeAwareness':true}).then(function(tr) {
				var obj = tr.fetch();
				return tr.del(obj).then(function() {
					return {
						'title': 'Deleted a document',
						'$type': 'Document',
						'content': prepare_doc(req, obj)
					};
				});
			});
		});

	};
}

/** Get methods by type
 * @returns `function(req, res)` which uses promises
 */
function get_methods_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');

	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_types_'+type,
			'database_types_'+type+'_methods'
		]);

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchMethods(type)({'$active': true}).then(function(tr) {
				var methods = tr.fetch();
				debug.assert(methods).is('array');

				return {
					'title': 'Methods for '+type,
				//	'type': prepare_type(req, type_obj),
					'$type': 'table',
					'content': prepare_methods(req, methods),
					'links': [
						/*
						{
							'$ref': ref(req, 'api/database/types', type),
							'title': 'Type '+type,
							'icon': 'file-o'
						}
						*/
					]
				};

			});
		});
	};
}

/** Create a new method
 * @returns `function(req, res)` which uses promises
 */
function post_methods_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_create_method',
			'database_types_'+type+'_create_method'
		]);

		var data = req.body || {};
		debug.log('data = ', data);

		debug.assert(data).is('object');
		debug.assert(data.content).is('object');
		var content = data.content;
		debug.assert(content.$name).is('string');
		debug.assert(content.$body).is('string');

		return nopg.transaction(opts.pg, function(tr) {
			return tr.declareMethod(type)(content.$name, content.$body).then(function(tr) {
				var obj = tr.fetch();
				return {
					'title': 'Created a method',
					'$status': 303,
					'$type': 'redirect',
					'content': prepare_method(req, obj),
					'$ref': ref(req, 'api/database/types', obj.$type, 'methods', obj.$name)
				};
			});
		});

	};
}

/** Get single method
 * @returns `function(req, res)` which uses promises
 */
function get_method_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		var name = params.name;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_types_'+type,
			'database_types_'+type+'_methods'
		]);

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchMethods(type)({'$name':name, '$active':true}).then(function(tr) {
				var methods = tr.fetch();
				var method = methods.shift();
				if(!method) { throw new HTTPError(404); }

				return {
					'title': 'Method ' +method.$type + '.' + method.$name,
					'$type': 'Method',
					'content': prepare_method(req, method),
					'links': [
					/*
						{
							'$ref': ref(req, 'api/database/types', method.$type, 'search'),
							'title': 'Search methods',
							'icon': 'search'
						},
						{
							'$ref': ref(req, 'api/database/types', method.$type, 'methods', method.$name, 'delete'),
							'title': 'Delete this method',
							'icon': 'trash-o'
						}
					*/
					]
				};
			});
		});
	};
}

/** Update a method
 * @returns `function(req, res)` which uses promises
 */
function post_method_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_update_method',
			'database_types_'+type+'_update_method'
		]);

		var name = params.name;
		debug.assert(name).is('string');

		var req_body = req.body || {};
		debug.log('req_body = ', req_body);
		debug.assert(req_body).is('object');

		var data = req_body.content || {};
		debug.assert(data).is('object');

		Object.keys(data).forEach(function(key) {
			if(key === '$body') {
				return;
			}
			if(key.charAt(0) === '$') {
				delete data[key];
			}
		});

		debug.log('data = ', data);

		debug.assert(data.$body).is('string');
		var body = data.$body;

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchMethods(type)({'$name':name, '$active': true}).then(function(tr) {
				var methods = tr.fetch();
				debug.assert(methods).is('array').length(1);
				var method = methods.shift();
				return tr.declareMethod(type)(method.$name, body, data);
			}).then(function(tr) {
				var obj = tr.fetch();
				return {
					'title': 'Updated a method',
					'$status': 303,
					'$type': 'redirect',
					'content': prepare_method(req, obj),
					'$ref': ref(req, 'api/database/types', obj.$type, 'methods', obj.$name)
				};
			});
		});

	};
}

/** Delete a method
 * @returns `function(req, res)` which uses promises
 */
function del_method_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req/*, res*/) {

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

		assert_logged_in(req, [
			'admin',
			'database_delete_method',
			'database_types_'+type+'_delete_method'
		]);

		var name = params.name;
		debug.assert(name).is('string');

		return nopg.transaction(opts.pg, function(tr) {
			return tr.getMethod(type)(name).then(function(tr) {
				var obj = tr.fetch();
				return tr.deleteMethod(type)(name).then(function() {
					return {
						'title': 'Deleted a method',
						'$type': 'Method',
						'content': prepare_method(req, obj)
					};
				});
			});
		});

	};
}

// Exports
module.exports = {
	'$get': get_types_handler,
	'createType': {
		'$get': get_create_type_form,
		'$post': post_types_handler,
	},
	'types': {
		'$get': get_types_handler,
		'$post': post_types_handler,
		':type': {
			'$get': get_type_handler,
			'$post': post_type_handler,
			'$del': del_type_handler,
			'search': {
				'$get': get_docs_handler
			},
			'export': {
				'$get': export_docs_handler,
				'csv': {'$get': export_docs_handler},
				'xlsx': {'$get': export_docs_handler},
				'all': {
					'$get': export_docs_handler,
					'csv': {'$get': export_docs_handler},
					'xlsx': {'$get': export_docs_handler}
				}
			},
			'delete': {
				'$get': get_del_type_form,
				'$post': del_type_handler,
				'$del': del_type_handler
			},
			'documents': {
				'$get': get_docs_handler,
				'$post': post_docs_handler,
				'create': {
					'$get': get_create_doc_form,
					'$post': post_docs_handler
				},
				':id': {
					'$get': get_doc_handler,
					'$post': post_doc_handler,
					'$del': del_doc_handler,
					'delete': {
						'$get': get_del_doc_form,
						'$post': del_doc_handler,
						'$del': del_doc_handler
					},
				}
			},
			'methods': {
				'$get': get_methods_handler,
				'$post': post_methods_handler,
				'create': {
					'$post': post_methods_handler
				},
				':name': {
					'$get': get_method_handler,
					'$post': post_method_handler,
					'$del': del_method_handler,
					'delete': {
						'$post': del_method_handler,
						'$del': del_method_handler
					},
				}
			}
		}
	}
};
