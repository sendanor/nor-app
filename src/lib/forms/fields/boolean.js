"use strict";

var debug = require('nor-debug');
var field_builders = require('./_all.js');

/** Returns field(s) for text elements
 * @param key {string} Field keyword
 * @param schema {object} JSON Schema for field
 * @returns {array} Array of field descriptions
 */
field_builders.boolean = module.exports = function(schema, key) {
	debug.assert(schema).is('object');
	debug.assert(key).is('string');
	var fields = [];
	fields.push({
		'type':'checkbox',
		'name': key,
		'label': schema.title||key,
		'description':schema.description||'',
		'$schema': schema
	});
	return fields;
};
