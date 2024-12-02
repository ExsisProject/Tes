(function() {
	define([
        // 필수
    	"jquery",
		"underscore", 
        "backbone", 
        "app",
        "hgn!approval/templates/document/actcopy_detail",
		"i18n!nls/commons",
        "i18n!approval/nls/approval",
        "jquery.jstree"
    ], 
    
    function(
        $,  
		_, 
        Backbone, 
        App, 
        ActCopyDetailTpl,
        commonLang,
		approvalLang
    ) {	
		
		var instance = null,
			lang = {
				'상세정보' : approvalLang['상세정보'],
 				'양식제목' : approvalLang['양식제목'],
				'문서분류' : approvalLang['문서분류'],
				'보존연한' : approvalLang['보존연한'],
				'설명' : approvalLang['설명']
			};
		
		var ActCopyDetailView = Backbone.View.extend({
    		el : "#actCopy_detail",
    		tagName : 'tbody',
    		
			events: {

			},
	    	
    		initialize: function(options) {
    		    this.options = options || {};
    		},
    		
	    	render : function(model){
	    		this.model = model;
    			this.dataset = model.attributes;
    			
				var tpl = ActCopyDetailTpl({
				    dataset: this.dataset,
				    year : this.model.getYear(),
					lang : lang
				});
				
				this.$el.html(tpl);
    		},
    		
	    	release: function() {
				this.$el.off();
				this.$el.empty();
			}
		});

		return ActCopyDetailView;
		
	});
	
}).call(this);