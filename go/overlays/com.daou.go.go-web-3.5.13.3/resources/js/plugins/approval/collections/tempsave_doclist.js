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
    	
        var TempSaveDocList = PaginatedCollection.extend({
            
            model: DocListItemModel,
            
            url: function() {
                return '/api/approval/doclist/tempsave/' + this.type + '?' + this._makeParam();
            },
            
            getCsvURL: function() {
                return '/api/approval/doclist/tempsave/all/csv?' + this._makeParam();
            },
            
            _makeParam: function() {
                return $.param({
                    page: this.pageNo, 
                    offset: this.pageSize,
                    property: this.property, 
                    direction: this.direction, 
                    searchtype : this.searchtype, 
                    keyword : this.keyword
                });
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
            }
        });

        return TempSaveDocList;
        
    });
}).call(this);