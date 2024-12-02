;(function () {
    define([
            "views/mobile/m_more_list",
            "jquery",
            "backbone",
            "hogan",
            "app",
            "when",

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
            MoreView,
            $,
            Backbone,
            Hogan,
            GO,
            when,
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

            var lang = {
                'approval': approvalLang['전자결재'],
                'move_to_home': commonLang['홈으로 이동'],
                '공문 문서함': approvalLang['공문 문서함'],
                '새결재': approvalLang['새결재'],
                '양식선택': approvalLang['결재양식 선택']
            };

            var ConfigModel = Backbone.Model.extend({
                url: "/api/approval/apprconfig"
            });

            var SendDocList = PaginatedCollection.extend({

                model: DocListItemModel.extend({
                    idAttribute: "_id",
                }),

                url: function () {
                    return '/api/' + this.getBaseURL();
                },

                getBaseURL: function () {
                    return 'approval/doclist/userofficial/all';
                }
            });


            var SendDocListView = MoreView.extend({
                    el: '#content',
                    initialize: function (options) {
                        GO.util.appLoading(true);
                        var self = this;
                        this.options = options || {};
                        _.bindAll(this, 'render', 'renderPages');
                        this.collection = new SendDocList();
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
                            title: lang['공문 문서함'],
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
                                        self.onScrollEvent();
                                        self.$el.find('#document_action').hide();
                                        self.$el.find('#document_todo').show();
                                    }
                                };
                                self.documentAction = new FormSelectView({
                                    toolBarData: formSelectToolBarData
                                });
                                self.documentAction.release();
                                self.offScrollEvent();
                                self.$el.find('#document_todo').hide();
                                self.$el.find('#document_action').show();
                                self.assign(self.documentAction, '#document_action');
                            }
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

            return SendDocListView;
        });
}).call(this);