"use strict";

require('./style.css');
var template = require('./template.html');
var controller = require('./controller.js');

/* Tables */
module.exports = function nor_table_directive() {
	return {
		restrict: 'E',
		scope: {
			ngModel: '=',
			onCommit: '&?'
		},
		controller: controller,
		templateUrl: template
	};
};
