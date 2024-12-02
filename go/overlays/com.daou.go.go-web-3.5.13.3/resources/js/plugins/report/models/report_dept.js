define([
    "backbone",
    "GO.util"
],

function(Backbone) {
    var ReportDeptModel = Backbone.Model.extend({
        urlRoot: GO.contextRoot+"api/report/folder/department",
    },{
        get : function(id){
            var instance = new ReportDeptModel();
            instance.set({"id" :  id}, {silent:true});
            instance.fetch({async : false});
            return instance;
        }
    }); 
    return ReportDeptModel;
});