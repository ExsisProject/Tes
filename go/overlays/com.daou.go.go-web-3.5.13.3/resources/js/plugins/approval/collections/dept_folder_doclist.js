(function() {
    define([
        "jquery",
        "collections/paginated_collection",
        "approval/models/doclist_item",
    ], 
    function(
        $,
        PaginatedCollection,
        DocListItemModel
    ) {
    	var preloader = null;
    	
        var DeptFolderDocCollection = PaginatedCollection.extend({
            
            model: DocListItemModel,
            types: ['deptdraft', 'deptreference', 'deptfolder'],
            
            initialize: function(options) {
                PaginatedCollection.prototype.initialize.apply(this, arguments);
                this.folderId = options.folderId;
                this.deptId = options.deptId;
                this.type = options.type;
                this.status = options.status
            },
            
            url: function() {
                return this._makeURL(false); 
            },
            
            getCsvURL: function() {
                return this._makeURL(true); 
            },
            
    		fetch : function(options){
    			typeof(options) != 'undefined' || (options = {});
    			var self = this;
    			var beforeSend = options.beforeSend;
    			if(!_.isFunction(beforeSend)) {
					preloader = $.goPreloader();
					preloader.render();    				
    			}
    			
    			var complete = options.complete;
    			options.complete = function(resp){
    				if(preloader != null){
    					preloader.release();
    				}
    				if(_.isFunction(complete)){
    					complete(self, resp);
    				}
    			}
    			return PaginatedCollection.prototype.fetch.call(this, options);
    		},
            
            _makeURL: function(isCsv) {
                var baseURL = "";
                
                if (this.type == 'deptdraft') {
                    baseURL = '/api/approval/deptfolder/draft/' + this.deptId;
                } else if (this.type == 'deptreference') {
                    baseURL = '/api/approval/deptfolder/reference/' + this.deptId;
                    if(this.status != undefined){
                        baseURL += "/" + this.status;
                    }
                } else if (this.type == 'deptofficial') {
                    baseURL = '/api/approval/deptfolder/official/' + this.deptId;
                } else {
                    baseURL = '/api/approval/deptfolder/' + this.folderId + '/documents';
                }
                
                return baseURL + (isCsv ? '/csv' : '') + '?' + this._makeParam();
            },
            
            _makeParam: function() {
            	var params = {
                        page: this.pageNo, 
                        offset: this.pageSize,
                        property: this.property, 
                        direction: this.direction, 
                        searchtype : this.searchtype,
                        keyword : this.keyword
            	};
            	if(this.usePeriod){
            		params['fromDate'] = this.fromDate;
            		params['toDate'] = this.toDate;
            		params['duration'] = this.duration;
            	}
            	
            	return $.param(params);
            },
            
            setFolderId: function(folderId) {
                this.folderId = folderId;
            },
            
            setDeptId: function(deptId) {
                this.deptId = deptId;
            },
            
            setType: function(type) {
                this.type = type;
            },
            
            setSort: function(property,direction) {
                this.property = property;
                this.direction = direction;
                this.pageNo = 0;
                this.pageSize = 20;
            },
            
    		setDuration: function(options) {
    			options = options || {};
    			this.duration = options.duration || 'all';
    			this.fromDate = options.fromDate || "";
    			this.toDate = options.toDate || "";
    		},
            
            setSearch: function(searchtype,keyword) {
                this.searchtype = searchtype;
                this.keyword = keyword;
                this.pageNo = 0;
                this.pageSize = 20;
            },
            
            setListParam: function() {
                this.pageNo = sessionStorage.getItem('list-history-pageNo');
                this.pageSize = sessionStorage.getItem('list-history-pageSize');
                this.property = sessionStorage.getItem('list-history-property');
                this.direction = sessionStorage.getItem('list-history-direction');
                this.searchtype = sessionStorage.getItem('list-history-searchtype');
                this.keyword = sessionStorage.getItem('list-history-keyword').replace(/\+/gi, " ");
            	if(this.usePeriod){
            		this.duration = sessionStorage.getItem('list-history-duration');
            		this.fromDate = sessionStorage.getItem('list-history-fromDate');
            		this.toDate = sessionStorage.getItem('list-history-toDate');
            	}
            }
        });
        
        return DeptFolderDocCollection;
        
    });
}).call(this);