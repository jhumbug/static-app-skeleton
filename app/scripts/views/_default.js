var Backbone = require('backbone');
var $ = require('jquery');
Backbone.$ = $;

var _ = require('lodash');
var key = require('keymaster');

$._default = require('../lib/_default');

module.exports = Backbone.View.extend({
	el: "#_default",

	template: require('../templates/_default'),

    initialize: function() {
        var self = this;

        // this.listenTo(this.model, 'change:{attr}', this.render); 

        // _.bindAll(this, '{FUNCTION}', '{FUNCTION}');

        // key('enter', 'app', _.bind(this.{FUNCTION}, this));
    },

    render: function() {
        console.log(this.model.toJSON());
        this.$el.html(this.template(this.model.toJSON()));

        return this;
    },

    // {FUNCTION}: function () {
       
    // }
});