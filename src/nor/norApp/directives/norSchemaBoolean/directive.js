"use strict";

var controller = require('./controller.js');
var template = require('./template.html');

/** Element for boolean JSON schema */
module.exports = function nor_schema_boolean_directive() {
	return {
		restrict: 'E',
		scope: {
			key: '=',
			value: '=',
			onCommit: '&?',
			enableBorder: '=?',
			enableHeader: '=?',
			enableInner: '=?',
			enableSourceCode: '=?'
		},
		controller: controller,
		templateUrl: template
	};
};
