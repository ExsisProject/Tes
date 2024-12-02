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
            "approval/views/mobile/document/m_appr_form_select",
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
            FormSelectView,
            DocListEmptyTpl,
            DocListItemTpl
        ) {

            var lang = {
                'approval': approvalLang['전자결재'],
                '부서 참조함': approvalLang['부서 참조함'],
                'move_to_home': commonLang['홈으로 이동'],
                '새결재': approvalLang['새결재'],
                '양식선택': approvalLang['결재양식 선택']

            };

            var DeptFolderDocCollection = PaginatedCollection.extend({

                model: DocListItemModel,
                types: ['deptdraft', 'deptreference', 'deptofficial', 'deptdoc'],

                initialize: function (type, deptId, folderId) {
                    PaginatedCollection.prototype.initialize.call(this);
                    this.type = type;
                    this.deptId = deptId;
                    this.folderId = folderId;
                    if (!_.contains(this.types, this.type)) {
                        throw new Error('지원하지 않는 타입입니다.');
                    }
                },
                url: function () {
                    var url;
                    switch (this.type) {
                        case 'deptdraft':
                            url = '/api/approval/deptfolder/draft/' + this.deptId + '?';
                            break;
                        case 'deptreference':
                            url = '/api/approval/deptfolder/reference/' + this.deptId + '?';
                            break;
                        case 'deptofficial':
                            url = '/api/approval/deptfolder/official/' + this.deptId + '?';
                            break;
                        default:
                            url = '/api/approval/deptfolder/' + this.folderId + '/documents?';
                            break;
                    }
                    return url;
                },
                setFolderId: function (folderId) {
                    this.folderId = folderId;
                },
                // setListParam: function() {
                // 	this.pageNo = sessionStorage.getItem('list-history-pageNo');
                // }
            });

            var DeptListView = MoreView.extend({

                    el: '#content',
                    types: ['deptdraft', 'deptreference', 'deptofficial', 'deptdoc'],
                    typesWithNoState: ['deptdraft', 'deptdoc'],

                    initialize: function (options) {
                        GO.util.appLoading(true);
                        this.options = options || {};
                        this.type = this.options.type;
                        if (!_.contains(this.types, this.type)) {
                            throw new Error('지원하지 않는 타입입니다.');
                        }
                        this.folderId = this.options.folderId;
                        this.deptId = this.options.deptId;
                        _.bindAll(this, 'render', 'renderPages');
                        this.collection = new DeptFolderDocCollection(this.type, this.deptId, this.folderId);
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
                        this.$el.html(DocListItemTpl({ulWrapperId:"document_todo", documentAction: true}));
                        GO.util.appLoading(false);
                        this.headerToolbarView = HeaderToolbarView;
                        var _title = function () {
                            if (self.type === "deptdoc") {
                                return $('a[data-id="' + self.folderId + '"][data-navi="' + self.type + '"]').text().trim();
                            }
                            return $('a[data-deptid="' + self.deptId + '"][data-navi="' + self.type + '"]').text().trim();
                        };
                        this.toolBarData = {
                            title: _title(),
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
                        if (_.contains(this.typesWithNoState, this.type)) {
                            this.hideListState();//목록의 state값을 숨긴다.(진행 완료 등등)
                        }
                    },
                    hideListState: function () {
                        this.$el.find('span.state').hide();
                    },
                    assign: function (view, selector) {
                        view.setElement(this.$(selector)).render();
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
            return DeptListView;
        });
}).call(this);