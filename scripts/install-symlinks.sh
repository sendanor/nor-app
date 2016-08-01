#!/bin/sh
set -e

test -d src/public/_libs

cd src/public/_libs

test ! -e ace                 && cp -afr ../../../node_modules/ace-builds/src-min ace
test ! -e angular             && cp -afr ../../../node_modules/angular angular
test ! -e angular-datatables  && cp -afr ../../../node_modules/angular-datatables/dist/ angular-datatables
test ! -e angular-route       && cp -afr ../../../node_modules/angular-route angular-route
test ! -e angular-sanitize    && cp -afr ../../../node_modules/angular-sanitize angular-sanitize
test ! -e angular-ui-router   && cp -afr ../../../node_modules/angular-ui-router/release angular-ui-router
test ! -e bootstrap           && cp -afr ../../../node_modules/bootstrap/dist bootstrap
test ! -e font-awesome        && cp -afr ../../../node_modules/font-awesome/ font-awesome
test ! -e jquery              && cp -afr ../../../node_modules/jquery/dist/ jquery
test ! -e ng-prettyjson       && cp -afr ../../../node_modules/ng-prettyjson/dist/ ng-prettyjson
test ! -e purecss             && cp -afr ../../../node_modules/purecss/build/ purecss
test ! -e tv4                 && cp -afr ../../../node_modules/tv4/ tv4

mkdir -p datatables.net
cd datatables.net

test ! -e css     && cp -afr ../../../../node_modules/datatables.net-dt/css css
test ! -e images  && cp -afr ../../../../node_modules/datatables.net-dt/images images
test ! -e js      && cp -afr ../../../../node_modules/datatables.net/js js

exit 0
