/**
 * Created by JeremyJeon on 15. 10. 5..
 */
define('works/views/mobile/doc_detail/consumer_item', function (require) {

    var worksLang = require("i18n!works/nls/works");
    var lang = {
        '건의 연동된 데이터가 있습니다': worksLang['건의 연동된 데이터가 있습니다'],
        '현재 연동된 데이터가 없습니다': worksLang['현재 연동된 데이터가 없습니다']
    };

    var when = require('when');

    var Docs = require("works/collections/docs");
    var Fields = require('works/collections/fields');

    var ListSetting = require('works/components/list_manager/models/list_setting');

    var DocListView = require('works/components/doc_list/views/doc_list');

    var Tmpl = require('hgn!works/templates/mobile/doc_detail/consumer_item');
    var DocumentListTmpl = require('hgn!works/templates/mobile/doc_detail/consumer_doc_list');
    var DocumentListItemTmpl = require('hgn!works/templates/mobile/doc_detail/consumer_doc_list_item');

    return Backbone.View.extend({

        events: {
            "click a.btn_more": "clickedMoreItems",
            "click a.tit": "clickedDocumentItem",
            'vclick a[data-value]': '_paging',
            'vclick .btn_ic_arrow': '_toggleFold'
        },

        initialize: function (options) {
            this.docId = options.docId;
            this.appletId = this.model.get('applet').id;
            this.docs = new Docs([], {appletId: this.appletId, pageSize: 5});
            this.docs.queryString = this._getQueryString();
            this.fields = new Fields([], {
                appletId: this.appletId,
                includeProperty: true,
                type: 'producers'
            });
            this.setting = new ListSetting({}, {appletId: this.appletId});
            this.fieldsOfIntegrationApplet = {};
        },

        render: function () {
            var template = Tmpl({
                lang: lang,
                model: this.model.toJSON(),
                hasData: this.model.get('count') > 0,
                appletId: this.appletId
            });
            this.$el.html(template);

            if (this.model.get('accessable')) {
                var self = this;
                when.all([this.docs.fetch(), this.fields.fetch(), this.setting.fetch()])
                    .then(function () {
                        self.fields.getFieldsOfIntegrationApplet().done(function (fields) {
                            self.fieldsOfIntegrationApplet = fields;
                            self._renderList();
                        });
                    });
            }

            return this;
        },

        _renderList: function () {
            var collection = this._parseCollection(this.docs);
            var pageInfo = this.docs.pageInfo();
            var docListTemplate = DocumentListTmpl({
                lang: lang,
                hasPage: pageInfo.pageSize < pageInfo.total,
                appletId: this.appletId,
                page: _.extend(this.docs.pageInfo(), this.docs.mobilePageInfo())
            });
            this.$('#consumerDocumentList_' + this.appletId).html(docListTemplate);
            _.each(collection, function (doc) {
                var view = DocumentListItemTmpl({document: doc});
                this.$("#consumerDocumentListItem_" + this.appletId).append(view);
            }, this);
        },

        _paging: function (e) {
            var target = $(e.currentTarget);
            var type = target.attr('data-type');
            var pageInfo = this.docs.pageInfo();
            if (type === 'prev' && !pageInfo.prev) return;
            if (type === 'next' && !pageInfo.next) return;

            var self = this;
            var value = target.attr('data-value');
            this.docs.setPageNo(this.docs.pageInfo().pageNo + parseInt(value));
            this.docs.fetch({
                success: function () {
                    self._setCurrentPage();
                    self._renderList();
                }
            });
        },

        _setCurrentPage: function () {
            var pageInfo = _.extend(this.docs.pageInfo(), this.docs.mobilePageInfo());
            this.$('#listCurrent').text(pageInfo.firstIndex);
            this.$('#listMax').text(pageInfo.lastIndex);
            this.$('#listTotal').text(' / ' + pageInfo.total);
        },

        _toggleFold: function (e) {
            var $target = $(e.currentTarget);
            $target.parents('.appInterlock_header').toggleClass('on');
            $target.find('.ic_v2').toggleClass('ic_arrow_open').toggleClass('ic_arrow_close');
            this.$('#consumerDocumentList_' + this.appletId).toggle();
        },

        _gatColumnClass: function (mergedField, isTitle) {
            if (isTitle) return 'tit_word_break';
            if (mergedField.isMultiValueType()) return "item_wrap";
            if (mergedField.isNumberValueType()) return "amount";
            return "";
        },

        _parseCollection: function (docs) {
            var clone = _.clone(docs);
            var columnFields = this.fields.getColumnFields();
            var fields = this.columnFields ? (new Fields(this.columnFields)).models : this.setting.getColumns(columnFields);
            return _.map(clone.models, function (model) {
                var columnsInfo = _.map(fields, function (mergedField, index) {
                    var isTitle = index === this.setting.get('titleColumnIndex');
                    return {
                        visible: true,
                        label: mergedField.get("columnName") || mergedField.get("label"),
                        data: this.getColumnData(model, mergedField, isTitle, true)
                    };
                }, this);

                var titleColumn = columnsInfo[this.setting.get('titleColumnIndex')] || {};
                titleColumn.visible = false;
                return {
                    id: model.id,
                    columns: columnsInfo,
                    titleText: _.isEmpty(titleColumn.data) ? '-' : titleColumn.data
                };
            }, this);
        },

        _getUserLabel: function (user) {
            var position = user.position ? " " + user.position : "";
            return user.name + position;
        },

        clickedMoreItems: function (event) {
            _.each(this.moreCollection, function (doc) {
                var view = DocumentListItemTmpl({
                    document: doc
                });
                this.$("#consumerDocumentListItem_" + this.appletId).append(view);
            }, this);
            this.moreCollection = [];

            $(event.currentTarget).remove();
        },

        clickedDocumentItem: function (event) {
            var docId = $(event.currentTarget).attr('value');
            GO.router.navigate("works/applet/" + this.appletId + "/doc/" + docId, true);
        },

        _getQueryString: function () {
            return _.map(this.model.get('fieldCids'), function (fieldCid) {
                return fieldCid + '.id:(' + this.docId + ')';
            }, this).join(' OR ');
        },

        getColumnData: DocListView.prototype.getColumnData,
        getProperties: DocListView.prototype.getProperties
    });
});
