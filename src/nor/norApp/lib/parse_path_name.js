"use strict";

/** Returns the resource suffix part of an API URL */
module.exports = function parse_path_name(url) {
	if(!url) {
		return;
	}
	if(url.indexOf('/api/') >= 0) {
		var tmp = url.split('/api/');
		tmp.shift();
		var path = tmp.join('/api/');
		if(path === 'index') {
			return '';
		}
		return '/' + path;
	} else {
		if(url === '/index') {
			return '';
		}
		return url;
	}
};
