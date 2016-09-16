"use strict";

require('./style.css');
var template = require('./template.html');
var controller = require('./controller.js');

/* Types */
module.exports = [function nor_footer_directive() {
	return {
		restrict: 'E',
		scope: {
		},
		controller: controller,
		templateUrl: template
	};
}];
