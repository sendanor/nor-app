"use strict";

require('./style.css');

var template = require('./template.html');
var controller = require('./controller.js');

/* Element for object JSON Schema */
module.exports = function nor_schema_object_directive() {
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
