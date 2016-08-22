"use strict";

var template = require('./template.html');

/** Element for dropdown menus */
module.exports = function nor_dropdown_directive() {
	return {
		restrict: 'E',
		scope: {
			title: '=',
			links: '='
		},
		controller: ['$scope', function($scope) {
			$scope.icon = $scope.icon || 'cog';
			$scope.title = $scope.title || '';
			$scope.links = $scope.links || [];
		}],
		templateUrl: template
	};
};
