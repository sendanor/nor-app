"use strict";

var angular = require("angular");

var norApp = module.exports = angular.module('norApp', [
	'datatables',
	'ngPrettyJson',
	'ngRoute'
]);

norApp.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
});

/* Setup brace */
/*var ace = */require('brace');
require('brace/mode/javascript');
require('brace/theme/monokai');

//var editor = ace.edit('javascript-editor');
//editor.getSession().setMode('ace/mode/javascript');
//editor.setTheme('ace/theme/monokai');

/* */

require('./layout/index.js');
require('./directives.js');
require('./factories.js');
require('./filters.js');
require('./controllers.js');
