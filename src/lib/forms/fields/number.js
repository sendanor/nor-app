"use strict";

var debug = require('nor-debug');

/** Returns field(s) for text elements
 * @param key {string} Field keyword
 * @param schema {object} JSON Schema for field
 * @returns {array} Array of field descriptions
 */
module.exports = function(schema, key) {
	debug.assert(key).is('string');
	debug.assert(schema).is('object');
	var fields = [];
	fields.push({
		'type':'number',
		'name': key,
		'label': schema.title||key,
		'description':schema.description||''
	});
	return fields;
};
