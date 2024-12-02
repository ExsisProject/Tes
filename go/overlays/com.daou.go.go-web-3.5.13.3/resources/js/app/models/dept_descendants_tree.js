define(
    [
        "backbone",
    ],

    function(
        Backbone
    ) {

        var DepartmentsDescendantTree = Backbone.Model.extend({
            initialize : function(data) {
                this.deptId = data.deptId;
            },
            url: function(){
                return GO.contextRoot + "api/department/descendant/tree/" + this.deptId;
            }
        });

        return DepartmentsDescendantTree;
    }
);