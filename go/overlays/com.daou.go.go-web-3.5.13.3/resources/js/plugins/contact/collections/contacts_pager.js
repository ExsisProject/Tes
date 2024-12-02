(function() {
    define(function(require) {
        var _ = require("underscore");
        var Model = require("contact/models/contact");
        var PaginatedCollection = require("collections/paginated_collection");

        var collectionType = null;

        var urlList = {
            'search' : '/api/contact/search',
            'home' : '/api/contact/contacts'
        }

        var contacts = PaginatedCollection.extend({
            model : Model,

            initialize : function(models, options){
                PaginatedCollection.prototype.initialize.apply(this, arguments);

                this.type = options.type;
                this.groupId = options.groupId;
                this.deptId = options.deptId;
                this.initialConsonantPattern = options.initialConsonantPattern;
                collectionType = options.collectionType;
            },

            makeParam : function() {
                var param = {};
                var queryString = "";

                if (this.searchType) param["searchType"] = this.searchType;
                if (this.type) param["type"] = this.type;
                if (this.keyword) param["keyword"] = this.keyword;
                if (this.property) param["property"] = this.property;
                if (this.direction) param["direction"] = this.direction;
                if (this.groupId) param["groupId"] = this.groupId;
                if (this.deptId) param["deptId"] = this.deptId;
                if (this.initialConsonantPattern) param["initialConsonantPattern"] = this.initialConsonantPattern;


                if (!_.isEmpty(param)) queryString += "&" + $.param(param);

                return queryString;
            },

            url : function() {
                var url = [
                    urlList[collectionType],
                    '?',
                    this.makeParam()
                ].join('');

                return url;
            },

            parse: function(resp) {
                this.pageNo = resp.page.page;
                this.pageSize = resp.page.offset;
                this.total = resp.page.total;
                this.extData = resp.extParameter;
                this.page = resp.page;
                return resp.data;
            },

            findById : function(id){
                var model = this.find(function(model){
                    return _.isEqual(model.get("id"), id);
                });

                return model;
            }
        });

        return contacts;
    });
}).call(this);
