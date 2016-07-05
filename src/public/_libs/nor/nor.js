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

	function initialize_page(path) {
		$scope.reset();
		$http({
			method: 'GET',
			url: '/api' + path
		}).then(function successCallback(response) {
			change_scope_data(response.data);
		}, function errorCallback(response) {
			$log.error("error: ", response);
		});
	}

	$scope.keys = Object.keys;

	$scope.$on('$locationChangeSuccess', function() {
		var path = $location.path();
		$log.debug("path = " + path);
		initialize_page(path);
	});

	function parse_path_name(url) {
		if(!url) {
			return;
		}
		var tmp = url.split('/api/');
		tmp.shift();
		return '/' + tmp.join('/api/');
	}
	$scope.path = parse_path_name;

	/** Go to another resource */
	$scope.go = function(url) {
		var path = parse_path_name(url);
		$location.path(path);
		initialize_path(path);
	};

	//var path = $location.path();
	//$log.debug("path = " + path);
	//initialize_page(path);

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
		$scope.links = undefined;
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

		if($scope.$type === "redirect") {
			return "record";
		}

		if($scope.$type === "error") {
			return "record";
		}

		if($scope.$type === "record") {
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

/* Links */
norApp.directive('norLink', function() {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {
			link: '=?',
			ref: '=?',
			icon: '=?',
			classes: '@?class'
		},
		controller: ['$scope', '$location', function($scope, $location) {

			if($scope.link) {
				if($scope.link.$ref && (!$scope.ref)) {
					$scope.ref = $scope.link.$ref;
				}
				if($scope.link.icon && (!$scope.icon)) {
					$scope.icon = $scope.link.icon;
				}
			}

			function parse_path_name(url) {
				if(!url) {
					return;
				}
				var tmp = url.split('/api/');
				tmp.shift();
				return '/' + tmp.join('/api/');
			}

			$scope.path = parse_path_name;

			/** Go to another resource */
			$scope.go = function(url) {
				var path = parse_path_name(url);
				$location.path(path);
			};

		}],
		template: '<a href="{{path(ref)}}" ng-click="go(ref)" ng-class="classes"><i class="fa fa-{{icon}}" aria-hidden="true" ng-if="icon"></i> <ng-transclude></ng-transclude></a>'
	};
});

/* Records */
norApp.directive('norRecord', function() {
	return {
		restrict: 'E',
		replace: true,
		//require: '^^norLink',
		//transclude: true,
		scope: {
			content: '='
		},
		controller: ['$scope', '$log', function($scope, $log) {

			/** */
			$scope.get_type = function(obj) {
				if(obj && (typeof obj === 'object') && (obj instanceof Array)) {
					return 'array';
				}
				if(obj && (typeof obj === 'object')) {
					return 'object';
				}
				return 'default';
			};

			/** */
			$scope.keys = [];

			/** Append keys from object to $scope.keys */
			function _append_keys(parent, keys) {

				if(!keys) {
					keys = [];
				}

				Object.keys(parent).forEach(function(key) {
					var data = parent[key];
					if(data && (typeof data === 'object')) {
						_append_keys(data, keys.concat([key]) );
					} else {
						$scope.keys.push(keys.concat([key]));
					}

				});
			}

			_append_keys($scope.content);

			/**
			 * @param key {string} The path to the value
			 * @returns value at the place for key
			 */
			function _get_content(data, keys) {

				if(keys.length === 1) {
					return data && data[keys[0]];
				}

				if(keys.length >= 2) {
					return data && _get_content(data[keys[0]], keys.slice(1) );
				}

			};

			/**
			 * @param key {string} The path to the value
			 * @returns value at the place for key
			 */
			$scope.get_content = function(keys) {
				return _get_content($scope.content, keys);
			};

		}],
		templateUrl: '/_libs/nor/record.html'
	};
});
