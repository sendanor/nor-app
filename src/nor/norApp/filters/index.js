"use strict";
var app = require('../app.js');
app.filter('prettyPrint', require('./prettyPrint/index.js'));
app.filter('unique', require('./unique/index.js'));
