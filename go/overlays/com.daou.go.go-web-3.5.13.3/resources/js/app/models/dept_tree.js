define(
    [
        "backbone",
    ],

    function(
        Backbone
    ) {

        var DepartmentsTree = Backbone.Model.extend({
            initialize : function(data){
                this.deptId = data.deptId;
            },
            url: function(){
                return GO.contextRoot + "api/department/tree/" + this.deptId;
            }
        });


        return DepartmentsTree;
    }
);