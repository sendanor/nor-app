"use strict";

var template = require('./template.html');
var controller = require('./controller.js');

/* Types */
module.exports = [function nor_type_directive() {
	return {
		restrict: 'E',
		scope: {
			methods: '=',
			content: '=',
			onCommit: '&?'
		},
		controller: controller,
		templateUrl: template
	};
}];
