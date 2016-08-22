"use strict";

/* Types */
module.exports = ['$scope', '$log', 'norRouter', function nor_type_controller($scope, $log, norRouter) {

			$scope.content                    = $scope.content || {};
			$scope.content.$name              = $scope.content.$name || '';
			$scope.content.$schema            = $scope.content.$schema || {};
			$scope.content.$schema.properties = $scope.content.$schema.properties || {};
			$scope.keys = Object.keys($scope.content.$schema.properties);

			/** If true, the JSON editor for the type is enabled */
			$scope.editor = false;

			/** Set editor */
			$scope.setEditor = function(value) {
				$scope.editor = value ? true : false;
			};

			/** */
			$scope.prettyprint = function(data) {
				return JSON.stringify(data, null, 2);
			};

			/** Save changes on the backend */
			$scope.commit = function(content) {
				$log.debug("norType.commit()");
				if(!content) { throw new TypeError("!content"); }

				// Trigger .onCommit() once when next change
				$log.debug('norType started listening content');
				var listener = $scope.$watch('content', function() {
					$log.debug('norType stopped listening content');
					listener();
					if($scope.onCommit) {
						return $scope.onCommit();
					}
				}, true);

				return norRouter.post($scope.content.$ref, {'content': content}).then(function(data) {
					$scope.content = data.content;
				}, function errorCallback(response) {
					$log.error("error: ", response);
				});
			};

			// 
			if($scope.content.$schema.type !== "object") {
				$scope.content.$schema.type = 'object';
				return $scope.commit($scope.content);
			}

}];
