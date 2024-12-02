(function() {
    
    define([
        "backbone", 
        "survey/views/query/response",
        "survey/helpers/html", 
        "i18n!survey/nls/survey"
    ], 
    
    function(
        Backbone, 
        QueryResponseView, 
        SurveyHtmlHelper, 
        SurveyLang
    ) {
       
        var MobileQueryResponseView = QueryResponseView.extend({            
            initialize: function() {
            	QueryResponseView.prototype.initialize.apply(this, arguments);
                
                this.template = makeTemplate(this.model);
            }, 
            
            /**
             * @override
             * @param title 경고타이틀(모바일에서는 사용안함)
             * @param msg 경고 메시지
             */
            _alert: function(title, msg) {
            	window.alert($('<p>' + msg + '</p>').text());
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
	        	html.push('<ul class="wrap_answer survey_type1"></ul>');
        	html.push('</div>');
	        
	        return html.join("\n");
        }
        
        return MobileQueryResponseView;
        
    });
    
})();