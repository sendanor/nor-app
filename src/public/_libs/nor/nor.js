var norApp = angular.module('norApp', [
	'datatables'
]);

norApp.config(function($locationProvider) {
	$locationProvider.html5Mode(true);
});

norApp.controller('norCtrl', function($scope, $http, $log, $location) {

	function change_scope_data(data) {
		data = data || {};
		$log.debug("new data = ", data);
		Object.keys(data).forEach(function(key) {
			$scope[key] = data[key];
		});
	}

	function get_path(path) {
		$http({
			method: 'GET',
			url: '/api' + path
		}).then(function successCallback(response) {
			change_scope_data(response.data);
		}, function errorCallback(response) {
			$log.error("error: ", response);
		});
	}

	$scope.$app = {
		name: 'Unnamed-App',
		menu: []
	};

	$scope.title = 'Undefined Title';

	$scope.$on('$locationChangeSuccess', function() {
		var path = $location.path();
		$log.debug("path = " + path);
		get_path(path);
	});

	//var path = $location.path();
	//$log.debug("path = " + path);
	//get_path(path);

});

norApp.controller('formCtrl', function($scope, $http, $log, $location) {

	$scope.alerts = [{"type":"danger", "title":"test", "content": "Content."}];

	$scope.closeAlert = function(alert) {
		$scope.alerts = $scope.alerts.filter(function(a) {
			return a != alert;
		});
	};

	$scope.openAlert = function(alert) {
			alert = alert || {};
			alert.type = alert.type || "danger";
			alert.title = alert.title || "Unknown Alert";
			alert.content = alert.content || "";
			$scope.alerts.push( alert );
	};

	$scope.data = {};

	$scope.submit = function() {
		$log.debug("form submit called: ", $scope.data );

		var path = $location.path();

		$log.debug("path = " + path);

		$http.post('/api' + path, $scope.data).then(function successCallback(response) {
			var data = response.data || {};
			Object.keys(data).forEach(function(key) {
				$scope[key] = data[key];
			});
		}, function errorCallback(response) {
			$log.error("error: ", response);
			$scope.openalert( {"type":"danger", title: "Error", content: ""+response} );
		});
	};

});
