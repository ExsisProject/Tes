;(function () {
    define([
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
                //'공유 문서함' : approvalLang['공유 문서함'],
                'move_to_home': commonLang['홈으로 이동']
            };

            var ShareFolderDocCollection = PaginatedCollection.extend({
                model: DocListItemModel,
                types: ['userfolder', 'deptfolder'],

                initialize: function (options) {
                    PaginatedCollection.prototype.initialize.call(this);
                    this.options = options || {};
                    this.type = options.type;
                    this.folderId = options.folderId;
                    this.belong = options.belong;
                    this.deptId = options.deptId;
                },
                url: function () {
                    var params = $.param({page: this.pageNo});
                    var baseURL = '/api/approval/userfolder/' + this.folderId + '/share/' + this.belong;
                    if (this.type == "userfolder") {
                        if (this.belong == "indept") {
                            baseURL = '/api/approval/userfolder/' + this.folderId + '/share/' + this.belong + '/' + this.deptId;
                        } else {
                            baseURL = '/api/approval/userfolder/' + this.folderId + '/share/' + this.belong;
                        }
                    } else if (this.type == "deptfolder") {
                        baseURL = '/api/approval/deptfolder/' + this.folderId + '/share/' + this.belong + '/' + this.deptId;
                    }
                    return baseURL + '?' + params;
                    ;
                },
                setFolderId: function (folderId) {
                    this.folderId = folderId;
                },
                setListParam: function () {
                    this.pageNo = sessionStorage.getItem('list-history-pageNo');
                }
            });

            var ShareFolderDocListView = Backbone.View.extend({

                    el: '#content',
                    types: ['userfolder', 'deptfolder'],
                    typesWithNoState: ['userfolder', 'deptfolder'],

                    initialize: function (options) {
                        GO.util.appLoading(true);
                        this.options = options || {};
                        this.type = this.options.type;
                        if (!_.contains(this.types, this.type)) {
                            throw new Error('지원하지 않는 타입입니다.');
                        }
                        this.folderId = this.options.folderId;
                        this.belong = this.options.belong;
                        if (this.options.belong) {
                            if (this.options.belong.indexOf("?") >= 0) {
                                this.belong = this.options.belong.substr(0, this.options.belong.indexOf("?"));
                            } else {
                                this.belong = this.options.belong;
                            }
                        }

                        if (this.options.deptId) {
                            if (this.options.deptId.indexOf("?") >= 0) {
                                this.deptId = this.options.deptId.substr(0, this.options.deptId.indexOf("?"));
                            } else {
                                this.deptId = this.options.deptId;
                            }
                        }

                        _.bindAll(this, 'render', 'renderPages');
                        this.collection = new ShareFolderDocCollection({
                            type: this.type,
                            folderId: this.folderId,
                            belong: this.belong,
                            deptId: this.deptId
                        });
                        //this.collection.setFolderId(this.folderId);
                        this.headerToolbarView = HeaderToolbarView;
                        var baseUrl = sessionStorage.getItem('list-history-baseUrl');

                        var currUrl = '/api/approval/userfolder/' + this.folderId + '/share/' + this.belong;
                        if (this.type == "userfolder") {
                            if (this.belong == "indept") {
                                currUrl = '/api/approval/userfolder/' + this.folderId + '/share/' + this.belong + '/' + this.deptId;
                            } else {
                                currUrl = '/api/approval/userfolder/' + this.folderId + '/share/' + this.belong;
                            }
                        } else if (this.type == "deptfolder") {
                            currUrl = '/api/approval/deptfolder/' + this.folderId + '/share/' + this.belong + '/' + this.deptId;
                        }

                        if (baseUrl && baseUrl == currUrl) {
                            this.collection.setListParam();
                        }
                        sessionStorage.clear();
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
                            title: this.collection.extData.folderName,
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
                        if (_.contains(this.typesWithNoState, this.type)) {
                            this.hideListState();//목록의 state값을 숨긴다.(진행 완료 등등)
                        }
                        if (!doclist.length == 0) {
                            this.renderPages();
                        }
                    },
                    hideListState: function () {
                        this.$el.find('span.state').hide();
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
            return ShareFolderDocListView;
        });
}).call(this);