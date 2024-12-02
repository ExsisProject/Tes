(function() {
    
    define([
        "backbone", 
        "app", 
        "survey/views/detail/response", 
        "survey/views/mobile/query/response", 
        "i18n!survey/nls/survey"
    ], 
    
    function(
        Backbone,
        GO,
        DetailResponseView,
        QueryResponseView, 
        SurveyLang
    ) {
        
        var MobileResponseView = DetailResponseView.extend({

            initialize: function() {
            	DetailResponseView.prototype.initialize.apply(this, arguments);
            	this.template = makeTemplate(this.model);
            },
            
            addQueryView: function(model) {
                var qrView = new QueryResponseView({ "model": model });
                this.$el.find('.list_box_survey').append(qrView.el);
                qrView.render();
            }
        });
        
        function makeTemplate(model) {
            var html = [];

            html.push('<ul class="list_box list_box_survey"></ul>');

            if(model.isStarted()) {
                html.push('<div class="page_action_wrap">');
                    html.push('<a href="#" class="btn-complete btn_major" data-role="button"><span class="txt">'+SurveyLang["설문 제출"]+'</span></a>');
                    if(!model.isResponseDone()) {
                    	html.push('<a href="#" class="btn-tempsave btn_minor" data-role="button"><span class="txt">'+SurveyLang["임시저장"]+'</span></a>');
                    }
                html.push('</div>');
            }
            
            return html.join("\n");
        }
        
        return MobileResponseView;
    });
    
})();