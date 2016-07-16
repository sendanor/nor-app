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
			onCommit: '&?'
		},
		controller: ['$scope', '$log', 'norRouter', function($scope, $log, norRouter) {

			$scope.content = $scope.content || {};

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

			}

			/**
			 * @param key {string} The path to the value
			 * @returns value at the place for key
			 */
			$scope.get_content = function(keys) {
				return _get_content($scope.content, keys);
			};

			/** Save changes on the backend */
			$scope.commit = function(content) {
				if(!content) { throw new TypeError("!content"); }

				// Trigger .onCommit() once when next change
				var listener = $scope.$watch('content', function() {
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

/* Tables */
norApp.directive('norTable', function() {
	return {
		restrict: 'E',
		scope: {
			model: '=',
			content: '=?',
			onCommit: '&?'
		},
		controller: ['$scope', '$http', '$log', '$location', 'norRouter', function($scope, $http, $log, $location, norRouter) {

			$scope.content = $scope.content || ($scope.model && $scope.model.content) || [];

			/** Save changes on the backend */
			/*
			$scope.commit = function(content) {
				if(!content) { throw new TypeError("!content"); }

				// Trigger .onCommit() once when next change
				var listener = $scope.$watch('content', function() {
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
			*/

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

			/** */
			$scope.prettyprint = function(data) {
				return JSON.stringify(data, null, 2);
			};

			/** Save changes on the backend */
			$scope.commit = function(content) {
				if(!content) { throw new TypeError("!content"); }

				// Trigger .onCommit() once when next change
				var listener = $scope.$watch('content', function() {
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

		}],
		templateUrl: '/_libs/nor/type.html'
	};
}]);

/* Element for any JSON schema element */
norApp.directive('norSchema', function() {
	return {
		restrict: 'E',
		scope: {
			parent: '=?',
			key: '=?',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', function($scope, $log) {

			$scope.parent = $scope.parent || undefined;
			$scope.key = $scope.key || undefined;

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
			parent: '=?',
			key: '=?',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', function($scope, $log) {

			$scope.parent = $scope.parent || undefined;
			$scope.key = $scope.key || undefined;

			/** Action to do on commit */
			$scope.commit = function() {
				if($scope.onCommit) {
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
				lastNewPropertyKey = key;
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
				var parent = $scope.parent;
				if(!parent) {
					return false;
				}
				return parent.hasOwnProperty('$schema');
			};

			/** Returns true if property is index */
			$scope.hasIndex = function(key) {
				var parent = $scope.parent;
				if(!parent) {
					return false;
				}
				if(!parent.hasOwnProperty('indexes')) {
					return false;
				}
				var indexes = parent.indexes;
				var i = indexes.indexOf(key);
				return i >= 0;
			};

			/** Toggle index on property */
			$scope.toggleIndex = function(key) {
				var parent = $scope.parent;
				if(!parent) {
					return false;
				}
				if(!parent.hasOwnProperty('indexes')) {
					parent.indexes = [];
				}
				var indexes = parent.indexes;
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
			key: '=?',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', function($scope, $log) {

			$scope.key = $scope.key || undefined;

			/** Action to do on commit */
			$scope.commit = function() {
				if($scope.onCommit) {
					return $scope.onCommit();
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
		templateUrl: '/_libs/nor/schemas/string.html'
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
			$scope.commit = function() {
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
				var listener = $scope.$watch('value', function() {
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
