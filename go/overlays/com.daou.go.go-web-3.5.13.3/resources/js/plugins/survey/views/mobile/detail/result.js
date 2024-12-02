(function() {
    
    define([
        "backbone", 
        "app", 
        "survey/views/detail/result", 
        "i18n!survey/nls/survey"
    ], 
    
    function(
        Backbone,
        GO,
        DetailResultView,
        SurveyLang
    ) {
        
        var MobileResultView = DetailResultView.extend({            

            initialize: function() {
            	DetailResultView.prototype.initialize.apply(this, arguments);
            	this.template = '<ul class="survey list_box list_box_survey"></ul>';
            	$("header.go_header").scrollTop();
            }, 
            
            /**
             * @override
             * @param queryModel
             * @returns
             */
            _makeQueryViewTemplate: function(queryModel) {
            	var html = [];
    	        
    	        html.push('<p class="tit">');
    	        	html.push('<span class="seq">' + queryModel.getQueryNum() +'</span>. ');
    	        	if(queryModel.isRequired()) {
    	        		html.push('<span class="necess">[' + SurveyLang["필수"] + ']</span>');
    	        	}
    	        	html.push(queryModel.get('question'));
    	        html.push('</p>');
    	        html.push('<div class="container">');
    	        	html.push('<ul class="wrap_answer answer_wrap"></ul>');
            	html.push('</div>');
    	        
    	        return html.join("\n");
            }, 
            
            _renderActtionButton: function() {
            	this.$el.append(makeBtnTemplate());
            },
        
        });
        
        function makeBtnTemplate() {
        	var html = [];
        	
            html.push('<div class="page_action_wrap">');
	            html.push('<a class="btn-modify-resp btn_major" data-role="button"><span class="txt">' + SurveyLang['응답 수정'] + '</span></a>');
	        html.push('</div>');
	        
	        return html.join("\n");
        }
        
        return MobileResultView;
    });
    
})();