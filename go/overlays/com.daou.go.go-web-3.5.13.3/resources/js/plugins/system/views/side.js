define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!admin/templates/side_menus",
    "i18n!admin/nls/admin"
], 

function(
    $, 
    Backbone,
    App, 
    layoutTpl,
    adminLang
) {
    var instance = null,
        menuRoot = 'company',
        tmplVar = {
            'label_device' : adminLang["디바이스 버전 관리"],
            'label_apns' : adminLang["APNS 인증서 관리"]
        };
    var layoutView = Backbone.View.extend({
        el : '.admin_side',
        events : {
			'click ul.admin li' : 'movePage'
		},
		movePage : function(e){
			var target = $(e.currentTarget);
			App.router.navigate(target.attr('data-url'), {trigger : true, pushState : true});
			
		},
        initialize: function() {
        	this.$el.off();
        },
       
        render : function(args) {
            
            var isActive = function() {
                if(args == this.leftName) return true;
                return false;
            };
            
            this.$el.html(layoutTpl({
                contextRoot : GO.contextRoot,
                menus : [{
                	leftName : "device",
                	href : 'system/device',
                	name : tmplVar['label_device'],
                	isActive : isActive
                },{
                    leftName : "apns",
                    href : 'system/apns',
                    name : tmplVar['label_apns'],
                    isActive : isActive
                }]
            }));
            
            GO.util.setTopMenu('baseTopMenu');
        }
    });
    
    return {
        render: function(args) {    
            if(instance === null) instance = new layoutView();
            return instance.render(args);
        }        
    };
});