;(function() {
    define([
        "views/layouts/default" 
    ], 
    
    function(
        DefaultLayout
    ) {        
        var FullpageLayout = DefaultLayout.extend({
            name: "fullpage", 
            className: "full_page go_full_screen",
            
            _init: function() {
            	this.setUseSide(false);
                this.setUseContentWrapper(false);
            }
        }, {
            __instance__: null            
        });
        
        return FullpageLayout;
    });
})();