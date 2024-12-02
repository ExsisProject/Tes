(function(){
    define([
            "jquery",
            "backbone",
            "app",
            "approval/models/help",
            "hgn!approval/templates/help",
            "i18n!nls/commons",
            "jquery.go-popup",
            "jquery.go-sdk"
    ],
    function(
        $,
        Backbone,
        App,
        HelpModel,
        HelpTmpl,
        commonLang
    ){
        var ApprFormHelp = Backbone.View.extend({
        	el : "#content",
        	
            type : {
                title : commonLang["도움말"],
                close : commonLang["닫기"]
            },
            
            initialize : function(){
            },

            render : function(options){
            	$('#main').css('min-width',"400px");
                $('#main').css('background-image',"none");
                $('#main').attr('class','go_skin_default');
                this.formId = this.options;
            	this.modle = this.model = new HelpModel();
            	this.model.set({id : this.formId});
                this.model.fetch({async : false});
            	
                var data = this.model.toJSON();
                
                this.$el.html(HelpTmpl({
                	type : this.type
            	}));
                $("#help_content").html(data.description);
            }
            
        });
        
        return {
            render: function(options) {
                var apprFormHelp = new ApprFormHelp(options);
                return apprFormHelp.render(options);
            }
        };
    });
}).call(this);