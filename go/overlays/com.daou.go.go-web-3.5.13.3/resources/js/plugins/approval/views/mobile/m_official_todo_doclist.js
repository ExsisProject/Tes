;(function () {
    define([
            // libraries...
            "views/mobile/m_more_list",
            "jquery",
            "backbone",
            "when",
            "hogan",
            "app",
            "when",

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
            when,
            Hogan,
            GO,
            when,
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

            var ConfigModel = Backbone.Model.extend({
                url: "/api/approval/apprconfig"
            });

            var lang = {
                'approval': approvalLang['전자결재'],
                '공문 대기 문서': approvalLang['공문 대기 문서'],
                'move_to_home': commonLang['홈으로 이동']

            };

            var TodoReceptionList = PaginatedCollection.extend({
                initialize: function (options) {
                    PaginatedCollection.prototype.initialize.call(this, options);
                    _.extend(this.options, options || {});
                },
                model: DocListItemModel,
                url: function () {
                    return '/api/approval/officialtodo';
                }
            });


            var OfficialTodoListView = MoreView.extend({
                    el: '#content',
                    initialize: function (options) {
                        GO.util.appLoading(true);
                        this.options = options || {};
                        _.bindAll(this, 'render', 'renderPages');
                        this.collection = new TodoReceptionList();
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
                            title: lang['공문 대기 문서'],
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
                        var dataSet = {};
                        this.setFetchInfo(dataSet, this.collection);
                    },

                    renderPages: function () {
                        this.$el.find('div.paging br_no').remove();
                    },

                    render: function () {
                        when(this.fetchConfig.call(this))
                            .then(_.bind(function () {
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
                            }, this))
                            .then(_.bind(this.fetchCollection, this))
                            .otherwise(function printError(err) {
                                console.log(err.stack);
                            });
                        setTimeout(function () {
                            GO.util.pageDone();
                        }, 500);
                    },
                    fetchConfig: function () {
                        var self = this;
                        var deffered = when.defer();
                        this.configModel = new ConfigModel();
                        this.useOfficialConfirm = true
                        this.configModel.fetch({
                            success: function (model) {
                                self.useOfficialConfirm = model.get('useOfficialConfirm');
                                deffered.resolve();
                            },
                            error: deffered.reject
                        });
                        return deffered.promise;
                    },
                    fetchCollection: function () {
                        var deffered = when.defer();
                        this.collection.fetch({
                            success: function () {
                                deffered.resolve();
                            },
                            error: deffered.reject
                        });
                        return deffered.promise;
                    },
                    renderList: function (doclist) {
                        var self = this;
                        var listType = "officialDoc";
                        var useOfficialConfirm = this.useOfficialConfirm;
                        doclist.each(function (doc) {
                            var docListItemView = new DocListItemView({
                                model: doc,
                                listType: listType,
                                useDocStatus: false,
                                useOfficialConfirm: useOfficialConfirm
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
            return OfficialTodoListView;
        });
}).call(this);