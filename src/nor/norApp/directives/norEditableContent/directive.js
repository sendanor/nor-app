"use strict";

require('./style.css');

var controller = require('./controller.js');
var template = require('./template.html');

/** Element for custom JSON schema */
module.exports = function nor_editable_content_directive() {
	return {
		restrict: 'A',
		scope: {
			'norOptions': '=?',
			'value': '=norEditableContent',
			onCommit: '&?'
		},
		controller: controller,
		templateUrl: template
	};
};
