"use strict";

require('./style.css');
var template = require('./template.html');
var controller = require('./controller.js');

/* Types */
module.exports = [function nor_content_directive() {
	return {
		restrict: 'E',
		scope: {
			ngModel: '='
		},
		controller: controller,
		templateUrl: template
	};
}];
