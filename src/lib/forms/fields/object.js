"use strict";

var debug = require('nor-debug');
var ARRAY = require('nor-array');
var any_builder = require('./_any.js');
var field_builders = require('./_all.js');

/** Returns field(s) for object element
 * @param key {string} Optional field keyword
 * @param schema {object} JSON Schema for field
 * @returns {array} Array of field descriptions
 */
field_builders.object = module.exports = function(schema, key) {
	debug.assert(key).ignore(undefined).is('string');
	debug.assert(schema).is('object');
	var properties = schema.properties || {};
	return ARRAY(Object.keys(properties)).map(function(property_key) {
		var full_key = (key ? key + '.' : '') + property_key;
		var prop = properties[property_key];
		return any_builder(prop, full_key);
	}).reduce(function(a, b) {
		return a.concat(b);
	}, []);
};
