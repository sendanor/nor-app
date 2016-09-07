
"use strict";

var XLSX = require('xlsx');
var debug = require('nor-debug');

/** Workbook for XLSX */
function Workbook() {
	if(!(this instanceof Workbook)) return new Workbook();
	this.SheetNames = [];
	this.Sheets = {};
}

/** */
function datenum(v, date1904) {
	if(date1904) v+=1462;
	var epoch = Date.parse(v);
	return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

/** */
function sheet_from_array_of_arrays(data, opts) {
	var ws = {};
	var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
	for(var R = 0; R != data.length; ++R) {
		for(var C = 0; C != data[R].length; ++C) {
			if(range.s.r > R) range.s.r = R;
			if(range.s.c > C) range.s.c = C;
			if(range.e.r < R) range.e.r = R;
			if(range.e.c < C) range.e.c = C;
			var cell = {v: data[R][C] };
			if(cell.v == null) continue;
			var cell_ref = XLSX.utils.encode_cell({c:C,r:R});

			if(typeof cell.v === 'number') cell.t = 'n';
			else if(typeof cell.v === 'boolean') cell.t = 'b';
			else if(cell.v instanceof Date) {
				cell.t = 'n'; cell.z = XLSX.SSF._table[14];
				cell.v = datenum(cell.v);
			}
			else {
				cell.t = 's';
				cell.v = ''+cell.v;
			}

			ws[cell_ref] = cell;
		}
	}
	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
	return ws;
}

/** Export data as XLSX */
module.exports = function export_data_xlsx(req, res, data, type) {
	debug.assert(req).is('object');
	debug.assert(res).is('object');
	debug.assert(data).is('array');

	var ws_name = (type && type.$name) || "Sheet1";
	var wb = new Workbook();
	var ws = sheet_from_array_of_arrays(data);
	wb.SheetNames.push(ws_name);
	wb.Sheets[ws_name] = ws;

	var wopts = { bookType:'xlsx', bookSST:false, type:'buffer' };
	var wbout = XLSX.write(wb, wopts);

	res.setHeader('Content-disposition', 'attachment; filename='+type.$name+'-documents.xlsx');
	res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
	res.status(200);
	res.send(wbout);
};
