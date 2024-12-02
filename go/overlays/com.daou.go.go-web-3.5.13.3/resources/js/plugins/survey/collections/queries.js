(function() {
    
    define(["backbone", "survey/models/query"], function(Backbone, QueryModel) {
        
        var QueryCollection = Backbone.Collection.extend({
            model: QueryModel,
            
            surveyId: -1, 
            
            url: function() {
                return '/api/survey/' + this.surveyId + '/query/list';
            }, 
            
            setSurveyId: function(surveyId) {
                this.surveyId = surveyId;
            }, 
            
            getSurveyId: function() {
                return this.surveyId;
            }, 
            
            reorder: function() {
            	var self = this;
            	this.sort();
            	
            	$.ajax(GO.config('contextRoot') + 'api/survey/' + this.surveyId + '/query/order', {
            		type: 'PUT', 
            		data: JSON.stringify({"ids": this.pluck('id')}), 
            		dataType: 'json',
                    contentType: 'application/json'
            	}).done(function(resp) {
            		self.reset(resp.data);
            	}).fail(function() {
            		
            	});
            }
        });
        
        return QueryCollection;
    });
    
})();