(function() {
    
    define([
        "app" 
    ], 

    function(
        GO 
    ) {
        
        var MobileBaseConfig = GO.BaseModel.extend({
            url: function() {
                return "/api/mobile/company";
            } 
        });
        return MobileBaseConfig;
    });

}).call(this);