define(
    [
      "backbone",
      "models/joined_dept"
    ],
    
    function(
            Backbone,
            JoinedDeptModel
        ) { 
        var JoinedDeptCollection = Backbone.Collection.extend({
            url: GO.contextRoot+"api/department/list/joined",
            model : JoinedDeptModel
        }, {
            fetch: function(opt) {
                var instance = new JoinedDeptCollection();
                
                instance.fetch({async:false}, opt);
                return instance;
            }
        });
        return JoinedDeptCollection;
    }
);