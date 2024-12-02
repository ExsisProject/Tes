define([
    "backbone"
],

function(Backbone) {
    var model = Backbone.Model.extend({
        hasDescendant : function(){
            return this.get("childrenCount") > 0;
        }
    }); 
    return model;
});