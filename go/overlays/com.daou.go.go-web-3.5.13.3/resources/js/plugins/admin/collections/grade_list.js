define([
    "backbone"
],

function(
        Backbone
    ) {
    
    var instance = null;
    var GradeCollection = Backbone.Collection.extend({
        model : Backbone.Model,
        url: function() {
            return GO.contextRoot + "ad/api/grade/list";
        }
    }); 
    
    return {
        getCollection : function(){
            if(instance == null) instance = new GradeCollection();
            instance.fetch({ 
                async : false,
                contentType : 'application/json'
                });
            return instance;
        }
    };
});