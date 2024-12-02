(function() {
    define(["views/layouts/default"], function(DefaultLayout) {
    	
        return DefaultLayout.extend({
            name: "dashboard", 
            useRedirectPolicy: false,
            
            _init: function() {
                this.className = 'go_skin_home_w';
                GO.config('workspace_expansion_button_visible', false);
            	this.setUseSide(false);
                this.setUseContentWrapper(false);
            }, 
        }, {
            __instance__: null
        });
        
    });
})();