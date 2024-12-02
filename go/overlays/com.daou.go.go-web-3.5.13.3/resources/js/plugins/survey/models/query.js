(function() {
    
    define(["backbone", "app"], function(Backbone, GO) {
        
        var QueryModel = Backbone.Model.extend({
        	
        	initialize: function() {
        		this.on("all", this._reorderQueryCase, this);
        	}, 
            
            urlRoot: function() {
            	return ['/api/survey', this.get('surveyId'), 'query'].join('/');
            }, 
                        
            reorder: function(newSeq, options) {
                var reqUrl = GO.config('contextRoot') + _.result(this, 'url') + '/order', 
                	reqOpt = _.extend(options || {}, {
	                	url: reqUrl.replace('//', '/')
	                });
                
                this.save({'seq': +newSeq }, reqOpt);
            }, 
            
            getQueryNum: function() {
            	return this.get('seq') + 1;
            }, 
            
            getCases: function() {
            	return this.get('cases') || [];
            }, 
            
            getMaxOfSelectable: function() {
            	return this.get('maxOfSelectable') || 0;
            }, 
            
            getResponseCount: function() {
            	return this.get('responseCount') || 0;
            }, 
            
            isRequired: function() {
            	return this.get('required') || false;
            }, 
            
            isSelectType: function() {
            	return this.get('type') === 'select';
            },
            
            isMultiSelectType: function() {
            	return this.get('type') === 'mselect';
            }, 
            
            isTextType: function() {
            	return this.get('type') === 'text';
            }, 
            
            isTextareaType: function() {
            	return this.get('type') === 'textarea';
            }, 
            
            isScoreType: function() {
            	return this.get('type') === 'score';
            }, 
            
            getGroupedType: function() {
				return {
				    "select": 'select', "mselect": 'select', "text": 'text', "textarea": 'text', "score": 'score'
				}[this.get('type')];
            }, 
            
            isGroupOfSelect: function() {
            	return this.getGroupedType() === 'select';
            }, 
            
            isGroupOfText: function() {
            	return this.getGroupedType() === 'text';
            }, 
            
            isAnswered: function() {
            	return this.get('answered') || false;
            }, 
            
            copy: function() {
            	return new QueryModel(_.omit(this.toJSON(), 'id'));
            }, 
            
        	_reorderQueryCase: function() {
        		if(!this.isGroupOfText()) {
        			var old = this.getCases(), copied;
            		copied = _.sortBy(old, function(item) {
            			return +item.seq;
            		});
            		
            		this.set('cases', copied, {silent: true});
        		}
        	}, 
            
        });
        
        return QueryModel;
        
    });
    
})();