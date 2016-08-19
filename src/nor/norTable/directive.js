"use strict";

var angular = require("angular");

require('./style.css');

var template = require('./template.html');

/* Tables */
module.exports = function nor_table_directive() {
	return {
		restrict: 'E',
		scope: {
			model: '=',
			content: '=?',
			onCommit: '&?'
		},
		controller: ['$scope', 'norUtils', 'norRouter', '$location', function($scope, norUtils, norRouter, $location) {

			$scope.content = $scope.content || ($scope.model && $scope.model.content) || [];

			$scope.updatePaths = function() {
				var model = $scope.model;
				var columns = model.$columns;
				var type = model.type;
				$scope.paths = (type && norUtils.getPathsFromType(type)) || columns.map(norUtils.parsePathArray) || [['$id'], ['$created'], ['$modified']];
			};

			$scope.updatePages = function() {
				var model = $scope.model;
				var results = model.totalResults;
				var offset = model.offset || 0;
				var limit = model.limit;

				$scope.pages = Math.ceil(results/limit);
				$scope.page = Math.round(offset/results*$scope.pages)+1;
			};

			$scope.prevPage = function() {
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

		}],
		templateUrl: template
	};
};
