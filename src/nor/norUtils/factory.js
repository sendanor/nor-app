"use strict";

var angular = require("angular");

var tv4 = require('tv4');

/** Common utilities */
module.exports = function nor_utils_factory($log) {
	var norUtils = {};

	/** Returns true if string */
	norUtils.isArray = angular.isArray;
	norUtils.isDefined = angular.isDefined;
	norUtils.isFunction = angular.isFunction;
	norUtils.isNumber = angular.isNumber;
	norUtils.isObject = angular.isObject;
	norUtils.isString = angular.isString;
	norUtils.isUndefined = angular.isUndefined;

	/** Returns true if UUID */
	norUtils.isUUID = function norUtils_isUUID(x) {
		return /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(x);
	};

	/** Returns true if null */
	norUtils.isNull = function(x) {
		return (x === null) ? true : false;
	};

	/** Returns true if boolean */
	norUtils.isBoolean = function(obj) {
		return (typeof obj === 'boolean') || (obj instanceof Boolean);
	};

	/** Returns the type of `obj` */
	norUtils.getType = function(obj) {
		if(norUtils.isUndefined(obj)) { return 'undefined'; }
		if(norUtils.isFunction(obj)) { return 'function'; }
		if(norUtils.isArray(obj)) { return 'array'; }
		if(norUtils.isObject(obj)) { return 'object'; }
		if(norUtils.isString(obj)) { return 'string'; }
		if(norUtils.isNumber(obj)) { return 'number'; }
		if(norUtils.isNull(obj)) { return 'null'; }
		if(norUtils.isBoolean(obj)) { return 'boolean'; }
		return 'unknown';
	};

	/** Parses all full paths to generic data from a JSON Schema (no paths to arrays and objects, only generic data). Paths are arrays of property keywords. */
	var pathParsers = {};

	/** Parse full paths to data from any JSON Schema value
	 * @param value {object} Any JSON Schema object
	 * @param path {array} Path to parent as an array of properties as a string.
	 * @returns {array} Array of arrays.
	  */
	pathParsers.any = function parse_value(value, path) {
		if(!value) { throw new TypeError("!schema"); }
		if(!path) { throw new TypeError("!path"); }

		if(value.type === 'object') {
			return pathParsers.object(value, [].concat(path));
		}

		if(value.type === 'array') {
			return pathParsers.array(value, [].concat(path));
		}

		return [[].concat(path)];
	};

	/** Handle (sub) arrays */
	pathParsers.array = function get_columns_from_array(schema, path) {
		if(!schema) { throw new TypeError("!schema"); }
		if(!path) { throw new TypeError("!path"); }

		//var items = schema.items || {};
		//pathParsers.any(items, [].concat(path) );

		return [[].concat(path)];
	};

	/** Handle (sub) objects */
	pathParsers.object = function get_columns_from_object(schema, path) {
		if(!schema) { throw new TypeError("!schema"); }
		if(!path) { throw new TypeError("!path"); }
		var properties = schema.properties || {};
		return Object.keys(properties).map(function(key) {
			var value = properties[key];
			return pathParsers.any(value, [].concat(path).concat([key]));
		}).reduce(function(a, b) {
			return a.concat(b);
		}, []);
	};

	norUtils.pathParsers = pathParsers;

	/** Returns a path array -- an array of properties
	 * @param path {array|string} Path as a string or array.
	 * @returns {array} Array of properties.
	 */
	norUtils.parsePathArray = function norUtils_parsePathArray(path) {
		if(!path) { throw new TypeError("!path"); }
		if(norUtils.isArray(path)) {
			return [].concat(path);
		}
		if(norUtils.isString(path)) {
			return path.split('.');
		}
		throw new TypeError("path is in unknown format: " + typeof path);
	};

	/** Detect JSON schema from data
	 * @param value {any} Any variable
	 * @returns {object} JSON Schema for value
	 */
	norUtils.detectSchema = function norUtils_detectSchema(value) {
		if(norUtils.isArray(value)) {
			return {'type':'array'};
		}
		if(norUtils.isObject(value)) {
			return {'type':'object'};
		}
		if(norUtils.isString(value)) {
			return {'type':'string'};
		}
		if(norUtils.isNumber(value)) {
			return {'type':'number'};
		}
		if(norUtils.isBoolean(value)) {
			return {'type':'boolean'};
		}
		if(norUtils.isNull(value)) {
			return {'type':'null'};
		}
		throw new TypeError("Unknown type {" + (typeof value) + "} for: " + value);
	};

	/** A pointer object to data which makes possible to change the data */
	function DataPointer(parent, key) {
		if(!norUtils.isString(key)) { throw new TypeError("!key"); }
		if(!norUtils.isObject(parent)) { throw new TypeError("!parent"); }
		this._key = key;
		this._parent = parent;
		this._root = undefined;
		this._path = undefined;
		this._documents = undefined;
	}

	/** Set root object and path to element */
	DataPointer.prototype.setRootPath = function(root, path, documents) {
		this._root = root;
		this._path = path;
		this._documents = documents;
		return this;
	};

	/** Returns the root object */
	DataPointer.prototype.getRoot = function() {
		return this._root;
	};

	/** Returns the path to root object */
	DataPointer.prototype.getPath = function() {
		return this._path;
	};

	/** */
	DataPointer.prototype.valueOf = function() {
		return this._parent[this._key];
	};

	/** */
	DataPointer.prototype.toString = function() {
		return ''+this._parent[this._key];
	};

	/** */
	DataPointer.prototype.toJSON = function() {
		return this._parent[this._key];
	};

	/** */
	DataPointer.prototype.hasData = function() {
		if(!this._parent) { return false; }
		return this._parent.hasOwnProperty(this._key);
	};

	/** */
	DataPointer.prototype.getData = function() {
		return this._parent[this._key];
	};

	/** */
	DataPointer.prototype.setData = function(value) {
		this._parent[this._key] = value;
		return this;
	};

	/** Returns automatically detected basic JSON Schema for data at this pointer */
	DataPointer.prototype.detectSchema = function() {
		return norUtils.detectSchema(this._parent[this._key]);
	};

	/** A pointer object to data which makes possible to change the data */
	function SchemaPointer(parent, key) {
		if(!norUtils.isString(key)) { throw new TypeError("!key"); }
		if(!norUtils.isObject(parent)) { throw new TypeError("!parent"); }
		this._key = key;
		this._parent = parent;
	}

	/** */
	SchemaPointer.prototype.valueOf = function() {
		return this._parent.properties[this._key];
	};

	/** */
	SchemaPointer.prototype.toString = function() {
		return ''+this._parent.properties[this._key];
	};

	/** */
	SchemaPointer.prototype.toJSON = function() {
		return this._parent.properties[this._key];
	};

	/** */
	SchemaPointer.prototype.hasSchema = function() {
		if(!this._parent) { return false; }
		if(!this._parent.properties) { return false; }
		return this._parent.properties.hasOwnProperty(this._key);
	};

	/** */
	SchemaPointer.prototype.getSchema = function() {
		if(!this._parent) { throw new TypeError("!this.parent"); }
		if(!this._parent.properties) { throw new TypeError("!this.parent.properties"); }
		return this._parent.properties[this._key];
	};

	/** */
	SchemaPointer.prototype.setSchema = function(value) {
		if(!this._parent.hasOwnProperty('properties')) {
			this._parent.properties = {};
		}
		this._parent.properties[this._key] = value;
		return this;
	};

	/** Set root object and path to element */
	SchemaPointer.prototype.setRootPath = function(root, path, documents) {
		this._root = root;
		this._path = path;
		this._documents = documents;
		return this;
	};

	/** Returns the root object */
	SchemaPointer.prototype.getRoot = function() {
		return this._root;
	};

	/** Returns the path to root object */
	SchemaPointer.prototype.getPath = function() {
		return this._path;
	};

	/** A pointer object to data which makes possible to change the data */
	function Pointer(data_pointer, schema_pointer) {
		if(!norUtils.isObject(data_pointer)) { throw new TypeError("!data_pointer"); }
		if(! ( (schema_pointer === undefined) || norUtils.isObject(schema_pointer) ) ) { throw new TypeError("!schema_pointer"); }
		this._data = data_pointer;
		this._schema = schema_pointer;
	}

	/** */
	Pointer.prototype.toString = function() {
		return this._data.toString();
	};

	/** */
	Pointer.prototype.toJSON = function() {
		return this._data.toJSON();
	};

	/** Returns true if pointer can set a schema */
	Pointer.prototype.canSetSchema = function() {
		return this._schema ? true : false;
	};

	/** Returns true if pointer has data */
	Pointer.prototype.hasData = function() {
		return this._data.hasData();
	};

	/** Returns true if pointer has schema */
	Pointer.prototype.hasSchema = function() {
		if(!this._schema) { return false; }
		return this._schema.hasSchema();
	};

	/** */
	Pointer.prototype.getSchema = function() {
		if(this._schema) {
			return this._schema.getSchema();
		}
	};

	/** */
	Pointer.prototype.setSchema = function(value) {
		if(this._schema) {
			this._schema.setSchema(value);
		} else {
			throw new TypeError("Cannot set a schema, no pointer to it!");
		}
		return this;
	};

	/** */
	Pointer.prototype.getData = function() {
		return this._data.getData();
	};

	/** */
	Pointer.prototype.setData = function(value) {
		this._data.setData(value);
		return this;
	};

	/** */
	Pointer.prototype.validate = function() {
		var data = this.getData();
		if(!this.hasSchema()) {
			return true;
		}
		var schema = this.getSchema();
		if(schema) {
			return tv4.validate(data, schema);
		}
	};

	/** */
	Pointer.prototype.getRootData = function() {
		return this._data.getRoot();
	};

	/** */
	Pointer.prototype.getPath = function() {
		return this._data.getPath();
	};

	/** */
	Pointer.prototype.detectSchema = function() {
		return this._data.detectSchema();
	};

	/** */
	Pointer.prototype.getRootSchema = function() {
		if(this._schema) {
			return this._schema.getRoot();
		}
	};

	/** Returns an array of paths to each non-object data in a NoPg type object
	 * @param type {object} The NoPG type object
	 * @returns {array} Array of paths. Each path is also an array with each property as a string.
	 */
	norUtils.getPathsFromType = function norUtils_getPathsFromType(type) {
		if(!type) { throw new TypeError("!type"); }

		// Default expected columns
		var columns = [['$id'], ['$created'], ['$modified']];
		if(type.$schema) {
			columns = columns.concat(pathParsers.any(type.$schema, []));
		}
		return columns;
	};

	/** Returns an array of paths to each non-object data in an object
	 * @param parent {object} The data object
	 * @param path {array|string} The path to parent
	 * @returns {array} Array of paths. Each path is also an array with each property as a string.
	 */
	norUtils.getPathsFromData = function norUtils_getPathsFromData(parent, path) {
		if(!parent) { throw new TypeError("!parent"); }
		path = norUtils.parsePathArray(path || []);
		var documents = parent.$documents || {};
		return Object.keys(parent).map(function(key) {
			var data = parent[key];
			var data_path = [].concat(path).concat([key]);

			// Skip $documents
			if(key === '$documents') {
				return [];
			}

			if(data && (typeof data === 'object')) {
				return norUtils_getPathsFromData(data, data_path );
			} else {

				// Check if there is an external document available for this element
				if(norUtils.isString(data) && norUtils.isUUID(data) && documents.hasOwnProperty(data)) {
					return [data_path].concat( norUtils_getPathsFromData(documents[data], data_path ) );
				}

				return [[].concat(path).concat([key])];
			}
		}).reduce(function(a, b) {
			return a.concat(b);
		}, []);
	};

	/** Returns pointer object to the JSON schema of a (sub) property
	 * @param schema {object} The full JSON schema
	 * @param path {array} Path as an array of property names (as string)
	 * @returns {object} Pointer object which can be used to get or set a JSON Schema for this property
	 */
	norUtils.getSchemaPointerFromPath = function norUtils_getSchemaPointerFromPath(schema, path) {

		function return_wrapper(pointer) {
			if(pointer) {
				pointer.setRootPath(schema, path);
			}
			return pointer;
		}

		if(!schema) {
			$log.debug("schema does not exist");
			return;
		}

		if(schema.$schema) {
			return norUtils_getSchemaPointerFromPath(schema.$schema, path);
		}

		if(!path) { throw new TypeError("!path"); }
		path = norUtils.parsePathArray(path);

		if(path.length <= 0) {
			throw new TypeError("No path!");
		}

		if(schema.type !== "object") {
			throw new TypeError("Schema was not JSONSchema object: " + JSON.stringify(schema));
		}

		if(path.length === 1) {
			return return_wrapper(new SchemaPointer(schema, path[0]));
		}

		var properties = schema.properties || {};
		var key = path[0];

		if(!properties.hasOwnProperty(key)) {
			return;
		}

		return return_wrapper( norUtils_getSchemaPointerFromPath(properties[key], path.slice(1) ) );

	};

	/** Returns the JSON schema of a (sub) property
	 * @param schema {object} The full JSON schema
	 * @param path {array} Path as an array of property names (as string)
	 * @returns {object} JSON Schema for this property
	 */
	norUtils.getSchemaFromPath = function norUtils_getSchemaFromPath(schema, path) {
		var pointer = norUtils.getSchemaPointerFromPath(schema, path);
		if(pointer) {
			return pointer.getSchema();
		}
	};

	/** Get a pointer object to data which makes possible to change the data.
	 * @param key {string} The path to the value
	 * @returns {object} An object with specific interface to change the data in this path
	 */
	norUtils.getDataPointerFromPath = function get_data_pointer_from_path(data, path, documents) {

		function return_wrapper(pointer) {
			if(pointer) {
				pointer.setRootPath(data, path, documents);
			}
			return pointer;
		}

		if(!path) { throw new TypeError("!path"); }
		path = norUtils.parsePathArray(path);
		//$log.debug("data = ", data);
		//$log.debug("path = ", path);
		//$log.debug("documents = ", documents);

		if(!data) {
			return;
		}

		// FIXME: Enable support for possible sub documents
		if( documents && data.hasOwnProperty('$documents') ) {
			$log.warn("Document had multiple $documents, only first one was used.");
		}

		if( (documents === undefined) && data && data.hasOwnProperty('$documents') ) {
			documents = data.$documents;
		}

		if(documents && (!norUtils.isObject(documents)) ) { throw new TypeError("documents not object!"); }

		//$log.debug("documents = ", documents);

		if(path.length === 0) {
			throw new TypeError("path is empty");
		}

		var key = path[0];
		var parent = data;
		var value = parent[key];
		//$log.debug("key = ", key);
		//$log.debug("value = ", value);
		//$log.debug("parent = ", parent);

		if(path.length === 1) {
			if(!norUtils.isObject(parent)) { throw new TypeError("parent not object!"); }
			return return_wrapper(new DataPointer(parent, key));
		}

		// Check if there is an external document available for this element
		if(norUtils.isString(value) && norUtils.isUUID(value) && documents && documents.hasOwnProperty(value)) {
			key = value;
			parent = documents;
			value = parent[key];
			//$log.debug("key = ", key);
			//$log.debug("value = ", value);
			//$log.debug("parent = ", parent);
		}

		if(path.length >= 2) {
			if(!norUtils.isObject(value)) { throw new TypeError("value not object!"); }
			return return_wrapper( get_data_pointer_from_path(value, path.slice(1), documents ) );
		}
	};

	/**
	 * @param key {string} The path to the value
	 * @returns value at the place for key
	 */
	norUtils.getDataFromPath = function get_data_from_path(data, path) {
		if(!path) { throw new TypeError("!path"); }
		var pointer = norUtils.getDataPointerFromPath(data, path);
		if(pointer) {
			return pointer.getData();
		}
	};

	/** Returns the title of element from path
	 * @param schema {object} NoPg Type Object or JSON Schema
	 * @param path {array} Path as an array of property names (as string)
	 * @returns {object} JSON Schema for this property
	 */
	norUtils.getTitleFromPath = function get_title_from_path(schema, path) {
		var pointer = norUtils.getSchemaPointerFromPath(schema, path);
		if( (!pointer) || (!pointer.hasSchema()) ) {
			return path.join('.');
		}
		schema = pointer.getSchema();
		return (schema && schema.title) || path.join('.');
	};

	/** Returns the description of element from path
	 * @param schema {object} NoPg Type Object or JSON Schema
	 * @param path {array} Path as an array of property names (as string)
	 * @returns {object} JSON Schema for this property
	 */
	norUtils.getDescriptionFromPath = function get_description_from_path(schema, path) {
		var pointer = norUtils.getSchemaPointerFromPath(schema, path);
		if( (!pointer) || (!pointer.hasSchema()) ) {
			return '';
		}
		schema = pointer.getSchema();
		return (schema && schema.description) || '';
	};

	/** Returns a Pointer to path, which is both SchemaPointer and DataPointer */
	norUtils.getPointerFromPath = function(data, type, path) {
		if(!data) { throw new TypeError("!data"); }
		if(!type) { throw new TypeError("!type"); }
		var data_pointer = norUtils.getDataPointerFromPath(data, path);
		var schema_pointer = norUtils.getSchemaPointerFromPath(type, path);
		return new Pointer(data_pointer, schema_pointer);
	};

	/** Create missing objects and set schema to `value` for `path`
	 * @param schema {object} Schema object
	 * @param path {array} Path
	 * @returns {boolean} True if something was changed
	 */
	norUtils.setMissingPath = function norUtils_setMissingPath(schema, path, value) {
		var changed = false;
		if(!norUtils.isObject(value)) { throw new TypeError("!value"); }
		if(!norUtils.isObject(schema)) { throw new TypeError("!schema"); }
		if(!path) { throw new TypeError("!path"); }
		path = norUtils.parsePathArray(path);

		if(path.length <= 0) {
			throw new TypeError("Path is empty");
		}

		if(!schema.hasOwnProperty('type')) {
			schema.type = 'object';
			changed = true;
		}

		if(schema.type !== 'object') {
			throw new TypeError("Cannot create property for type: " + schema.type);
		}

		if(!schema.hasOwnProperty('properties')) {
			changed = true;
			schema.properties = {};
		}

		var key = path[0];

		if(!schema.properties.hasOwnProperty(key)) {
			changed = true;
			schema.properties[key] = {};
		}

		if(path.length === 1) {
			changed = true;
			schema.properties[key] = value;
			return true;
		}

		if(path.length >= 2) {
			if(norUtils_setMissingPath(schema.properties[key], path.slice(1), value )) {
				changed = true;
			}
			return changed;
		}

		return changed;
	};

	/** Detect missing settings based on data
	 * @param data {object} Data object (used to find new settings)
	 * @param type {object} Type object
	 * @returns {boolean} True if type object was changed
	 */
	norUtils.detectMissingSettings = function norUtils_detectSchema(data, type) {
		if(!norUtils.isObject(data)) { throw new TypeError("!data"); }
		if(!norUtils.isObject(type)) { throw new TypeError("!type"); }
		var changed = false;
		var keys = norUtils.getPathsFromData(data);
		keys.forEach(function(path) {
			var pointer = norUtils.getPointerFromPath(data, type, path);
			if( pointer && pointer.hasSchema() ) {
				return;
			}

			var schema = pointer.detectSchema();

			if(pointer && pointer.canSetSchema()) {
				changed = true;
				pointer.setSchema(schema);
				return;
			}

			if(norUtils.setMissingPath(type.$schema, path, schema)) {
				changed = true;
			}

		});

		return changed;
	};

	// Exports
	return norUtils;
};
