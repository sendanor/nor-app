"use strict";

require('./style.css');

var controller = require('./controller.js');
var template = require('./template.html');

/* Actions */
module.exports = function nor_action_directive() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			click: '&',
			icon: '@?',
			dangerousIcon: '@?',
			title: '@?',
			classes: '@?class',
			safety: '@?'
		},
		controller: controller,
		templateUrl: template
	};
};
