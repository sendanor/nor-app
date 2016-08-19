"use strict";

/** Pretty print JSON filter */
module.exports = function prettyPrint_filter() {
	return function(input) {
		return JSON.stringify(input, null, 2);
	};
};

