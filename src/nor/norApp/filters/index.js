"use strict";
var app = require('../app.js');
app.filter('prettyPrint', require('./prettyPrint/filter.js'));
app.filter('unique', require('./unique/filter.js'));
