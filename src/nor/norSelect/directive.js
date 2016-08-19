"use strict";

var template = require('./template.html');

/* Select element for external resource */
module.exports = [function nor_select_directive() {
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
		templateUrl: template
	};
}];
