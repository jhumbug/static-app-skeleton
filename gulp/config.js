var dest = "./_build";
var app = './app';

var url = require('url');
var proxy = require('proxy-middleware');

var ftpConfig = require('./.ftppass');

// var proxyOptions = url.parse('http://www.adultswim.com/videos');
// proxyOptions.route = '/videos';
var proxyOptions = null;

module.exports = {
    browserSync: {
        server: {
            middleware: [proxy(proxyOptions)],
            // Serve up our build folder
            baseDir: dest
        }
    },
    less: {
        src: app + "/styles/app.less",
        watchSrc: app + "/styles/*.less",
        dest: dest + "/css/",
        settings: {
            paths: [
                app + '/styles/'
            ]
        }
    },
    images: {
        src: app + "/images/**",
        dest: dest + "/images"
    },
    fonts: {
        src: app + "/fonts/**",
        dest: dest + "/fonts"
    },
    markup: {
        src: app + "/index.html",
        dest: dest
    },
    browserify: {
        // A separate bundle will be generated for each
        // bundle config in the list below
        bundleConfigs: [{
                entries: app + '/scripts/app.js',
                dest: dest,
                outputName: 'js/app.js',
                // Additional file extentions to make optional
                extensions: ['.ejs'],
                // list of modules to make require-able externally
                require: ['jquery', 'lodash', 'keymaster']
            }]
            // , {
            //   entries: app + '/javascript/page.js',
            //   dest: dest,
            //   outputName: 'page.js',
            //   // list of externally available modules to exclude from the bundle
            //   external: ['jquery', 'underscore']
            // }]
    },
    production: {
        cssSrc: dest + '/css/*.css',
        jsSrc: dest + '/js/*.js',
        cssDest: dest + '/css/',
        jsDest: dest + '/js/'
    },
    deploy: {
        src: dest + '/**',
        dev: {
            host: ftpConfig.adultswimdev.host,
            user: ftpConfig.adultswimdev.username,
            pass: ftpConfig.adultswimdev.password,
            remotePath: '/dev/site'
        },
        staging: {
            host: ftpConfig.adultswimstaging.host,
            user: ftpConfig.adultswimstaging.username,
            key: ftpConfig.adultswimstaging.keyLocation,
            remotePath: '/dev/site'
        },
        production: {
            host: ftpConfig.adultswimproduction.host,
            user: ftpConfig.adultswimproduction.username,
            key: ftpConfig.adultswimproduction.keyLocation,
            remotePath: '/dev/site'
        }
    }
};
