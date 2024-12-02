define('works/components/applet_doc_search/views/applet_doc_search', function (require) {

    var commonLang = require('i18n!nls/commons');
    var worksLang = require('i18n!works/nls/works');

    var lang = {};

    var DocListView = require('works/components/doc_list/views/refer_doc_list');

    var DEFAULT_PAGE_SIZE = 5;
    return Backbone.View.extend({

        events: {},

        initialize: function (options) {
            this.fieldsOfIntegrationApp = options.fieldsOfIntegrationApp;
            this.integration = options.integration;
            this.selfIntegration = options.selfIntegration;
            this.docs = options.docs;
            this.useToolbar = options.useToolbar;
            this.pageSize = options.pageSize ? options.pageSize : DEFAULT_PAGE_SIZE;
        },

        render: function () {
            var hasIntegrationField = this.fieldsOfIntegrationApp ? _.isObject(this.fieldsOfIntegrationApp.findWhere({cid: this.model.get('integrationFieldCid')})) : false;
            var selectedDisplayFields = this.model.get('selectedDisplayFields') || [];
            var hasDisplayFields = !!selectedDisplayFields.length;
            var hasListAuth = this.selfIntegration ? this.selfIntegration : this.integration.getListAuthByCid(this.model.get('integrationAppletId'));
            if (!hasIntegrationField || !hasDisplayFields || !hasListAuth || !this.model.get('integrationAppletId')) {
                if (!this.model.get('integrationAppletId')) {
                    this.$el.html(this._descTmpl(worksLang['연동 앱 없음 설명']));
                } else if (!hasIntegrationField) {
                    this.$el.html(this._descTmpl(worksLang['삭제된 연동 설명']));
                } else if (!hasDisplayFields) {
                    this.$el.html(this._descTmpl(worksLang['검색 노출 항목 없음 설명']));
                } else {
                    this.$el.html(this._descTmpl(worksLang['연동 권한 설명']));
                }
            } else {
                this._renderDocList();
                this.$el.html(this.docListView.el);
            }

            return this;
        },

        search: function (keyword) {
            if (this.docListView) this.docListView.search(keyword);
        },

        _renderDocList: function () {
            this.docListView = new DocListView({
                collection: this.docs,
                fields: this.fieldsOfIntegrationApp,
                columnFields: this._getColumnFields(),
                className: 'dataTables_wrapper',
                integrationFieldCid: this.model.get('integrationFieldCid'),
                appletId: this.model.get('integrationAppletId'),
                checkbox: false,
                readOnly: true,
                usePageSize: false,
                useBottomButton: false,
                useTableScroll: true,
                useProfile: false,
                useToolbar: this.useToolbar,
                trClass: 'pointer',
                buttons: [{
                    render: $.proxy(function () {
                        return this._searchInputTmpl();
                    }, this)
                }],
                columns: []
            });

            this.docListView.dataFetch().done($.proxy(function () {
                this.docListView.render();
                this.docs.setQueryString('');
                this.docs.setPageSize(this.pageSize, false);
                this.docs.navigationSize = this.pageSize;
                this.docs.fetch({
                    success: _.bind(function () {
                        this.trigger('rendered:appletDocSearch');
                    }, this),
                    error: $.proxy(function (model, e) {
                        this._renderErrorDesc(e);
                        this.trigger('rendered:appletDocSearch');
                    }, this)
                });
            }, this));
            this.docListView.on('ajaxFail', $.proxy(function (e) {
                this._renderErrorDesc(e);
            }, this));
        },

        _descTmpl: function (desc) {
            return Hogan.compile([
                '<p class="desc" id="desc">',
                desc,
                '</p>'
            ].join('')).render();
        },

        _getColumnFields: function () {
            var columnFields = this.fieldsOfIntegrationApp.getFields(this.model.get('selectedDisplayFields'));
            return columnFields.filter(function (columnField) {
                return this.fieldsOfIntegrationApp.findWhere({cid: columnField.get('cid')});
            }, this);
        },

        _renderErrorDesc: function (e) {
            var message = "";
            if (e.status === '403') {
                message = worksLang['연동 권한 설명'];
            } else if (e.status === '404' && e.statusText == 'not.found') {
                message = worksLang['삭제된 연동 설명'];
            }
            this.$el.html(this._descTmpl(message));
        },

        _searchInputTmpl: function () {
            return Hogan.compile([
                '<input type="txt_mini" id="searchKeyword" class="txt_mini" />',
                '<span class="btn_minor_s" id="searchBtn">',
                '<span class="txt">', commonLang['검색'], '</span>',
                '</span>'
            ].join('')).render({lang: lang});
        }
    });
});