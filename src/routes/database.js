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
	// FIXME: This api/database/types should use configuration paths
	tmp.$ref = ref(req, 'api/database/types', tmp.$name);
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

/** Assert that we have logged in */
function assert_logged_in(req) {
	var logged_in = req.session && req.session.user ? true : false;
	if(!logged_in) {
		throw new HTTPError(403);
	}
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
		assert_logged_in(req);
		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes().then(function(tr) {
				var types = tr.fetch();
				return {
					'title': 'Types',
					'$type': 'table',
					'$columns': ['$name', '$modified'],
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

	return function(req, res) {
		assert_logged_in(req);
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

/** Get single document type
 * @returns `function(req, res)` which uses promises
 */
function get_type_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');
	return function(req, res) {
		assert_logged_in(req);

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		debug.assert(type).is('string');

		return nopg.transaction(opts.pg, function(tr) {
			return tr.searchTypes({'$name': type}).then(function(tr) {
				var types = tr.fetch();
				var type = types.shift();

				if(!type) { throw new HTTPError(404); }

				// FIXME: This api/database/:name/items should use configuration paths

				return {
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
						}
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
	return function(req, res) {

		assert_logged_in(req);

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		var id = params.id;
		debug.assert(type).is('string');

		return nopg.transaction(opts.pg, function(tr) {
			return tr.search(type)({'$id':id}, {'typeAwareness':true}).then(function(tr) {
				var docs = tr.fetch();
				var doc = docs.shift();

				if(!doc) { throw new HTTPError(404); }

				return {
					'title': 'Document ' + doc.$id,
					'$type': 'Document',
					'content': prepare_doc(req, doc),
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

		assert_logged_in(req);

		var params = req.params || {};
		debug.assert(params).is('object');
		var type = params.type;
		debug.assert(type).is('string');

		return nopg.transaction(opts.pg, function(tr) {
			return tr.search(type)(undefined, {'typeAwareness':true}).then(function(tr) {
				var docs = tr.fetch();
				return {
					'title': 'Documents for '+type,
					'$type': 'table',
					'$columns': ['$id', '$name', '$modified'],
					'content': prepare_docs(req, docs)
				};
			});
		});
	};
}

/** Create a new document type
 * @returns `function(req, res)` which uses promises
 */
function post_types_handler(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	return function(req, res) {

		assert_logged_in(req);

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
	return function(req, res) {

		assert_logged_in(req);

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

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

/** Get a form to create document
 * @returns `function(req, res)` which uses promises
 */
function get_create_doc_form(opts) {
	debug.assert(opts).ignore(undefined).is('object');
	opts = opts || {};
	debug.assert(opts.pg).is('string');

	return function(req, res) {
		assert_logged_in(req);

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

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
	return function(req, res) {
		assert_logged_in(req);

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

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
	return function(req, res) {
		assert_logged_in(req);

		var params = req.params || {};
		debug.assert(params).is('object');

		var type = params.type;
		debug.assert(type).is('string');

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

// Exports
module.exports = {
	'$get': get_types_handler,
	'createType': {
		'$get': get_create_type_form,
		'$post': post_types_handler
	},
	'types': {
		'$get': get_types_handler,
		'$post': post_types_handler,
		':type': {
			'$get': get_type_handler,
			'$post': post_type_handler,
			'search': {
				'$get': get_docs_handler
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
					'$post': post_doc_handler
				}
			}
		}
	}
};
