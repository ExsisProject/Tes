(function() {
    
    define([
        "backbone", 
        "survey/views/query/result",
        "survey/helpers/html"
    ], 
    
    function(
        Backbone, 
        QueryResultView, 
        SurveyHtmlHelper
    ) {
       
        var MobileQueryResultView = QueryResultView.extend({            
        	initialize: function() {
            	QueryResultView.prototype.initialize.apply(this, arguments);
                this.template = makeTemplate(this.model);
            }
        });
        
        function makeTemplate(model) {
        	var html = [];
	        
	        html.push('<p class="tit">');
	        	html.push('<span class="seq">' + model.getQueryNum() +'</span>. ');
	        	if(model.isRequired()) {
	        		html.push('<span class="necess">[' + SurveyLang["필수"] + ']</span>');
	        	}
	        	html.push(model.get('question'));
	        html.push('</p>');
	        html.push('<div class="container">');
	        	html.push('<ul class="wrap_answer answer_wrap"></ul>');
        	html.push('</div>');
	        
	        return html.join("\n");
        }
        
        return MobileQueryResultView;
        
    });
    
})();