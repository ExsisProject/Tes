define([
    "backbone"
],

function(
        Backbone
    ) {
    
    var instance = null;
    var DomainPositionCollection = Backbone.Collection.extend({
        model : Backbone.Model,
        url: function() {
            return "/ad/api/position/list";
        },
    }, {
        get: function() {
            if(instance == null) instance = new DomainPositionCollection();
            instance.fetch({async:false, contentType:"application/json"});
            return instance;
        }
    }); 
    
    return {
        getCollection : function(){
            return DomainPositionCollection.get();
        }
    };
});