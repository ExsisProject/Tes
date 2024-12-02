define('docs/search/models/search', function (require) {

    var BaseModel = require('models/base_model');

    var PaginatedCollection = require('collections/paginated_collection');
    var Collection = PaginatedCollection.extend({
        fetch: function() {
            this.trigger('fetch', {pageNo: this.pageNo});
        }
    });

    return BaseModel.extend({

        initialize: function () {
            BaseModel.prototype.initialize.apply(this, arguments);
            this.collection = new Collection();
            this.listenTo(this.collection, 'fetch', this.fetch);
        },

        url: function () {
        	return GO.contextRoot + 'api/search/docs?' + this.makeParam();
        },

        fetch: function(options) {
            options = options || {};
            this.page = options.pageNo || 0;
            return BaseModel.prototype.fetch.apply(this, arguments);
        },

        parse: function(resp) {
            this.collection.page = resp.page;
            this.collection.total = resp.page.total;
            this.collection.pageNo = resp.page.page;
            this.collection.pageSize = resp.page.offset;
            this.collection.lastPage = resp.page.lastPage;
            this.collection.reset(resp.data);
            return resp.data;
        },

        setParam: function(param) {
            _.each(param, function(value, key) {
                this[key] = value;
            }, this);
        },
        
        makeParam: function() {
        	
        	var isDocsAppSearch = window.location.pathname.indexOf("docs") > -1;
        	
        	var object = {
        			stype: this.stype,
                    keyword: this.keyword || '',
                    page: this.page || 0,
                    offset: this.offset || 15
                };
        	if (this.fromDate) object['fromDate'] = this.fromDate;
            if (this.toDate) object['toDate'] = this.toDate;
            if (this.title) {
            	object['title'] = this.title;
            }else if (!isDocsAppSearch) {
            	object['title'] = this.keyword;
            }
            if (this.content) {
            	object['content'] = this.content;
            }else if (!isDocsAppSearch) {
            	object['content'] = this.keyword;
            }
            if (!_.isUndefined(this.attachFileNames)) {
            	object['attachFileNames'] = this.attachFileNames;
            }else if (!isDocsAppSearch) {
            	object['attachFileNames'] = this.keyword;
            }
            if (!_.isUndefined(this.creatorName)) object['creatorName'] = this.creatorName;
        	if (!_.isUndefined(this.attachFileContents)) object['attachFileContents'] = this.attachFileContents;
        	if (!_.isUndefined(this.docNum)) object['docNum'] = this.docNum;
        	if (!_.isUndefined(this.docsYear)) object['docsYear'] = this.docsYear;
        	if (!_.isUndefined(this.folderId)) object['folderId'] = this.folderId;
        	
        	object['includeType'] = this.includeType;
        	
        	return $.param(object);
        },

        getCollection: function() {
            return this.collection;
        }

    });
});