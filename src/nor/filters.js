"use strict";
var angular = require('angular');
var norApp = angular.module('norApp');
norApp.filter('prettyPrint', require('./prettyPrint/filter.js'));
norApp.filter('unique', require('./unique/filter.js'));
