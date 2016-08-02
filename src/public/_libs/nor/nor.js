"use strict";

/** Returns the resource suffix part of an API URL */
function parse_path_name(url) {
	if(!url) {
		return;
	}
	if(url.indexOf('/api/') >= 0) {
		var tmp = url.split('/api/');
		tmp.shift();
		return '/' + tmp.join('/api/');
	} else {
		return url;
	}
}

var norApp = angular.module('norApp', [
	'datatables',
	'ngPrettyJson',
	'ngRoute'
]);

norApp.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
});

/** */
norApp.factory('norRouter', ['$http', '$log', '$location', function($http, $log, $location) {

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
		return $http(opts).then(function successCallback(response) {
			return response.data || {};
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
		new_model.$app.name = new_model.$app.name || 'Unnamed-App';
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

		$log.debug('current = ', current);

		// Remove missing params
		Object.keys(current).forEach(function(key) {
			if(!params.hasOwnProperty(key)) {
				$log.debug('unsetting ', key);
				$location.search(key, null);
			}
		});

		// Copy new params
		Object.keys(params).forEach(function(key) {
			$log.debug('setting ', key, ' as ', params[key]);
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

}]);

norApp.controller('norCtrl', function($scope, $http, $log, $location, norRouter) {

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
		transclude: true,
		scope: {
			link: '=?',
			ref: '=?',
			icon: '=?',
			target: '=?',
			classes: '@?class'
		},
		controller: ['$scope', 'norRouter', function($scope, norRouter) {

			if($scope.link) {
				if($scope.link.$ref && (!$scope.ref)) {
					$scope.ref = $scope.link.$ref;
				}
				if($scope.link.icon && (!$scope.icon)) {
					$scope.icon = $scope.link.icon;
				}
				if($scope.link.target && (!$scope.target)) {
					$scope.target = $scope.link.target;
				}
			}

			if(!$scope.target) {
				$scope.target = 'hypermedia';
			}

			$scope.parsePathName = parse_path_name;

			/** Go to another resource */
			$scope.go = function(url, params) {
				var path = parse_path_name(url);
				return norRouter.go($scope, path, params);
			};

		}],
		template: '<a ng-if="target === \'hypermedia\'" href="{{parsePathName(ref)}}" ng-click="go(ref)" ng-class="classes"><i class="fa fa-{{icon}}" aria-hidden="true" ng-if="icon"></i> <ng-transclude></ng-transclude></a>'+
			'<a ng-if="target !== \'hypermedia\'" href="{{ref}}" target="{{target}}" ng-class="classes"><i class="fa fa-{{icon}}" aria-hidden="true" ng-if="icon"></i> <ng-transclude></ng-transclude></a>'
	};
});

/* Actions */
norApp.directive('norAction', function() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			click: '&',
			icon: '@?',
			dangerousIcon: '@?',
			title: '@?',
			classes: '@?class',
			safety: '@?'
		},
		controller: ['$scope', '$timeout', '$q', function($scope, $timeout, $q) {

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

		}],
		template: '<div class="nor-action" ng-if="safety">'+
			'	<a href="#" title="{{title}}" ng-if="state === \'loading\'" class="safety-on"><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></a>'+
			'	<a href="#" title="{{title}}" ng-if="state === true" ng-click="safetyOff()" class="safety-on"><i class="fa fa-{{icon}}" ng-if="icon" aria-hidden="true"></i></a>'+
			'	<a href="#" title="{{title}}" ng-if="state === false" ng-click="execute()" class="safety-off"><i class="fa fa-{{dangerousIcon}}" ng-if="dangerousIcon" aria-hidden="true"></i> <ng-transclude></ng-transclude></a>'+
			'</div>'+
			'<div class="nor-action" ng-if="!safety">'+
			'	<a href="#" title="{{title}}" ng-if="state === \'loading\'" class="safety-on"><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></a>'+
			'	<a href="#" title="{{title}}" ng-if="state !== \'loading\'" ng-click="execute()" class="safety-off"><i class="fa fa-{{dangerousIcon}}" ng-if="dangerousIcon" aria-hidden="true"></i> <ng-transclude></ng-transclude></a>'+
			'</div>'
	};
});

/* Records */
norApp.directive('norRecord', function() {
	return {
		restrict: 'E',
		scope: {
			content: '=',
			type: '=?',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', 'norRouter', 'norUtils', function($scope, $log, norRouter, norUtils) {

			$scope.content = $scope.content || {};
			$scope.type = $scope.type || {"type":"object"};

			$scope.getType = norUtils.getType;

			/**
			 * @param key {string} The path to the value
			 * @returns value at the place for key
			 */
			$scope.get_content = function(keys) {
				return norUtils.getDataFromPath($scope.content, keys);
			};

			/**
			 * @param path {string} The path to the value
			 * @returns {Pointer} Pointer object which can be used to get or set data/schema.
			 */
			$scope.getPointer = function(path) {
				return norUtils.getPointerFromPath($scope.content, $scope.type, path);
			};

			/** Save changes on the backend */
			$scope.commit = function(content) {

				$log.debug("norRecord.commit()");

				if(!content) { throw new TypeError("!content"); }

				// Trigger .onCommit() once when next change
				$log.debug('norRecord started listening content');
				var listener = $scope.$watch('content', function() {
					$log.debug('norRecord stopped listening content');
					listener();
					if($scope.onCommit) {
						$log.debug('Triggering norRecord.onCommit()');
						return $scope.onCommit();
					}
				}, true);

				var body = {'content': content};
				$log.debug('POSTing to ', $scope.content.$ref, ' with ', body);
				return norRouter.post($scope.content.$ref, body).then(function(data) {
					$scope.content = data.content;
				}, function errorCallback(response) {
					$log.error("error: ", response);
				});
			};

			/** */
			$scope.refreshContent = function(content) {
				$log.debug('GET from ', content.$ref);
				return norRouter.get(content.$ref).then(function(data) {
					$log.debug('Got content: ', data);
					$scope.content = data.content;
					if(data.type) {
						$scope.type = data.type;
					}
				}, function errorCallback(response) {
					$log.error("error: ", response);
				});
			};

			/** */
			$scope.updateType = function(type) {
				var body = {'content': type};
				$log.debug('POSTing to ', type.$ref, ' with ', body);
				return norRouter.post(type.$ref, body).then(function(data) {
					$scope.type = data.content;
					return data.content;
				}, function errorCallback(response) {
					$log.error("error: ", response);
				});
			};

			/** */
			$scope.detectMissingSettings = function() {
				if(norUtils.detectMissingSettings($scope.content, $scope.type)) {
					return $scope.updateType($scope.type).then(function() {
						$log.debug("Refreshing content...");
						return $scope.refreshContent($scope.content);
					});
				}
			};

			/** Update data in scope from $scope.content */
			function update_content() {

				$log.debug("Updating content...");

				/* Path arrays to generic data in $scope.content. Array of paths, where a path is an array of property names. */
				$scope.keys = norUtils.getPathsFromData($scope.content);

				/* Pointers to paths */
				$scope.pointers = $scope.keys.map(function(path) {
					return $scope.getPointer(path);
				});

				/* Is there some pointers missing schema? */
				$scope.missing_schemas = false;
				$scope.pointers.forEach(function(pointer) {
					if(pointer.hasSchema()) {
						return;
					}
					$scope.missing_schemas = true;
				});
			}

			update_content();

			$scope.$watch('content', function() {
				update_content();
			}, true);

			$scope.$watch('type', function() {
				update_content();
			}, true);

		}],
		templateUrl: '/_libs/nor/record.html'
	};
});

/* Forms */
norApp.directive('norForm', function() {
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
		templateUrl: '/_libs/nor/form.html'
	};
});

/** Common utilities */
norApp.factory('norUtils', function($log) {
	var norUtils = {};

	/** Returns true if string */
	norUtils.isArray = angular.isArray;
	norUtils.isDefined = angular.isDefined;
	norUtils.isFunction = angular.isFunction;
	norUtils.isNumber = angular.isNumber;
	norUtils.isObject = angular.isObject;
	norUtils.isString = angular.isString;
	norUtils.isUndefined = angular.isUndefined;

	/** Returns true if UUID */
	norUtils.isUUID = function norUtils_isUUID(x) {
		return /^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/.test(x);
	};

	/** Returns true if null */
	norUtils.isNull = function(x) {
		return (x === null) ? true : false;
	};

	/** Returns true if boolean */
	norUtils.isBoolean = function(obj) {
		return (typeof obj === 'boolean') || (obj instanceof Boolean);
	};

	/** Returns the type of `obj` */
	norUtils.getType = function(obj) {
		if(norUtils.isUndefined(obj)) { return 'undefined'; }
		if(norUtils.isFunction(obj)) { return 'function'; }
		if(norUtils.isArray(obj)) { return 'array'; }
		if(norUtils.isObject(obj)) { return 'object'; }
		if(norUtils.isString(obj)) { return 'string'; }
		if(norUtils.isNumber(obj)) { return 'number'; }
		if(norUtils.isNull(obj)) { return 'null'; }
		if(norUtils.isBoolean(obj)) { return 'boolean'; }
		return 'unknown';
	};

	/** Parses all full paths to generic data from a JSON Schema (no paths to arrays and objects, only generic data). Paths are arrays of property keywords. */
	var pathParsers = {};

	/** Parse full paths to data from any JSON Schema value
	 * @param value {object} Any JSON Schema object
	 * @param path {array} Path to parent as an array of properties as a string.
	 * @returns {array} Array of arrays.
	  */
	pathParsers.any = function parse_value(value, path) {
		if(!value) { throw new TypeError("!schema"); }
		if(!path) { throw new TypeError("!path"); }

		if(value.type === 'object') {
			return pathParsers.object(value, [].concat(path));
		}

		if(value.type === 'array') {
			return pathParsers.array(value, [].concat(path));
		}

		return [[].concat(path)];
	};

	/** Handle (sub) arrays */
	pathParsers.array = function get_columns_from_array(schema, path) {
		if(!schema) { throw new TypeError("!schema"); }
		if(!path) { throw new TypeError("!path"); }

		//var items = schema.items || {};
		//pathParsers.any(items, [].concat(path) );

		return [[].concat(path)];
	};

	/** Handle (sub) objects */
	pathParsers.object = function get_columns_from_object(schema, path) {
		if(!schema) { throw new TypeError("!schema"); }
		if(!path) { throw new TypeError("!path"); }
		var properties = schema.properties || {};
		return Object.keys(properties).map(function(key) {
			var value = properties[key];
			return pathParsers.any(value, [].concat(path).concat([key]));
		}).reduce(function(a, b) {
			return a.concat(b);
		}, []);
	};

	norUtils.pathParsers = pathParsers;

	/** Returns a path array -- an array of properties
	 * @param path {array|string} Path as a string or array.
	 * @returns {array} Array of properties.
	 */
	norUtils.parsePathArray = function norUtils_parsePathArray(path) {
		if(!path) { throw new TypeError("!path"); }
		if(norUtils.isArray(path)) {
			return [].concat(path);
		}
		if(norUtils.isString(path)) {
			return path.split('.');
		}
		throw new TypeError("path is in unknown format: " + typeof path);
	};

	/** Detect JSON schema from data
	 * @param value {any} Any variable
	 * @returns {object} JSON Schema for value
	 */
	norUtils.detectSchema = function norUtils_detectSchema(value) {
		if(norUtils.isArray(value)) {
			return {'type':'array'};
		}
		if(norUtils.isObject(value)) {
			return {'type':'object'};
		}
		if(norUtils.isString(value)) {
			return {'type':'string'};
		}
		if(norUtils.isNumber(value)) {
			return {'type':'number'};
		}
		if(norUtils.isBoolean(value)) {
			return {'type':'boolean'};
		}
		if(norUtils.isNull(value)) {
			return {'type':'null'};
		}
		throw new TypeError("Unknown type {" + (typeof value) + "} for: " + value);
	};

	/** A pointer object to data which makes possible to change the data */
	function DataPointer(parent, key) {
		if(!norUtils.isString(key)) { throw new TypeError("!key"); }
		if(!norUtils.isObject(parent)) { throw new TypeError("!parent"); }
		this._key = key;
		this._parent = parent;
		this._root = undefined;
		this._path = undefined;
		this._documents = undefined;
	}

	/** Set root object and path to element */
	DataPointer.prototype.setRootPath = function(root, path, documents) {
		this._root = root;
		this._path = path;
		this._documents = documents;
		return this;
	};

	/** Returns the root object */
	DataPointer.prototype.getRoot = function() {
		return this._root;
	};

	/** Returns the path to root object */
	DataPointer.prototype.getPath = function() {
		return this._path;
	};

	/** */
	DataPointer.prototype.valueOf = function() {
		return this._parent[this._key];
	};

	/** */
	DataPointer.prototype.toString = function() {
		return ''+this._parent[this._key];
	};

	/** */
	DataPointer.prototype.toJSON = function() {
		return this._parent[this._key];
	};

	/** */
	DataPointer.prototype.hasData = function() {
		if(!this._parent) { return false; }
		return this._parent.hasOwnProperty(this._key);
	};

	/** */
	DataPointer.prototype.getData = function() {
		return this._parent[this._key];
	};

	/** */
	DataPointer.prototype.setData = function(value) {
		this._parent[this._key] = value;
		return this;
	};

	/** Returns automatically detected basic JSON Schema for data at this pointer */
	DataPointer.prototype.detectSchema = function() {
		return norUtils.detectSchema(this._parent[this._key]);
	};

	/** A pointer object to data which makes possible to change the data */
	function SchemaPointer(parent, key) {
		if(!norUtils.isString(key)) { throw new TypeError("!key"); }
		if(!norUtils.isObject(parent)) { throw new TypeError("!parent"); }
		this._key = key;
		this._parent = parent;
	}

	/** */
	SchemaPointer.prototype.valueOf = function() {
		return this._parent.properties[this._key];
	};

	/** */
	SchemaPointer.prototype.toString = function() {
		return ''+this._parent.properties[this._key];
	};

	/** */
	SchemaPointer.prototype.toJSON = function() {
		return this._parent.properties[this._key];
	};

	/** */
	SchemaPointer.prototype.hasSchema = function() {
		if(!this._parent) { return false; }
		if(!this._parent.properties) { return false; }
		return this._parent.properties.hasOwnProperty(this._key);
	};

	/** */
	SchemaPointer.prototype.getSchema = function() {
		if(!this._parent) { throw new TypeError("!this.parent"); }
		if(!this._parent.properties) { throw new TypeError("!this.parent.properties"); }
		return this._parent.properties[this._key];
	};

	/** */
	SchemaPointer.prototype.setSchema = function(value) {
		if(!this._parent.hasOwnProperty('properties')) {
			this._parent.properties = {};
		}
		this._parent.properties[this._key] = value;
		return this;
	};

	/** Set root object and path to element */
	SchemaPointer.prototype.setRootPath = function(root, path, documents) {
		this._root = root;
		this._path = path;
		this._documents = documents;
		return this;
	};

	/** Returns the root object */
	SchemaPointer.prototype.getRoot = function() {
		return this._root;
	};

	/** Returns the path to root object */
	SchemaPointer.prototype.getPath = function() {
		return this._path;
	};

	/** A pointer object to data which makes possible to change the data */
	function Pointer(data_pointer, schema_pointer) {
		if(!norUtils.isObject(data_pointer)) { throw new TypeError("!data_pointer"); }
		if(! ( (schema_pointer === undefined) || norUtils.isObject(schema_pointer) ) ) { throw new TypeError("!schema_pointer"); }
		this._data = data_pointer;
		this._schema = schema_pointer;
	}

	/** */
	Pointer.prototype.toString = function() {
		return this._data.toString();
	};

	/** */
	Pointer.prototype.toJSON = function() {
		return this._data.toJSON();
	};

	/** Returns true if pointer can set a schema */
	Pointer.prototype.canSetSchema = function() {
		return this._schema ? true : false;
	};

	/** Returns true if pointer has data */
	Pointer.prototype.hasData = function() {
		return this._data.hasData();
	};

	/** Returns true if pointer has schema */
	Pointer.prototype.hasSchema = function() {
		if(!this._schema) { return false; }
		return this._schema.hasSchema();
	};

	/** */
	Pointer.prototype.getSchema = function() {
		if(this._schema) {
			return this._schema.getSchema();
		}
	};

	/** */
	Pointer.prototype.setSchema = function(value) {
		if(this._schema) {
			this._schema.setSchema(value);
		} else {
			throw new TypeError("Cannot set a schema, no pointer to it!");
		}
		return this;
	};

	/** */
	Pointer.prototype.getData = function() {
		return this._data.getData();
	};

	/** */
	Pointer.prototype.setData = function(value) {
		this._data.setData(value);
		return this;
	};

	/** */
	Pointer.prototype.validate = function() {
		var data = this.getData();
		if(!this.hasSchema()) {
			return true;
		}
		var schema = this.getSchema();
		if(schema) {
			return tv4.validate(data, schema);
		}
	};

	/** */
	Pointer.prototype.getRootData = function() {
		return this._data.getRoot();
	};

	/** */
	Pointer.prototype.getPath = function() {
		return this._data.getPath();
	};

	/** */
	Pointer.prototype.detectSchema = function() {
		return this._data.detectSchema();
	};

	/** */
	Pointer.prototype.getRootSchema = function() {
		if(this._schema) {
			return this._schema.getRoot();
		}
	};

	/** Returns an array of paths to each non-object data in a NoPg type object
	 * @param type {object} The NoPG type object
	 * @returns {array} Array of paths. Each path is also an array with each property as a string.
	 */
	norUtils.getPathsFromType = function norUtils_getPathsFromType(type) {
		if(!type) { throw new TypeError("!type"); }

		// Default expected columns
		var columns = [['$id'], ['$created'], ['$modified']];
		if(type.$schema) {
			columns = columns.concat(pathParsers.any(type.$schema, []));
		}
		return columns;
	};

	/** Returns an array of paths to each non-object data in an object
	 * @param parent {object} The data object
	 * @param path {array|string} The path to parent
	 * @returns {array} Array of paths. Each path is also an array with each property as a string.
	 */
	norUtils.getPathsFromData = function norUtils_getPathsFromData(parent, path) {
		if(!parent) { throw new TypeError("!parent"); }
		path = norUtils.parsePathArray(path || []);
		var documents = parent.$documents || {};
		return Object.keys(parent).map(function(key) {
			var data = parent[key];
			var data_path = [].concat(path).concat([key]);

			// Skip $documents
			if(key === '$documents') {
				return [];
			}

			if(data && (typeof data === 'object')) {
				return norUtils_getPathsFromData(data, data_path );
			} else {

				// Check if there is an external document available for this element
				if(norUtils.isString(data) && norUtils.isUUID(data) && documents.hasOwnProperty(data)) {
					return [data_path].concat( norUtils_getPathsFromData(documents[data], data_path ) );
				}

				return [[].concat(path).concat([key])];
			}
		}).reduce(function(a, b) {
			return a.concat(b);
		}, []);
	};

	/** Returns pointer object to the JSON schema of a (sub) property
	 * @param schema {object} The full JSON schema
	 * @param path {array} Path as an array of property names (as string)
	 * @returns {object} Pointer object which can be used to get or set a JSON Schema for this property
	 */
	norUtils.getSchemaPointerFromPath = function norUtils_getSchemaPointerFromPath(schema, path) {

		function return_wrapper(pointer) {
			if(pointer) {
				pointer.setRootPath(schema, path);
			}
			return pointer;
		}

		if(!schema) {
			$log.debug("schema does not exist");
			return;
		}

		if(schema.$schema) {
			return norUtils_getSchemaPointerFromPath(schema.$schema, path);
		}

		if(!path) { throw new TypeError("!path"); }
		path = norUtils.parsePathArray(path);

		if(path.length <= 0) {
			throw new TypeError("No path!");
		}

		if(schema.type !== "object") {
			throw new TypeError("Schema was not JSONSchema object: " + JSON.stringify(schema));
		}

		if(path.length === 1) {
			return return_wrapper(new SchemaPointer(schema, path[0]));
		}

		var properties = schema.properties || {};
		var key = path[0];

		if(!properties.hasOwnProperty(key)) {
			return;
		}

		return return_wrapper( norUtils_getSchemaPointerFromPath(properties[key], path.slice(1) ) );

	};

	/** Returns the JSON schema of a (sub) property
	 * @param schema {object} The full JSON schema
	 * @param path {array} Path as an array of property names (as string)
	 * @returns {object} JSON Schema for this property
	 */
	norUtils.getSchemaFromPath = function norUtils_getSchemaFromPath(schema, path) {
		var pointer = norUtils.getSchemaPointerFromPath(schema, path);
		if(pointer) {
			return pointer.getSchema();
		}
	};

	/** Get a pointer object to data which makes possible to change the data.
	 * @param key {string} The path to the value
	 * @returns {object} An object with specific interface to change the data in this path
	 */
	norUtils.getDataPointerFromPath = function get_data_pointer_from_path(data, path, documents) {

		function return_wrapper(pointer) {
			if(pointer) {
				pointer.setRootPath(data, path, documents);
			}
			return pointer;
		}

		if(!path) { throw new TypeError("!path"); }
		path = norUtils.parsePathArray(path);
		//$log.debug("data = ", data);
		//$log.debug("path = ", path);
		//$log.debug("documents = ", documents);

		if(!data) {
			return;
		}

		// FIXME: Enable support for possible sub documents
		if( documents && data.hasOwnProperty('$documents') ) {
			$log.warn("Document had multiple $documents, only first one was used.");
		}

		if( (documents === undefined) && data && data.hasOwnProperty('$documents') ) {
			documents = data.$documents;
		}

		if(documents && (!norUtils.isObject(documents)) ) { throw new TypeError("documents not object!"); }

		//$log.debug("documents = ", documents);

		if(path.length === 0) {
			throw new TypeError("path is empty");
		}

		var key = path[0];
		var parent = data;
		var value = parent[key];
		//$log.debug("key = ", key);
		//$log.debug("value = ", value);
		//$log.debug("parent = ", parent);

		if(path.length === 1) {
			if(!norUtils.isObject(parent)) { throw new TypeError("parent not object!"); }
			return return_wrapper(new DataPointer(parent, key));
		}

		// Check if there is an external document available for this element
		if(norUtils.isString(value) && norUtils.isUUID(value) && documents && documents.hasOwnProperty(value)) {
			key = value;
			parent = documents;
			value = parent[key];
			//$log.debug("key = ", key);
			//$log.debug("value = ", value);
			//$log.debug("parent = ", parent);
		}

		if(path.length >= 2) {
			if(!norUtils.isObject(value)) { throw new TypeError("value not object!"); }
			return return_wrapper( get_data_pointer_from_path(value, path.slice(1), documents ) );
		}
	};

	/**
	 * @param key {string} The path to the value
	 * @returns value at the place for key
	 */
	norUtils.getDataFromPath = function get_data_from_path(data, path) {
		if(!path) { throw new TypeError("!path"); }
		var pointer = norUtils.getDataPointerFromPath(data, path);
		if(pointer) {
			return pointer.getData();
		}
	};

	/** Returns the title of element from path
	 * @param schema {object} NoPg Type Object or JSON Schema
	 * @param path {array} Path as an array of property names (as string)
	 * @returns {object} JSON Schema for this property
	 */
	norUtils.getTitleFromPath = function get_title_from_path(schema, path) {
		var pointer = norUtils.getSchemaPointerFromPath(schema, path);
		if( (!pointer) || (!pointer.hasSchema()) ) {
			return path.join('.');
		}
		schema = pointer.getSchema();
		return (schema && schema.title) || path.join('.');
	};

	/** Returns the description of element from path
	 * @param schema {object} NoPg Type Object or JSON Schema
	 * @param path {array} Path as an array of property names (as string)
	 * @returns {object} JSON Schema for this property
	 */
	norUtils.getDescriptionFromPath = function get_description_from_path(schema, path) {
		var pointer = norUtils.getSchemaPointerFromPath(schema, path);
		if( (!pointer) || (!pointer.hasSchema()) ) {
			return '';
		}
		schema = pointer.getSchema();
		return (schema && schema.description) || '';
	};

	/** Returns a Pointer to path, which is both SchemaPointer and DataPointer */
	norUtils.getPointerFromPath = function(data, type, path) {
		if(!data) { throw new TypeError("!data"); }
		if(!type) { throw new TypeError("!type"); }
		var data_pointer = norUtils.getDataPointerFromPath(data, path);
		var schema_pointer = norUtils.getSchemaPointerFromPath(type, path);
		return new Pointer(data_pointer, schema_pointer);
	};

	/** Create missing objects and set schema to `value` for `path`
	 * @param schema {object} Schema object
	 * @param path {array} Path
	 * @returns {boolean} True if something was changed
	 */
	norUtils.setMissingPath = function norUtils_setMissingPath(schema, path, value) {
		var changed = false;
		if(!norUtils.isObject(value)) { throw new TypeError("!value"); }
		if(!norUtils.isObject(schema)) { throw new TypeError("!schema"); }
		if(!path) { throw new TypeError("!path"); }
		path = norUtils.parsePathArray(path);

		if(path.length <= 0) {
			throw new TypeError("Path is empty");
		}

		if(!schema.hasOwnProperty('type')) {
			schema.type = 'object';
			changed = true;
		}

		if(schema.type !== 'object') {
			throw new TypeError("Cannot create property for type: " + schema.type);
		}

		if(!schema.hasOwnProperty('properties')) {
			changed = true;
			schema.properties = {};
		}

		var key = path[0];

		if(!schema.properties.hasOwnProperty(key)) {
			changed = true;
			schema.properties[key] = {};
		}

		if(path.length === 1) {
			changed = true;
			schema.properties[key] = value;
			return true;
		}

		if(path.length >= 2) {
			if(norUtils_setMissingPath(schema.properties[key], path.slice(1), value )) {
				changed = true;
			}
			return changed;
		}

		return changed;
	};

	/** Detect missing settings based on data
	 * @param data {object} Data object (used to find new settings)
	 * @param type {object} Type object
	 * @returns {boolean} True if type object was changed
	 */
	norUtils.detectMissingSettings = function norUtils_detectSchema(data, type) {
		if(!norUtils.isObject(data)) { throw new TypeError("!data"); }
		if(!norUtils.isObject(type)) { throw new TypeError("!type"); }
		var changed = false;
		var keys = norUtils.getPathsFromData(data);
		keys.forEach(function(path) {
			var pointer = norUtils.getPointerFromPath(data, type, path);
			if( pointer && pointer.hasSchema() ) {
				return;
			}

			var schema = pointer.detectSchema();

			if(pointer && pointer.canSetSchema()) {
				changed = true;
				pointer.setSchema(schema);
				return;
			}

			if(norUtils.setMissingPath(type.$schema, path, schema)) {
				changed = true;
			}

		});

		return changed;
	};

	// Exports
	return norUtils;
});

/* Tables */
norApp.directive('norTable', function() {
	return {
		restrict: 'E',
		scope: {
			model: '=',
			content: '=?',
			onCommit: '&?'
		},
		controller: ['$scope', 'norUtils', 'norRouter', '$location', function($scope, norUtils, norRouter, $location) {

			$scope.content = $scope.content || ($scope.model && $scope.model.content) || [];

			$scope.updatePaths = function() {
				var model = $scope.model;
				var columns = model.$columns;
				var type = model.type;
				$scope.paths = (type && norUtils.getPathsFromType(type)) || columns.map(norUtils.parsePathArray) || [['$id'], ['$created'], ['$modified']];
			};

			$scope.updatePages = function() {
				var model = $scope.model;
				var results = model.totalResults;
				var offset = model.offset || 0;
				var limit = model.limit;

				$scope.pages = Math.ceil(results/limit);
				$scope.page = Math.round(offset/results*$scope.pages)+1;
			};

			$scope.prevPage = function() {
				var model = $scope.model;
				//var results = model.totalResults;
				var offset = model.offset || 0;
				var limit = model.limit;
				var params = $location.search();
				offset -= limit;
				params = angular.merge(params, {'_offset':offset});
				return norRouter.go($scope, $location.path(), params);
			};

			$scope.nextPage = function() {
				var model = $scope.model;
				//var results = model.totalResults;
				var offset = model.offset || 0;
				var limit = model.limit;
				var params = $location.search();
				offset += limit;
				return norRouter.go($scope, $location.path(), angular.merge(params, {'_offset':offset}));
			};

			$scope.updatePaths();
			$scope.updatePages();

			$scope.$watch('model', function() {
				$scope.updatePaths();
				$scope.updatePages();
			}, true);

			$scope.parsePathArray = norUtils.parsePathArray;
			$scope.getDataFromPath = norUtils.getDataFromPath;
			$scope.getSchemaFromPath = norUtils.getSchemaFromPath;
			$scope.getTitleFromPath = norUtils.getTitleFromPath;
			$scope.getDescriptionFromPath = norUtils.getDescriptionFromPath;

		}],
		templateUrl: '/_libs/nor/table.html'
	};
});

/* Types */
norApp.directive('norType', ['$log', function($log) {
	return {
		restrict: 'E',
		scope: {
			content: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', 'norRouter', function($scope, $log, norRouter) {

			$scope.content                    = $scope.content || {};
			$scope.content.$name              = $scope.content.$name || '';
			$scope.content.$schema            = $scope.content.$schema || {};
			$scope.content.$schema.properties = $scope.content.$schema.properties || {};
			$scope.keys = Object.keys($scope.content.$schema.properties);

			/** If true, the JSON editor for the type is enabled */
			$scope.editor = false;

			/** Set editor */
			$scope.setEditor = function(value) {
				$scope.editor = value ? true : false;
			};

			/** */
			$scope.prettyprint = function(data) {
				return JSON.stringify(data, null, 2);
			};

			/** Save changes on the backend */
			$scope.commit = function(content) {
				$log.debug("norType.commit()");
				if(!content) { throw new TypeError("!content"); }

				// Trigger .onCommit() once when next change
				$log.debug('norType started listening content');
				var listener = $scope.$watch('content', function() {
					$log.debug('norType stopped listening content');
					listener();
					if($scope.onCommit) {
						return $scope.onCommit();
					}
				}, true);

				return norRouter.post($scope.content.$ref, {'content': content}).then(function(data) {
					$scope.content = data.content;
				}, function errorCallback(response) {
					$log.error("error: ", response);
				});
			};

			// 
			if($scope.content.$schema.type !== "object") {
				$scope.content.$schema.type = 'object';
				return $scope.commit($scope.content);
			}
			

		}],
		templateUrl: '/_libs/nor/type.html'
	};
}]);

/* Select element for external resource */
norApp.directive('norSelect', ['$log', function($log) {
	return {
		restrict: 'E',
		scope: {
			ref: '@?',
			path: '=?',
			values: '=?',
			valueKey: '@?',
			labelKey: '@?',
			content: '=?',
			items: '=?',
			model: '=?',
			ignoreValues: '=?',
			onChange: '&?'
		},
		controller: ['$scope', '$log', 'norRouter', function($scope, $log, norRouter) {

			$scope.loading = true;
			$scope.ref = $scope.ref || undefined;
			$scope.path = $scope.path || [];
			$scope.content = $scope.content || undefined;
			$scope.model = $scope.model || undefined;
			$scope.valueKey = $scope.valueKey || '';
			$scope.labelKey = $scope.labelKey || '';
			$scope.items = $scope.items || [];
			$scope.ignoreValues = $scope.ignoreValues || undefined;
			$scope.values = $scope.values || [];

			function fetch_(data, keys) {
				if(!data) {
					return;
				}
				if(keys.length === 0) {
					return data;
				}
				keys = [].concat(keys);
				var key = keys.shift();
				return fetch_(data[key], keys);
			}

			// Update items based on content
			$log.debug('norSelect started listening content');
			$scope.$watch('content', function() {
				$log.debug('norSelect content changed');

				var content = $scope.content;

				if(!content) {
					return;
				}

				// Handle array content
				if(content instanceof Array) {
					$scope.items = [];
					content.forEach(function(item, key) {
						$scope.items.push({"key":key, "item":item});
					});
					return;
				}

				// Handle object content
				$scope.items = [];
				Object.keys(content).forEach(function(key) {
					var item = content[key];
					$scope.items.push({"key": key, "item":item});
				});

			});

			/** Update element values from external resource pointed by $scope.ref */
			$scope.updateValues = function() {
				if($scope.ref) {
					norRouter.get($scope.ref).then(function(data) {
						var content = fetch_(data.content, $scope.path);
						if(content && content instanceof Array) {
							$scope.content = [].concat(content).concat($scope.values);
						} else {
							Object.keys($scope.values).forEach(function(key) {
								content[key] = $scope.values[key];
							});
							$scope.content = content;
						}
						$log.debug("content = ", $scope.content);
						$scope.loading = false;
					}, function errorCallback(response) {
						$log.error("error: ", response);
					});
				}
			};

			/** Action to do on change */
			$scope.change = function() {
				$log.debug("norSelect.change()");

				$log.debug("$scope.model = ", $scope.model);

				// Trigger .onChange() once when next change
				$log.debug('norSelect started listening model');
				var listener = $scope.$watch('model', function() {
					$log.debug('norSelect stopped listening model');
					listener();
					$log.debug("$scope.model = ", $scope.model);
					if($scope.onChange) {
						$log.debug('Triggering norSelect.onChange()');
						return $scope.onChange();
					}
				});

			};

			// Update values if $scope.ref changes
			$log.debug('norSelect started listening ref');
			$scope.$watch('ref', function() {
				$log.debug('ref changed in norSelect');
				$scope.updateValues();
			});

			// Initial update
			$scope.updateValues();

		}],
		templateUrl: '/_libs/nor/select.html'
	};
}]);

/* Element for any JSON schema element */
norApp.directive('norSchema', function() {
	return {
		restrict: 'E',
		scope: {
			root: '=?',
			parent: '=?',
			path: '&?',
			key: '=?',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', function($scope, $log) {

			$scope.root = $scope.root || undefined;
			$scope.parent = $scope.parent || undefined;
			$scope.key = $scope.key || undefined;

			/** Path from root object to this value as an array */
			$scope.path = ($scope.path && $scope.path()) || [];
			$log.debug('path = ', $scope.path);

			/** Action to do on commit */
			$scope.commit = function() {
				if($scope.onCommit) {
					return $scope.onCommit();
				}
			};

		}],
		templateUrl: '/_libs/nor/schema.html'
	};
});

/* Element for object JSON Schema */
norApp.directive('norSchemaObject', function() {
	return {
		restrict: 'E',
		scope: {
			root: '=?',
			parent: '=?',
			path: '&?',
			key: '=?',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', function($scope, $log) {

			$scope.root = $scope.root || undefined;
			$scope.parent = $scope.parent || undefined;
			$scope.key = $scope.key || undefined;

			/** Path from root object to this value as an array */
			$scope.path = ($scope.path && $scope.path()) || [];
			$log.debug('path = ', $scope.path);

			/** Action to do on commit */
			$scope.commit = function(value) {
				if(value) {

					// Trigger .onCommit() once when next change
					$log.debug('norSchemaObject started listening value');
					var listener = $scope.$watch('value', function() {
						$log.debug('norSchemaObject stopped listening value');
						listener();
						if($scope.onCommit) {
							$log.debug('Triggering norSchemaObject.onCommit()');
							return $scope.onCommit();
						}
					}, true);

					$scope.value = value;

				} else if($scope.onCommit) {
					$log.debug('Triggering norSchemaObject.onCommit()');
					return $scope.onCommit();
				}
			};

			$scope.show_add_property_options = false;

			/** */
			$scope.setAddPropertyOptions = function(value) {
				$scope.new_property = {};
				$scope.show_add_property_options = value ? true : false;
			};

			var enableInitNewPropertyKey = true;

			/** */
			$scope.initNewPropertyKey = function(value) {
				if(!enableInitNewPropertyKey) {
					return;
				}
				var key = (''+value).toLowerCase().replace(/[^a-z0-9]+/g, "_");
				$scope.new_property.key = key;
			};

			/** */
			$scope.disableInitNewPropertyKey = function() {
				enableInitNewPropertyKey = false;
			};

			/** */
			$scope.addNewProperty = function(data) {
				$scope.show_add_property_options = false;
				var key = data.key;
				delete data.key;
				if(data.type === "object") {
					data.properties = {};
				}
				$scope.value.properties[key] = data;
				return $scope.commit();
			};

			/** Remove property */
			$scope.removeProperty = function(obj, key) {
				if(obj && obj.properties && obj.properties.hasOwnProperty(key)) {
					delete obj.properties[key];
					return $scope.commit();
				}
			};

			/** Returns true if property is required */
			$scope.isRequired = function(obj, key) {
				if(!obj.hasOwnProperty('required')) {
					return false;
				}
				var required = obj.required;
				var i = required.indexOf(key);
				return i >= 0;
			};

			/** Toggle required */
			$scope.toggleRequired = function(obj, key) {
				if(!obj.hasOwnProperty('required')) {
					obj.required = [];
				}
				var required = obj.required;
				var i = required.indexOf(key);
				if(i === -1) {
					required.push(key);
				} else {
					required.splice(i, 1);
				}
				return $scope.commit();
			};

			/** Returns true if property has index support */
			$scope.indexesEnabled = function() {
				var root = $scope.root;
				if(!root) {
					return false;
				}
				return root.hasOwnProperty('$schema');
			};

			/** Returns true if property is index */
			$scope.hasIndex = function(key) {
				var root = $scope.root;
				if(!root) {
					return false;
				}
				if(!root.hasOwnProperty('indexes')) {
					return false;
				}
				var indexes = root.indexes;
				var i = indexes.indexOf(key);
				return i >= 0;
			};

			/** Toggle index on property */
			$scope.toggleIndex = function(key) {
				var root = $scope.root;
				if(!root) {
					return false;
				}
				if(!root.hasOwnProperty('indexes')) {
					root.indexes = [];
				}
				var indexes = root.indexes;
				var i = indexes.indexOf(key);
				if(i === -1) {
					indexes.push(key);
				} else {
					indexes.splice(i, 1);
				}
				return $scope.commit();
			};

		}],
		templateUrl: '/_libs/nor/schemas/object.html'
	};
});

/* Element for array JSON Schema */
norApp.directive('norSchemaArray', function() {
	return {
		restrict: 'E',
		scope: {
			root: '=?',
			parent: '=?',
			path: '&?',
			key: '=?',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', function($scope, $log) {

			$scope.root = $scope.root || undefined;
			$scope.parent = $scope.parent || undefined;

			/** Path from root object to this value as an array */
			$scope.path = ($scope.path && $scope.path()) || [];
			$log.debug('path = ', $scope.path);

			$scope.key = $scope.key || undefined;

			/** Action to do on commit */
			$scope.commit = function(value) {
				if(value) {

					// Trigger .onCommit() once when next change
					$log.debug('norSchemaArray started listening value');
					var listener = $scope.$watch('value', function() {
						$log.debug('norSchemaArray stopped listening value');
						listener();
						if($scope.onCommit) {
							$log.debug('Triggering norSchemaArray.onCommit()');
							return $scope.onCommit();
						}
					}, true);

					$scope.value = value;

				} else if($scope.onCommit) {
					$log.debug('Triggering norSchemaArray.onCommit()');
					return $scope.onCommit();
				}
			};

			$scope.show_add_property_options = false;

			/** */
			$scope.setAddPropertyOptions = function(value) {
				$scope.new_property = {};
				$scope.show_add_property_options = value ? true : false;
			};

			/** */
			$scope.addNewProperty = function(data) {
				$scope.show_add_property_options = false;
				if(data.type === "object") {
					data.properties = {};
				}
				$scope.value.items = data;
				return $scope.commit();
			};

			/** Remove property */
			$scope.removeItemsProperty = function(obj) {
				if(obj && obj.hasOwnProperty('items')) {
					delete obj.items;
					return $scope.commit();
				}
			};


		}],
		templateUrl: '/_libs/nor/schemas/array.html'
	};
});

/* Element for string JSON schema */
norApp.directive('norSchemaString', function() {
	return {
		restrict: 'E',
		scope: {
			root: '=?',
			parent: '=?',
			path: '&?',
			key: '=',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', '$q', function($scope, $log, $q) {

			$scope.new_field = "";

			$scope.root = $scope.root || undefined;
			$scope.parent = $scope.parent || undefined;

			/** Path from root object to this value as an array */
			$scope.path = ($scope.path && $scope.path()) || [];
			$log.debug('path = ', $scope.path);

			/** Action to do on commit */
			$scope.commit = function(value) {
				//if(value !== undefined) {

					// Trigger .onCommit() once when next change
					$log.debug('norSchemaString started listening value');
					var listener = $scope.$watch('value', function() {
						$log.debug('norSchemaString stopped listening value');
						listener();
						if($scope.onCommit) {
							$log.debug('Triggering norSchemaString.onCommit() #1');
							return $scope.onCommit();
						}
					}, true);

					if(value !== undefined) {
						$scope.value = value;
					}

				//} else if($scope.onCommit) {
				//	$log.debug('Triggering norSchemaString.onCommit() #2');
				//	return $scope.onCommit();
				//}
			};

			/** Returns true if property has support for (relation of) documents */
			$scope.documentsEnabled = function() {
				var root = $scope.root;
				if(!root) {
					return false;
				}
				return root.hasOwnProperty('$schema');
			};

			/** Returns true if property has link to document */
			$scope.hasDocument = function(key_) {
				var root = $scope.root;
				if(!root) {
					return false;
				}
				if(!root.hasOwnProperty('documents')) {
					return false;
				}
				var documents = root.documents;
				var results = documents.filter(function(line) {
					var parts = line.split('|');
					var type_key = parts.shift().split('#');
					//var fields = parts.join('|').split(',');
					/*var type = */type_key.shift();
					var key = type_key.join('#');

					return key === key_;
				});
				return results.length >= 1;
			};

			/** Returns document link information */
			$scope.getDocument = function(path_) {
				var key_ = path_.join('.');
				$log.debug("key_ = ", key_);
				var root = $scope.root;
				if(!root) {
					$log.debug("No root");
					return;
				}
				if(!root.hasOwnProperty('documents')) {
					$log.debug("No documents in root");
					return {
						"type": "",
						"key": key_,
						"fields": []
					};
				}
				var documents = root.documents;
				$log.debug('key_ = ', key_);
				$log.debug('documents = ', documents);
				var results = documents.map(function(line) {
					var parts = line.split('|');
					var type_key = parts.shift().split('#');
					var fields = parts.join('|').split(',');
					var type = type_key.shift();
					var key = type_key.join('#');

					$log.debug("Key " + key + " has type " + type + " and fields: " + fields);

					return {
						"type": type,
						"key": key,
						"fields": fields
					};
				}).filter(function(doc) {
					return doc.key === key_;
				});
				var doc = results.shift();
				$log.debug('doc = ', doc);
				return doc;
			};

			/** Returns fields array without `field` */
			$scope.removeField = function(field_, fields_) {
				return fields_.filter(function(field) {
					return field_ !== field;
				});
			};

			/** Returns true if field is part of accepted fields */
			$scope.acceptedField = function(field_, accepted_fields) {
				var items = (accepted_fields || []).map(function(item) {
					return item.key;
				});
				$log.debug("field = ", field_);
				$log.debug("acceptedFields = ", items);
				return items.indexOf(field_) >= 0;
			};

			/** Returns fields array appended with `field`, but only if it is part of accepted fields */
			$scope.addField = function(field_, fields_, accepted_fields) {
				fields_ = fields_ || [];
				if($scope.acceptedField(field_, accepted_fields) && (fields_.indexOf(field_) < 0)) {
					return [].concat(fields_).concat([field_]);
				} else {
					return fields_;
				}
			};

			/** Toggle document relation on property */
			$scope.setDocument = function(type_, path_, fields_) {

				fields_ = fields_ || ['$id'];

				var key_ = path_.join('.');

				$log.debug("type_ = ", type_);
				$log.debug("path_ = ", path_);
				$log.debug("key_ = ", key_);
				$log.debug("fields_ = ", fields_);

				var root = $scope.root;

				$log.debug("root = ", root);

				if(!root) {
					return false;
				}
				if(!root.hasOwnProperty('documents')) {
					root.documents = [];
				}
				var documents = root.documents;

				// Note: We must ignore any keyword which has ',' in it
				var line_ = (type_||'') + (type_?'#':'') + key_ + '|' + fields_.filter(function(f) {
					if(!f) { return; }
					return (''+f).indexOf(',') < 0;
				}).join(',');

				$log.debug("documents = ", documents);
				$log.debug("line_ = ", line_);

				var changed = false;

				var seen = {};

				var results = documents.map(function(line) {
					var parts = (line||'').split('|');
					var type_key = (parts.shift()||'').split('#');
					//var fields = parts.join('|').split(',');
					/*var type = */type_key.shift();
					var key = type_key.join('#');

					$log.debug("key = ", key);

					// Assert unique keywords
					if(seen.hasOwnProperty(key)) {
						return;
					}
					seen[key] = true;

					// Do not change other keywords
					if(key !== key_) {
						return line;
					}

					// Use our new line_ for this keyword
					changed = true;
					return line_;
				}).filter(function(line){
					return line?true:false;
				});

				if(changed) {
					root.documents = results;
				} else {
					root.documents.push(line_);
				}

				$log.debug("root.documents = ", root.documents);

				return $q.when($scope.commit()).then(function() {
					$scope.updateLink();
				});
			};

			/** */
			$scope.updateLink = function() {
				$scope.new_field = "";
				$scope.link = $scope.getDocument($scope.path);

				$log.debug('$scope.link for key ('+$scope.key+') updated as: ', $scope.link);
			};

			$scope.updateLink();

		}],
		templateUrl: '/_libs/nor/schemas/string.html'
	};
});

/* Element for number JSON schema */
norApp.directive('norSchemaNumber', function() {
	return {
		restrict: 'E',
		scope: {
			root: '=?',
			parent: '=?',
			path: '&?',
			key: '=',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', '$q', function($scope, $log, $q) {

			$scope.new_field = "";

			$scope.root = $scope.root || undefined;
			$scope.parent = $scope.parent || undefined;

			/** Path from root object to this value as an array */
			$scope.path = ($scope.path && $scope.path()) || [];
			$log.debug('path = ', $scope.path);

			/** Action to do on commit */
			$scope.commit = function(value) {
				//if(value !== undefined) {

					// Trigger .onCommit() once when next change
					$log.debug('norSchemaNumber started listening value');
					var listener = $scope.$watch('value', function() {
						$log.debug('norSchemaNumber stopped listening value');
						listener();
						if($scope.onCommit) {
							$log.debug('Triggering norSchemaNumber.onCommit() #1');
							return $scope.onCommit();
						}
					}, true);

					if(value !== undefined) {
						$scope.value = value;
					}

				//} else if($scope.onCommit) {
				//	$log.debug('Triggering norSchemaNumber.onCommit() #2');
				//	return $scope.onCommit();
				//}
			};

			/** Returns true if property has support for (relation of) documents */
			$scope.documentsEnabled = function() {
				var root = $scope.root;
				if(!root) {
					return false;
				}
				return root.hasOwnProperty('$schema');
			};

			/** Returns true if property has link to document */
			$scope.hasDocument = function(key_) {
				var root = $scope.root;
				if(!root) {
					return false;
				}
				if(!root.hasOwnProperty('documents')) {
					return false;
				}
				var documents = root.documents;
				var results = documents.filter(function(line) {
					var parts = line.split('|');
					var type_key = parts.shift().split('#');
					//var fields = parts.join('|').split(',');
					/*var type = */type_key.shift();
					var key = type_key.join('#');

					return key === key_;
				});
				return results.length >= 1;
			};

			/** Returns document link information */
			$scope.getDocument = function(path_) {
				var key_ = path_.join('.');
				$log.debug("key_ = ", key_);
				var root = $scope.root;
				if(!root) {
					$log.debug("No root");
					return;
				}
				if(!root.hasOwnProperty('documents')) {
					$log.debug("No documents in root");
					return {
						"type": "",
						"key": key_,
						"fields": []
					};
				}
				var documents = root.documents;
				$log.debug('key_ = ', key_);
				$log.debug('documents = ', documents);
				var results = documents.map(function(line) {
					var parts = line.split('|');
					var type_key = parts.shift().split('#');
					var fields = parts.join('|').split(',');
					var type = type_key.shift();
					var key = type_key.join('#');

					$log.debug("Key " + key + " has type " + type + " and fields: " + fields);

					return {
						"type": type,
						"key": key,
						"fields": fields
					};
				}).filter(function(doc) {
					return doc.key === key_;
				});
				var doc = results.shift();
				$log.debug('doc = ', doc);
				return doc;
			};

			/** Returns fields array without `field` */
			$scope.removeField = function(field_, fields_) {
				return fields_.filter(function(field) {
					return field_ !== field;
				});
			};

			/** Returns true if field is part of accepted fields */
			$scope.acceptedField = function(field_, accepted_fields) {
				var items = (accepted_fields || []).map(function(item) {
					return item.key;
				});
				$log.debug("field = ", field_);
				$log.debug("acceptedFields = ", items);
				return items.indexOf(field_) >= 0;
			};

			/** Returns fields array appended with `field`, but only if it is part of accepted fields */
			$scope.addField = function(field_, fields_, accepted_fields) {
				fields_ = fields_ || [];
				if($scope.acceptedField(field_, accepted_fields) && (fields_.indexOf(field_) < 0)) {
					return [].concat(fields_).concat([field_]);
				} else {
					return fields_;
				}
			};

			/** Toggle document relation on property */
			$scope.setDocument = function(type_, path_, fields_) {

				fields_ = fields_ || ['$id'];

				var key_ = path_.join('.');

				$log.debug("type_ = ", type_);
				$log.debug("path_ = ", path_);
				$log.debug("key_ = ", key_);
				$log.debug("fields_ = ", fields_);

				var root = $scope.root;

				$log.debug("root = ", root);

				if(!root) {
					return false;
				}
				if(!root.hasOwnProperty('documents')) {
					root.documents = [];
				}
				var documents = root.documents;

				// Note: We must ignore any keyword which has ',' in it
				var line_ = (type_||'') + (type_?'#':'') + key_ + '|' + fields_.filter(function(f) {
					if(!f) { return; }
					return (''+f).indexOf(',') < 0;
				}).join(',');

				$log.debug("documents = ", documents);
				$log.debug("line_ = ", line_);

				var changed = false;

				var seen = {};

				var results = documents.map(function(line) {
					var parts = (line||'').split('|');
					var type_key = (parts.shift()||'').split('#');
					//var fields = parts.join('|').split(',');
					/*var type = */type_key.shift();
					var key = type_key.join('#');

					$log.debug("key = ", key);

					// Assert unique keywords
					if(seen.hasOwnProperty(key)) {
						return;
					}
					seen[key] = true;

					// Do not change other keywords
					if(key !== key_) {
						return line;
					}

					// Use our new line_ for this keyword
					changed = true;
					return line_;
				}).filter(function(line){
					return line?true:false;
				});

				if(changed) {
					root.documents = results;
				} else {
					root.documents.push(line_);
				}

				$log.debug("root.documents = ", root.documents);

				return $q.when($scope.commit()).then(function() {
					$scope.updateLink();
				});
			};

			/** */
			$scope.updateLink = function() {
				$scope.new_field = "";
				$scope.link = $scope.getDocument($scope.path);

				$log.debug('$scope.link for key ('+$scope.key+') updated as: ', $scope.link);
			};

			$scope.updateLink();

		}],
		templateUrl: '/_libs/nor/schemas/number.html'
	};
});

/* Element for boolean JSON schema */
norApp.directive('norSchemaBoolean', function() {
	return {
		restrict: 'E',
		scope: {
			key: '=',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', function($scope, $log) {

			/** Action to do on commit */
			$scope.commit = function() {
				if($scope.onCommit) {
					return $scope.onCommit();
				}
			};

		}],
		templateUrl: '/_libs/nor/schemas/boolean.html'
	};
});

/* Element for custom JSON schema */
norApp.directive('norSchemaCustom', function() {
	return {
		restrict: 'E',
		scope: {
			key: '=',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', function($scope, $log) {

			/** Action to do on commit */
			$scope.commit = function(value) {
				if(value !== undefined) {
					$scope.value = value;
				}
				if($scope.onCommit) {
					return $scope.onCommit();
				}
			};

		}],
		templateUrl: '/_libs/nor/schemas/custom.html'
	};
});

/* Element for custom JSON schema */
norApp.directive('norEditableContent', function() {
	return {
		restrict: 'A',
		scope: {
			'norOptions': '=?',
			'value': '=norEditableContent',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', '$timeout', function($scope, $log, $timeout) {

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

				value = value || '';

				// Trigger .onCommit() once when next change
				$log.debug('norEditableContent started listening value');
				var listener = $scope.$watch('value', function() {
					$log.debug('norEditableContent stopped listening value');
					listener();
					if($scope.onCommit) {
						$log.debug('Triggering norEditableContent.onCommit()');
						return $scope.onCommit();
					}
				});

				$scope.editing = false;
				$scope.option = value;
				$scope.value = value;

			};

		}],
		templateUrl: '/_libs/nor/editable-content.html'
	};
});

/** */
norApp.directive('ngEnter', function() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if(event.which === 13) {
				scope.$apply(function(){
					scope.$eval(attrs.ngEnter);
				});
				event.preventDefault();
			}
		});
	};
});

/** */
norApp.directive('autoFocus', function($timeout) {
	return {
		restrict: 'AC',
		link: function(_scope, _element) {
			$timeout(function(){
				_element[0].focus();
			}, 0);
		}
	};
});

/* Element for dropdown menus */
norApp.directive('norDropdown', function() {
	return {
		restrict: 'E',
		scope: {
			title: '=',
			links: '='
		},
		controller: ['$scope', '$log', function($scope, $log) {
			$scope.icon = $scope.icon || 'cog';
			$scope.title = $scope.title || '';
			$scope.links = $scope.links || [];
		}],
		templateUrl: '/_libs/nor/dropdown.html'
	};
});

/** Pretty print JSON filter */
norApp.filter('prettyPrint', function() {
	return function(input) {
		return JSON.stringify(input, null, 2);
	};
});

/** Unique filter */
norApp.filter('unique', function () {
	return function (items, attr) {
		var seen = {};
		return items.filter(function (item) {
			return (angular.isUndefined(attr) || !item.hasOwnProperty(attr)) ? true : seen[item[attr]] = !seen[item[attr]];
		});
	};
});
