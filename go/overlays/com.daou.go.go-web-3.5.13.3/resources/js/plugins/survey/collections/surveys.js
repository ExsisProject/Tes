(function() {
    
    define(["backbone", "survey/models/survey_response"], function(Backbone, SurveyResponseModel) {
        
        var SurveyCollection = Backbone.Collection.extend({
            
            model: SurveyResponseModel,
            filterName: 'progress', 
            
            pageOptions: {
            	"page": 0, 
            	"offset": 20, 
            	"property": 'id', 
            	"direction": 'desc'
            }, 
            
            url: function() {
                return '/api/survey/list/' + this.filterName + '?' + $.param(this.pageOptions);
            }, 
            
            initialize: function(collection, options) {
            	options = options || {};
            	
            	if(options.hasOwnProperty('filter')) {
            		this.setFilter(options.filter);
            	}
            }, 
            
            setFilter: function(filterName) {
                this.filterName = filterName;
                return this;
            }, 
            
            setPageOptions: function(options) {
            	_.extend(this.pageOptions, options || {});
            }, 
            
            setPageNum: function(page) {
            	this.pageOptions.page = page;
            }, 
            
            setPageSize: function(size) {
            	this.pageOptions.offset = size;
            }, 
            
            setPageOrder: function(prop, dir) {
            	this.pageOptions.property = prop;
            	this.pageOptions.direction = dir;
            }
        });
        
        return SurveyCollection;
        
    });
})();