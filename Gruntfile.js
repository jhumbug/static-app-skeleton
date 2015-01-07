'use strict';
var LIVERELOAD_PORT = 35729;
var SERVER_PORT = 9000;
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
        app: 'app',
        dist: 'dist',
        deployDir: '.deploy',
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
                    '<%= appConfig.app %>/scripts/{,**/}*.ejs',
                    '<%= appConfig.app %>/*.html',
                    '<%= appConfig.app %>/styles/{,**/}*.css',
                    '<%= appConfig.app %>/styles/{,**/}*.less',
                    '<%= appConfig.app %>/scripts/{,**/}*.js',
                    '<%= appConfig.app %>/images/{,**/}*.{png,jpg,jpeg,gif,webp}'
                ],
                tasks: ['jst', 'less:app', 'autoprefixer:app']
            },
            staging: {
                options: {
                    livereload: false
                },
                files: ['<%= appConfig.app %>/index.html'],
                tasks: ['stage:index']
            }
        },

        less: {
            options: {
                paths: [
                    '<%= appConfig.app %>/styles'
                ]
            },
            app: {
                files: {
                    '.tmp/styles/app.css': '<%= appConfig.app %>/styles/app.less'
                }
            },
            dist: {
                files: {
                    '<%= appConfig.dist %>/tools/css/app.css': '<%= appConfig.app %>/styles/app.less'
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
                    cwd: '<%= appConfig.dist %>/tools/js',
                    src: 'app.js',
                    dest: '<%= appConfig.dist %>/tools/js'
                }]
            }
        },
        connect: {
            options: {
                port: SERVER_PORT,
                // change this to '0.0.0.0' to access the server from outside
                hostname: '127.0.0.0'
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
                            mountFolder(connect, appConfig.app)
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
                            mountFolder(connect, appConfig.dist)
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
            dist: ['.tmp', '<%= appConfig.dist %>/*'],
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
                '<%= appConfig.app %>/scripts/{,*/}*.js',
                '!<%= appConfig.app %>/scripts/vendor/*'
            ]
        },
        requirejs: {
            dist: {
                // Options: https://github.com/jrburke/r.js/blob/master/build/example.build.js
                options: {
                    baseUrl: '<%= appConfig.app %>/scripts',
                    optimize: 'none',
                    paths: {
                        'templates': '../../.tmp/scripts/templates',
                        'jquery': 'http://z.cdn.turner.com/adultswim/tools/lib/jquery/jquery-1.11.0.min'
                    },
                    preserveLicenseComments: false,
                    useStrict: true,
                    wrap: true,
                    urlArgs : "bust="+new Date().getTime()
                }
            }
        },
        useminPrepare: {
            html: '<%= appConfig.app %>/index.html',
            options: {
                dest: '<%= appConfig.dist %>'
            }
        },
        usemin: {
            html: ['<%= appConfig.dist %>/{,*/}*.html'],
            css: ['<%= appConfig.dist %>/styles/{,*/}*.css'],
            options: {
                dirs: ['<%= appConfig.dist %>'],

            }
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= appConfig.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= appConfig.dist %>/images'
                }]
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= appConfig.dist %>/styles/app.css': [
                        '.tmp/styles/{,*/}*.css',
                        '<%= appConfig.app %>/styles/{,*/}*.css'
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
                    cwd: '<%= appConfig.app %>',
                    src: 'index.html',
                    dest: '<%= appConfig.dist %>'
                }]
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= appConfig.app %>',
                    dest: '<%= appConfig.dist %>',
                    src: [
                        'images/{,*/}*.{webp,gif}',
                        'styles/fonts/{,*/}*.*',
                    ]
                }]
            },
            deploy: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= appConfig.dist %>',
                    dest: '<%= appConfig.deployDir %>',
                    src: '<%= appConfig.deploy.src %>'
                }]
            }
        },
        bower: {
            all: {
                rjsConfig: '<%= appConfig.app %>/scripts/main.js'
            }
        },
        jst: {
            options: {
                amd: true
            },
            compile: {
                files: {
                    '.tmp/scripts/templates.js': ['<%= appConfig.app %>/scripts/templates/{,*/}*.ejs']
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
                src: '<%= appConfig.deployDir %>',
                dest: '<%= appConfig.staging.path %>',
                server_sep: '/'
            },
            production: {
                auth: {
                    host: '<%= appConfig.sftpHost %>',
                    post: 22,
                    authKey: 'adultswimproduction'
                },
                src: '<%= appConfig.deployDir %>',
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
                src: '<%= appConfig.deployDir %>',
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
                src: '<%= appConfig.dist %>/{,**/}*.css'
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
