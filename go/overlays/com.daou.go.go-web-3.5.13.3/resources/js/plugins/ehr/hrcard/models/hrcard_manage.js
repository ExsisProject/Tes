define([
    "backbone",
    "app"
],

function(
    Backbone,
    GO
){
    var instance = null;
    var HRCardConfig = Backbone.Model.extend({
        url: function() {
            return "/api/ehr/hrcard/manage";
        }
    });
    
    return HRCardConfig;
    
});