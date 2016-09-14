"use strict";

require('./style.css');
var template = require('./template.html');
var controller = require('./controller.js');

/* Tables */
module.exports = function nor_view_directive() {
	return {
		restrict: 'E',
		scope: {
			ngModel: '=',
			type: '=',
			editing: '=?',
			onCommit: '&?'
		},
		controller: controller,
		templateUrl: template
	};
};
