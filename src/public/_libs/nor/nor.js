angular.module('norApp', [
]).config(function($locationProvider) {
	$locationProvider.html5Mode(true);
}).controller('norCtrl', function($scope, $http, $log, $location) {

	$scope.app = {
		name: 'Unnamed-App',
		menu: []
	};

	$scope.title = 'Undefined Title';

	var path = $location.path();

	$log.debug("path = " + path);

	$http({
		method: 'GET',
		url: '/api' + path
	}).then(function successCallback(response) {
		var data = response.data || {};
		Object.keys(data).forEach(function(key) {
			$scope[key] = data[key];
		});
	}, function errorCallback(response) {
		$log.error("error: ", response);
	});

});
