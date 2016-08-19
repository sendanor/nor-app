"use strict";
var angular = require('angular');
var norApp = angular.module('norApp');
norApp.factory('norRouter', require('./norRouter/factory.js'));
norApp.factory('norUtils', require('./norUtils/factory.js'));
