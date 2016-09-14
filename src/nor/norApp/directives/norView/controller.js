"use strict";

var debug = require('nor-debug');
var merge = require('merge');
//var angular = require("angular");

function remove_duplicates(a) {
	return a.filter(function(item, pos, a2) {
		return a2.indexOf(item) === pos;
	});
}

/* Tables */
module.exports = ['$scope', 'norUtils', 'norRouter', '$location', '$timeout', function nor_table_controller($scope, norUtils, norRouter, $location, $timeout) {

	/** True if element has been removed */
	$scope.deleted = false;

	/** True if we're in editing mode */
	$scope.editing = $scope.editing ? true : false;

	$scope.enableEditing = function() {
		$scope.editing = true;
	};

	$scope.disableEditing = function() {
		$scope.editing = false;
	};

	$scope.ngModel = $scope.ngModel || {};
	$scope.type = $scope.type || {};

	$scope.enabledFieldsOptions = {
		connectWith: ".fields-available",
		stop: function() {
			$scope.normalizeFields();
		}
	};

	$scope.availableFieldsOptions = {
		connectWith: ".fields-enabled",
		stop: function() {
			$scope.normalizeFields();
		}
	};

	$scope.listFields = [];
	$scope.enabledFields = [];
	$scope.availableFields = [];

	$scope.updatePaths = function() {
		var model = $scope.ngModel;
		var listFields = model.listFields;

		$scope.paths = ($scope.type && norUtils.getPathsFromType($scope.type)) || [['$id'], ['$created'], ['$modified']];

		$scope.listFields = listFields || $scope.paths.map(function(path) { return path.join('.'); }) || [];

		if($scope.enabledFields.length === 0) {
			$scope.enabledFields = [].concat( $scope.listFields );
		}

		$scope.availableFields = [].concat( $scope.paths.map(function(path) {
			return path.join('.');
		}) );

		$scope.normalizeFields();
	};

	$scope.normalizeFields = function() {
		$scope.normalizeEnabledFields();
		$scope.normalizeAvailableFields();
	};

	$scope.delayedNormalizeFields = function() {
		var listen = $scope.$watch('enabledFields', function() {
			listen();
			$scope.normalizeEnabledFields();
			$scope.normalizeAvailableFields();
		});
	};

	$scope.normalizeEnabledFields = function() {
		debug.log('before $scope.enabledFields = ', $scope.enabledFields);

		var paths = $scope.paths.map(function(path) { return path.join('.'); });
		debug.log('paths = ', paths);

		$scope.enabledFields = remove_duplicates($scope.enabledFields.filter(function(field) {
			return paths.indexOf(field) >= 0;
		}));

		debug.log('after $scope.enabledFields = ', $scope.enabledFields);
	};

	$scope.normalizeAvailableFields = function() {
		debug.log('before $scope.availableFields = ', $scope.availableFields);

		var paths = $scope.paths.map(function(path) { return path.join('.'); });
		debug.log('paths = ', paths);

		var enabledFields = $scope.enabledFields;
		debug.log('enabledFields = ', enabledFields);

		$scope.availableFields = remove_duplicates($scope.availableFields.filter(function(field) {
			return (paths.indexOf(field) >= 0) && (enabledFields.indexOf(field) < 0);
		}));

		debug.log('after $scope.availableFields = ', $scope.availableFields);
	};

	$scope.updatePaths();

	$scope.$watch('model', function() {
		$scope.updatePaths();
	}, true);

	$scope.parsePathArray = norUtils.parsePathArray;
	$scope.getDataFromPath = norUtils.getDataFromPath;
	$scope.getSchemaFromPath = norUtils.getSchemaFromPath;
	$scope.getTitleFromPath = norUtils.getTitleFromPath;
	$scope.getDescriptionFromPath = norUtils.getDescriptionFromPath;

	/** */
	$scope.saveChanges = function(view, fields) {
		debug.log('view = ', view);
		debug.assert(view).is('object');
		debug.assert(view.$ref).is('string');
		if(fields !== undefined) {
			debug.log('fields = ', fields);
			debug.assert(fields).is('array');
			view.listFields = fields;
		}
		return norRouter.post(view.$ref, {'content': view}).then(function(/*data*/) {
			debug.log('successfully changed view');
			if(fields) {
				$scope.editing = false;
			}
		}, function errorCallback(response) {
			debug.error("error: ", response);
		});
	};

	/** */
	$scope.disableField = function(field) {
		$scope.enabledFields = $scope.enabledFields.filter(function(enabled_field) {
			return field !== enabled_field;
		});
		$scope.availableFields.push(field);
		$scope.normalizeFields();
	};

	/** */
	$scope.removeView = function nor_remove_view(view) {
		debug.log('view = ', view);
		debug.assert(view).is('object');
		debug.assert(view.$ref).is('string');
		return norRouter.del(view.$ref).then(function(/*data*/) {
			debug.log('successfully removed view');
			$scope.deleted = true;
		}, function errorCallback(response) {
			debug.error("error: ", response);
		});
	};

	/** */
	$scope.setAsDefaultView = function(type, view) {
		debug.log('view = ', view);
		debug.assert(view).is('object');
		debug.assert(view.$id).is('uuid');
		debug.log('type = ', type);
		debug.assert(type).is('object');
		debug.assert(type.$ref).is('string');
		type.content.defaultView = view.$id;
		return norRouter.post(type.$ref, {'content': type.content}).then(function(/*data*/) {
			debug.log('successfully changed type\'s default view');
		}, function errorCallback(response) {
			debug.error("error: ", response);
		});
	};

			/** */
			$scope.setCloneViewOptions = function(value) {
				$scope.new_view = merge({}, $scope.ngModel);
				$scope.new_view.$name = '';
				if($scope.new_view.$id) {
					delete $scope.new_view.$id;
				}
				$scope.show_clone_view_options = value ? true : false;
			};

			/** */
			$scope.cloneNewView = function(data) {
				$scope.show_clone_view_options = false;
				debug.assert($scope.type.views).is('object');
				debug.assert($scope.type.views.$ref).is('url');
				return norRouter.post($scope.type.views.$ref, {'content': data}).then(function(data) {
					debug.assert($scope.type).is('object');
					debug.assert($scope.type.$ref).is('url');

					//$scope.content = data.content;
					debug.log('data = ', data);
					debug.log('$ref = ', $scope.type.$ref);

					return norRouter.get($scope.type.$ref).then(function(data2) {
						debug.log('data2 = ', data2);
						$scope.type = data2;
						$scope.show_clone_view_options = false;
					});

				}, function errorCallback(response) {
					debug.error("error: ", response);
				});
			};

	$scope.setCloneViewOptions(false);

}];
