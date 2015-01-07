/*global define*/
'use strict';

define('jquery', [], function () {
    return jQuery;
});

require.config({
    shim: {
        underscore: {
            exports: '_'
        },
        backbone: {
            deps: [
                'underscore',
                'jquery'
            ],
            exports: 'Backbone'
        }
    },
    paths: {
        'backbone': '../bower_components/backbone/backbone',
        'underscore': '../bower_components/underscore/underscore',
        'konami': '../bower_components/konami-code/src/jquery.konami',
        'moment': '../bower_components/moment/min/moment-with-locales.min'
    }
});

require([
    'underscore',
    'backbone',
    'views/app'
], function (_, Backbone, AppView) {
    window.vent = _.extend({}, Backbone.Events);

    window.App = new AppView();

    Backbone.history.start();
});
