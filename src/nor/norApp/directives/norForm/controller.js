"use strict";

/* Forms */
module.exports = ['$scope', '$http', '$log', '$location', 'norRouter', function($scope, $http, $log, $location, norRouter) {

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

	// Alerts
	$scope.alerts = [];

	/** Close alert */
	$scope.closeAlert = function(alert) {
		$scope.alerts = $scope.alerts.filter(function(a) {
			return a !== alert;
		});
	};

	/** Create an alert */
	$scope.openAlert = function(alert) {
			alert = alert || {};
			alert.type = alert.type || "danger";
			alert.title = alert.title || "Unknown Alert";
			alert.content = alert.content || "";
			$scope.alerts.push( alert );
	};

}];
