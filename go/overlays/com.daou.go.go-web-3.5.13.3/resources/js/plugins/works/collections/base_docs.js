define("works/collections/base_docs", function (require) {
    var VALUE_TYPE = require("works/constants/value_type");
    var Doc = Backbone.Model.extend({
        isCreator: function (userId) {
            var values = this.get('values') || {};
            var creator = values.creator || {};
            return creator.id === userId;
        }
    });

    return Backbone.Collection.extend({

        model: Doc,

        type: 'base',

        initialize: function (models, options) {
            this.appletId = options.appletId;
            this.subFormId = options.subFormId;
            this.personalViewId = options.personalViewId;
            this.referAppletId = options.referAppletId;
            this.fieldCid = options.fieldCid;
            this.fieldValueType = options.fieldValueType || "";
            this.includeActivityCount = options.includeActivityCount;
            if (options.type) this.type = options.type;
        },

        url: function () {
            var url = this.getUrl();

            url += "?q=" + encodeURIComponent(this.queryString || "") + "&" + this.makeParam();
            if (this.includeActivityCount) url += '&ac=true';
            if (GO.util.isValidValue(this.subFormId)) {
                url += '&subFormId=' + this.subFormId;
            }

            return url;
        },

        getUrl: function () {
            var partialUrl = GO.contextRoot + "api/works/applets/" + this.appletId;
            return {
                base: partialUrl + "/docs",
                score: partialUrl + "/docs/score",
                producerDocs: this.referAppletId ? partialUrl + "/producer/" + this.referAppletId + "/docs" : '',
                consumerDocs: this.referAppletId ? partialUrl + "/consumer/" + this.referAppletId + "/docs" : ''
            }[this.type];
        },

        csvUrl: function () {
            var baseUrl = this.url().replace("/docs?q=", "/docs/csv?q=");
            if (GO.util.isValidValue(this.personalViewId) && this.personalViewId > 0) {
                baseUrl += '&personalViewId=' + this.personalViewId;
            }
            return baseUrl;
        },

        setSimilarKeyword: function (keyword) {
            if (!keyword) return;
            this.queryString = this.fieldCid + ':similar("' + this._escapeSpecialCharacter(keyword) + '")';
        },

        setDuplicateKeyword: function (keyword) {
            if (!keyword) return;
            this.queryString = this.fieldCid + ':eq("' + this._escapeSpecialCharacter(keyword) + '")';
        },

        similarSearch: function (keyword) {
            if (!keyword) return;
            this.setSimilarKeyword(keyword);
            return this.fetch();
        },

        duplicateSearch: function (keyword, currentDocId) {
            if (!keyword) return;
            this.setDuplicateKeyword(keyword);
            this.property = 'create_date';
            this.direction = 'desc';
            this.pageSize = 2;
            var deferred = $.Deferred();
            this.fetch({
                success: function (collection) {
                    collection.reset(collection.reject(function (doc) {
                        return parseInt(doc.id) === parseInt(currentDocId);
                    }));
                    deferred.resolve(collection);
                }
            });
            return deferred;
        },

        setQueryString: function (keyword) {
            if (this.fieldValueType === VALUE_TYPE.NUMBER) {
                this.queryString = "(" + this.fieldCid + ':[* TO *] OR (*:* NOT ' + this.fieldCid + ':[* TO *]))';
            } else {
                this.queryString = this.fieldCid + ':"' + keyword + '"';
            }
        },

        _escapeSpecialCharacter: function (string) {
            return string.replace(/[\\+!():^\[\]\{}~*?|&;\/-\\"]/g, '\\$&');
        },

        _setPersonalViewId: function (personalViewId) {
            this.personalViewId = personalViewId;
        }
    });
});
