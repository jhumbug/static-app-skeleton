var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;

var key = require('keymaster');

var _defaultView = require('../views/_default');
var _defaultModel = require('../models/_default');

module.exports = Backbone.View.extend({
	el: "#content",

	template: require('../templates/main.ejs'),

    initialize: function() {
        this.render();

        key.setScope('app');
    },

    render: function() {
        this.$el.html(this.template());

        this._defaultView = new _defaultView({ model: new _defaultModel() }).render();
    }
});