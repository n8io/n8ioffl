module.exports = function(grunt) {
  var nodeInspectorPort = 5858;
  grunt.initConfig({
    stylus: {
      compile: {
        options: {
          import: ['nib'], // use stylus 'nib' plugin at compile time
          compress: true,
          linenos: true
        },
        files: {
          './client/css/style.min.css': [
            './server/stylus/style.styl'
          ]
        }
      }
    },
    cssmin: {
      minify: {
        options:{
          keepSpecialComments: 0
        },
        files: {
          './client/css/style.min.css': [
            './client/css/style.min.css'
          ]
        }
      }
    },
    jshint: {
      all: {
        src: ['./server/js/**/*.js'],
        options: {
          jshintrc: true
        }
      }
    },
    uglify: {
      js: {
        options : {
          mangle: false,
          compress: false
        },
        files: {
          './client/js/script.min.js': [
            './server/js/angular/app.js',
            './server/js/angular/config.js',
            './server/js/angular/services.js',
            './server/js/angular/directives.js',
            './server/js/angular/controllers.js',
            './server/js/angular/filters.js',
            './server/js/script.js',
          ]
        }
      }
    },
    copy: {
      assets: {
        files: [
          {
            expand: true,
            cwd: './server/statics',
            src: '**',
            dest: 'client',
            flatten: false
          }
        ]
      }
    },
    'node-inspector': {
      dev: {
        options: {
          'web-port': 8080,
          'web-host': 'localhost',
          'debug-port': nodeInspectorPort,
          'save-live-edit': true,
          hidden: ['node_modules']
        }
      }
    },
    concurrent: {
      tasks: ['nodemon', 'watch', 'node-inspector'],
      options: {
        logConcurrentOutput: true
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options : {
          nodeArgs: ['--debug=' + nodeInspectorPort],
          watch: [
            'app.js',
            'server/config/**/*.json',
            'server/controllers/**/*.js',
            'server/models/**/*.js',
            'server/routes/**/*.js',
          ],
          ext: 'js,json'
        }
      },
    },
    watch: {
      js: {
        files: [
          './server/js/**/*.js',
        ],
        tasks: ['jshint','uglify'],
        options: {
          nospawn: false,
          interrupt: false
        }
      },
      grunt: {
        files: [
          './Gruntfile.js',
        ],
        tasks: ['default'],
        options: {
          nospawn: false,
          interrupt: false
        }
      },
      css: {
        files: ['./server/stylus/**/*.styl'],
        tasks: ['stylus', 'cssmin'],
        options: {
          nospawn: false,
          interrupt: false
        }
      },
      assets: {
        files: [
          './statics/**/*'
        ],
        tasks: ['copy'],
        options: {
          nospawn: false,
          interrupt: false
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-node-inspector');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.option('force', true);

  // Default task(s).
  grunt.registerTask('default', [
    'copy',
    'stylus',
    'cssmin',
    'uglify'
  ]);

  // For development
  grunt.registerTask('watcher', 'Compiles and minifies css, validates and minify js, copies static assets to ./client, then watches for changes.', [
    'default',
    'jshint',
    'concurrent'
  ]);
};
