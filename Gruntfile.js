module.exports = function(grunt) {
	grunt.initConfig({

		jsSrcPath: 'src',
		deployPath: 'lib',
		testPath: 'test',
		demoPath: 'demo',

		clean: ["<%=deployPath%>"],

		jshint: {
			all: ['<%=jsSrcPath%>']
		},

		uglify: {
			deploy: {
				files: [{
					expand: true,     // Enable dynamic expansion.
					cwd: '<%=jsSrcPath%>',      // Src matches are relative to this path.
					src: ['**/*.js'], // Actual pattern(s) to match.
					dest: '<%=deployPath%>',   // Destination path prefix.
					ext: '.min.js',   // Dest filepaths will have this extension.
				}]
			}
		},

		qunit: {
				files: ['<%=testPath%>/**/*.html']
		},

		open: {
            test : {
              path: '<%=testPath%>/index.html',
              app: 'Google Chrome'
            },
            demo : {
              path: '<%=demoPath%>/index.html',
              app: 'Google Chrome'
            }
        },

		watch: {
			js: {
				files: '<%=jsSrcPath%>/**/*.js',
				tasks: ['js:dev']
			}
		},

		bump: {
          options: {
            files: ['package.json'],
            updateConfigs: [],
            commit: true,
            commitMessage: 'Version v%VERSION%',
            commitFiles: ['package.json'], // '-a' for all files
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: false
          }
        }
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-open');

	grunt.registerTask('default', ['dev']);
	grunt.registerTask('dev', ['js:dev']);
	grunt.registerTask('deploy', ['clean', 'js:deploy']);

	grunt.registerTask('js', ['js:dev']);
	grunt.registerTask('js:dev', ['lint', 'qunit']);
	grunt.registerTask('js:deploy', ['lint', 'qunit', 'uglify']);
	grunt.registerTask('lint', ['jshint']);
	grunt.registerTask('test', ['js:dev', 'open:test']);
	grunt.registerTask('demo', ['deploy', 'open:demo']);

};
