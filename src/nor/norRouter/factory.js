"use strict";

var angular = require("angular");

/** Returns the resource suffix part of an API URL */
var parse_path_name = require('../lib/parse_path_name.js');

/** */
module.exports = ['$http', '$log', '$location', '$q', function($http, $log, $location, $q) {

	/** */
	function do_get(path, params) {
		//reset_scopes();
		if(!path) { throw new TypeError("!path"); }
		path = parse_path_name(path);
		var opts = {
			method: 'GET',
			url: '/api' + path
		};
		if(params) {
			opts.params = params;
		}
		//$log.debug("Calling ", opts);
		return $http(opts).then(function successCallback(response) {
			return response.data || {};
		}, function(response) {
			$log.debug("error in norRouter.do_get(): ", response);

			if(response.data && (response.data.$type === 'error')) {
				return $q.reject(response.data);
			}

			var data = {};
			data.title = '';
			if(response.hasOwnProperty('status')) {
				data.title += '' + response.status;
			}
			if(response.hasOwnProperty('statusText')) {
				data.title += ((data.title==='') ? '' : ' - ') + response.statusText;
			}
			if(response.hasOwnProperty('data')) {
				data.content = response.data;
			}
			return $q.reject(data);

		});
	}

	/** */
	function reset_model(model, new_model) {

		if(!model) { throw new TypeError("!model"); }
		if(!new_model) { throw new TypeError("!new_model"); }

		$log.debug("Resetting model as new_model=", new_model);

		new_model = angular.copy(new_model, model);

		// Initialize standard properties
		new_model.$app = new_model.$app || {};
		new_model.$app.name = new_model.$app.name || '';
		new_model.$app.menu = new_model.$app.menu || [];
		new_model.title = new_model.title || 'Undefined Title';
		new_model.$type = new_model.$type || 'default';
		new_model.type = new_model.type || undefined;
		new_model.content = new_model.content || '';

		// Remove properties that aren't part of new_model anymore
		//Object.keys(model).forEach(function(key) {
		//	if(!new_model.hasOwnProperty(key)) {
		//		delete model[key];
		//	}
		//});

		// Copy properties from new_model
		//Object.keys(new_model).forEach(function(key) {
		//	model[key] = new_model[key];
		//});

		//$scope.model = model;
	}

	/** */
	function reset_search_params(params) {
		if(!angular.isObject(params)) { throw new TypeError("params not object"); }

		var current = $location.search();

		//$log.debug('current = ', current);

		// Remove missing params
		Object.keys(current).forEach(function(key) {
			if(!params.hasOwnProperty(key)) {
				//$log.debug('unsetting ', key);
				$location.search(key, null);
			}
		});

		// Copy new params
		Object.keys(params).forEach(function(key) {
			//$log.debug('setting ', key, ' as ', params[key]);
			$location.search(key, params[key]);
		});

	}

	/** Go to page */
	function do_go($scope, path, params) {
		if(!$scope) { throw new TypeError("!$scope"); }
		if(!path) { throw new TypeError("!path"); }
		if(params) {
			params = angular.copy(params);
		}
		//$log.debug("Calling ", path, " with ", params);
		return do_get(path, params).then(function(data) {
			if($location.path() !== path) {
				$location.path(path);
			}
			reset_search_params(params||{});
			//change_scope_data($scope, data);
			if($scope.model) {
				reset_model($scope.model, data);
			}
			return data;
		}, function errorCallback(data) {
			//$log.error("error in norRouter.do_go(): ", data);
			if($location.path() !== path) {
				$location.path(path);
			}
			reset_search_params(params||{});
			//change_scope_data($scope, data);
			if($scope.model) {
				reset_model($scope.model, data);
			}
			return data;
		});
	}

	/** */
	function initialize($scope) {
		if(!$scope) { throw new TypeError("!$scope"); }

		$scope.model = {};

		$scope.$on('$locationChangeSuccess', function() {
			var path = $location.path();
			//$log.debug("path = " + path);
			do_go($scope, path, $location.search());
		});

	}

	/** */
	function do_post(path, data) {
		path = parse_path_name(path);
		$log.debug("POSTing: path = /api" + path, ", with data: ", data);
		//if(data && data.content && data.content.$schema) {
		//	$log.debug("POSTing with $schema: ", data.content.$schema);
		//	$log.debug("POSTing with $schema: ", JSON.stringify(data.content.$schema, null, 2));
		//}
		//if(data && data.content && data.content.$schema && data.content.$schema.properties) {
		//	$log.debug("POSTing with property name: ", data.content.$schema.properties.name);
		//}
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

}];

