define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!system/templates/nav_install",
    "i18n!nls/commons",
    "i18n!admin/nls/admin"
], 

function(
    $, 
    Backbone,
    App, 
    layoutTpl,
    commonLang,
    adminLang
) {
    var instance = null,
        tmplVar = {
            'start' : commonLang["시작"],
            'license' : adminLang["라이선스 등록"],
            'domain' : adminLang["도메인 등록"],
            'site' : adminLang["사이트 정보 등록"],
            'complete' : commonLang["완료"],
        };
    var layoutView = Backbone.View.extend({
        el : '#state',
        events : {
		},
        initialize: function() {
        	this.$el.off();
        },
       
        render : function(args) {
            this.$el.html(layoutTpl({
                contextRoot : GO.contextRoot,
                lang : tmplVar,
            }));
            this.setStateIcon(args);
        },
        
        setStateIcon : function(state){
        	$('#'+state).prevAll('.pro_step').each(function() {
        		var findEl = $($(this).find('span')[0]).attr('class').split('_')[0];
        		$($(this).find('span')[0]).attr('class', findEl+'_compl');
        	});
        	
        	$('#'+state).nextAll('.pro_step').each(function() {
        		$($(this).find('span')[0]).attr('class', 'pro06_ing');
        	});
        }
    });
    
    return {
        render: function(args) {    
            if(instance === null) instance = new layoutView();
            return instance.render(args);
        }        
    };
});