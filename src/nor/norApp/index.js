"use strict";

require('jquery');
require('jquery-ui/draggable.js');
require('jquery-ui/droppable.js');
require('jquery-ui/sortable.js');
require('angular');
require('angular-ui-sortable');
require('angular-dragdrop');

module.exports = require('./app.js');

require('./directives/');
require('./factories/');
require('./filters/');
require('./controllers/');

require('./layouts/default/index.js');
