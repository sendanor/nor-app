"use strict";

var debug = require('nor-debug');
var is = require('nor-is');
var ARRAY = require('nor-array');
var field_builders = require('./index.js');

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
		var type = prop.type || 'undefined';
		var builder;
		if(field_builders.hasOwnProperty(type)) {
			builder = field_builders[type];
		}
		if(is.func(builder)) {
			return builder(prop, full_key);
		}
		debug.warn('No builder for type '+type+' of key ' + full_key + ' -- not possible to create a field. Ignored.');
		return [];
	}).reduce(function(a, b) {
		return a.concat(b);
	}, []);

};
