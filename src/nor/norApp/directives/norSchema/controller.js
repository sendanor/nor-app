"use strict";

//var debug = require('nor-debug');

/* Element for any JSON schema element */
module.exports = ['$scope', function nor_schema_controller($scope) {

	$scope.enableBorder = ($scope.enableBorder === undefined) ? true : ($scope.enableBorder ? true : false);
	$scope.enableHeader = ($scope.enableHeader === undefined) ? true : ($scope.enableHeader ? true : false);
	$scope.enableInner = ($scope.enableInner === undefined) ? true : ($scope.enableInner ? true : false);
	$scope.enableSourceCode = ($scope.enableSourceCode === undefined) ? true : ($scope.enableSourceCode ? true : false);

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
