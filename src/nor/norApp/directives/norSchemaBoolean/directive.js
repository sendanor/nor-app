"use strict";

var template = require('./template.html');

/** Element for boolean JSON schema */
module.exports = function nor_schema_boolean_directive() {
	return {
		restrict: 'E',
		scope: {
			key: '=',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', function($scope) {

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
