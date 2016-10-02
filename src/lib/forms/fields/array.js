"use strict";

var debug = require('nor-debug');
var any_builder = require('./_any.js');
var field_builders = require('./_all.js');

/** Returns field(s) for array elements
 * @param key {string} Field keyword
 * @param schema {object} JSON Schema for field
 * @returns {array} Array of field descriptions
 */
field_builders.array = module.exports = function(schema, key) {
	debug.assert(key).is('string');
	debug.assert(schema).is('object');

	var items = any_builder(schema.items || {}, key + '[]');

	var fields = [];
	fields.push({
		'type':'array',
		'name': key,
		'label': schema.title||key,
		'description':schema.description||'',
		'items': items,
		'$schema': schema
	});
	return fields;
};
