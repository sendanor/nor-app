"use strict";

/** Element for boolean JSON schema */
module.exports = ['$scope', function($scope) {

	$scope.enableBorder = ($scope.enableBorder === undefined) ? true : ($scope.enableBorder ? true : false);
	$scope.enableHeader = ($scope.enableHeader === undefined) ? true : ($scope.enableHeader ? true : false);
	$scope.enableInner = ($scope.enableInner === undefined) ? true : ($scope.enableInner ? true : false);
	$scope.enableSourceCode = ($scope.enableSourceCode === undefined) ? true : ($scope.enableSourceCode ? true : false);

			/** Action to do on commit */
			$scope.commit = function() {
				if($scope.onCommit) {
					return $scope.onCommit();
				}
			};

		}];
