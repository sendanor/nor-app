"use strict";

/* Element for any input element */
module.exports = ['$scope', function nor_input_controller($scope) {

	$scope.type = $scope.type || 'text';
	$scope.ngModel = $scope.ngModel || undefined;
	$scope.name = $scope.name || '';
	$scope.label = $scope.label || $scope.name || '';
	$scope.placeholder = $scope.placeholder || '';

	/** Action to do on commit */
	$scope.commit = function() {
		if($scope.onCommit) {
			return $scope.onCommit();
		}
	};

}];
