define(
    [
        "backbone",
        "models/dept_descendant"
    ],

    function(
            Backbone,
            DeptDescendantModel
    ) { 
        
        var DeptDescendants = Backbone.Collection.extend({
            model : DeptDescendantModel,
            initialize : function(){
            },
            url: function(){
                return GO.contextRoot + "api/department/descendant/";
            }
        }, {
            fetch: function() {
                var instance = new DeptDescendants();
                instance.fetch({async:false});
                return instance;
            }
        });
    
        return DeptDescendants;
    }
);