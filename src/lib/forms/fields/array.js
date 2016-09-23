"use strict";

var debug = require('nor-debug');

/** Returns field(s) for array elements
 * @param key {string} Field keyword
 * @param schema {object} JSON Schema for field
 * @returns {array} Array of field descriptions
 */
module.exports = function(schema, key) {
	debug.assert(schema).is('object');
	debug.assert(key).is('string');
	var fields = [];
	/*
	fields.push({
		'type':'array',
		'name': key,
		'label': schema.title||key,
		'description':schema.description||''
	});
	*/
	return fields;
};
