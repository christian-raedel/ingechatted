(function() {
  'use strict';

  var components = [
        'angular/angular.js',
        'angular-ui-router/release/angular-ui-router.js'
      ].map(
        function(item) {
          return 'bower_components/' + item;
        }
      );

  function Gruntfile(grunt) {
    grunt.initConfig({
      pkg   : grunt.file.readJSON('bower.json'),
      jshint: {
        'source': 'src/**/*.js',
        'config': 'config/**/*.json',
        options: {
          globals: {
            'strict' : true,
            'browser': true
          }
        }
      },
      ngtemplates: {
        'templates': {
          src: '<%= watch.templates.files %>',
          dest: 'build/_templates.js',
          options: {
            standalone: 'true',
            htmlmin: {
              collapseBooleanAttributes:      true,
              collapseWhitespace:             true,
              removeAttributeQuotes:          true,
              removeComments:                 true,
              removeEmptyAttributes:          true,
              removeScriptTypeAttributes:     true,
              removeStyleLinkTypeAttributes:  true
            }
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
          src : [ 'build/_components.js', 'build/_templates.js', 'build/_source.js' ],
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
          files: [
            {
              src: 'build/_build.js',
              dest: '../public/js/app.js'
            }
          ]
        },
        'stylesheets': {
          files: [
            {
              src: 'build/_build.css',
              dest: '../public/css/styles.css'
            }
          ]
        }
      },
      karma: {
        unit: {
          options: {
            frameworks: [ 'jasmine' ],
            singleRun: true,
            files: [
              'build/_build.js',
              'bower_components/angular-mocks/angular-mocks.js',
              'test/**/*.spec.js'
            ],
            browsers: [ 'PhantomJS' ]
          }
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
          files: [ 'src/**/*.spec.coffee' ],
          tasks: [ 'karma' ],
          options: {
            spawn: false
          }
        },
        'config': {
          files: [ 'config/**/*.json' ],
          tasks: [ 'default' ]
        },
        'less': {
          files: [ 'src/**/*.less' ],
          tasks: [ 'default' ]
        },
        'templates': {
          files: [ 'src/**/*.tpl.html' ],
          tasks: [ 'default' ]
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
      'grunt-contrib-less',
      'grunt-angular-templates',
      'grunt-karma'
    ].forEach(
      function(task) {
        grunt.loadNpmTasks(task);
      }
    );

    grunt.registerTask('default', [
      'clean',
      'jshint',
      'ngtemplates',
      'concat',
      'karma',
      'less',
      'copy',
      'watch'
    ]);
    grunt.registerTask('deploy', [
      'clean',
      'jshint',
      'ngtemplates',
      'concat',
      'karma',
      'less',
      'copy'
    ]);
  }

  module.exports = Gruntfile;
}(this));
