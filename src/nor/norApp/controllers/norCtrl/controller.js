"use strict";

//var parse_path_name = require('../../lib/parse_path_name.js');

module.exports = function($scope, norRouter) {

	// Initializes $scope.model from REST service based on the current location
	norRouter.initialize($scope, 'model');

	//$scope.keys = Object.keys;

	// Go to another resource
	//$scope.go = function(url, params) {
	//	var path = parse_path_name(url);
	//	return norRouter.go($scope, path, params);
	//};

};
