"use strict";

require('./style.css');

var template = require('./template.html');
var controller = require('./controller.js');

/* Element for any JSON schema element */
module.exports = function nor_schema_directive() {
	return {
		restrict: 'E',
		scope: {
			root: '=?',
			parent: '=?',
			path: '&?',
			key: '=?',
			value: '=',
			onCommit: '&?'
		},
		controller: controller,
		templateUrl: template
	};
};
