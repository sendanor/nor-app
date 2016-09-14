"use strict";

var merge = require('merge');
var debug = require('nor-debug');

/* Method */
module.exports = ['$scope', '$log', 'norRouter', '$timeout', function nor_method_controller($scope, $log, norRouter, $timeout) {

	$scope.content = $scope.content || {};

	/** ACE options for body */
	$scope.bodyOptions = {
		mode: 'javascript',
		useWrapMode : false,
		highlightActiveLine: true,
		enableVerticalScrollbar: true
	};

	$scope.rowHeight = 16;
	$scope.lines = 1;
	$scope.bodyEditor = undefined;

	/** This is the body property which should be same as in the backend, so it can be used to check if we need to POST */
	var last_body = $scope.content.body || '';

	/** This is use so that recountLines() remembers how many lines last call had */
	var last_lines = -1;

	$scope.commitTriggered = false;

	/** */
	$scope.recountLines = function recount_lines() {
		//debug.log('content: ', $scope.content);
		//debug.log('body: ', $scope.content.body);

		if(!($scope.content && $scope.content.$active)) {
			//debug.log("Not active");
			return;
		}

		var lines = $scope.content.body.split('\n').length;
		if(lines < 1) {
			lines = 1;
		}

		// Ignore if nothing changes
		if(last_lines === lines) {
			//debug.log("Not changed: last_lines = ", last_lines, ' and lines = ', lines);
			return;
		}

		$scope.lines = lines;
		last_lines = lines;

		//debug.log('Changed to ', lines, ' lines');
	};

	/** Save changes on the backend */
	$scope.commit = function norMethod_commit(content) {
		//debug.log("norMethod.commit()");
		if(!content) { throw new TypeError("!content"); }

		// Trigger .onCommit() once when next change
		//debug.log('norMethod started listening content');
		var listener = $scope.$watch('content', function norMethod_content_watcher() {
			//debug.log('norMethod stopped listening content');
			listener();
			if($scope.onCommit) {
				return $scope.onCommit();
			}
		}, true);

		return norRouter.post($scope.content.$ref, {'content': content}).then(function(data) {
			$scope.content = merge({}, data.content, {'body': $scope.content.body});
			return data.content;
		}, function errorCallback(response) {
			$log.error("error: ", response);
		});
	};

	/** */
	$scope.bodyLoaded = function(_editor) {
		////debug.log('bodyLoaded()');
		//_editor.setReadOnly(true);

		$scope.bodyEditor = _editor;

		if($scope.bodyEditor.renderer) {
			$scope.rowHeight = $scope.bodyEditor.renderer.lineHeight;
		}

		$scope.recountLines();

	};

	/** */
	$scope.bodyChanged = function(/*e*/) {
		//debug.log('bodyChanged()');
		$scope.recountLines();

		if((last_body !== $scope.content.body) && (!$scope.commitTriggered)) {
			$scope.commitTriggered = true;
			$timeout(function() {
				$scope.commit($scope.content).then(function(content) {
					last_body = content.body;
					$scope.commitTriggered = false;
				});
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

	/** */
	$scope.unpublish = function norMethod_unpublish() {
		$scope.content.$active = false;
		$scope.content.$body = $scope.content.body;
		$scope.commit($scope.content);
	};

	//$scope.$watch('body', $scope.recountLines);

	$scope.bodyOptions.onLoad = $scope.bodyLoaded;
	$scope.bodyOptions.onChange = $scope.bodyChanged;

	// Watch changes to content
	$scope.$watch('content', function() {
		$scope.content.$name = $scope.content.$name || '';
		$scope.content.$body = $scope.content.$body || '';
		$scope.content.body = $scope.content.body || $scope.content.$body || 'function() {}';
		//debug.log('$scope.content = ', $scope.content);
	}, true);

	// Watch changes to rowHeight
	$scope.$watch('rowHeight', function() {
		$scope.bodyMinHeight = $scope.rowHeight*1;
		$scope.bodyMaxHeight = $scope.rowHeight*24;
		//debug.log('$scope.bodyMinHeight = ', $scope.bodyMinHeight);
		//debug.log('$scope.bodyMaxHeight = ', $scope.bodyMaxHeight);
	});

	// Watch changes to lines and rowHeight
	//$scope.$watch(['lines', 'rowHeight'], function() {
	//	$scope.bodyHeight = $scope.lines * $scope.rowHeight;
	//});

	/** Resize bodyHeight when lines changes */
	$scope.$watch(function() {
		return Math.min(Math.max( $scope.lines * $scope.rowHeight, $scope.bodyMinHeight), $scope.bodyMaxHeight);
	}, function() {
		//debug.log('$scope.lines = ', $scope.lines);
		$scope.bodyHeight = Math.min(Math.max( $scope.lines * $scope.rowHeight, $scope.bodyMinHeight), $scope.bodyMaxHeight);
		//debug.log('$scope.bodyHeight = ', $scope.bodyHeight);
	});

	/** Resize ACE when bodyHeight changes */
	$scope.$watch('bodyHeight', function() {
		//$timeout(function() {
			if($scope.bodyEditor) {
				//debug.log('resizing ', $scope.bodyHeight);
				$scope.bodyEditor.resize();
			}
		//}, 250);
	});

}];
