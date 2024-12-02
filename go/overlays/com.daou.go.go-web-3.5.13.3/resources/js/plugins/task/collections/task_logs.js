define(
    [
        "backbone"
    ],

    function(
            Backbone
    ) { 
        
    	var TaskLogModel = Backbone.Model.extend({
    		initialize : function() {},
    		
    		//댓글에 <input> 이라고 입력해서 저장하면 변경이력에 실제로 input 엘리먼트가 생성되는 이슈가 있습니다. works도 동일.GO-18042. works랑 동일하게 escape처리합니다.-- 곽준영  
    		contentParser : function() {
    			var splits = this.get("message").split("\n");
    			splits = _.map(splits, function(m){
    				return GO.util.escapeHtml(m)
    			});
    			return splits;
    		}
    	});
    	
        var TaskLogs = Backbone.Collection.extend({
            model : TaskLogModel,
            
            
            initialize : function(options) {
            	this.options = options || {};
            	this.taskId = options.id;
            },
            
            
            url : function() {
            	return GO.contextRoot + "api/task/" + this.taskId + "/logs?" + $.param(this.options);
            },
            
            
            options : {
            	page : 0,
            	size : 10
            },
            
            
            setPage : function(page) {
            	this.options.page = page;
            }
        });
    
        return TaskLogs;
    }
);