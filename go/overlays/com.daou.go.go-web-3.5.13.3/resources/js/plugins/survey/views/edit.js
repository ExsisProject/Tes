(function() {
    
    define([
        "survey/views/regist"
    ], 
    
    function(
        SurveyRegistView
    ) {
        
        var SurveyEditView = SurveyRegistView.extend({
            render: function() {
                var self = this;
                this.model.fetch({
                    success: function() {
                        SurveyRegistView.prototype.render.apply(self, arguments);
                    }
                });
            }
        });
        
        return SurveyEditView;
    });
    
})();