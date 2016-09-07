"use strict";

var CSV = require('nor-csv');

/** Export data as CSV */
module.exports = function export_data_csv(req, res, data, type) {
	debug.assert(req).is('object');
	debug.assert(res).is('object');
	debug.assert(data).is('array');

	var csv = CSV.stringify(data);
	debug.assert(csv).is('string');

	res.setHeader('Content-disposition', 'attachment; filename='+type.$name+'-documents.csv');
	res.set('Content-Type', 'text/csv');
	res.status(200);
	res.send(csv);
};
