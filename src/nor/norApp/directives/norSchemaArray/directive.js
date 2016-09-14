"use strict";

require('./style.css');
var template = require('./template.html');
var controller = require('./controller.js');

/* Element for array JSON Schema */
module.exports = function norSchemaArray_directive() {
	return {
		restrict: 'E',
		scope: {
			root: '=?',
			parent: '=?',
			path: '&?',
			key: '=?',
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
