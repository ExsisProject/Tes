;(function () {
    define([
            // libraries...
            "views/mobile/m_more_list",
            "jquery",
            "backbone",
            "hogan",
            "app",
            "i18n!nls/commons",
            "i18n!approval/nls/approval",
            "approval/views/mobile/m_pagination",
            "approval/views/mobile/m_doclist_item",
            "approval/models/doclist_item",
            "collections/paginated_collection",
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
            commonLang,
            approvalLang,
            PaginationView,
            DocListItemView,
            DocListItemModel,
            PaginatedCollection,
            HeaderToolbarView,
            DocListEmptyTpl,
            DocListItemTpl
        ) {

            var lang = {
                'approval': approvalLang['전자결재'],
                '전사 문서함': approvalLang['전사 문서함'],
                'move_to_home': commonLang['홈으로 이동']
            };

            var DraftDocList = PaginatedCollection.extend({
                model: DocListItemModel,
                url: function () {
                    return '/api/docfolder' + '?' + $.param({
                        page: this.pageNo,
                        property: 'completedAt',
                        direction: 'desc'
                    });
                },
                setType: function (type) {
                    this.type = type;
                }
            });


            var draftListView = MoreView.extend({
                    el: '#content',
                    events: {},
                    initialize: function (options) {
                        GO.util.appLoading(true);
                        this.options = options || {};
                        this.collection = new DraftDocList();
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
                        this.toolBarData = {
                            title: lang['전사 문서함'],
                            isList: true,
                            isSideMenu: true,
                            isHome: true,
                            isSearch: true
                        };

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
                        var dataSet = {property: 'completedAt', direction: 'desc'};
                        this.setFetchInfo(dataSet, this.collection);
                    },

                    render: function () {
                        GO.util.pageDone();
                        this.$el.html(DocListItemTpl);
                        this.headerToolbarView.render(this.toolBarData);
                        this.dataFetch()
                            .done($.proxy(function (collection) {
                                if (collection.length === 0) {
                                    this.renderListFunc.emptyListFunc();
                                } else {
                                    this.renderListFunc.listFunc(collection);
                                    this.scrollToEl();
                                }
                            }, this));
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
            return draftListView;
        });
}).call(this);