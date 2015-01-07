/*global define*/
/* jshint -W100 */

define([
    'jquery',
    'underscore',
    'backbone',
    'konami',
    'moment'
], function ($, _, Backbone) {
    'use strict';

    var AppView = Backbone.View.extend({
        el: 'body',

        initialize: function () {
            var $window = $(window),
                $document = $(document);

            _.bindAll(this, 'onKonami');

            this.Environment = this.setEnvironment();

            this.pageTitleTimeout = null;
            this.pageOriginalTitle = $('title').text();
            this.pageTitleMessages = ['Crying Digital Tears', 'It\'s Cold Without You', 'Hot Puppet Action', 'Still Here, Waiting', 'Take a Fun-cation'];

            //set resize vars to track when resizing is done
            //this is so resize doesn't fire multiple times while resizing
            this.resizeTime = new Date(1, 1, 2000, 12, 0, 0);
            this.resizeTimeout = false;
            this.resizeDelta = 300;


            var now = moment().format('ddd, MMM. D YYYY');
            this.$('#todays-date').text(now);


            $window.scroll(function() {
                vent.trigger('page:scroll');
            });

            $window.resize(function() {
                vent.trigger('window:resize', new Date());
            });

            this.konamiTimeout = null;
            $window.konami({
                cheat: this.onKonami
            });

         
            //prevents default behaviour of dropping files on the page
            $document.bind('drop dragover', function (e) {
                e.preventDefault();
            });

            vent.on('window:resize', this.onWindowResize, this);
            vent.on('page:focusChange', this.titleAlert, this);
            vent.on('page:resize', this.render, this);

            this.pageFocusListeners();
        },



        render: function () {
            return this;
        },

        onKonami: function () {
            var self = this,
                shift = function () {
                    self.$el.toggleClass('oooweeeeoooo');
                };

            this.$el.toggleClass('konami');

            if (this.$el.hasClass('konami')) {
                this.konamiTimeout = window.setInterval(shift, 1000);
            } else {
                window.clearInterval(this.konamiTimeout);
                this.$el.removeClass('konami oooweeeeoooo');
            }
        },



        onWindowResize: function (date) {
            this.resizeTime = date || new Date();

            //if the resize timeout is no longer there, fire it again
            if (!this.resizeTimeout) {
                this.resizeTimeout = true;
                setTimeout(_.bind(this.resize, this), this.resizeDelta); //we have to use _.bind because of the way a function is passed in timeout.  we need to pass the backbone object with it.
            }
        },



        pageFocusListeners: function () {
            var self = this,
                hidden = 'hidden',
                onchange;

            this.inFocus = true;

            onchange = function () {
                //toggle the in focus 
                self.inFocus = !self.inFocus;
                vent.trigger('page:focusChange');
            };

            // Standards:
            if (hidden in document) {
                document.addEventListener('visibilitychange', onchange);
            } else if ((hidden = 'mozHidden') in document) {
                document.addEventListener('mozvisibilitychange', onchange);
            } else if ((hidden = 'webkitHidden') in document) {
                document.addEventListener('webkitvisibilitychange', onchange);
            } else if ((hidden = 'msHidden') in document) {
                document.addEventListener('msvisibilitychange', onchange);
            } else if ('onfocusin' in document) { // IE 9 and lower:
                document.onfocusin = document.onfocusout = onchange;
            } else { // All others:
                window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
            }
        },



        resize: function () {
            //if the resize hasn't stopped, don't run the resize, but call the function over to see if it's ready yet
            if (new Date() - this.resizeTime < this.resizeDelta) {
                setTimeout(_.bind(this.resize, this), this.resizeDelta);
            } else {
                this.resizeTimeout = false;
                vent.trigger('page:resize');
            }
        },



        setEnvironment: function () {
            var bodyClass = [],
                ua = navigator.userAgent,
                environment = {
                    isMac: navigator.platform.toLowerCase().indexOf('mac') > -1,
                    isChrome: ua.indexOf('Chrome') > -1,
                    isSafari:  ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1,
                    isIE: ua.indexOf('MSIE') > -1,
                    isFirefox: ua.indexOf('Firefox') > -1,
                    isiOS: (ua.match(/(iPad|iPhone|iPod)/i) ? true : false),
                    isAndroid: (ua.toLowerCase().indexOf('android') > -1)
                };

            if (environment.isMac) {
                bodyClass.push('osx');
            } else {
                bodyClass.push('win');
            }
            if (environment.isiOS) { bodyClass.push('ios'); }
            if (environment.isAndroid) { bodyClass.push('android'); }
            if (environment.isChrome) { bodyClass.push('chrome'); }
            if (environment.isFirefox) { bodyClass.push('firefox'); }
            if (environment.isSafari) { bodyClass.push('safari'); }
            if (environment.isIE) { bodyClass.push('ie'); }

            if (bodyClass.length > 0) {
                this.$el.addClass(bodyClass.join(' '));
            }

            return environment;
        },



        titleAlert: function () {
            var self = this;

            if (this.inFocus) {
                this.pageTitleInterval = null;
                this.pageTitleTimeout = setTimeout(function() {
                    $('title').text(self.pageOriginalTitle);
                }, 50);
            } else {
                this.pageTitleTimeout = setTimeout(function() {
                    $('title').text(self.pageTitleMessages[Math.floor(Math.random() * self.pageTitleMessages.length)]);
                }, 30000);
            }
        }
    });

    return AppView;
});
