;(function () {
    define([
            // libraries...
            "views/mobile/m_more_list",
            "jquery",
            "backbone",
            "hogan",
            "app",
            "i18n!board/nls/board",
            "i18n!nls/commons",
            "i18n!approval/nls/approval",
            "approval/views/mobile/m_pagination",
            "approval/views/mobile/m_doclist_item",
            "approval/collections/company_doc_list",
            "views/mobile/header_toolbar",
            "hgn!approval/templates/mobile/m_doclist_empty",
            "hgn!approval/templates/mobile/m_doclist_item",
            "jquery.go-validation",
            "GO.util"
        ],
        function (
            MoreView,
            $,
            Backbone,
            Hogan,
            GO,
            boardLang,
            commonLang,
            approvalLang,
            PaginationView,
            DocListItemView,
            CompanyDocList,
            HeaderToolbarView,
            DocListEmptyTpl,
            DocListItemTpl
        ) {

            var lang = {
                'approval': approvalLang['전자결재'],
                '전사 문서함': approvalLang['전사 문서함'],
                'move_to_home': commonLang['홈으로 이동']

            };

            var CompanyDocListView = MoreView.extend({
                    el: '#content',
                    initialize: function (options) {
                        GO.util.appLoading(true);
                        this.options = options || {};
                        _.bindAll(this, 'render', 'renderPages');
                        this.folderId = this.options.folderId;
                        this.collection = new CompanyDocList();
                        this.collection.setFolderId(this.folderId);
                        var fragment = this.collection.url().replace('/api/', '');
                        var bUrl = GO.router.getUrl();
                        if (bUrl.indexOf("?") < 0) {
                            GO.router.navigate(fragment, {replace: true});
                        } else {
                            if (bUrl != fragment) {
                                GO.router.navigate(fragment, {trigger: false, pushState: true});
                            }
                        }
                        this.headerToolbarView = HeaderToolbarView;
                        this.initProperty = "completedAt";
                        this.initDirection = "desc";
                        this.ckeyword = "";
                        var baseUrl = sessionStorage.getItem('list-history-baseUrl');
                        if (baseUrl && baseUrl == 'docfolder/' + this.folderId + '/documents') {
                            this.initProperty = sessionStorage.getItem(GO.constant("navigator", 'PROPERTY'));
                            this.initDirection = sessionStorage.getItem(GO.constant("navigator", 'DIRECTION'));
                            this.initSearchtype = sessionStorage.getItem(GO.constant("navigator", 'SEARCH-TYPE'));
                            this.ckeyword = sessionStorage.getItem(GO.constant("navigator", 'KEYWORD').replace(/\+/gi, " "));
                        } else {
                            this.collection.setSort(this.initProperty, this.initDirection);
                        }
                        var renderListFunc = {
                            listFunc: $.proxy(function (collection) {
                                this.renderList(collection);
                            }, this),
                            emptyListFunc: $.proxy(function () {
                                this.$el.find('ul.list_box').append(DocListEmptyTpl({
                                    lang: {'doclist_empty': approvalLang['문서가 없습니다.']}
                                }));
                            }, this)
                        };
                        this.setRenderListFunc(renderListFunc);
                        var dataSet = {
                            property: this.collection.property,
                            direction: this.collection.direction,
                            searchtype: this.collection.searchtype,
                            keyword: this.collection.keyword
                        };
                        this.setFetchInfo(dataSet, this.collection);
                    },

                    renderPages: function () {
                        this.$el.find('div.paging br_no').remove();
                    },

                    render: function () {
                        this.$el.html(DocListItemTpl);
                        this.dataFetch()
                            .done($.proxy(function (collection) {
                                if (collection.length === 0) {
                                    this.renderListFunc.emptyListFunc();
                                } else {
                                    this.renderListFunc.listFunc(collection);
                                    this.scrollToEl();
                                }
                            }, this));
                        this.toolBarData = {
                            title: this.collection.extData.name,
                            isList: true,
                            isSideMenu: true,
                            isHome: true,
                            isSearch: true
                        };
                        this.headerToolbarView.render(this.toolBarData);
                        GO.util.appLoading(false);
                    },
                    renderList: function (doclist) {
                        var self = this;
                        var listType = "docfolder";
                        doclist.each(function (doc) {
                            var docListItemView = new DocListItemView({
                                model: doc,
                                listType: listType
                            });
                            self.$el.find('ul.list_box').append(docListItemView.render().el);
                        });
                    }
                },
                {
                    __instance__: null,
                    create: function () {
                        this.__instance__ = new this.prototype.constructor({el: $('#content')});
                        return this.__instance__;
                    },
                    render: function () {
                        var instance = this.create(),
                            args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];
                        return this.prototype.render.apply(instance, args);
                    }
                });
            return CompanyDocListView;
        });
}).call(this);