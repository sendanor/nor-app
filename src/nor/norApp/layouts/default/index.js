"use strict";

/* Require CSS modules */

require("font-awesome/css/font-awesome.css");
require("font-awesome-webpack");

require("datatables.net-dt/css/jquery.dataTables.css");
require("bootstrap/dist/css/bootstrap.css");
require("purecss/build/pure.css");
require("ng-prettyjson-css");

require('jquery-ui-css/core.css');
require('jquery-ui-css/menu.css');
require('jquery-ui-css/autocomplete.css');
require('jquery-ui-css/sortable.css');
require('jquery-ui-css/draggable.css');
require('jquery-ui-css/theme.css');

require('./style.css');

/* Export HTML */

module.exports = require('./index.html');
