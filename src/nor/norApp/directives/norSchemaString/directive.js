"use strict";

require('./style.css');

var debug = require('nor-debug');
var template = require('./template.html');

/** Element for string JSON schema */
module.exports = function nor_schema_string_directive() {
	return {
		restrict: 'E',
		scope: {
			root: '=?',
			parent: '=?',
			path: '&?',
			key: '=',
			value: '=',
			onCommit: '&?'
		},
		controller: ['$scope', '$q', function($scope, $q) {

			$scope.new_field = "";

			$scope.root = $scope.root || undefined;
			$scope.parent = $scope.parent || undefined;

			/** Path from root object to this value as an array */
			$scope.path = ($scope.path && $scope.path()) || [];
			//debug.log('path = ', $scope.path);

			/** Action to do on commit */
			$scope.commit = function(value) {
				//if(value !== undefined) {

					// Trigger .onCommit() once when next change
					debug.log('norSchemaString started listening value');
					var listener = $scope.$watch('value', function() {
						debug.log('norSchemaString stopped listening value');
						listener();
						if($scope.onCommit) {
							debug.log('Triggering norSchemaString.onCommit() #1');
							return $scope.onCommit();
						}
					}, true);

					if(value !== undefined) {
						$scope.value = value;
					}

				//} else if($scope.onCommit) {
				//	debug.log('Triggering norSchemaString.onCommit() #2');
				//	return $scope.onCommit();
				//}
			};

			/** Returns true if property has support for (relation of) documents */
			$scope.documentsEnabled = function() {
				var root = $scope.root;
				if(!root) {
					return false;
				}
				return root.hasOwnProperty('$schema');
			};

			/** Returns true if property has link to document */
			$scope.hasDocument = function(key_) {
				var root = $scope.root;
				if(!root) {
					return false;
				}
				if(!root.hasOwnProperty('documents')) {
					return false;
				}
				var documents = root.documents;
				var results = documents.filter(function(line) {
					var parts = line.split('|');
					var type_key = parts.shift().split('#');
					//var fields = parts.join('|').split(',');
					/*var type = */type_key.shift();
					var key = type_key.join('#');

					return key === key_;
				});
				return results.length >= 1;
			};

			/** Returns document link information */
			$scope.getDocument = function(path_) {
				var key_ = path_.join('.');
				debug.log("key_ = ", key_);
				var root = $scope.root;
				if(!root) {
					debug.log("No root");
					return;
				}
				if(!root.hasOwnProperty('documents')) {
					debug.log("No documents in root");
					return {
						"type": "",
						"key": key_,
						"fields": []
					};
				}
				var documents = root.documents;
				debug.log('key_ = ', key_);
				debug.log('documents = ', documents);
				var results = documents.map(function(line) {
					var parts = line.split('|');
					var type_key = parts.shift().split('#');
					var fields = parts.join('|').split(',');
					var type = type_key.shift();
					var key = type_key.join('#');

					debug.log("Key " + key + " has type " + type + " and fields: " + fields);

					return {
						"type": type,
						"key": key,
						"fields": fields
					};
				}).filter(function(doc) {
					return doc.key === key_;
				});
				var doc = results.shift();
				debug.log('doc = ', doc);
				return doc;
			};

			/** Returns fields array without `field` */
			$scope.removeField = function(field_, fields_) {
				return fields_.filter(function(field) {
					return field_ !== field;
				});
			};

			/** Returns true if field is part of accepted fields */
			$scope.acceptedField = function(field_, accepted_fields) {
				var items = (accepted_fields || []).map(function(item) {
					return item.key;
				});
				debug.log("field = ", field_);
				debug.log("acceptedFields = ", items);
				return items.indexOf(field_) >= 0;
			};

			/** Returns fields array appended with `field`, but only if it is part of accepted fields */
			$scope.addField = function(field_, fields_, accepted_fields) {
				fields_ = fields_ || [];
				if($scope.acceptedField(field_, accepted_fields) && (fields_.indexOf(field_) < 0)) {
					return [].concat(fields_).concat([field_]);
				} else {
					return fields_;
				}
			};

			/** Toggle document relation on property */
			$scope.setDocument = function(type_, path_, fields_) {

				fields_ = fields_ || ['$id'];

				var key_ = path_.join('.');

				debug.log("type_ = ", type_);
				debug.log("path_ = ", path_);
				debug.log("key_ = ", key_);
				debug.log("fields_ = ", fields_);

				var root = $scope.root;

				debug.log("root = ", root);

				if(!root) {
					return false;
				}
				if(!root.hasOwnProperty('documents')) {
					root.documents = [];
				}
				var documents = root.documents;

				// Note: We must ignore any keyword which has ',' in it
				var line_ = (type_||'') + (type_?'#':'') + key_ + '|' + fields_.filter(function(f) {
					if(!f) { return; }
					return (''+f).indexOf(',') < 0;
				}).join(',');

				debug.log("documents = ", documents);
				debug.log("line_ = ", line_);

				var changed = false;

				var seen = {};

				var results = documents.map(function(line) {
					var parts = (line||'').split('|');
					var type_key = (parts.shift()||'').split('#');
					//var fields = parts.join('|').split(',');
					/*var type = */type_key.shift();
					var key = type_key.join('#');

					debug.log("key = ", key);

					// Assert unique keywords
					if(seen.hasOwnProperty(key)) {
						return;
					}
					seen[key] = true;

					// Do not change other keywords
					if(key !== key_) {
						return line;
					}

					// Use our new line_ for this keyword
					changed = true;
					return line_;
				}).filter(function(line){
					return line?true:false;
				});

				if(changed) {
					root.documents = results;
				} else {
					root.documents.push(line_);
				}

				debug.log("root.documents = ", root.documents);

				return $q.when($scope.commit()).then(function() {
					$scope.updateLink();
				});
			};

			/** */
			$scope.updateLink = function() {
				$scope.new_field = "";
				$scope.link = $scope.getDocument($scope.path);

				debug.log('$scope.link for key ('+$scope.key+') updated as: ', $scope.link);
			};

			$scope.updateLink();

		}],
		templateUrl: template
	};
};
