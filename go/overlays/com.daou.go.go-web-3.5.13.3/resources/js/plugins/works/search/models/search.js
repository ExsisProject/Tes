define('works/search/models/search', function (require) {

    var BaseModel = require('models/base_model');

    var Fields = require('works/collections/fields');
    var PaginatedCollection = require('collections/paginated_collection');
    var Collection = PaginatedCollection.extend({
        fetch: function () {
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
            return GO.contextRoot + 'api/search/works?' + this.makeParam();
        },

        fetch: function (options) {
            options = options || {};
            this.page = options.pageNo || 0;
            return BaseModel.prototype.fetch.apply(this, arguments);
        },

        parse: function (resp) {
            this.collection.page = resp.data.docs.pageInfo;
            this.collection.total = resp.data.docs.pageInfo.total;
            this.collection.pageNo = resp.data.docs.pageInfo.page;
            this.collection.pageSize = resp.data.docs.pageInfo.offset;
            this.collection.lastPage = resp.data.docs.pageInfo.lastPage;
            this.collection.reset(resp.data.docs.content);
            return resp.data;
        },

        setParam: function (param) {
            _.each(param, function (value, key) {
                this[key] = value;
            }, this);
        },

        makeParam: function () {
            var object = {
                keyword: this.keyword || '',
                content: _.isUndefined(this.content) ? true : this.content,
                page: this.page || 0,
                offset: this.offset || 15
            };
            if (this.authorName) object['authorName'] = this.authorName;
            if (!_.isUndefined(this.comments)) object['comments'] = this.comments;
            if (!_.isUndefined(this.attachFileNames)) object['attachFileNames'] = this.attachFileNames;
            if (!_.isUndefined(this.activityContents)) object['activityContents'] = this.activityContents;
            if (!_.isUndefined(this.attachFileContents)) object['attachFileContents'] = this.attachFileContents;
            if (this.fromDate) object['fromDate'] = this.fromDate;
            if (this.toDate) object['toDate'] = this.toDate;
            if (this.appletId) object['appletId'] = this.appletId;
            if (this.appletName) object['appletName'] = this.appletName;

            return $.param(object);
        },

        getCollection: function () {
            return this.collection;
        },

        parseViewDatas: function () {
            return _.map(this.get('docs').content, function (document) {
                var summary = _.findWhere(this.get('appletSummaries'), {id: document.appletId});
                var appletIcon = summary.thumbSmall || '';
                var titleCid = summary.titleCid || '';
                var fieldsArray = summary.fields;
                var fields = new Fields(fieldsArray);
                var columnFields = fields.getColumnFields();
                var displayTitle = document.values[titleCid] || '';
                var content = columnFields.map(function (field) {
                    var tmpValue = field.getDisplayValue(new Backbone.Model(document), field.get('properties'));
                    var displayValue = (_.isArray(tmpValue) ? tmpValue.join(', ') : tmpValue);

                    if (field.get('cid') == titleCid) {
                        displayTitle = displayValue;
                    }
                    return field.get('label') + ': ' + displayValue;
                });
                return {
                    id: document.id,
                    appletId: document.appletId,
                    title: displayTitle,
                    createdAt: GO.util.basicDate3(document.values.create_date),
                    content: content,
                    creator: document.values.creator ? GO.util.userLabel(document.values.creator) : "",
                    appletName: summary.name,
                    appletIcon: appletIcon
                };
            }, this);
        }
    });
});
