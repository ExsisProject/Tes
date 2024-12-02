define('works/views/app/home/works_home_layout', function(require) {
	
    var DefaultLayout = require("views/layouts/default");
    var WorksHomeLayout = DefaultLayout.extend({
        name: "works_home", 
        className: "go_skin_default go_full_screen go_skin_works", 
        
        _init: function() {
        	this.setUseSide(false);
            this.setUseContentWrapper(false);
            GO.config('workspace_expansion_button_visible', true);
            this.appName = 'works';
        }
    }, {
        __instance__: null            
    });
    
    return WorksHomeLayout;
});