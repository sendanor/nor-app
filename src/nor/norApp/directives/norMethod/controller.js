"use strict";

var debug = require('nor-debug');

/* Method */
module.exports = ['$scope', '$log', 'norRouter', '$timeout', function nor_method_controller($scope, $log, norRouter, $timeout) {

	$scope.content                    = $scope.content || {};
	$scope.content.$name              = $scope.content.$name || '';
	$scope.content.$body              = $scope.content.$body || '';

	/** ACE options for body */
	$scope.bodyOptions = {
		mode: 'javascript',
		useWrapMode : false,
		highlightActiveLine: true,
		enableVerticalScrollbar: true
	};

	$scope.rowHeight = 16;
	$scope.lines = 1;
	$scope.bodyMinHeight = $scope.rowHeight*1;
	$scope.bodyMaxHeight = $scope.rowHeight*24;
	$scope.bodyHeight = $scope.lines * $scope.rowHeight;
	$scope.bodyEditor = undefined;
	$scope.body = $scope.content.body || $scope.content.$body || 'function() {}';

	/** This is use so that recountLines() remembers how many lines last call had */
	var last_lines = -1;

	/** */
	$scope.recountLines = function resize_body() {

		var lines = $scope.body.split('\n').length;
		if(lines < 1) {
			lines = 1;
		}

		// Ignore if nothing changes
		if(last_lines === lines) {
			return;
		}

		$scope.lines = lines;
		last_lines = lines;
	};

	/** Resize bodyHeight when lines changes */
	$scope.$watch('lines', function() {
		//debug.log('$scope.lines = ', $scope.lines);
		$scope.bodyHeight = Math.min(Math.max( $scope.lines * $scope.rowHeight, $scope.bodyMinHeight), $scope.bodyMaxHeight);
		//debug.log('scope.bodyHeight = ', $scope.bodyHeight);
	});


	/** Resize ACE when bodyHeight changes */
	$scope.$watch('bodyHeight', function() {
		$timeout(function() {
			if($scope.bodyEditor) {
				//debug.log('resizing ', $scope.bodyHeight);
				$scope.bodyEditor.resize();
			}
		}, 250);
	});

	/** Save changes on the backend */
	$scope.commit = function(content) {
		$log.debug("norMethod.commit()");
		if(!content) { throw new TypeError("!content"); }

		// Trigger .onCommit() once when next change
		$log.debug('norMethod started listening content');
		var listener = $scope.$watch('content', function() {
			$log.debug('norMethod stopped listening content');
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

	/** */
	$scope.bodyLoaded = function(_editor) {
		//debug.log('bodyLoaded()');
		//_editor.setReadOnly(true);

		$scope.bodyEditor = _editor;

		if($scope.bodyEditor.renderer) {
			$scope.rowHeight = $scope.bodyEditor.renderer.lineHeight;
		}

		$scope.recountLines();

	};

	$scope.commitTriggered = false;

	/** */
	$scope.bodyChanged = function(/*e*/) {
		//debug.log('bodyChanged()');
		$scope.recountLines();

		if( ($scope.content.body !== $scope.body) && (!$scope.commitTriggered) ) {
			$scope.content.body = $scope.body;
			$timeout(function() {
				$scope.commit($scope.content);
				$scope.commitTriggered = false;
			}, 500);
		}
	};

	/** */
	$scope.publish = function norMethod_publish() {
		if($scope.content.body !== $scope.content.$body) {
			$scope.content.$body = $scope.content.body;
			$scope.commit($scope.content);
		}
	};

	$scope.$watch('body', $scope.recountLines);

	$scope.bodyOptions.onLoad = $scope.bodyLoaded;
	$scope.bodyOptions.onChange = $scope.bodyChanged;

}];
