define([
    "backbone",
    "i18n!report/nls/report", 
    "GO.util"
],

function(
    Backbone,
    ReportLang
    ) {
    var instance = null;
    var ReportSearchModel = Backbone.Model.extend({
        urlRoot: "",
        getTitle : function(){
            if(this.get("folderType") == "PERIODIC"){
                var series = GO.util.parseOrdinaryNumber(this.get("seriesNo"), GO.config("locale"));
                return this.get("folderDeptName") + " " +GO.i18n(ReportLang['제 {{arg1}}회차'], {"arg1": series});
            }else{
                return this.get("title");
            }
        }
    }, {
        get: function(opt, refresh) {
            instance = new ReportSearchModel();
            return instance;
        }
    }); 
    return ReportSearchModel;
});