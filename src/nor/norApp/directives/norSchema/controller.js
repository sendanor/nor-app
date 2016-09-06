"use strict";

var debug = require('nor-debug');

/* Element for any JSON schema element */
module.exports = ['$scope', function nor_schema_controller($scope) {

	$scope.root = $scope.root || undefined;
	$scope.parent = $scope.parent || undefined;
	$scope.key = $scope.key || undefined;

	/** Path from root object to this value as an array */
	$scope.path = ($scope.path && $scope.path()) || [];
	//debug.log('path = ', $scope.path);

	/** Action to do on commit */
	$scope.commit = function() {
		if($scope.onCommit) {
			return $scope.onCommit();
		}
	};

}];
