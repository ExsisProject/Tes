(function() {
    
    define([
        "backbone", 
        "survey/models/query", 
        "helpers/form", 
        "survey/helpers/html"
    ], 
    
    function(
        Backbone, 
        QueryModel,
        FormHelper, 
        SurveyHtmlHelper
    ) {
       
        var QueryResultView = Backbone.View.extend({
            tagName: 'li', 
            className: 'query-result', 
            
            initialize: function() {
                if(!this.model) {
                    this.model = new QueryModel();
                }
                this.template = SurveyHtmlHelper.getQueryViewTemplate(this.model, 'div');
                this.$el.data('instance', this);
            }, 
            
            render: function() {
                this.$el.append(this.template);
                
                _.each(this.model.getCases(), function(item, idx) {
                    $(makeQueryCaseGraph(queryType, this.model.id, item))
                        .data('model', item)
                        .appendTo(this.$el.find('.wrap_answer'));
                }, this);
            }
        });
        
        return QueryResultView;
    });
    
})();