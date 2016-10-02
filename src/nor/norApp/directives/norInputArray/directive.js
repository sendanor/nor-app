"use strict";

require('./style.css');
var template = require('./template.html');
var controller = require('./controller.js');

/** Element for string JSON schema */
module.exports = function nor_input_text_directive() {
	return {
		restrict: 'E',
		scope: {
			ngModel: '=',
			label: '=?',
			name: '=?',
			placeholder: '=?',
			onCommit: '&?'
		},
		controller: controller,
		templateUrl: template
	};
};
