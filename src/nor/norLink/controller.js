"use strict";

var parse_path_name = require('../lib/parse_path_name.js');
var template = require('./template.html');

/* Links */
module.exports = ['$scope', 'norRouter', function norLink_controller($scope, norRouter) {

	if($scope.link) {
		if($scope.link.$ref && (!$scope.ref)) {
			$scope.ref = $scope.link.$ref;
		}
		if($scope.link.icon && (!$scope.icon)) {
			$scope.icon = $scope.link.icon;
		}
		if($scope.link.target && (!$scope.target)) {
			$scope.target = $scope.link.target;
		}
	}

	if(!$scope.target) {
		$scope.target = 'hypermedia';
	}

	$scope.parsePathName = parse_path_name;

	/** Go to another resource */
	$scope.go = function(url, params) {
		var path = parse_path_name(url);
		return norRouter.go($scope, path, params);
	};

}];
