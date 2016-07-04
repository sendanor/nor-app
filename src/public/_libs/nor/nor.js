"use strict";

var norApp = angular.module('norApp', [
	'datatables'
]);

norApp.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
});

norApp.controller('norCtrl', function($scope, $http, $log, $location) {

	function change_scope_data(data) {
		data = data || {};
		$log.debug("new data = ", data);
		Object.keys(data).forEach(function(key) {
			$scope[key] = data[key];
		});
	}

	function get_path(path) {
		$http({
			method: 'GET',
			url: '/api' + path
		}).then(function successCallback(response) {
			change_scope_data(response.data);
		}, function errorCallback(response) {
			$log.error("error: ", response);
		});
	}

	$scope.$on('$locationChangeSuccess', function() {
		var path = $location.path();
		$log.debug("path = " + path);
		get_path(path);
	});

	//var path = $location.path();
	//$log.debug("path = " + path);
	//get_path(path);

	// Array of functions which to call when resetting
	$scope._resets = [];

	/** Reset content */
	$scope.reset = function(data) {
		$scope._resets.forEach(function(f) {
			f($scope);
		});
		if(data) {
			$log.debug("data = ", data);
			Object.keys(data).forEach(function(key) {
				$scope[key] = data[key];
			});
		}
	};

	/** Append new action to reset scope */
	$scope._addResetAction = function(f) {
		$scope._resets.push(f);
	};

	// Implement action to reset default content
	$scope._addResetAction(function() {
		$scope.$ref = undefined;
		$scope.$resource = undefined;
		$scope.$user = undefined;
		$scope.$app = {
			name: 'Unnamed-App',
			menu: []
		};
		$scope.title = 'Undefined Title';
		$scope.$type = 'default';
		$scope.content = '';
	});

	// Reset scope
	$scope.reset();

	/** @returns {string} Content display type */
	$scope.getContentType = function() {

		if($scope.$type === "form" && angular.isArray($scope.content)) {
			return "form";
		}

		if($scope.$type === "table") {
			return "table";
		}

		return "default";
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

});

norApp.controller('formCtrl', function($scope, $http, $log, $location) {

	$scope.data = {};

	$scope._addResetAction(function() {
		$scope.data = {};
	});

	/** Submit a form with HTTP POST action to REST API */
	$scope.submit = function() {
		$log.debug("form submit called: ", $scope.data );

		var path = $location.path();

		$log.debug("path = " + path);

		$http.post('/api' + path, $scope.data).then(function successCallback(response) {
			var data = response.data || {};
			$scope.reset(data);
		}, function errorCallback(response) {
			$log.error("error: ", response);
			$scope.openalert( {"type":"danger", title: "Error!", content: ""+response} );
		});
	};

});
