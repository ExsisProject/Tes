define([
    "jquery", 
    "backbone", 
    "app",
    "system/collections/companies",
    "hgn!admin/templates/side_menus",
    "i18n!nls/commons",
    "i18n!admin/nls/admin"
], 

function(
    $, 
    Backbone,
    App,
    CompanyCollection,
    layoutTpl,
    commonLang,
    adminLang
) {
    var instance = null,
        tmplVar = {
            'label_site' : adminLang["사이트 목록"],
            'label_domain' : adminLang["도메인 목록"],
            'label_sitegroup' : adminLang['사이트 그룹 목록']
        };
    
    var layoutView = Backbone.View.extend({
        
        el : '.admin_side',
        events : {
			'click ul.admin li' : 'movePage'
		},
		
		movePage : function(e){
			var url = $(e.currentTarget).attr('data-url');
			App.router.navigate(url, {trigger : true, pushState : true});
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
                	leftName : "domain",
                	href : 'system/domain',
                	name : tmplVar['label_domain'],
                	isActive : isActive
                },{
                	leftName : "site",
                	href : 'system/site',
                	name : tmplVar['label_site'],
                	isActive : isActive
                },{
                    leftName : "sitegroup",
                    href : "system/sitegroup",
                    name : tmplVar['label_sitegroup'],
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