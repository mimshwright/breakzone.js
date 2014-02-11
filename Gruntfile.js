module.exports = function(grunt) {
    "use strict";

    grunt.initConfig({

        jsSrcPath: 'src',
        deployPath: 'lib',
        testPath: 'test',
        demoPath: 'demo',

        clean: ["<%=deployPath%>"],

        jshint: {
            ignore_warning: {
                options: {
                },
                src: ['<%=jsSrcPath%>']
            }
        },

        jsbeautifier : {
            options : {
                indentSize: 4,                // Indentation size [4]
                indentChar: " ",              // Indentation character [space]
                indentWithTabs: "false",
                preserveNewlines: "false",    // Preserve line-breaks (--no-preserve-newlines disables)
                maxPreserveNewlines: "4",     // Number of line-breaks to be preserved in one chunk [10]
                spaceInParen: "true",         // Add padding spaces within paren, ie. f( a, b )
                jslintHappy: "true",          // Enable jslint-stricter mode
                braceStyle: "collapse",       // [collapse|expand|end-expand] ["collapse"]
                breakChainedMethods: "true",  // Break chained method calls across subsequent lines
                keepArrayIndentation: "true", // Preserve array indentation
                unescapeStrings: "false",     // Decode printable characters encoded in xNN notation
                wrapLineLength: "false",      // Wrap lines at next opportunity after N characters [0]
                e4x: "true",                  // Pass E4X xml literals through untouched
                goodStuff: "true"             // Warm the cockles of Crockford's heart
            },

            dev: {
                src : ["<%=jsSrcPath%>/**/*.js"],
                options: {
                    mode: "VERIFY_AND_WRITE"
                }
            },
            deploy: {
                src : ["<%=jsSrcPath%>/**/*.js"],
                options: {
                    mode: "VERIFY_ONLY"
                }
            }
        },

        uglify: {
            deploy: {
                files: [{
                    expand: true,               // Enable dynamic expansion.
                    cwd: '<%=jsSrcPath%>',      // Src matches are relative to this path.
                    src: ['**/*.js'],           // Actual pattern(s) to match.
                    dest: '<%=deployPath%>',    // Destination path prefix.
                    ext: '.min.js'              // Dest filepaths will have this extension.
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
    grunt.loadNpmTasks('grunt-jsbeautifier');

    grunt.registerTask('default', ['dev']);
    grunt.registerTask('dev', ['js:dev']);
    grunt.registerTask('deploy', ['clean', 'js:deploy']);

    grunt.registerTask('js', ['js:dev']);
    grunt.registerTask('js:dev', ['lint', "jsbeautifier:dev" ]);
    grunt.registerTask('js:deploy', ['lint', "jsbeautifier:deploy", 'uglify']);
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['js:dev', 'open:test']);
    grunt.registerTask('demo', ['deploy', 'open:demo']);

};