"use strict";

var debug = require('nor-debug');

/* Element for array JSON Schema */
module.exports = ['$scope', function($scope) {

	$scope.enableBorder = ($scope.enableBorder === undefined) ? true : ($scope.enableBorder ? true : false);
	$scope.enableHeader = ($scope.enableHeader === undefined) ? true : ($scope.enableHeader ? true : false);
	$scope.enableInner = ($scope.enableInner === undefined) ? true : ($scope.enableInner ? true : false);
	$scope.enableSourceCode = ($scope.enableSourceCode === undefined) ? true : ($scope.enableSourceCode ? true : false);

			$scope.root = $scope.root || undefined;
			$scope.parent = $scope.parent || undefined;

			/** Path from root object to this value as an array */
			$scope.path = ($scope.path && $scope.path()) || [];
			//debug.log('path = ', $scope.path);

			$scope.key = $scope.key || undefined;

			/** Action to do on commit */
			$scope.commit = function(value) {
				if(value) {

					// Trigger .onCommit() once when next change
					debug.log('norSchemaArray started listening value');
					var listener = $scope.$watch('value', function() {
						debug.log('norSchemaArray stopped listening value');
						listener();
						if($scope.onCommit) {
							debug.log('Triggering norSchemaArray.onCommit()');
							return $scope.onCommit();
						}
					}, true);

					$scope.value = value;

				} else if($scope.onCommit) {
					debug.log('Triggering norSchemaArray.onCommit()');
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


		}];
