"use strict";

var template = require('./template.html');

/* Forms */
module.exports = function norForm_directive() {
	return {
		restrict: 'E',
		scope: {
			model: '=',
			content: '=?',
		},
		controller: ['$scope', '$http', '$log', '$location', 'norRouter', function($scope, $http, $log, $location, norRouter) {

			$scope.content = $scope.content || ($scope.model && $scope.model.content) || [];

			$scope.data = {};

			//norRouter.addResetAction(function() {
			//	$scope.data = {};
			//});

			/** Submit a form with HTTP POST action to REST API */
			$scope.submit = function() {
				$log.debug("form submit called: ", $scope.data );

				var path = $scope.model.$target || $location.path();
				norRouter.post(path, $scope.data).then(function(data) {
					$log.debug('data = ', data);
					//norRouter.reset();
					//norRouter.changeScopeData($scope.model, data);
					$scope.data = {};
					norRouter.resetModel($scope.model, data);
				}, function errorCallback(response) {
					$log.error("error: ", response);
				});

			};

		}],
		templateUrl: template
	};
};
