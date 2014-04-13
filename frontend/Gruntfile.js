(function() {
  'use strict';

  var components = [
        'angular/angular.js'
      ].map(
        function(item) {
          return 'bower_components/' + item;
        }
      );

  function Gruntfile(grunt) {
    grunt.initConfig({
      pkg   : grunt.file.readJSON('bower.json'),
      jshint: {
        'source': '<%= watch.source.files =>',
        'test': '<%= watch.test.files =>',
        'config': '<%= watch.config.files =>',
        options: {
          globals: {
            'strict' : true,
            'browser': true
          }
        }
      },
      concat: {
        'source': {
          src : '<%= watch.source.files %>',
          dest: 'build/_source.js'
        },
        'components': {
          src: components,
          dest: 'build/_components.js'
        },
        'less': {
          src : [ 'src/**/*.less' ],
          dest: 'build/_build.less'
        },
        'build': {
          src : [ 'build/_components.js', 'build/_source.js' ],
          dest: 'build/_build.js'
        }
      },
      less: {
        'build': {
          files: {
            'build/_build.css': 'build/_build.less'
          },
          options: {
            cleancss: true
          }
        }
      },
      copy: {
        'javascripts': {
          files: [{
            src: 'build/_build.js',
            dest: '../public/js/app.js'
          }]
        },
        'stylesheets': {
          files: [{
                    src: 'build/_build.css',
                    dest: '../public/js/styles.css'
                  }]
        }
      },
      watch: {
        'source': {
          files: [ 'src/**/*.js' ],
          tasks: [ 'default' ],
          options: {
            spawn: false
          }
        },
        'test': {
          files: [ 'test/**/*.spec.js' ],
          tasks: [ 'jshint:test', 'karma' ],
          options: {
            spawn: false
          }
        },
        'config': {
          files: [ 'Gruntfile.js', 'config/**/*.json' ],
          tasks: []
        },
        'less': {
          files: [ 'src/**/*.less' ],
          tasks: []
        },
        'templates': {
          files: [ 'src/**/*.tpl.html' ],
          tasks: []
        }
      },
      clean: [ 'build/*' ]
    });

    [
      'grunt-contrib-jshint',
      'grunt-contrib-concat',
      'grunt-contrib-uglify',
      'grunt-contrib-copy',
      'grunt-contrib-watch',
      'grunt-contrib-clean',
      'grunt-contrib-less'
    ].forEach(
      function(task) {
        grunt.loadNpmTasks(task);
      }
    );

    grunt.registerTask('default', [
      'jshint',
      'concat',
      'less',
      'copy',
      'watch'
    ]);
    grunt.registerTask('deploy', [
      'jshint',
      'concat',
      'copy',
      'clean'
    ]);
  }

  module.exports = Gruntfile;
}(this));
