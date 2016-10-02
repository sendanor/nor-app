"use strict";

//var debug = require('nor-debug');

/** Element for string JSON schema */
module.exports = ['$scope', function($scope) {
	$scope.ngModel = $scope.ngModel || false;
	$scope.type = 'checkbox';
	$scope.name = $scope.name || '';
	$scope.label = $scope.label || $scope.name || '';
	$scope.placeholder = $scope.placeholder || '';
}];
