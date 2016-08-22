"use strict";

/* Actions */
module.exports = ['$scope', '$timeout', '$q', function nor_action_controller($scope, $timeout, $q) {

			$scope.safety = $scope.safety === 'enabled';
			$scope.title = $scope.title || '';
			$scope.state = true;
			$scope.icon = $scope.icon || undefined;
			$scope.dangerousIcon = $scope.dangerousIcon || $scope.icon;

			/** Turn off safety for a moment */
			$scope.safetyOff = function() {
				$scope.state = 'loading';
				$timeout(function() {
					$scope.state = false;
					$timeout(function() {
						$scope.state = true;
					}, 5000);
				}, 500);
			};

			/** */
			$scope.execute = function() {
				$scope.state = 'loading';
				function fin() {
					$scope.state = true;
				}
				return $q.when($scope.click()).then(fin, fin);
			};

}];
