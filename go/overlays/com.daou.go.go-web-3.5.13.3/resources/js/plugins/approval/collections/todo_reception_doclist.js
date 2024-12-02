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

        var ReceptionDocList = PaginatedCollection.extend({

            type: "all",
            deptId: null,

            model: DocListItemModel.extend({
                idAttribute: "_id"
            }),

            initialize: function(type, deptId) {
                PaginatedCollection.prototype.initialize.apply(this, arguments);
                this.type = type;
                this.deptId = deptId;
            },

            url: function() {
                return '/api/' + this.getBaseURL() +'/' + this.type + '?' + this._makeParam();
            },

            getCsvURL: function() {
                return '/api/' + this.getBaseURL() +'/all/csv?' + this._makeParam();
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

            getBaseURL: function() {
            	return 'approval/todoreception';

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
                this.type = type;
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

        return ReceptionDocList;

    });
}).call(this);