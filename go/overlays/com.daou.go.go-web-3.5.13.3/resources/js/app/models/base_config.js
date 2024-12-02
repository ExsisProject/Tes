(function() {
    define([
        "underscore", 
        "backbone"
    ], 
    
    function(
        _, 
        Backbone
    ) { 
        var BaseConfig = Backbone.Model.extend({
           url: "/api/userside/baseconfig", 
           
           getDisplayConfig: function() {
               return _.omit(this.get("displayConfigModel"), 'id');
           }, 
           
           getNotiConfig: function() {
               return _.omit(this.get("notiConfigModel"), 'id');
           }, 
           
           getMenuConfig: function() {
               return this.get("menuConfigModel");
           }
        });
        
        return BaseConfig;
    });
}).call(this);