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
            "hgn!board/templates/mobile/m_home_list_unit",
            "hgn!board/templates/mobile/m_board_list_item",
            "board/collections/post_myhome",
            "views/mobile/header_toolbar",
            "jquery.go-validation",
            "GO.util"
        ],
        function (
            MoreView,
            $,
            Backbone,
            Hogan,
            App,
            boardLang,
            commonLang,
            LayoutUnitTpl,
            LayoutTpl,
            HomeListCollection,
            HeaderToolbarView
        ) {

            var lang = {
                'board': commonLang['게시판'],
                'activity_posts': boardLang['최근글'],
                'post_write': boardLang['글쓰기'],
                'detail_view': commonLang['자세히 보기'],
                'more_view': boardLang['더 보기'],
                'view_count': boardLang['조회'],
                'total': boardLang['총'],
                'count': boardLang['건'],
                'not_list': boardLang['아직 등록된 글이 없습니다. 아래 버튼을 클릭하여, 글을 등록해 주세요.'],
                'new_post': boardLang['새 글 작성하기'],
                'new_board': boardLang['게시판 추가하기'],
                'no_auth': boardLang['열람권한이 없는 게시물입니다.'],
                'post_null': boardLang['작성된 게시글이 없습니다.'],
                'board_null_msg1': boardLang['등록된 게시판이 없습니다.'],
                'board_null_msg2': boardLang['소속된 부서에서 게시판을 생성하고 열람할 수 있습니다.'],
                'move_to_home': commonLang['홈으로 이동'],
                'plus': boardLang["좋아요"]

            };
            var layoutView = MoreView.extend({
                    unbindEvent: function () {
                        this.$el.off("vclick", "ul.home_list li>a");
                        this.$el.off("vclick", ".board_link");
                        this.$el.off("vclick", "#homeListNewPostBtn");
                        this.$el.off("vclick", "#homeListNewBoardBtn");
                    },
                    bindEvent: function () {
                        this.$el.on("vclick", "ul.home_list li>a", $.proxy(this.viewDetailLi, this));
                        this.$el.on("vclick", ".board_link", $.proxy(this.moveBoardLink, this));
                        this.$el.on("vclick", "#homeListNewPostBtn", $.proxy(this.newPost, this));
                        this.$el.on("vclick", "#homeListNewBoardBtn", $.proxy(this.newBoard, this));
                    },
                    initialize: function () {
                        GO.util.appLoading(true);
                        var _this = this;
                        this.headerToolbarView = HeaderToolbarView;
                        this.$listEl = null;
                        this.toolBarData = {
                            title: lang['activity_posts'],
                            isList: true,
                            isSideMenu: true,
                            isHome: true,
                            isSearch: true,
                            isWriteBtn: true,
                            writeBtnCallback: function () {
                                _this.newPost();
                            }
                        };

                        this.collection = HomeListCollection.create();

                        var renderListFunc = {
                            listFunc: $.proxy(function (collection) {
                                var homelistUnitTpl = this.makeTemplete({
                                    collection: collection
                                });
                                this.$listEl.append(homelistUnitTpl);
                            }, this)
                        };
                        this.setRenderListFunc(renderListFunc);
                        this.setFetchInfo({'url-type': 'all'}, this.collection);
                    },

                    render: function () {
                        GO.util.pageDone();
                        this.unbindEvent();
                        this.bindEvent();
                        this.$el.html(LayoutTpl({otherClass: "list_board home_list"}));
                        this.$el.find('.paging').remove();
                        this.$listEl = this.$el.find('ul');
                        this.headerToolbarView.render(this.toolBarData);
                        this.dataFetch()
                            .done($.proxy(function (collection) {

                                this.hasWritableBoard = collection.extParameter ? collection.extParameter['hasWritableBoard'] : true;
                                this.hasBoard = collection.extParameter ? collection.extParameter['hasBoard'] : true;
                                console.log(this.hasWritableBoard);
                                if (!this.hasWritableBoard) {
                                    $("#commonWriteButton").hide();
                                }
                                this.renderListFunc.listFunc(collection);
                                this.scrollToEl();
                            }, this));

                        GO.util.appLoading(false);
                    },
                    newPost: function () {
                        GO.util.appLoading(true);
                        App.router.navigate('board/post/write', {trigger: true, pushState: true});
                    },
                    newBoard: function () {
                        App.router.navigate('board/create', true);
                    },
                    moveBoardLink: function (e) {
                        var targetEl = $(e.currentTarget).parents('li').first();
                        var boardId = targetEl.attr('data-boardId');
                        App.router.navigate("board/" + boardId, true);
                        e.stopPropagation();
                    },
                    viewDetailLi: function (e) {
                        e.stopPropagation();
                        this.setSessionInfo(e);
                        var targetEl = $(e.currentTarget);
                        this.moveBoardAction(targetEl);
                        return false;
                    },
                    moveBoardAction: function (targetEl) {
                        var boardType = targetEl.attr('data-boardType');
                        var boardId = targetEl.attr('data-boardId');
                        var postId = targetEl.attr('data-postId');
                        var isHiddenPost = targetEl.attr('data-hidden');

                        if (!boardId) return false;
                        if (isHiddenPost == 'true') {
                            alert(boardLang['게시글 열람불가 메세지']);
                            return false;
                        }

                        if (boardType == "CLASSIC") {
                            App.router.navigate("board/" + boardId + "/post/" + postId, true);
                        } else if (boardType == 'STREAM') {
                            App.router.navigate("board/" + boardId + "/post/" + postId + "/stream", true);
                        } else {
                            App.router.navigate("board/" + boardId, true);
                        }
                        return false;
                    },
                    makeTemplete: function (opt) {
                        var collection = opt.collection;
                        var homelistTpl;
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

                        homelistTpl = LayoutUnitTpl({
                            dataSet: collection.toJSON(),
                            isZero: isZero,
                            titleParse: titleParse,
                            contentParse: contentParse,
                            dateParse: dateParse,
                            getPostDetailUrl: function () {
                                var returnUrl = "board/" + this.boardId;

                                if (this.type == "CLASSIC") {
                                    returnUrl += "/post/" + this.id;
                                } else if (this.type == 'STREAM') {
                                    returnUrl += "/post/" + this.id + "/stream";
                                }
                                return returnUrl;
                            },
                            hasBoard: this.hasBoard,
                            hasWritableBoard: this.hasWritableBoard,
                            isClassic: isClassic,
                            lang: lang,
                            isPostHidden: isPostHidden,
                            isTitleHidden: isTitleHidden
                        });

                        return homelistTpl;

                    },
                    renderList: function () {
                        GO.util.appLoading(true);
                        var data = {"page": "0", "offset": this.offset};
                        this.collection.fetch({data: data, reset: true});
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
            return layoutView;
        });
}).call(this);