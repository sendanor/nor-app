"use strict";

var debug = require('nor-debug');
var angular = require("angular");

/* Tables */
module.exports = ['$scope', 'norUtils', 'norRouter', '$location', '$timeout', function nor_table_controller($scope, norUtils, norRouter, $location, $timeout) {

	$scope.content = $scope.content || ($scope.model && $scope.model.content) || [];

	$scope.listFields = [];

	$scope.currentViewID = $scope.model.type.content.defaultView;
	if($scope.model.type.views) {
		$scope.currentView = $scope.model.type.views.byID[$scope.currentViewID];
		if($scope.currentView) {
			$scope.listFields = $scope.currentView.listFields;
		}
	}

	$scope.$watch('currentViewID', function() {
		if($scope.model.type.views) {
			$scope.currentView = $scope.model.type.views.byID[$scope.currentViewID];
			if($scope.currentView) {
				$scope.listFields = $scope.currentView.listFields;
			}
		}
	});

	/** */
	$scope.updatePaths = function() {
		var model = $scope.model;
		var columns = model && model.$columns;
		var type = model && model.type;
		var listFields;
		if($scope.currentView) {
			listFields = $scope.currentView.listFields;
		}

		$scope.paths = (type && norUtils.getPathsFromType(type)) || columns.map(norUtils.parsePathArray) || [['$id'], ['$created'], ['$modified']];

		$scope.listFields = listFields || $scope.paths.map(function(path) { return path.join('.'); }) || [];

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

	/** */
	$scope.getViewLabel = function(view) {
		return view.title || view.$name;
	};

	/** */
	$scope.getFieldIndex = function(field) {
		return $scope.getTitleFromPath($scope.model.type, field) || field;
	};

}];
