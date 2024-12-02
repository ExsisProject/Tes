// Karma configuration
// Generated on Wed Dec 03 2014 14:53:33 GMT+0900 (대한민국 표준시)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine', 'requirejs'],


    // list of files / patterns to load in the browser
    files: [
      'vendors/requirejs/require.js',
      'test/config/config.js',
      'test/test-main.js',
      'test/config/boot.js',
      
      {pattern: 'app/*/**', included: false},
      {pattern: 'components/**', included: false},
      {pattern: 'conf/**', included: false},
      {pattern: 'lang/**', included: false},
      {pattern: 'libs/**', included: false},
      {pattern: 'plugins/**', included: false},
      {pattern: 'test/unit/**/*spec.js', included: false},
      {pattern: 'test/mocks/**', included: false},
      {pattern: 'vendors/**', included: false},
      {pattern: 'test/config/*.js', included: false}
    ],

    // list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
        "plugins/**/*.js" : "coverage"
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress', 'junit', "coverage"],
    
    coverageReporter : {
        dir : 'test/output/coverage',
        reporters : [
            {type : 'cobertura' , subdir : "report-cobertuna"},
            {type : 'html' , subdir : "report-html"},
            {type : 'text'},
            {type : 'text-summary'}
        ]
    },
    
    junitReporter: {
        outputFile: 'test/output/test_result/test-resuls.xml'
    },


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
    
    browserNoActivityTimeout : 100000,


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true
  });
};
