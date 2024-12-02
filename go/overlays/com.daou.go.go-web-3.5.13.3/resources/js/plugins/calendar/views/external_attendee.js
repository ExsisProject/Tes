(function() {
    define([
        "underscore", 
        "backbone", 
        "app", 
        "hogan",
        "i18n!nls/commons"
    ], 

    function(
        _, 
        Backbone, 
        GO, 
        Hogan,
        commonLang
    ) {
    	var externalTpl = Hogan.compile(
			'<span class="name">{{name}}</span>' +
			'<span class="btn_wrap">' +
				'<span class="ic{{^isMobile}}_classic{{/isMobile}} ic_del" title="' + commonLang["삭제"] +'"></span>' +
			'</span>'
    	);
        
    	// 임시view. 향후 주소록 연동하여 nameTagView 형태로 변경 또는 참석자 통합 예정.
    	var ExternalView = Backbone.View.extend({
    		tagName : "li",
    		
    		events : {
    			"click span.ic_del" : "destroy"
    		},
    		
    		initialize : function(options) {
    			this.name = options.name || options.email;
    			this.email = options.email;
    		},
    		
    		render : function() {
    			this.$el.html(externalTpl.render({
    				name : this.name,
    				isMobile : GO.util.isMobile()
    			}));
    			
    			this.$("span.name").data("label", this.name);
    			this.$("span.name").data("email", this.email);
    			
    			return this;
    		},
    		
    		destroy : function(e) {
    			var target = $(e.currentTarget).parents("li");
    			// 상위뷰 몫이지만 임시니까..
    			if (!this.$el.siblings().length) {
    				$("#externalArea").hide();
    			}
    			this.$el.trigger("externalAttendee:destroy", target.find("span.name").text());
    			//
    			
    			this.$el.remove();
    		}
    	});

        return ExternalView;
    });

}).call(this);