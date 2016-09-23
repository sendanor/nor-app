"use strict";

var debug = require('nor-debug');
var object_builder = require('./fields/object.js');

var forms = module.exports = {};

/** Returns form fields based on type object
 * @returns {array} Form field descriptions for this type
 */
forms.getFormFields = function get_form_fields(type) {
	debug.assert(type).is('object');
	var schema = type.$schema || {};
	return object_builder(schema, undefined);
};
