"use strict";

var debug = require('nor-debug');
var angular = require("angular");

/* Tables */
module.exports = ['$scope', 'norUtils', 'norRouter', '$location', '$timeout', function nor_table_controller($scope, norUtils, norRouter, $location, $timeout) {

	$scope.settings = false;

	$scope.enableSettings = function() {
		$scope.settings = true;
	};

	$scope.disableSettings = function() {
		$scope.settings = false;
	};

	$scope.content = $scope.content || ($scope.model && $scope.model.content) || [];

	$scope.listFields = [];
	$scope.enabledFields = [];
	$scope.availableFields = [];

	$scope.updatePaths = function() {
		var model = $scope.model;
		var columns = model && model.$columns;
		var type = model && model.type;
		var methods = type && type.methods;
		var listFields = type && type.content && type.content.listFields;

		$scope.paths = (type && norUtils.getPathsFromType(type)) || columns.map(norUtils.parsePathArray) || [['$id'], ['$created'], ['$modified']];

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
		debug.log('$scope.enabledFields = ', $scope.enabledFields);

		var paths = $scope.paths.map(function(path) { return path.join('.'); });
		debug.log('paths = ', paths);

		$scope.enabledFields = $scope.enabledFields.filter(function(field) {
			return paths.indexOf(field) >= 0;
		});

		debug.log('after $scope.enabledFields = ', $scope.enabledFields);
	};

	$scope.normalizeAvailableFields = function() {
		debug.log('$scope.availableFields = ', $scope.availableFields);

		var paths = $scope.paths.map(function(path) { return path.join('.'); });
		debug.log('paths = ', paths);

		var enabledFields = $scope.enabledFields;
		debug.log('enabledFields = ', enabledFields);

		$scope.availableFields = $scope.availableFields.filter(function(field) {
			return (paths.indexOf(field) >= 0) && (enabledFields.indexOf(field) < 0);
		});

		debug.log('after $scope.availableFields = ', $scope.availableFields);
	};

	$scope.updatePages = function() {
		var model = $scope.model;
		var results = model.totalResults;
		var offset = model.offset || 0;
		var limit = model.limit;

		$scope.pages = Math.ceil(results/limit);
		$scope.page = Math.floor(offset/results*$scope.pages)+1;
	};

	$scope.page_moving = false;

	$scope.$watch('page_moving', function() {
		if($scope.page_moving) {
			$timeout(function() {
				$scope.page_moving = false;
			}, 500);
		}
	});

	$scope.prevPage = function() {
		if($scope.page_moving) {
			debug.log('Page moving already!');
			return;
		}

		$scope.page_moving = true;

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
		if($scope.page_moving) {
			debug.log('Page moving already!');
			return;
		}

		$scope.page_moving = true;

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

	$scope.over_droppable = false;

	$scope.overDroppable = function(value) {
		$scope.over_droppable = value===true ? true : false;
	};

	/** */
	$scope.saveTypeListFields = function(type, fields) {
		debug.log('type = ', type);
		debug.log('fields = ', fields);
		debug.assert(type).is('object');
		debug.assert(type.$ref).is('string');
		debug.assert(fields).is('array');
		type.content.listFields = fields;
		return norRouter.post(type.$ref, {'content': type.content}).then(function(/*data*/) {
			debug.log('successfully changed type');
		}, function errorCallback(response) {
			$log.error("error: ", response);
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

}];
