"use strict";

require('./style.css');

var template = require('./template.html');

/* Records */
module.exports = function nor_record_directive() {
	return {
		restrict: 'E',
		scope: {
			content: '=',
			type: '=?',
			onCommit: '&?'
		},
		controller: ['$scope', '$log', 'norRouter', 'norUtils', function($scope, $log, norRouter, norUtils) {

			$scope.content = $scope.content || {};
			$scope.type = $scope.type || undefined;

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
				return norUtils.getPointerFromPath($scope.content, $scope.type || {"type":"object"}, path);
			};

			/** Save changes on the backend */
			$scope.commit = function(content) {

				//$log.debug("norRecord.commit()");

				if(!content) { throw new TypeError("!content"); }

				// Trigger .onCommit() once when next change
				//$log.debug('norRecord started listening content');
				var listener = $scope.$watch('content', function() {
					//$log.debug('norRecord stopped listening content');
					listener();
					if($scope.onCommit) {
						//$log.debug('Triggering norRecord.onCommit()');
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
				//$log.debug('GET from ', content.$ref);
				return norRouter.get(content.$ref).then(function(data) {
					//$log.debug('Got content: ', data);
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
				if(!type) {
					return;
				}
				if(!type.$ref) {
					return;
				}
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
				if(!$scope.type) {
					return;
				}
				if(norUtils.detectMissingSettings($scope.content, $scope.type)) {
					return $scope.updateType($scope.type).then(function() {
						//$log.debug("Refreshing content...");
						return $scope.refreshContent($scope.content);
					});
				}
			};

			/** Update data in scope from $scope.content */
			function update_content() {

				//$log.debug("Updating content...", $scope.content);

				/* Path arrays to generic data in $scope.content. Array of paths, where a path is an array of property names. */
				$scope.keys = norUtils.getPathsFromData($scope.content);

				/* Pointers to paths */
				$scope.pointers = $scope.keys.map(function(path) {
					return $scope.getPointer(path);
				});

				/* Is there some pointers missing schema? */
				$scope.missing_schemas = false;
				if($scope.type && $scope.type.$ref) {
					$scope.pointers.forEach(function(pointer) {
						if(pointer.hasSchema()) {
							return;
						}
						$scope.missing_schemas = true;
					});
				}
			}

			update_content();

			$scope.$watch('content', function() {
				update_content();
			}, true);

			$scope.$watch('type', function() {
				update_content();
			}, true);

		}],
		templateUrl: template
	};
};
