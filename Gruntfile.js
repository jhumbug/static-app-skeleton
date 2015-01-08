'use strict';
var LIVERELOAD_PORT = 35730;
var SERVER_PORT = 9001;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};
var proxyRequest = require('grunt-connect-proxy/lib/utils').proxyRequest;

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // configurable paths
    var appConfig = {
        appDirectory: 'app',
        distDirectory: 'dist',
        deployDirectory: '.deploy',
        bower: grunt.file.readJSON('./.bowerrc'),
        domain: 'www.adultswim.com',
        stagingDomain: 'www.staging.adultswim.com',
        devDomain: 'www.dev.adultswim.com',
        domainBase: '',
        prod: '',
        cdn: 'http://i.cdn.turner.com/adultswim',
        ftpMovitHost: 'movit.turner.com',
        sftpHost: 'movit.turner.com',
        deploy: {
            src: ['index.html']
        },
        dev: {
            path: ''
        },
        production: {
            confirm: false
        },
        staging: {
            confirm: false,
            path: ''
        }
    };

    grunt.initConfig({
        appConfig: appConfig,
        watch: {
            options: {
                nospawn: true,
                livereload: true
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '<%= appConfig.appDirectory %>/scripts/{,**/}*.ejs',
                    '<%= appConfig.appDirectory %>/*.html',
                    '<%= appConfig.appDirectory %>/styles/{,**/}*.css',
                    '<%= appConfig.appDirectory %>/styles/{,**/}*.less',
                    '<%= appConfig.appDirectory %>/scripts/{,**/}*.js',
                    '<%= appConfig.appDirectory %>/images/{,**/}*.{png,jpg,jpeg,gif,webp}'
                ],
                tasks: ['jst', 'less:app', 'autoprefixer:app']
            },
            staging: {
                options: {
                    livereload: false
                },
                files: ['<%= appConfig.appDirectory %>/index.html'],
                tasks: ['stage:index']
            }
        },

        less: {
            options: {
                paths: [
                    '<%= appConfig.appDirectory %>/styles'
                ]
            },
            app: {
                files: {
                    '.tmp/styles/app.css': '<%= appConfig.appDirectory %>/styles/app.less'
                }
            },
            dist: {
                files: {
                    '<%= appConfig.distDirectory %>/tools/css/app.css': '<%= appConfig.appDirectory %>/styles/app.less'
                }
            }
        },

        uglify: {
            options: {
                banner: ('/*' + ' \n      \\;,._                           _,,- \n      \\`;, `-._ _..--``````--.._ __.-`,;( \n       \\ `;,  `:.  ,   ;.   .   :`  .;` / \n        ; `;;,      .:    :.      ,;;` / \n         \\ `;/    \\:: :  . ::/    \\;` ; \n          ).` __.._`        `_..__ `./ \n          /<  \\\\$$$$,      ,$$$$//   > \n          /\\   `;$$$$\\ -- /$$$$;`   /\\ \n          //.    `"`:" ;; ":`"`     /\\ \n           |/ .  .:` __..__ `.     \\| \n           /\\|: ./. `=_  _=` .\\   |/\\ \n              /:(/::.  \\/  .::\\) / \n               ////=-v-``-v-=\\\\\\\\  adult swim is for you. \n               ///`\\\\_\\\VV/_//`\\\\\\ \n              / /   `"\\=/"`    \\ \\ \n               /                \\ \n*/ \n'),
                manngle: false
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= appConfig.distDirectory %>/tools/js',
                    src: 'app.js',
                    dest: '<%= appConfig.distDirectory %>/tools/js'
                }]
            }
        },
        connect: {
            options: {
                port: SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            proxies: [
                // {
                //     context: '/webcam',
                //     host: 'www.adultswim.com',
                //     changeOrigin: true
                // }
            ],
            livereload: {
                options: {
                    middleware: function (connect, options) {
                        var middlewares = [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, appConfig.appDirectory)
                        ];

                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        middlewares.push(proxyRequest);

                        options.base.forEach(function(base) {
                            middlewares.push(connect.static(base));
                        });

                        return middlewares;
                    }
                }
            },
            dist: {
                options: {
                    middleware: function (connect, options) {
                        var middlewares = [
                            mountFolder(connect, appConfig.distDirectory)
                        ];

                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        middlewares.push(proxyRequest);

                        options.base.forEach(function(base) {
                            middlewares.push(connect.static(base));
                        });

                        return middlewares;
                    }
                }
            }
        },
        open: {
            server: {
                path: 'http://<%= connect.options.hostname %>:<%= connect.options.port %>'
            },
            dev: {
                path: 'http://<%= appConfig.devDomain %>' + '?' + new Date().getTime()
            },
            staging: {
                path: 'http://<%= appConfig.stagingDomain %>'
            },
            production: {
                path: 'http://<%= appConfig.domain %>'
            }
        },
        clean: {
            dist: ['.tmp', '<%= appConfig.distDirectory %>/*'],
            server: '.tmp',
            deploy: '.deploy'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: [
                'Gruntfile.js',
                '<%= appConfig.appDirectory %>/scripts/{,*/}*.js',
                '!<%= appConfig.appDirectory %>/scripts/vendor/*'
            ]
        },
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    baseUrl: '<%= appConfig.appDirectory %>/scripts',
                    optimize: 'none',
                    paths: {
                        'templates': '../../.tmp/scripts/templates'
                    },
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true,
                    urlArgs : "bust="+new Date().getTime()
                }
            }
        },
        useminPrepare: {
            html: '<%= appConfig.appDirectory %>/index.html',
            options: {
                dest: '<%= appConfig.distDirectory %>'
            }
        },
        usemin: {
            html: ['<%= appConfig.distDirectory %>/{,*/}*.html'],
            css: ['<%= appConfig.distDirectory %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= appConfig.distDirectory %>'],
                blockReplacements: {
                  // js: function (block) {
                  //     return '<script src="' + block + '"></script>';
                  // }
                }
            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= appConfig.appDirectory %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= appConfig.distDirectory %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= appConfig.distDirectory %>/styles/app.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= appConfig.appDirectory %>/styles/{,*/}*.css'
                    ]
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= appConfig.appDirectory %>',
                    src: 'index.html',
                    dest: '<%= appConfig.distDirectory %>'
                }]
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= appConfig.appDirectory %>',
                        dest: '<%= appConfig.distDirectory %>',
                        src: [
                            'images/{,*/}*.{webp,gif}',
                            'styles/fonts/{,*/}*.*',
                        ]
                    },
                    //copies special scripts from app to dist
                    {
                        expand: true,
                        dot: true,
                        cwd: '',
                        dest: '<%= appConfig.distDirectory %>/tools/lib',
                        flatten: true,
                        src: [
                            '<%= appConfig.bower.directory %>/requirejs/require.js',
                            '<%= appConfig.bower.directory %>/modernizr/modernizr.js'
                        ]
                    }
                ]
            },
            deploy: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= appConfig.distDirectory %>',
                    dest: '<%= appConfig.deployDirectory %>',
                    src: '<%= appConfig.deploy.src %>'
                }]
            }
        },
        bower: {
            all: {
                rjsConfig: '<%= appConfig.appDirectory %>/scripts/main.js'
            }
        },
        jst: {
            options: {
                amd: true
            },
            compile: {
                files: {
                    '.tmp/scripts/templates.js': ['<%= appConfig.appDirectory %>/scripts/templates/{,*/}*.ejs']
                }
            }
        },
        'sftp-deploy': {
            staging: {
                auth: {
                    host: '<%= appConfig.sftpHost %>',
                    post: 22,
                    authKey: 'adultswimstaging'
                },
                src: '<%= appConfig.deployDirectory %>',
                dest: '<%= appConfig.staging.path %>',
                server_sep: '/'
            },
            production: {
                auth: {
                    host: '<%= appConfig.sftpHost %>',
                    post: 22,
                    authKey: 'adultswimproduction'
                },
                src: '<%= appConfig.deployDirectory %>',
                dest: '',
                server_sep: '/'
            }
        },
        'ftp-deploy': {
            dev: {
                auth: {
                    host: '<%= appConfig.ftpMovitHost %>',
                    post: 22,
                    authKey: 'adultswimdev'
                },
                src: '<%= appConfig.deployDirectory %>',
                dest: '<%= appConfig.dev.path %>',
                server_sep: '/'
            }
        },
        prompt: {
            staging: {
                options: {
                    questions: [{
                        config: 'appConfig.staging.confirm',
                        type: 'confirm',
                        message: 'Are you sure you want to deploy this to staging?',
                        default: false
                    }]
                }
            },
            production: {
                options: {
                    questions: [{
                        config: 'appConfig.production.confirm',
                        type: 'confirm',
                        message: 'Are you sure you want to deploy this to production?',
                        default: false
                    }]
                }
            }
        },
        autoprefixer: {
            app: {
                src: '.tmp/styles/{,**/}*.css'
            },

            dist: {
                src: '<%= appConfig.distDirectory %>/{,**/}*.css'
            }
        }
    });

    grunt.registerTask('createDefaultTemplate', function () {
        grunt.file.write('.tmp/scripts/templates.js', 'this.JST = this.JST || {};');
    });

    grunt.registerTask('server', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('dev', function () {
        var path = grunt.option('path'),
            deployPath = (path && grunt.util.kindOf(path) === 'string') ? ('/' + path) : '';

        grunt.config.set('appConfig.deploy.src', ['**']);
        grunt.config.set('appConfig.dev.path', deployPath);

        grunt.task.run(['build:dev', 'clean:deploy', 'copy:deploy', 'ftp-deploy:dev', 'open:dev']);
    });

    grunt.registerTask('stage', function (target) {
        var path = grunt.option('path'),
            deployPath = (path && grunt.util.kindOf(path) === 'string') ? ('/' + path) : '';

        grunt.config.set('appConfig.staging.path', deployPath);

        var files = grunt.option('all') ? ['**'] : ['index.html'],
            tasks = (!grunt.option('all')) ? ['build:index', 'clean:deploy', 'copy:deploy', 'sftp-deploy:staging'] : ['prompt:staging', 'stageFiles'];
        grunt.config.set('appConfig.deploy.src', files);

        return grunt.task.run(tasks);
    });

    grunt.registerTask('deploy', function () {
        var files = grunt.option('all') ? ['**'] : ['index.html'];
        grunt.config.set('appConfig.deploy.src', files);
        return grunt.task.run(['prompt:production', 'deployFiles']);
    });

    grunt.registerTask('stageFiles', function () {
        if (grunt.config('appConfig.staging.confirm') === true) {
            grunt.config.set('appConfig.staging.confirm', false);
            return grunt.task.run(['build', 'clean:deploy', 'copy:deploy', 'sftp-deploy:staging', 'open:staging']);
        }
    });

    grunt.registerTask('deployFiles', function () {
        if (grunt.config('appConfig.production.confirm') === true) {
            grunt.config.set('appConfig.production.confirm', false);
            return grunt.task.run(['build', 'clean:deploy', 'copy:deploy', 'sftp-deploy:production', 'open:production']);
        }
    });

    grunt.registerTask('serve', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'open:server', 'connect:dist:keepalive']);
        }

        if (target === 'staging') {
            return grunt.task.run([
                'clean:server',
                'createDefaultTemplate',
                'jst',
                'configureProxies:server',
                'connect:livereload',
                'open:server',
                'less:app',
                'autoprefixer:app',
                'watch'
            ]);
        }

        grunt.task.run([
            'clean:server',
            'createDefaultTemplate',
            'copy:server',
            'jst',
            'configureProxies:server',
            'connect:livereload',
            'open:server',
            'less:app',
            'autoprefixer:app',
            'watch:livereload'
        ]);
    });

    grunt.registerTask('build', function (target) {
        if (target === 'index') {
            return grunt.task.run([
                'clean:dist',
                'useminPrepare',
                'htmlmin',
                'usemin:html'
            ]);
        }

        if (target === 'dev') {
            return grunt.task.run([
                'clean:dist',
                'createDefaultTemplate',
                'jst',
                'useminPrepare',
                'requirejs',
                'imagemin',
                'less:dist',
                'htmlmin',
                'copy',
                'usemin',
                'autoprefixer:dist'
            ]);
        }

        grunt.task.run([
            'clean:dist',
            'createDefaultTemplate',
            'jst',
            'useminPrepare',
            'requirejs',
            'imagemin',
            'less:dist',
            'htmlmin',
            'uglify',
            'copy',
            'usemin',
            'autoprefixer:dist'
        ]);
    });

    grunt.registerTask('default', [
        'watch:staging'
    ]);
};
