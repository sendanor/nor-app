"use strict";

var parse_path_name = require('../lib/parse_path_name.js');
var template = require('./template.html');
var controller = require('./controller.js');

/* Links */
module.exports = function norLink_directive() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			link: '=?',
			ref: '=?',
			icon: '=?',
			target: '=?',
			classes: '@?class'
		},
		controller: controller,
		templateUrl: template
	};
};
