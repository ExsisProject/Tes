'use strict';
var path = require('path');

function init(grunt){
    // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      karma : {
          unit : {
              configFile : 'karma.conf.js'
          }
      },
      jshint : {
    	  allFiles:[
//               "../app/**/*.js",
//               "../libs/*.js",
//               "../components/*.js",
//               "../plugins/**/*.js"
				"Gruntfile.js",
				"../plugins/report/**/*.js",
                "../plugins/contact/**/*.js"
          ],
          options : {
//              reporter: require('jshint-stylish'), 
        	  reporter: require('jshint-jenkins-checkstyle-reporter'),
              reporterOutput: 'report-jshint-checkstyle.xml'
          }
      },
      bower : {
    	  install : {
    		  options : {
    			  targetDir : "vendors"
    		  }
    	  }
      }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-bower-task');
    
    // Default task(s).
    grunt.registerTask('default', ['karma', 'jshint']);
}

module.exports = init