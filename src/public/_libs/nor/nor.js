angular.module('norApp', []).controller('norCtrl', function($scope, $http, $log) {

	$scope.app = {
		name: 'UnnamedApp'
	};

	$scope.title = 'Index';

	$http({
		method: 'GET',
		url: '/api'
	}).then(function successCallback(response) {
		var data = response.data || {};
		Object.keys(data).forEach(function(key) {
			$scope[key] = data[key];
		});
	}, function errorCallback(response) {
		$log.error("error: ", response);
	});

});
