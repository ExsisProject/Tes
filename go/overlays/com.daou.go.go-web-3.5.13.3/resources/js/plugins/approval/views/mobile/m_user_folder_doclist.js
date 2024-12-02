;(function () {
    define([
            "views/mobile/m_more_list",
            "jquery",
            "backbone",
            "hogan",
            "app",

            "approval/models/doclist_item",
            "collections/paginated_collection",

            "approval/views/mobile/m_pagination",
            "approval/views/mobile/m_doclist_item",
            "views/mobile/header_toolbar",

            "hgn!approval/templates/mobile/m_doclist_empty",
            "hgn!approval/templates/mobile/m_doclist_item",

            "i18n!nls/commons",
            "i18n!approval/nls/approval",

            "jquery.go-validation",
            "GO.util"
        ],
        function (
            MoreView,
            $,
            Backbone,
            Hogan,
            GO,
            DocListItemModel,
            PaginatedCollection,
            PaginationView,
            DocListItemView,
            HeaderToolbarView,
            DocListEmptyTpl,
            DocListItemTpl,
            commonLang,
            approvalLang
        ) {

            var lang = {
                'approval': approvalLang['전자결재'],
                '개인 문서함': approvalLang['개인 문서함'],
                'move_to_home': commonLang['홈으로 이동']
            };

            var UserFolderDocCollection = PaginatedCollection.extend({

                model: DocListItemModel,
                types: ['userdoc'],

                initialize: function (type, folderId) {
                    PaginatedCollection.prototype.initialize.call(this);
                    this.type = type;
                    this.folderId = folderId;
                },
                url: function () {
                    return '/api/approval/userfolder/' + this.folderId + '/documents';
                },
                setFolderId: function (folderId) {
                    this.folderId = folderId;
                }
            });

            var UserFolderDocListView = MoreView.extend({

                    el: '#content',
                    types: ['userdoc'],
                    typesWithNoState: ['userdoc'],

                    initialize: function (options) {
                        GO.util.appLoading(true);
                        this.options = options || {};
                        this.type = this.options.type;
                        if (!_.contains(this.types, this.type)) {
                            throw new Error('지원하지 않는 타입입니다.');
                        }
                        this.folderId = this.options.folderId;
                        _.bindAll(this, 'render', 'renderPages');
                        this.collection = new UserFolderDocCollection(this.type, this.folderId);
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
                        var dataSet = {};
                        this.setFetchInfo(dataSet, this.collection);
                    },

                    renderPages: function () {
                        this.$el.find('div.paging br_no').remove();
                    },

                    render: function () {
                        var self = this;
                        this.$el.html(DocListItemTpl);
                        var _title = function () {
                            return $('a[data-id="' + self.folderId + '"][data-navi="' + self.type + '"]').text().trim();
                        };
                        this.toolBarData = {
                            title: _title(),
                            isList: true,
                            isSideMenu: true,
                            isHome: true,
                            isSearch: true
                        };
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
                        if (_.contains(this.typesWithNoState, this.type)) {
                            this.hideListState();//목록의 state값을 숨긴다.(진행 완료 등등)
                        }
                        GO.util.appLoading(false);
                    },

                    hideListState: function () {
                        this.$el.find('span.state').hide();
                    },

                    renderList: function (doclist) {
                        var self = this;
                        var listType = "approval";
                        doclist.each(function (doc) {
                            var docListItemView = new DocListItemView({
                                model: doc,
                                listType: listType
                            });
                            self.$el.find('ul.list_box').append(docListItemView.render().el);
                        });
                    },
                    scrollToEl: function () {
                        if (_.isNull(this.properties)) {
                            return false;
                        }
                        var _properties = JSON.parse(this.properties);
                        var el = $('a[data-docid=' + _properties.docid + ']');
                        var elOffset = el.offset().top;
                        var elHeight = el.height();
                        var windowHeight = $(window).height();
                        var offset;
                        if (elHeight < windowHeight) {
                            offset = elOffset - ((windowHeight / 2) - (elHeight / 2))
                        } else {
                            offset = elOffset
                        }
                        $('html').animate({scrollTop: offset});
                    },
                    appendRenderAboveList: function () {
                        var _this = this;
                        var _pageInfo = this.collection.pageInfo();
                        if (!_pageInfo.next) {
                            return
                        }
                        var cPage = _pageInfo.pageNo + 1;
                        this.collection.fetch({
                            async: false,
                            data: {page: cPage, offset: this.offset},
                            success: function (collection) {
                                _this.renderList(collection);
                            }
                        });
                        return false;
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
            return UserFolderDocListView;
        });
}).call(this);