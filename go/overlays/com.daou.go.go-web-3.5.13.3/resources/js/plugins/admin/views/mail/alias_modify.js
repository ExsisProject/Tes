(function() {
	define([
        "jquery",
	    "backbone",
	    "app",
	    
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        
        "GO.util"
	],
	function(
        $,
	    Backbone,
	    App,
	    
        commonLang,
        adminLang
	) {
		var instance = null;
		var lang = {
				alias : adminLang["별칭 계정 관리"],
		};
		
		var AliasModifyView = Backbone.View.extend({
			el: "#layoutContent",
			
			initialize: function() {
			},
			
			render: function() {
			}
		});

		return {
			render: function(opt) {	
				if(!instance){
					instance = new AliasModifyView(opt); 
				}
				return instance.render(opt);
			}
		};
	});
}).call(this);