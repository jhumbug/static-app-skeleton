var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
    defaults: {
        _default: 'WHOA'
    },

    initialize: function() {
        
    },

    url: '',

    validate: function(attrs, options) {
    },

    parse: function(response, options)  {
        return response;
    }
});