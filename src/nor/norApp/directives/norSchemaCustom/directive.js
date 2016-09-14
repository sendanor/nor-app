"use strict";

var template = require('./template.html');
var controller = require('./controller.js');

/** Element for custom JSON schema */
module.exports = function nor_schema_custom_directive() {
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
