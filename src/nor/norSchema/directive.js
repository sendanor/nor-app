"use strict";

require('./style.css');

var template = require('./template.html');

/* Element for any JSON schema element */
module.exports = function nor_schema_directive() {
	return {
		restrict: 'E',
		scope: {
			root: '=?',
			parent: '=?',
			path: '&?',
			key: '=?',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', function($scope, $log) {

			$scope.root = $scope.root || undefined;
			$scope.parent = $scope.parent || undefined;
			$scope.key = $scope.key || undefined;

			/** Path from root object to this value as an array */
			$scope.path = ($scope.path && $scope.path()) || [];
			$log.debug('path = ', $scope.path);

			/** Action to do on commit */
			$scope.commit = function() {
				if($scope.onCommit) {
					return $scope.onCommit();
				}
			};

		}],
		templateUrl: template
	};
};
