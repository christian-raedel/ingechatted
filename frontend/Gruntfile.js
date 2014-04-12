(function() {
  'use strict';

  var gruntfile = 'Gruntfile.js',
      configFiles = 'config/**/*.json',
      srcFiles = [ 'lib/**/*.js' ],
      testFiles = [ 'test/**/*.js' ],
      allFiles = srcFiles.concat(gruntfile, testFiles, configFiles),
      bowerComponents = [
        'angular/angular.js'
      ].map(
        function(item) {
          return 'bower_components/' + item;
        }
      ),
      appFile = 'build/app.js';

  function Gruntfile(grunt) {
    grunt.initConfig({
      pkg   : grunt.file.readJSON('bower.json'),
      jshint: {
        all: allFiles,
        src: srcFiles.concat(configFiles),
        test: testFiles.concat(configFiles),
        options: {
          globals: {
            "strict" : true,
            "browser": true
          }
        }
      },
      concat: {
        javascripts: {
          src : bowerComponents.concat(srcFiles),
          dest: appFile
        }
      },
      uglify: {
        options: {
          banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
        },
        build  : {
          src : appFile,
          dest: appFile.substr(0, appFile.lastIndexOf('.')) + '.min.js'
        }
      },
      copy: {
        javascripts: {
          files: [{
            expand: true,
            cwd: 'build/',
            src: '*.js',
            dest: '../public/javascripts/',
            filter: 'isFile'
          }]
        }
      },
      watch: {
        gruntfile: {
          files: gruntfile,
          tasks: [ 'jshint:gruntfile' ]
        },
        src: {
          files: srcFiles,
          tasks: [ 'default' ],
          options: {
            spawn: false
          }
        },
        test: {
          files: testFiles,
          tasks: [ 'jshint:test', 'karma' ],
          options: {
            spawn: false
          }
        }
      },
      clean: [ 'build/*.js' ]
    });

    [
      'grunt-contrib-jshint',
      'grunt-contrib-concat',
      'grunt-contrib-uglify',
      'grunt-contrib-copy',
      'grunt-contrib-watch',
      'grunt-contrib-clean'
    ].forEach(
      function(task) {
        grunt.loadNpmTasks(task);
      }
    );

    grunt.registerTask('default', [ 'jshint', 'concat', 'copy', 'watch' ]);
    grunt.registerTask('deploy', [ 'jshint', 'concat', 'uglify', 'copy', 'clean' ]);
  }

  module.exports = Gruntfile;
}(this));
