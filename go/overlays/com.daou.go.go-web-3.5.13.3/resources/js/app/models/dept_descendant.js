define([
    "backbone"
],
function(Backbone) {
    var DeptDescendant = Backbone.Model.extend({
        
        initialize : function(options){
            this.options = options;
        },
    }, {
    }); 
    return DeptDescendant;
});
