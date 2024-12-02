define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!admin/templates/side_menus",
    "i18n!admin/nls/admin",
    "i18n!nls/commons"
], 

function(
    $,
    Backbone,
    App, 
    sideMenuTmpl,
    adminLang,
    commonLang
) {
    var instance = null;
    var menuRoot = "mail";
    var siteAdminMailMenuUrl = {
        "mailBasic" : "/site/domainCommon.action",
        "mailGroup" : "/site/domainCommon.action?initMethod=group",
        "mailDormant" : "/site/domainCommon.action?initMethod=acount",
        "mailAlias" : "mail/alias",//"/site/domainCommon.action?initMethod=alias",
        "mailMass" : "/site/domainCommon.action?initMethod=massSender",
        "mailDomain" : "/site/domainCommon.action?initMethod=domain",
        "mailLetter" : "/site/domainCommon.action?initMethod=letterList",
        "mailTemplate" : "/site/domainCommon.action?initMethod=docTmpList",
        "mailBanner" : "mail/banner"
    };
    	
    var layoutView = Backbone.View.extend({
        el : ".admin_side",
        events : {
			"click ul.admin li" : "movePage"
		},
		movePage : function(e){
			var moveTarget = $(e.currentTarget).attr("data-url");
			
			if(moveTarget === siteAdminMailMenuUrl["mailBanner"] || moveTarget === siteAdminMailMenuUrl["mailAlias"]) {
				App.router.navigate(moveTarget, {trigger : true, pushState : true});
			} else {
				location.href = siteAdminMailMenuUrl[moveTarget];
			}
		},
        initialize: function() {
        	this.$el.off();
        },
       
        render : function(args) {
            
            var isActive = function() {
                if(args == this.leftName) return true;
                return false;
            };
            
            this.$el.html(sideMenuTmpl({
                contextRoot : GO.contextRoot,
                menus : [{
                	leftName : "mailBasic",
                    href : "mailBasic",
                    name : adminLang["메일 기본 설정"],
                    isActive : isActive
                },{
                	leftName : "mailBanner",
                    href : menuRoot + "/banner",
                    name : adminLang["메일 배너 설정"],
                    isActive : isActive
                },{
                	leftName : "mailGroup",
                    href : "mailGroup",
                    name : adminLang["메일 그룹 관리"],
                    isActive : isActive
                },{
                	leftName : "mailDormant",
                    href : "mailDormant",
                    name : adminLang["휴면 계정 관리"],
                    isActive : isActive
                },{
                	leftName : "mailAlias",
                    href : menuRoot + "/alias",
                    name : adminLang["별칭 계정 관리"],
                    isActive : isActive
                },{
                	leftName : "mailMass",
                    href : "mailMass",
                    name : adminLang["대량메일 발송자 관리"],
                    isActive : isActive
                },{
                	leftName : "mailDomain",
                    href : "mailDomain",
                    name : adminLang["도메인 메일함 관리"],
                    isActive : isActive
                },{
                	leftName : "mailLetter",
                    href : "mailLetter",
                    name : adminLang["편지지 관리"],
                    isActive : isActive
                },{
                	leftName : "mailTemplate",
                    href : "mailTemplate",
                    name : adminLang["문서템플릿 관리"],
                    isActive : isActive
                }]
            }));
        }
    });
    
    return {
        render: function(args) {    
            if(instance === null) instance = new layoutView();
            return instance.render(args);
        }        
    };
});