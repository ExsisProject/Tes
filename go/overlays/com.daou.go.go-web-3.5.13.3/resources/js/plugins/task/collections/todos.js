define(
    [
        "backbone",
        "task/models/task"
    ],

    function(
            Backbone,
            TaskModel
    ) { 
        
        var Todos = Backbone.Collection.extend({
            model : TaskModel,
            
            
            initialize : function(options) {
            	this.options = options || {};
            	this.type = options ? options.type : null;
            },
            
            
            url : function() {
            	return GO.contextRoot + "api/task/" + this.type + "?" + $.param(this.listOption);	
            },
            
            
            listOption : {
            	page : 0,
            	offset : 20
            },
            
            
            fetchAll : function() {
            	var self = this;
            	var deferred = $.Deferred();
            	
            	this.listOption.offset = 1;
            	
            	this.setType("referred");
            	var fetchRefer = this.fetch().done(function(collection) {
            		self.referredCount = collection.page.total;
            	});
            	
            	this.setType("approvable");
            	var fetchApprove = this.fetch().done(function(collection) {
            		self.approvableCount = collection.page.total;
            	});
            	
            	this.setType("assigned");
            	var fetchAssign= this.fetch().done(function(collection) {
            		self.assignedCount = collection.page.total;
            	});
            	
            	this.setType("requested");
            	var fetchRequest = this.fetch().done(function(collection) {
            		self.requestedCount = collection.page.total;
        		});
            	
            	$.when(fetchRefer, fetchApprove, fetchAssign, fetchRequest).done(function() {
            		self.totalCount = self.referredCount + self.approvableCount + self.assignedCount + self.requestedCount;
            		
            		self.listOption.offset = 20;
            		self.setType("associated");
            		
            		self.fetch().done(function() {
            			deferred.resolve();
            		});
            	});
            	
            	return deferred;
            },
            
            
            isEmpty : function() {
            	return this.page.total == 0;
            },
            
            
            setType : function(type) {
            	this.type = type;
            },
            
            
            length : function() {
            	return this.models.length;
            },
            
            
            setPage : function(page) {
            	this.listOption.page = page;
            },
            
            
            getPageInfo : function() {
            	var page = this.listOption.page;
            	var total = this.page.total;
            	var offset = this.listOption.offset;
            	
            	var hasTodos = total > 0;
            	var isFirstPage = page == 0;
            	var isLastPage = this.page.lastPage;
            	
            	var firstIndex = (page * offset) + 1;
            	var lastIndex = isLastPage ? total : (page + 1) * offset;
            	
            	return {
            		hasTodos : hasTodos,
            		lastIndex : lastIndex,
            		firstIndex : firstIndex,
            		isPossiblePrev : !isFirstPage,
            		isPossibleNext : !isLastPage,
            		total : total
            	};
            }
        });
        return Todos;
    }
);