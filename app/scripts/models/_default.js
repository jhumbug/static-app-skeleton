var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
    defaults: {
        
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