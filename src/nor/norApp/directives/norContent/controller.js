"use strict";

//var debug = require('nor-debug');
var is = require('nor-is');

/* Method */
module.exports = ['$scope', function nor_method_controller($scope) {

	/** @returns {string} Content display type */
	$scope.getContentType = function(model) {

		model = model || {};

		//var content = model.content;
		var type = model.$type;

		//$log.debug('type = ', type);

		if(type === "form" && is.array(model.content)) {
			return "form";
		}

		if(type === "table") {
			return "table";
		}

		if(type === "Type") {
			return "Type";
		}

		if(type === "Document") {
			return "record";
		}

		if(type === "redirect") {
			return "record";
		}

		if(type === "error") {
			return "record";
		}

		if(type === "record") {
			return "record";
		}

		return "default";
	};

}];
