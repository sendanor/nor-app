"use strict";

var debug = require('nor-debug');

/* Types */
module.exports = ['$scope', '$log', 'norRouter', function nor_type_controller($scope, $log, norRouter) {

			var defaultMethods = $scope.methods;
			var defaultViews = $scope.views;
			var defaultContent = $scope.content;

			//$scope.ngModel = $scope.ngModel;

			$scope.updateScope = function() {
				$scope.methods                    = defaultMethods || $scope.ngModel.methods || {};
				$scope.views                      = defaultViews || $scope.ngModel.views || {};
				$scope.content                    = defaultContent || $scope.ngModel.content || {};
				$scope.content.$name              = $scope.content.$name || '';
				$scope.content.$schema            = $scope.content.$schema || {};
				$scope.content.$schema.properties = $scope.content.$schema.properties || {};
				$scope.keys = Object.keys($scope.content.$schema.properties);
				$scope.model = $scope.ngModel;
			};

			$scope.updateScope();

			$scope.$watch('ngModel', function() {
				$scope.updateScope();
			}, true);

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


	$scope.show_add_method_options = false;

			/** */
			$scope.setAddMethodOptions = function(value) {
				$scope.new_method = {
					'name': '',
					'body': 'function() {\n\treturn "";\n}'
				};
				$scope.show_add_method_options = value ? true : false;
			};

			/** */
			$scope.addNewMethod = function(data) {
				$scope.show_add_method_options = false;

				var title = (''+data.name).trim();
				var name = title.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_+/g, "").replace(/_+$/, "");

				return norRouter.post($scope.methods.$ref, {'content': {
					'title': title,
					"$name": name,
					"$body": data.body
				}}).then(function(data) {
					//$scope.content = data.content;
					//debug.log('data = ', data);
					//debug.log('$ref = ', $scope.content.$ref);

					return norRouter.get($scope.content.$ref).then(function(data2) {
						//debug.log('data2 = ', data2);
						$scope.content = data2.content;
						$scope.methods = data2.methods;
						$scope.show_add_method_options = false;
					});

				}, function errorCallback(response) {
					$log.error("error: ", response);
				});
			};

			/** */
			$scope.setAddViewOptions = function(value) {
				$scope.new_view = {
					'$name': '',
					'listFields': ['$id']
				};
				$scope.show_add_view_options = value ? true : false;
			};

			/** */
			$scope.addNewView = function(data) {
				$scope.show_add_view_options = false;
				debug.assert($scope.views).is('object');
				debug.assert($scope.views.$ref).is('url');
				return norRouter.post($scope.views.$ref, {'content': data}).then(function(data) {
					debug.assert($scope.content).is('object');
					debug.assert($scope.content.$ref).is('url');

					//$scope.content = data.content;
					//debug.log('data = ', data);
					//debug.log('$ref = ', $scope.content.$ref);

					return norRouter.get($scope.content.$ref).then(function(data2) {
						//debug.log('data2 = ', data2);
						$scope.content = data2.content;
						$scope.views = data2.views;
						$scope.show_add_view_options = false;
					});

				}, function errorCallback(response) {
					$log.error("error: ", response);
				});
			};

	/** Returns the `$id` property if it exists, for use as an index, otherwise undefined. */
	$scope.getIndexById = function(item) {
		return item && item.$id;
	};

}];
