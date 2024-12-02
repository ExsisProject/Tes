define([
        "backbone",
        "app",
        "GO.util"
    ],
    
    function(
        Backbone,
        GO
    ) {
        var Help = Backbone.Model.extend({
            urlRoot : GO.contextRoot + "api/approval/apprform/help",
            
            initialize : function(){
                
            }
            
        });
    
        return Help;
    }
);