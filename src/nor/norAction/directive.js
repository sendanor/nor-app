"use strict";

require('./style.css');

/* Actions */
module.exports = function nor_action_directive() {
	return {
		restrict: 'E',
		transclude: true,
		scope: {
			click: '&',
			icon: '@?',
			dangerousIcon: '@?',
			title: '@?',
			classes: '@?class',
			safety: '@?'
		},
		controller: ['$scope', '$timeout', '$q', function($scope, $timeout, $q) {

			$scope.safety = $scope.safety === 'enabled';
			$scope.title = $scope.title || '';
			$scope.state = true;
			$scope.icon = $scope.icon || undefined;
			$scope.dangerousIcon = $scope.dangerousIcon || $scope.icon;

			/** Turn off safety for a moment */
			$scope.safetyOff = function() {
				$scope.state = 'loading';
				$timeout(function() {
					$scope.state = false;
					$timeout(function() {
						$scope.state = true;
					}, 5000);
				}, 500);
			};

			/** */
			$scope.execute = function() {
				$scope.state = 'loading';
				function fin() {
					$scope.state = true;
				}
				return $q.when($scope.click()).then(fin, fin);
			};

		}],
		template: '<div class="nor-action" ng-if="safety">'+
			'	<a href="#" title="{{title}}" ng-if="state === \'loading\'" class="safety-on"><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></a>'+
			'	<a href="#" title="{{title}}" ng-if="state === true" ng-click="safetyOff()" class="safety-on"><i class="fa fa-{{icon}}" ng-if="icon" aria-hidden="true"></i></a>'+
			'	<a href="#" title="{{title}}" ng-if="state === false" ng-click="execute()" class="safety-off"><i class="fa fa-{{dangerousIcon}}" ng-if="dangerousIcon" aria-hidden="true"></i> <ng-transclude></ng-transclude></a>'+
			'</div>'+
			'<div class="nor-action" ng-if="!safety">'+
			'	<a href="#" title="{{title}}" ng-if="state === \'loading\'" class="safety-on"><i class="fa fa-spinner fa-spin" aria-hidden="true"></i></a>'+
			'	<a href="#" title="{{title}}" ng-if="state !== \'loading\'" ng-click="execute()" class="safety-off"><i class="fa fa-{{dangerousIcon}}" ng-if="dangerousIcon" aria-hidden="true"></i> <ng-transclude></ng-transclude></a>'+
			'</div>'
	};
};
