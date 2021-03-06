"use strict";

var template = require('./template.html');
var controller = require('./controller.js');

/* Forms */
module.exports = function norForm_directive() {
	return {
		restrict: 'E',
		scope: {
			model: '=',
			content: '=?',
		},
		controller: controller,
		templateUrl: template
	};
};
