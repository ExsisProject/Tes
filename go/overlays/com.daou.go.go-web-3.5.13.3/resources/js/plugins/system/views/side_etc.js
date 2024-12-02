define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!system/templates/side_etc",
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
            'label_setIPGroup' : adminLang["IP그룹 설정"],
            'label_initialization' : adminLang["초기화"],
            'label_storage' : adminLang['보관 기간 설정'],
            'label_password' : adminLang['비밀번호 찾기 설정'],
            'lable_passwordRules' : adminLang['비밀번호 정책 설정'],
            'label_openAPI' : adminLang['근태관리 지도 Open API'],
        };
    
    var layoutView = Backbone.View.extend({
        
        el : '.admin_side',
        events : {
			'click ul.admin li' : 'movePage'
		},
		
		movePage : function(e){
			var target = $(e.currentTarget);
//			App.router.navigate(target.attr('data-url'), {trigger : true, pushState : true});
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
                	leftName : "ipGroup",
                	href : '/listIPGroup.do',
                	name : tmplVar['label_setIPGroup'],
                	isActive : isActive
                },{
                	leftName : "initInfo",
                	href : '/readInitInfo.do',
                	name : tmplVar['label_initialization'],
                	isActive : isActive
                },{
                	leftName : "storagePeriod",
                	href : '/go/admin/system/storage',
                	name : tmplVar['label_storage'],
                	isActive : isActive
                },{
                	leftName : "passwordConfig",
                	href : '/go/admin/system/password',
                	name : tmplVar['label_password'],
                	isActive : isActive
                },{
                    leftName : "passwordRules",
                    href : '/go/admin/system/passwordRules',
                    name : tmplVar['lable_passwordRules'],
                    isActive : isActive
                },{
                    leftName : "timelineOpenApiKey",
                    href : '/go/admin/system/timelineOpenApiKey',
                    name : tmplVar['label_openAPI'],
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