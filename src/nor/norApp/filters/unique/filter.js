"use strict";

var angular = require("angular");

/** Unique filter */
module.exports = function unique_filter() {
	return function (items, attr) {
		var seen = {};
		return items.filter(function (item) {
			return (angular.isUndefined(attr) || !item.hasOwnProperty(attr)) ? true : seen[item[attr]] = !seen[item[attr]];
		});
	};
};
