//모바일웹 커뮤니티 가입목록
;(function () {
    define([
            "views/mobile/m_more_list",
            "jquery",
            "backbone",
            "app",
            "views/mobile/header_toolbar",
            "community/collections/myfeeds",
            "hgn!board/templates/mobile/m_home_list_unit",
            "hgn!board/templates/mobile/m_board_list_item",
            "i18n!nls/commons",
            "i18n!community/nls/community",
            "i18n!board/nls/board",
            "jquery.go-grid"
        ],
        function (
            MoreView,
            $,
            Backbone,
            GO,
            HeaderToolbarView,
            communityCollection,
            communityPostTpl,
            LayoutTpl,
            commonLang,
            communityLang,
            boardLang
        ) {

            var lang = {
                'board': commonLang['게시판'],
                'community_posts': communityLang['커뮤니티 글'],
                'new_post': boardLang['새 글 작성하기'],
                'new_board': boardLang['게시판 추가하기'],
                'board_null': boardLang['등록된 게시판이 없습니다.'],
                'board_null_msg1': boardLang['등록된 게시판이 없습니다.'],
                'joincommunity': communityLang['가입 커뮤니티'],
                'member_wait': communityLang['가입대기'],
                'community': commonLang['커뮤니티'],
                'all_post': communityLang['전체 글 0건'],
                'move_to_home': commonLang['홈으로 이동'],
                'recent_post': communityLang['최근글'],
                'post_write': boardLang['글쓰기'],
                'post_null': boardLang['등록된 글이 없습니다.'],
                'no_auth': boardLang['열람권한이 없는 게시물입니다.'],
                'view_count': boardLang['조회']
            };

            var Communities = MoreView.extend({
                events: {
                    'vclick .home_list li>a': 'goPost'
                },

                initialize: function () {
                    GO.util.appLoading(true);
                    this.$listEl = null;
                    this.headerToolbarView = HeaderToolbarView;

                    this.collection = communityCollection.create();
                    var renderListFunc = {
                        listFunc: $.proxy(function (collection) {
                            this.renderList(collection);
                        }, this)
                    };
                    this.setRenderListFunc(renderListFunc);
                    var dataSet = {};
                    this.setFetchInfo(dataSet, this.collection);
                },
                render: function () {
                    GO.util.pageDone();

                    this.headerToolbarView.render({
                        title: lang['recent_post'],
                        isList: true,
                        isSideMenu: true,
                        isHome: true,
                        isSearch: true
                    });

                    this.$el.html(LayoutTpl({otherClass: "list_board home_list"}));
                    this.$listEl = this.$el.find('ul');

                    this.dataFetch()
                        .done($.proxy(function (collection) {

                            this.renderListFunc.listFunc(collection);
                            this.scrollToEl();
                        }, this));
                    GO.util.appLoading(false);

                    return this.el;
                },

                renderList: function (collection) {
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
                        hasBoard: true,
                        isCommunity: true,
                    };

                    var communityPostHtml = communityPostTpl(tplData);

                    this.$listEl.append(communityPostHtml);

                },

                goPost: function (e) {
                    this.setSessionInfo(e);
                    var targetEl = $(e.currentTarget);
                    var boardType = targetEl.attr('data-boardType');
                    var boardId = targetEl.attr('data-boardId');
                    var postId = targetEl.attr('data-postId');
                    var isHiddenPost = targetEl.attr('data-hidden');
                    var communityId = targetEl.attr("data-ownerId");

                    if (isHiddenPost == 'true') {
                        alert(boardLang['게시글 열람불가 메세지']);
                        return;
                    }
                    GO.router.navigate('community/' + communityId + '/board/' + boardId + '/post/' + postId, {
                        trigger: true,
                        pushState: true
                    });
                }

            }, {
                __instance__: null,
                create: function () {
                    this.__instance__ = new this.prototype.constructor({el: $('#content')});// if(this.__instance__ === null)
                    return this.__instance__;
                },
                render: function () {
                    var instance = this.create(),
                        args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];
                    return this.prototype.render.apply(instance, args);
                }
            });

            return Communities;
        });

}).call(this);