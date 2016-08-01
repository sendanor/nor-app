#!/bin/sh
set -e

test -d src/public/_libs

cd src/public/_libs

test ! -h ace                 && ln -s ../../../node_modules/ace-builds/src-min ace
test ! -h angular             && ln -s ../../../node_modules/angular angular
test ! -h angular-datatables  && ln -s ../../../node_modules/angular-datatables/dist/ angular-datatables
test ! -h angular-route       && ln -s ../../../node_modules/angular-route angular-route
test ! -h angular-sanitize    && ln -s ../../../node_modules/angular-sanitize angular-sanitize
test ! -h angular-ui-router   && ln -s ../../../node_modules/angular-ui-router/release angular-ui-router
test ! -h bootstrap           && ln -s ../../../node_modules/bootstrap/dist bootstrap
test ! -h font-awesome        && ln -s ../../../node_modules/font-awesome/ font-awesome
test ! -h jquery              && ln -s ../../../node_modules/jquery/dist/ jquery
test ! -h ng-prettyjson       && ln -s ../../../node_modules/ng-prettyjson/dist/ ng-prettyjson
test ! -h purecss             && ln -s ../../../node_modules/purecss/build/ purecss
test ! -h tv4                 && ln -s ../../../node_modules/tv4/ tv4

mkdir -p datatables.net
cd datatables.net

test ! -h css     && ln -s ../../../../node_modules/datatables.net-dt/css css
test ! -h images  && ln -s ../../../../node_modules/datatables.net-dt/images images
test ! -h js      && ln -s ../../../../node_modules/datatables.net/js js

exit 0
