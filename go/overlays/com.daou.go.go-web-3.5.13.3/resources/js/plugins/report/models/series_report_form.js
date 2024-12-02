define([
    "backbone",
    "GO.util"
],

function(Backbone) {
    var ReportSeriesModel = Backbone.Model.extend({
        urlRoot: GO.contextRoot+"api/report/series/",
        setUrl : function(){
            
        }
    },{
        get : function(id){
            var instance = new ReportSeriesModel();
            instance.set({"id" :  id}, {silent:true});
            instance.fetch({async : false});
            
            instance.setDonesClickable();
            instance.setUndonesClickable();
            
            return instance;
        }
    }); 
    return ReportSeriesModel;
});