"use strict";

require('./style.css');
var template = require('./template.html');
var controller = require('./controller.js');

/** Element for string JSON schema */
module.exports = function nor_schema_string_directive() {
	return {
		restrict: 'E',
		scope: {
			root: '=?',
			parent: '=?',
			path: '&?',
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
