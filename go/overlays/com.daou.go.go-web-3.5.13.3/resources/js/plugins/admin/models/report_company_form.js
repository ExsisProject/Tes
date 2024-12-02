define([
    "backbone"
],

function(Backbone) {
    
    
    var instance = null;
    var ReportCompanyForm = Backbone.Model.extend({
        urlRoot : GO.contextRoot + "ad/api/report/form"
    }, {
        get: function(id) {
            if(instance == null) instance = new ReportCompanyForm();
            instance.set("id", id, {silent: true});
            instance.fetch({async:false});
            return instance;
        }
    }); 
    
    return ReportCompanyForm;
});