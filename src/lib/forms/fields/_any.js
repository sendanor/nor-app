"use strict";

var debug = require('nor-debug');
var is = require('nor-is');

/** Returns field(s) for any object type by using type specific builder
 * @param key {string} Optional field keyword
 * @param schema {object} JSON Schema for field
 * @returns {array} Array of field descriptions
 */
module.exports = function(schema, key) {
	debug.assert(key).ignore(undefined).is('string');
	debug.assert(schema).is('object');

	require('./index.js');
	var field_builders = require('./_all.js');

	var type = schema.type || 'undefined';
	var builder;
	if(field_builders.hasOwnProperty(type)) {
		builder = field_builders[type];
	}
	if(is.func(builder)) {
		return builder(schema, key);
	}
	debug.warn('No builder for type {'+type+'} of key "' + key + '" -- not possible to create a field. Ignored.');
	return [];
};
