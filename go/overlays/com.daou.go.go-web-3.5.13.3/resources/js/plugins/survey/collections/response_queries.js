(function() {
    
    define(["survey/collections/queries"], function(QueryCollection) {
        
        var RespQueryCollection = QueryCollection.extend({
            url: function() {
                return '/api/survey/' + this.surveyId + '/response/query';
            }
        });
        
        return RespQueryCollection;
    });
    
})();