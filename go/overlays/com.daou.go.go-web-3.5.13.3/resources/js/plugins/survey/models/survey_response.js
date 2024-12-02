(function() {
    define([
        "backbone", 
        "app",
        "survey/models/survey"
    ], 
    
    function(
        Backbone,
        GO,
        SurveyModel
    ) {
        
        var SurveyResponseModel = SurveyModel.extend({
        	fetch: function() {
        		return SurveyModel.prototype.fetch.apply(this, createRespSyncOpt(this, arguments));
        	}, 
        	
        	/**
        	 * 응답 제출
        	 */
            submit: function() {
        		return this.save(null, createRespSyncOpt(this, arguments));
            }, 
            
            /**
             * 응답 임시저장
             */
            tempsave: function() {
            	return this.save(null, {
            		url: getRespModelBaseUrl(this) + '/tempsave'
            	});
            }, 
                        
            isResponsible: function() {
                return this.get('responsible') || false;
            }
        });
        
        function getRespModelBaseUrl(model) {
        	var url = GO.config('contextRoot') + _.result(model, 'url') + '/response';
        	return url.replace('//', '/');
        }
        
        function createRespSyncOpt(model, argObj) {
        	var args = [].slice.call(argObj), 
    			options = args.pop() || {};
    		
			_.extend(options, {
				url: getRespModelBaseUrl(model)
			});
			
			args.push(options);
			
			return args;
        }
        
        return SurveyResponseModel;
    });
})();