"use strict";

//var debug = require('nor-debug');
var angular = require("angular");

/* Tables */
module.exports = ['$scope', 'norUtils', 'norRouter', '$location', '$timeout', function nor_table_controller($scope, norUtils, norRouter, $location, $timeout) {

	$scope.listFields = [];
	$scope.page_moving = false;

	/** */
	$scope.updatePaths = function() {
		var ngModel = $scope.ngModel;
		var columns = ngModel && ngModel.$columns;
		var type = ngModel && ngModel.type;
		var listFields;
		if($scope.currentView) {
			listFields = $scope.currentView.listFields;
		}

		$scope.paths = (type && norUtils.getPathsFromType(type)) || columns.map(norUtils.parsePathArray) || [['$id'], ['$created'], ['$modified']];

		$scope.listFields = listFields || $scope.paths.map(function(path) { return path.join('.'); }) || [];
		//debug.log('$scope.listFields as ', $scope.listFields);

	};

	/** */
	$scope.updatePages = function() {
		var ngModel = $scope.ngModel;
		var results = ngModel.totalResults;
		var offset = ngModel.offset || 0;
		var limit = ngModel.limit;

		$scope.pages = Math.ceil(results/limit);
		$scope.page = Math.floor(offset/results*$scope.pages)+1;
	};

	/** */
	$scope.prevPage = function() {
		if($scope.page_moving) {
			//debug.log('Page moving already!');
			return;
		}

		$scope.page_moving = true;

		var ngModel = $scope.ngModel;
		//var results = ngModel.totalResults;
		var offset = ngModel.offset || 0;
		var limit = ngModel.limit;
		var params = $location.search();
		offset -= limit;
		params = angular.merge(params, {'_offset':offset});

		return norRouter.go($scope, $location.path(), params);
	};

	/** */
	$scope.nextPage = function() {
		if($scope.page_moving) {
			//debug.log('Page moving already!');
			return;
		}

		$scope.page_moving = true;

		var ngModel = $scope.ngModel;
		//var results = ngModel.totalResults;
		var offset = ngModel.offset || 0;
		var limit = ngModel.limit;
		var params = $location.search();
		offset += limit;
		return norRouter.go($scope, $location.path(), angular.merge(params, {'_offset':offset}));
	};

	// Expose some functions
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
		return $scope.getTitleFromPath($scope.ngModel.type, field) || field;
	};

	// Watch our model
	$scope.$watch('ngModel', function() {
		//debug.log('model changed: ', $scope.ngModel);

		//$scope.content = ($scope.ngModel && $scope.ngModel.content) || [];

		//debug.log('$scope.ngModel.type = ', $scope.ngModel.type);

		if($scope.ngModel && $scope.ngModel.type) {
			$scope.currentViewID = ''+$scope.ngModel.type.content.defaultView;
		} else {
			$scope.currentViewID = '';
		}

		//debug.log('$scope.currentViewID = ', $scope.currentViewID);

		$scope.updatePaths();
		$scope.updatePages();
	}, true);

	// Watch changes to currentViewID
	$scope.$watch('currentViewID', function() {
		//debug.log('currentViewID changed: ', $scope.currentViewID);

		if($scope.ngModel.type && $scope.ngModel.type.views) {
			$scope.currentView = $scope.ngModel.type.views.byID[$scope.currentViewID];
		} else {
			$scope.currentView = undefined;
		}

		if($scope.currentView) {
			$scope.listFields = $scope.currentView.listFields;
			//debug.log('$scope.listFields as ', $scope.listFields);
		} else {
			$scope.listFields = [];
		}

		$scope.updatePaths();
	});

	// Watch changes to page_moving
	$scope.$watch('page_moving', function() {
		if($scope.page_moving) {
			$timeout(function() {
				$scope.page_moving = false;
			}, 500);
		}
	});

}];
