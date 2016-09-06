"use strict";

require('./style.css');
var template = require('./template.html');
var controller = require('./controller.js');

/* Types */
module.exports = [function nor_type_directive() {
	return {
		restrict: 'E',
		scope: {
			content: '=',
			onCommit: '&?'
		},
		controller: controller,
		templateUrl: template
	};
}];
