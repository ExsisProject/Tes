define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!system/templates/side_admin",
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
        tmplVar = {
            'label_admin' : adminLang["관리자"],
            'label_adminLog' : adminLang["관리자 로그"],
            'lable_otpAdminList' : adminLang['2차인증 관리자 OTP']
        };
    
    var layoutView = Backbone.View.extend({
        
        el : '.admin_side',
        events : {
			'click ul.admin li' : 'movePage'
		},
		
		movePage : function(e){
			var target = $(e.currentTarget);
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
                    leftName : "admin",
                    href : '/adminList.do',
                    name : tmplVar['label_admin'],
                    isActive : isActive
                },{
                    leftName : "adminLog",
                    href : '/listAdminLog.do',
                    name : tmplVar['label_adminLog'],
                    isActive : isActive
                },{
                    leftName : "otpAdminList",
                    href : '/go/admin/system/otpAdminList',
                    name : tmplVar['lable_otpAdminList'],
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