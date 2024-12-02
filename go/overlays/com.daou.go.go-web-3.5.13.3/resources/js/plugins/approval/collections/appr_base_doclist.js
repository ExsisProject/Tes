(function() {
    define([
        "jquery",
        "collections/paginated_collection",
        "approval/models/doclist_item"
    ], 
    function(
        $,
        PaginatedCollection,
        DocListItemModel
    ) {
    	var preloader = null;

        var ApprBaseDocList = PaginatedCollection.extend({
        	
            model: DocListItemModel,

            initialize: function() {
                PaginatedCollection.prototype.initialize.apply(this, arguments);
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
            
    		setDuration: function(options) {
    			options = options || {};
    			this.duration = options.duration || 'all';
    			this.fromDate = options.fromDate || "";
    			this.toDate = options.toDate || "";
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
    			};
    			return PaginatedCollection.prototype.fetch.call(this, options);
    		},
    		
            setType: function(type) {
                if (_.contains(type, "?")) {
                    // TODO: IE8/9에서만 ? 뒤의 것도 URL의 변수로 인식한다.
                    // doclist/draft/:type 으로 선언한 Routes 선언이 있고,
                    // doclist/draft/all?page=0으로 실제 URL이 날라오면,
                    // :type을 all?page=0으로 인식해버림.
                    this.type = type.substr(0, _.indexOf(type, "?"));
                } else {
                    this.type = type;
                }
            },
            
            setSort: function(property,direction) {
                this.property = property;
                this.direction = direction;
                this.pageNo = 0;
            },
            
            setSearch: function(searchtype,keyword) {
                this.searchtype = searchtype;
                this.keyword = keyword;
                this.pageNo = 0;
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
            },

            getCompletedDocumentCount: function(){
                var cnt = 0;
                _.each(this.models, function(model){
                    if(model.isCompleted()){
                        cnt += 1;
                    }
                });
                return cnt;
            }
        });

        return ApprBaseDocList;
        
    });
}).call(this);