(function () {
    define([
            "views/mobile/m_more_list",
            "jquery",
            "backbone",
            "app",
            "i18n!nls/commons",
            "i18n!board/nls/board",
            "i18n!community/nls/community",
            "hgn!board/templates/mobile/m_home_list_unit",
            "hgn!board/templates/mobile/m_board_list_item",
            "community/models/community_info",
            "community/collections/community_board_myhome",
            "views/mobile/header_toolbar",
            "jquery.go-validation",
            "GO.util"
        ],
        function (
            MoreView,
            $,
            Backbone,
            App,
            commonLang,
            boardLang,
            communityLang,
            LayoutUnitTpl,
            LayoutTpl,
            CommunityInfoModel,
            HomeListCollection,
            HeaderToolbarView
        ) {
            var lang = {
                'board': commonLang['게시판'],
                'community_posts': communityLang['커뮤니티 글'],
                'post_write': boardLang['글쓰기'],
                'new_post': boardLang['새 글 작성하기'],
                'new_board': boardLang['게시판 추가하기'],
                'no_auth': boardLang['열람권한이 없는 게시물입니다.'],
                'board_null': boardLang['등록된 게시판이 없습니다.'],
                'post_null': boardLang['작성된 게시글이 없습니다.'],
                'board_null_msg1': boardLang['등록된 게시판이 없습니다.'],
                'move_to_home': commonLang['홈으로 이동'],
                'view_count': boardLang['조회']
            };
            var layoutView = MoreView.extend({
                    initialize: function (options) {
                        // 상위뷰의 모든 이벤트가 영향을 주고있음. 임시코드.
                        this.$el.off();
                        this.options = options || {};
                        this.communityId = this.options.communityId;

                        this.headerToolbarView = HeaderToolbarView;

                        this.collection = new HomeListCollection();
                        var renderListFunc = {
                            listFunc: $.proxy(function (collection) {
                                this.renderPosts(collection);
                            }, this)
                        };
                        this.setRenderListFunc(renderListFunc);
                        var dataSet = {};
                        this.setFetchInfo(dataSet, this.collection);
                        this.model = CommunityInfoModel.read({communityId: this.communityId});
                    },
                    events: {
                        'vclick ul.home_list li>a': 'goPostDetail',
                        'vclick a[href="home"]': 'goCommunityHome'
                    },
                    getPage: function () {
                        var page = App.router.getSearch('page');
                        return page ? page : 0;
                    },
                    render: function () {
                        var self = this;
                        this.collection.communityId = this.communityId;
                        GO.util.pageDone();
                        this.$el.html(LayoutTpl({otherClass: "list_board home_list"}));
                        this.$listEl = this.$el.find('ul');
                        var headerOption = {
                            title: this.model.toJSON().name,
                            isList: true,
                            isSideMenu: true,
                            isHome: true,
                            isSearch: true
                        };
                        if (this.getWritable()) {
                            headerOption.isWriteBtn = true;
                            headerOption.writeBtnCallback = function () {
                                App.router.navigate('community/post/write/' + self.communityId, true);
                            };
                        }
                        this.headerToolbarView.render(headerOption);
                        this.dataFetch()
                            .done($.proxy(function (collection) {
                                this.renderListFunc.listFunc(collection);
                                this.scrollToEl();
                            }, this));
                    },
                    hasBoard: function () {
                        return this.model.get('boardCount') > 0;
                    },
                    getWritable: function () {
                        return this.hasBoard() && this.model.get('memberStatus') == 'ONLINE';
                    },
                    getPosts: function (page) {
                        GO.util.appLoading(true);
                        var data = {"offset": this.offset};
                        if (page === 'more') {
                            if (this.collection.page.lastPage) {
                                GO.util.appLoading(false);
                                return false;
                            }
                            data.page = parseInt(Number(this.collection.page.page) + 1, 10) || 0;
                        } else {
                            data.page = page || 0;
                        }
                        this.collection.communityId = this.communityId;
                        GO.util.appLoading(false);

                    },
                    renderPosts: function (collection) {

                        if (collection.page.page == 0) {
                            this.$listEl.empty();
                        }
                        this.$listEl.append(this.makeTemplete(collection));
                        GO.util.appLoading(false);
                    },
                    goPostDetail: function (e) {
                        this.setSessionInfo(e);
                        var $eTarget = $(e.currentTarget);
                        var url = 'community/' + this.communityId + '/board/' + $eTarget.attr('data-boardId') + '/post/' + $eTarget.attr('data-postId') + "?page=" + this.getPage();
                        App.router.navigate(url, {trigger: true, pushState: true});
                        e.stopImmediatePropagation();
                        return false;
                    },
                    goCommunityHome: function (e) {
                        e.preventDefault();
                        App.router.navigate('community', {trigger: true, pushState: true});
                        return false;
                    },
                    newPost: function () {
                        App.router.navigate('board/post/write', true);
                        return false;
                    },
                    makeTemplete: function (collection) {
                        var tplData = {},
                            homelistTpl = null;

                        var dataSet = collection.toJSON();
                        var isZero = function () {
                            if (parseInt(this.recommendCount) == 0) {
                                return 'zero';
                            }
                            return '';
                        };

                        var dateParse = function (date) {
                            return GO.util.snsDate(this.createdAt);
                        };

                        var isClassic = function () {
                            var type = this.type;
                            if (type == "CLASSIC") {
                                return true;
                            }
                            return false;
                        };

                        var contentParse = function () {
                            return GO.util.br2nl(GO.util.escapeHtml($.goValidation.charEllipsis(this.summary, 40)));
                        };
                        var titleParse = function () {
                            return GO.util.escapeHtml(this.title);
                        };

                        var isPostHidden = function () {
                            return this.hiddenPost;
                        };

                        var isTitleHidden = function () {
                            return this.summary == " $$#HIDDEN_POST#$$ ";
                        };

                        tplData = {
                            dataSet: dataSet,
                            isZero: isZero,
                            titleParse: titleParse,
                            contentParse: contentParse,
                            dateParse: dateParse,
                            isClassic: isClassic,
                            lang: lang,
                            isPostHidden: isPostHidden,
                            isTitleHidden: isTitleHidden,
                            hasBoard: this.hasBoard()
                        };

                        homelistTpl = LayoutUnitTpl(tplData);

                        return homelistTpl;
                    }
                },
                {
                    __instance__: null,
                    create: function (args) {
                        this.__instance__ = new this.prototype.constructor({
                            el: $('#content'),
                            communityId: args[0].communityId
                        });
                        return this.__instance__;
                    },
                    render: function () {
                        var args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [],
                            instance = this.create(args);
                        return this.prototype.render.apply(instance, args);
                    }
                });
            return layoutView;
        });
}).call(this);