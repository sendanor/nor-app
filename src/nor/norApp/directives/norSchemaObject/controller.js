"use strict";

var debug = require('nor-debug');

/* Element for object JSON Schema */
module.exports = ['$scope', function nor_schema_object_controller($scope) {

	$scope.root = $scope.root || undefined;
	$scope.parent = $scope.parent || undefined;
	$scope.key = $scope.key || undefined;

	/** Path from root object to this value as an array */
	$scope.path = ($scope.path && $scope.path()) || [];
	//debug.log('path = ', $scope.path);

	/** Action to do on commit */
	$scope.commit = function(value) {
		if(value) {

			// Trigger .onCommit() once when next change
			debug.log('norSchemaObject started listening value');
			var listener = $scope.$watch('value', function() {
				debug.log('norSchemaObject stopped listening value');
				listener();
				if($scope.onCommit) {
					debug.log('Triggering norSchemaObject.onCommit()');
					return $scope.onCommit();
				}
			}, true);

			$scope.value = value;

		} else if($scope.onCommit) {
			debug.log('Triggering norSchemaObject.onCommit()');
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

}];
