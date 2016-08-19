"use strict";

/** */
module.exports = function ng_enter_directive() {
	return function(scope, element, attrs) {
		element.bind("keydown keypress", function(event) {
			if(event.which === 13) {
				scope.$apply(function(){
					scope.$eval(attrs.ngEnter);
				});
				event.preventDefault();
			}
		});
	};
};

