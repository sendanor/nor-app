"use strict";

var angular = require("angular");

var parse_path_name = require('../lib/parse_path_name.js');

module.exports = function($scope, $http, $log, $location, norRouter) {

	norRouter.initialize($scope);

	$scope.keys = Object.keys;
	$scope.parsePathName = parse_path_name;

	/** Go to another resource */
	$scope.go = function(url, params) {
		var path = parse_path_name(url);
		return norRouter.go($scope, path, params);
	};

	/** @returns {string} Content display type */
	$scope.getContentType = function() {

		var model = $scope.model || {};
		//var content = model.content;
		var type = model.$type;

		//$log.debug('type = ', type);

		if(type === "form" && angular.isArray(model.content)) {
			return "form";
		}

		if(type === "table") {
			return "table";
		}

		if(type === "Type") {
			return "Type";
		}

		if(type === "Document") {
			return "record";
		}

		if(type === "redirect") {
			return "record";
		}

		if(type === "error") {
			return "record";
		}

		if(type === "record") {
			return "record";
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

};
