"use strict";

var template = require('./template.html');

/** Element for custom JSON schema */
module.exports = function nor_schema_custom_directive() {
	return {
		restrict: 'E',
		scope: {
			key: '=',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', function($scope) {

			/** Action to do on commit */
			$scope.commit = function(value) {
				if(value !== undefined) {
					$scope.value = value;
				}
				if($scope.onCommit) {
					return $scope.onCommit();
				}
			};

		}],
		templateUrl: template
	};
};
