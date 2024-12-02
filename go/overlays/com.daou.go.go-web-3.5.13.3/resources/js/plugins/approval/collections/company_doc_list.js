(function () {
    define([
            "jquery",
            "collections/paginated_collection",
            "approval/models/doclist_item",
            "jquery.go-preloader"
        ],
        function (
            $,
            PaginatedCollection,
            DocListItemModel
        ) {

            var preloader = null;

            var CompanyDocList = PaginatedCollection.extend({

                model: DocListItemModel.extend({
                    idAttribute: "_id"
                }),

                url: function () {
                    return this._makeURL(false);
                },

                getCsvURL: function () {
                    return this._makeURL(true);
                },

                fetch: function (options) {
                    typeof (options) != 'undefined' || (options = {});
                    var self = this;
                    var beforeSend = options.beforeSend;
                    if (!_.isFunction(beforeSend)) {
                        preloader = $.goPreloader();
                        preloader.render();
                    }

                    var complete = options.complete;
                    options.complete = function (resp) {
                        if (preloader != null) {
                            preloader.release();
                        }
                        if (_.isFunction(complete)) {
                            complete(self, resp);
                        }
                    }
                    return PaginatedCollection.prototype.fetch.call(this, options);
                },

                _makeURL: function (isCsv) {
                    var baseURL = '/api/docfolder/' + this.folderId + '/documents';
                    if (isCsv) {
                        baseURL += '/csv';
                    }

                    return baseURL + '?' + $.param({
                        page: this.pageNo,
                        offset: this.pageSize,
                        property: this.property,
                        direction: this.direction,
                        searchtype: this.searchtype,
                        keyword: this.keyword
                    });
                },

                setFolderId: function (folderId) {
                    this.folderId = folderId;
                },

                setSort: function (property, direction) {
                    this.property = property;
                    this.direction = direction;
                    this.pageNo = 0;
                },

                setSearch: function (searchtype, keyword) {
                    this.searchtype = searchtype;
                    this.keyword = keyword;
                    this.pageNo = 0;
                },

                setListParam: function () {
                    this.pageNo = sessionStorage.getItem(GO.constant("navigator", 'PAGE-NO'));
                    this.pageSize = sessionStorage.getItem(GO.constant("navigator", 'PAGE-SIZE'));
                    this.property = sessionStorage.getItem(GO.constant("navigator", 'PROPERTY'));
                    this.direction = sessionStorage.getItem(GO.constant("navigator", 'DIRECTION'));
                    this.searchtype = sessionStorage.getItem(GO.constant("navigator", 'SEARCH-TYPE'));
                    this.keyword = sessionStorage.getItem(GO.constant("navigator", 'KEYWORD').replace(/\+/gi, " "));
                }
            });

            return CompanyDocList;

        });
}).call(this);