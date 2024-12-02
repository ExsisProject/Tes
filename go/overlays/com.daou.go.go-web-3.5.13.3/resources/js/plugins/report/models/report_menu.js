define([
    "backbone"
],

function(Backbone) {
    var instance = null;
    var ReportMenu = Backbone.Model.extend({
        urlRoot: ""
    }, {
        get: function(opt, refresh) {
            instance = new ReportMenu();
            return instance;
        }
    }); 
    return ReportMenu;
});