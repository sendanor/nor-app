// Karma configuration
// Generated on Wed Jul 27 2016 09:50:57 GMT+0000 (UTC)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha', 'chai'],






    // list of files / patterns to load in the browser
    files: [
      'src/public/_libs/jquery/jquery.min.js',
      'src/public/_libs/tv4/tv4.js',
      'src/public/_libs/tv4/tv4.async-jquery.js',
      'src/public/_libs/datatables.net/js/jquery.dataTables.js',
      'src/public/_libs/angular/angular.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'src/public/_libs/angular-sanitize/angular-sanitize.min.js',
      'src/public/_libs/angular-route/angular-route.min.js',
      'src/public/_libs/angular-ui-router/angular-ui-router.min.js',
      'src/public/_libs/angular-datatables/angular-datatables.min.js',
      'src/public/_libs/ace/ace.js',
      'src/public/_libs/ng-prettyjson/ng-prettyjson.min.js',
      'src/public/_libs/bootstrap/js/bootstrap.min.js',
      'src/public/_libs/nor/**/*.js',
      'tests/public/**/*-test.js'
    ],


    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
