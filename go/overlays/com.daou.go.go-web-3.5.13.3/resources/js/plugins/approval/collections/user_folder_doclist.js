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

        var UserFolderDocCollection = PaginatedCollection.extend({
            
            model: DocListItemModel,
            types: ['userfolder'],
            
            initialize: function(options) {
                PaginatedCollection.prototype.initialize.apply(this, arguments);
                this.folderId = options.folderId;
                this.userId = options.userId;
                this.type = options.type;
                this.status = options.status
            },
            
            url: function() {
                return this._makeURL(false); 
            },
            
            getCsvURL: function() {
                return this._makeURL(true); 
            },
            
            _makeURL: function(isCsv) {
                var baseURL = '/api/approval/userfolder/' + this.folderId + '/documents';
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
            
            setUserId: function(userId) {
                this.userId = userId;
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
        
        return UserFolderDocCollection;
        
    });
}).call(this);