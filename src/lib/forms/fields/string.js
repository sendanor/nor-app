"use strict";

var debug = require('nor-debug');
var field_builders = require('./_all.js');

/** Returns field(s) for text elements
 * @param key {string} Field keyword
 * @param schema {object} JSON Schema for field
 * @returns {array} Array of field descriptions
 */
field_builders.string = module.exports = function(schema, key) {
	debug.assert(key).is('string');
	debug.assert(schema).is('object');
	var fields = [];
	fields.push({
		'type':'text',
		'name':key,
		'label':schema.title||key,
		'description':schema.description||'',
		'$schema': schema
	});
	return fields;
};
