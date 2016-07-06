"use strict";

/** Returns the resource suffix part of an API URL */
function parse_path_name(url) {
	if(!url) {
		return;
	}
	var tmp = url.split('/api/');
	tmp.shift();
	return '/' + tmp.join('/api/');
}

var norApp = angular.module('norApp', [
	'datatables'
]);

norApp.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
});

/** */
norApp.factory('norRouter', ['$http', '$log', '$location', function($http, $log, $location) {

	/** Array of functions which to call when resetting */
	//var _resets = [];

	/** */
	/*
	function change_scope_data($scope, data) {
		data = data || {};
		$log.debug("new data = ", data);
		Object.keys(data).forEach(function(key) {
			$scope[key] = data[key];
		});
	}
	*/

	/** Reset content */
	//function reset_scopes() {
	//	_resets.forEach(function(f) {
	//		f();
	//	});
	//}

	/** Append new action to reset scope */
	//function add_reset_action(f) {
	//	_resets.push(f);
	//}

	/** */
	function do_get(path) {
		//reset_scopes();
		if(!path) { throw new TypeError("!path"); }
		return $http({
			method: 'GET',
			url: '/api' + path
		}).then(function successCallback(response) {
			if($location.path() !== path) {
				$location.path(path);
			}
			return response.data || {};
		});
	}

	/** Go to page */
	function do_go($scope, path) {
		if(!$scope) { throw new TypeError("!$scope"); }
		if(!path) { throw new TypeError("!path"); }
		return do_get(path).then(function(data) {
			//change_scope_data($scope, data);
			reset_model($scope.model, data);
			return data;
		}, function errorCallback(response) {
			$log.error("error: ", response);
		});
	}

	/** */
	function initialize($scope) {
		if(!$scope) { throw new TypeError("!$scope"); }

		$scope.model = {};

		$scope.$on('$locationChangeSuccess', function() {
			var path = $location.path();
			$log.debug("path = " + path);
			do_go($scope, path);
			//do_get(path).then(function(data) {
			//	//change_scope_data($scope, data);
			//	$scope.model = data;
			//}, function errorCallback(response) {
			//	$log.error("error: ", response);
			//});
		});

		// Implement action to reset default content
		/*
		add_reset_action(function() {
			$scope.model = {};
			$scope.model.$app = {
				name: 'Unnamed-App',
				menu: []
			};
			$scope.model.title = 'Undefined Title';
			$scope.model.$type = 'default';
			$scope.model.content = '';
		});
		*/

		// Reset scope
		//reset_scopes();

	}

	/** */
	function reset_model(model, new_model) {

		if(!model) { throw new TypeError("!model"); }
		if(!new_model) { throw new TypeError("!new_model"); }

		$log.debug("Resetting model as new_model=", new_model);

		model.$app = new_model.$app || {};
		model.$app.name = new_model.$app.name || 'Unnamed-App';
		model.$app.menu = new_model.$app.menu || [];

		model.title = new_model.title || 'Undefined Title';
		model.$type = new_model.$type || 'default';
		model.content = new_model.content || '';

		Object.keys(new_model).forEach(function(key) {
			model[key] = new_model[key];
		});

		//$scope.model = model;
	}

	/** */
	function do_post(path, data) {
		$log.debug("POSTing: path = " + path);
		return $http.post('/api' + path, data).then(function successCallback(response) {
			return response.data || {};
		});
	}

	// Return interface to access functions
	return {
		'initialize': initialize,
		'go': do_go,
		//'addResetAction': add_reset_action,
		//'reset': reset_scopes,
		'resetModel': reset_model,
		'get': do_get,
		'post': do_post
	};

}]);

norApp.controller('norCtrl', function($scope, $http, $log, $location, norRouter) {

	norRouter.initialize($scope);

	$scope.keys = Object.keys;
	$scope.path = parse_path_name;

	/** Go to another resource */
	$scope.go = function(url) {
		var path = parse_path_name(url);
		return norRouter.go($scope, path);
	};

	/** @returns {string} Content display type */
	$scope.getContentType = function() {

		var model = $scope.model || {};
		var content = model.content;
		var type = model.$type;

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

/* Types */
norApp.directive('norType', function() {
	return {
		restrict: 'E',
		replace: true,
		//require: '^^norLink',
		//transclude: true,
		scope: {
			name: '=',
			content: '='
		},
		controller: ['$scope', '$log', function($scope, $log) {

			$scope.content = $scope.content || {};
			$scope.$id = $scope.content.$id || '';
			$scope.$name = $scope.content.$name || '';
			$scope.$schema = $scope.content.$schema || {};
			$scope.properties = $scope.$schema.properties || {};
			$scope.type = $scope.$schema.type || 'object';
			$scope.required = $scope.$schema.required || [];
			$scope.additionalProperties = $scope.$schema.additionalProperties ? true : false;
			$scope.indexes = $scope.content.indexes;
			$scope.$ref = $scope.content.$ref;
			$scope.$created = $scope.content.$created;
			$scope.$modified = $scope.content.$modified;

			$scope.keys = Object.keys($scope.properties);

		}],
		templateUrl: '/_libs/nor/type.html'
	};
});

/* Forms */
norApp.directive('norForm', function() {
	return {
		restrict: 'E',
		replace: true,
		//require: '^^norLink',
		//transclude: true,
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

				var path = $location.path();

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
		templateUrl: '/_libs/nor/form.html'
	};
});
