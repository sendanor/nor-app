"use strict";

// Required for ngPrettyJson
//require('ng-prettyjson/src/ng-prettyjson-tmpl.js');

// ngPrettyJson requires ACE
//require('ace/ace');
//require('ng-prettyjson-js');

// Setup angular module
var angular = require("angular");

var app = module.exports = angular.module('norApp', [
	'datatables',
	'ngPrettyJson',
	'ngRoute',
	'ui.ace',
	'ui.sortable',
	'ngDragDrop'
]);

app.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
});
