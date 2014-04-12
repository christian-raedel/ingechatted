(function() {
  'use strict';

  function Gruntfile(grunt) {
    grunt.initConfig({
      pkg   : grunt.file.readJSON('package.json'),
      jshint: {
        all: [ '*.js', 'lib/**/*.js', 'test/**/*.js', 'config/**/*.json' ],
        options: {
          globals: {
            "strict": true,
            "node"  : true
          }
        }
      }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', [ 'jshint' ]);
  }

  module.exports = Gruntfile;
}(this));
