;(function () {
    define([
            // libraries...
            "jquery",
            "backbone",
            "hogan",
            "app",
            "i18n!nls/commons",
            "i18n!approval/nls/approval",
            "approval/views/mobile/m_pagination",
            "approval/views/mobile/m_folderlist_item",
            "approval/models/folderlist_item",
            "collections/paginated_collection",
            "views/mobile/header_toolbar",
            "hgn!approval/templates/mobile/m_doclist_empty",
            "hgn!approval/templates/mobile/m_doclist_item",
            "jquery.go-validation",
            "GO.util"
        ],
        function (
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
                '하위 부서 문서함': approvalLang['하위 부서 문서함'],
                'move_to_home': commonLang['홈으로 이동']

            };

            var DeptFolderDocList = PaginatedCollection.extend({
                model: DocListItemModel,
                url: function () {
                    return '/api/approval/deptfolder/subfolder/list?' + $.param({
                        page: this.pageNo
                    });
                }
            });


            var DeptListView = Backbone.View.extend({
                    el: '#content',
                    events: {},
                    initialize: function (options) {
                        GO.util.appLoading(true);
                        this.options = options || {};
                        this.folderId = this.options.folderId;
                        _.bindAll(this, 'render', 'renderPages');
                        this.collection = new DeptFolderDocList();
                        this.headerToolbarView = HeaderToolbarView;
                        this.collection.bind('reset', this.resetList, this);
                        this.collection.fetch();

                    },

                    renderPages: function () {
                        this.pageView = new PaginationView({pageInfo: this.collection.pageInfo()});
                        this.pageView.bind('paging', this.selectPage, this);
                        this.$el.find('div.paging br_no').remove();
                        this.$el.find('ul.list_box').append(this.pageView.render().el);
                    },

                    render: function () {
                        this.$el.html(DocListItemTpl);
                        GO.util.appLoading(false);
                    },
                    // 페이지 이동
                    selectPage: function (pageNo) {
                        this.collection.setPageNo(pageNo);
                        this.collection.fetch();
                    },
                    resetList: function (doclist) {
                        var self = this;
                        var fragment = this.collection.url().replace('/api/', '');
                        //GO.router.navigate(fragment, {trigger: false, pushState: true});
                        var bUrl = GO.router.getUrl();
                        if (bUrl.indexOf("?") < 0) {
                            GO.router.navigate(fragment, {replace: true});
                        } else {
                            if (bUrl != fragment) {
                                GO.router.navigate(fragment, {trigger: false, pushState: true});
                            }
                        }
                        this.toolBarData = {
                            title: lang['하위 부서 문서함'],
                            isList: true,
                            isSideMenu: true,
                            isHome: true,
                            isSearch: true
                        };
                        this.headerToolbarView.render(this.toolBarData);
                        this.$el.find('ul.list_box').empty();
                        var listType = "approval";
                        doclist.each(function (doc) {
                            var docListItemView = new DocListItemView({
                                model: doc,
                                listType: listType
                            });
                            self.$el.find('ul.list_box').append(docListItemView.render().el);
                        });
                        if (doclist.length == 0) {
                            this.$el.find('ul.list_box').append(DocListEmptyTpl({
                                lang: {'doclist_empty': approvalLang['문서가 없습니다.']}
                            }));
                        }
                        this.renderPages();
                    },
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
            return DeptListView;
        });
}).call(this);