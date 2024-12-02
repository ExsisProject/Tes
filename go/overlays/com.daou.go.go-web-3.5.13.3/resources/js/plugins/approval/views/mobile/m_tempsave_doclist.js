;(function () {
    define([
            // libraries...
            "jquery",
            "backbone",
            "when",
            "hogan",
            "app",

            "approval/models/doclist_item",
            "collections/paginated_collection",

            "approval/views/mobile/m_pagination",
            "approval/views/mobile/m_doclist_item",
            "views/mobile/header_toolbar",
            "approval/views/mobile/document/m_appr_form_select",


            "hgn!approval/templates/mobile/m_doclist_empty",
            "hgn!approval/templates/mobile/m_doclist_item",

            "i18n!nls/commons",
            "i18n!approval/nls/approval",

            "jquery.go-validation",
            "GO.util"
        ],
        function (
            $,
            Backbone,
            when,
            Hogan,
            GO,
            DocListItemModel,
            PaginatedCollection,
            PaginationView,
            DocListItemView,
            HeaderToolbarView,
            FormSelectView,
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
                '임시 저장함': approvalLang['임시 저장함'],
                'move_to_home': commonLang['홈으로 이동'],
                '새결재': approvalLang['새결재'],
                '양식선택': approvalLang['결재양식 선택']

            };

            var TempSaveList = PaginatedCollection.extend({
                initialize: function (options) {
                    PaginatedCollection.prototype.initialize.call(this, options);
                    _.extend(this.options, options || {});
                },
                model: DocListItemModel,
                url: function () {
                    return '/api/approval/doclist/tempsave/all';
                }
            });


            var TempSaveListView = Backbone.View.extend({
                    el: '#content',
                    initialize: function (options) {
                        GO.util.appLoading(true);
                        var self = this;
                        this.offset = GO.config('mobileListOffset') || 20;
                        GO.EventEmitter.off("common", 'appendRenderAboveList');
                        GO.EventEmitter.on('common', 'appendRenderAboveList', this.appendRenderAboveList, this);
                        this.options = options || {};
                        _.bindAll(this, 'render', 'renderPages');
                        this.collection = new TempSaveList();
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
                            title: lang['임시 저장함'],
                            isList: true,
                            isSideMenu: true,
                            isHome: true,
                            isSearch: true,
                            isWriteBtn: true,
                            writeBtnCallback: function () {
                                var formSelectToolBarData = {
                                    title: lang['양식선택'],
                                    isClose: true,
                                    closeCallback: function () {
                                        self.headerToolbarView.render(self.toolBarData);
                                        self.documentAction.release();
                                        self.$el.find('#document_action').hide();
                                        self.$el.find('#document_todo').show();
                                    }
                                };
                                self.documentAction = new FormSelectView({
                                    toolBarData: formSelectToolBarData
                                });
                                self.documentAction.release();
                                self.$el.find('#document_todo').hide();
                                self.$el.find('#document_action').show();
                                self.assign(self.documentAction, '#document_action');
                            }
                        };
                        this.properties = !_.isNull(sessionStorage.getItem(GO.constant("navigator", "PROPERTY")))
                            ? sessionStorage.getItem(GO.constant("navigator", "PROPERTY"))
                            : null;
                        this.pageNo = !_.isNull(sessionStorage.getItem(GO.constant("navigator", "PAGE-NO")))
                            ? sessionStorage.getItem(GO.constant("navigator", "PAGE-NO"))
                            : 0;
                        sessionStorage.clear();
                    },
                    assign: function (view, selector) {
                        view.setElement(this.$(selector)).render();
                    },
                    renderPages: function () {
                        this.$el.find('div.paging br_no').remove();
                    },

                    render: function () {
                        when(this.fetchConfig.call(this))
                            .then(_.bind(function () {
                                this.$el.html(DocListItemTpl({ulWrapperId:"document_todo", documentAction: true}));
                                this.headerToolbarView.render(this.toolBarData);
                                var _this = this;
                                if (this.pageNo >= 0) {
                                    for (var i = 0; i <= this.pageNo; i++) {
                                        this.collection.fetch({
                                            async: false,
                                            data: {page: i, offset: this.offset},
                                            success: function (collection) {
                                                _this.renderList(collection);
                                            }
                                        });
                                        if (i === 0 && this.collection.length === 0) {
                                            this.$el.find('ul.list_box').append(DocListEmptyTpl({
                                                lang: {'doclist_empty': approvalLang['문서가 없습니다.']}
                                            }));
                                            return;
                                        }
                                    }
                                    this.scrollToEl();
                                }
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
                        this.useHold = true
                        this.configModel.fetch({
                            success: function (model) {
                                self.useHold = model.get('useHold');
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
                        var listType = "approval";
                        var isTodoList = this.useHold;
                        doclist.each(function (doc) {
                            var docListItemView = new DocListItemView({
                                model: doc,
                                listType: listType,
                                isTodoList: isTodoList
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
            return TempSaveListView;
        });
}).call(this);