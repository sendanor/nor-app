"use strict";

/** Element for custom JSON schema */
module.exports = ['$scope', '$log', '$timeout', function($scope, $log, $timeout) {

			$scope.editing = false;
			$scope.norOptions = $scope.norOptions || undefined;
			$scope.value = $scope.value || undefined;
			$scope.option = $scope.value;

			/* */
			$scope.edit = function(editing) {
				$log.debug('editing = ', editing);
				$scope.editing = editing ? true : false;
			};

			/** Disable editing with a delay */
			$scope.blur = function() {
				$timeout(function(){
					$scope.edit(false);
				}, 125);
			};

			/* */
			$scope.updateValue = function(option) {
				$scope.value = option;
				$scope.option = option;
			};

			/* */
			$scope.commit = function(value) {

				// Trigger .onCommit() once when next change
				$log.debug('norEditableContent started listening value');
				var listener = $scope.$watch('value', function() {
					listener();
					$log.debug('norEditableContent stopped listening value');
					if($scope.onCommit) {
						$log.debug('Triggering norEditableContent.onCommit()');
						return $scope.onCommit();
					}
				});

				value = value || '';

				$scope.editing = false;
				$scope.option = value;
				$scope.value = value;

			};

		}];
