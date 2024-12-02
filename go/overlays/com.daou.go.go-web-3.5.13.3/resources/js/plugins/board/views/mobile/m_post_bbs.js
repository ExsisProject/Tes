// 클래식형 게시판 글목록
(function () {
    define([
            // libraries...
            "views/mobile/m_more_list",
            "jquery",
            "backbone",
            "app",
            "board/collections/post_classic",
            "views/mobile/header_toolbar",
            "hgn!board/templates/mobile/m_post_bbs_unit",
            "hgn!board/templates/mobile/m_board_list_item",
            "i18n!board/nls/board",
            "i18n!nls/commons",
            "GO.util"
        ],
        function (
            MoreView,
            $,
            Backbone,
            App,
            postCollection,
            HeaderToolbarView,
            tplPostBbs,
            LayoutTpl,
            boardLang,
            commonLang
        ) {

            var tplVar = {
                'read': boardLang['조회'],
                'plus': boardLang['좋아요'],
                'hidden_post': boardLang['열람권한이 없는 게시물입니다.'],
                'post_sticky': boardLang['공지글'],
                'post_sticky_show': boardLang['공지글 보기'],
                'post_sticky_hide': boardLang['공지글 닫기'],
                'post_null': boardLang['등록된 글이 없습니다.'],
                'post_orphan_msg': boardLang['원글이 삭제된 답글'],
                'public': commonLang["공개"]
            };

            var PostBbs = MoreView.extend({

                initialize: function (options) {
                    this.options = options || {};
                    GO.util.appLoading(true);
                    GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
                    this.nullTpl = ['<li class="creat data_null"><span class="subject"><span class="txt_ellipsis">', tplVar['post_null'], '</span></span></li>'];
                    this.headerToolbarView = HeaderToolbarView;
                    this.collection = new postCollection();
                    var dataSet = {
                        "sorts": 'sortCriteria desc,threadRootCode desc,threadCode asc'
                    };
                    this.isNoticeVisible = GO.util.store.get("isBoardNoticeVisible", null, {type: "local"});
                    var renderListFunc = {
                        listFunc: $.proxy(function (collection) {
                            this.renderPosts(collection.toJSON(), collection.page);
                        }, this)
                    };
                    this.setRenderListFunc(renderListFunc);
                    this.setFetchInfo(dataSet, this.collection);
                },
                unbindEvent: function () {
                    this.$el.off('vclick', 'ul#classicUl a[data-postid]');
                    this.$el.off('vclick', '#notice');
                },
                bindEvent: function () {
                    this.$el.on('vclick', 'ul#classicUl a[data-postid]', $.proxy(this.goPostDetail, this));
                    this.$el.on('vclick', '#notice', $.proxy(this.toggleNotice, this));
                },
                resetPage: function (self, options) {
                    self.boardId = options.boardId;
                    self.owner = options.owner;
                    self.manageable = options.manageable || false;
                    self.isCommunity = options.isCommunity || false;
                    self.writable = options.writable || false;
                    self.status = options.status;
                    self.page = self.getPage();
                    if (self.status == 'CLOSED') self.writable = false;
                    self.postBbsTables = null;
                    self.controlButtons = null;
                    self.boardData = options.boardModel;
                },
                getPage: function () {
                    var page = App.router.getSearch('page');
                    return page ? page : 0;
                },
                render: function () {
                    var self = this;
                    this.resetPage(this, this.options);
                    this.collection.boardId = this.boardId;
                    this.unbindEvent();
                    this.bindEvent();
                    this.$el.html(LayoutTpl({ulTagId: "classicUl", otherClass: "list_board"}));
                    this.$listEl = this.$el.find('ul');
                    var title = this.isCommunity ? this.boardData.ownerInfo + " > " + this.boardData.name : this.boardData.name;
                    var toolbarData = {
                        title: title,
                        isList: true,
                        isSideMenu: true,
                        isHome: true,
                        isSearch: true
                    };

                    if (this.writable) {
                        toolbarData.isWriteBtn = true;
                        toolbarData.writeBtnCallback = function () {
                            var url = self.isCommunity ? 'community' : 'board';
                            url += '/post/write/' + self.owner.ownerId + '/' + self.boardId;
                            GO.router.navigate(url, {trigger: true});
                        }
                    }

                    this.headerToolbarView.render(toolbarData);
                    this.dataFetch(this.pageNo)
                        .done($.proxy(function (collection) {
                            this.renderListFunc.listFunc(collection);
                            this.scrollToEl();
                        }, this));
                    GO.util.appLoading(false);
                    return this.el;
                },
                getPosts: function (page) {
                    var data = {
                        "offset": this.offset,
                        "sorts": 'sortCriteria desc,threadRootCode desc,threadCode asc',
                        "page": page || 0
                    };

                    this.collection.boardId = this.boardId;
                    this.collection.fetch({async: true, data: data, reset: true});
                },
                renderPosts: function (data, page) {
                    var list = [];
                    if (page && page.page == 0) {
                        this.$listEl.empty();
                        this.renderNotice();
                    }

                    if (data.length == 0) {
                        if (page.page == 0) {
                            list.push(this.nullTpl.join(''));
                        }
                    } else {
                        $.each(data, function (k, v) {
                            list.push(tplPostBbs($.extend(v, {
                                'lang': tplVar,
                                'isReply?': function () {
                                    return this.depth;// && this.status != 'CLOSE'
                                },
                                'isClose?': function () {
                                    return this.status === 'CLOSE';
                                },
                                'isHidden?': function () {
                                    return this.status === 'CLOSE' && this.summary == " $$#HIDDEN_POST#$$ ";
                                },
                                'dateformat': function () {
                                    return GO.util.boardDate(this.createdAt, GO.lang);
                                },
                                isVisible: true,
                                postTitle: function () {
                                    return GO.util.escapeHtml(this.title);
                                }
                            })));
                        });
                    }
                    this.$listEl.append(list.join(''));

                },
                goPostDetail: function (e) {
                    this.setSessionInfo(e);
                    e.stopPropagation();
                    var $eTarget = $(e.currentTarget),
                        postId = $eTarget.attr('data-postId'),
                        isHidddenPost = $eTarget.attr('data-hidden'),
                        baseUrl = 'board/' + this.boardId + '/post/' + postId + '?page=' + this.getPage();

                    if (isHidddenPost == 'true') {
                        GO.util.delayAlert(boardLang['열람권한이 없는 게시물입니다.']);
                        return false;
                    }
                    if (this.isCommunity) {
                        baseUrl = 'community/' + this.owner.ownerId + '/' + baseUrl;
                    }
                    App.router.navigate(baseUrl, true);
                    return false;
                },
                renderNotice: function () {
                    var self = this;
                    var data = [],
                        list = [];
                    this.noticeCollection = new postCollection();
                    this.noticeCollection.boardId = this.boardId;
                    this.noticeCollection.notice = true;
                    this.noticeCollection.fetch({
                        async: false, data: {
                            "page": 0,
                            "sorts": 'sortCriteria desc,threadRootCode desc,threadCode asc'
                        }, reset: true
                    });

                    data = this.noticeCollection.toJSON();
                    if (data.length) {
                        list.push(
                            '<li class="notice" id="notice">',
                            '<a class="tit" href="javascript:;">',
                            '<span class="subject">',
                            '<span class="ic ic_noti"></span>',
                            '<span class="title">',
                            boardLang["공지"],
                            '(', data.length, ')',
                            '</span>',
                            this.noticeCollection.hasNewFlagPost() ? '<span class="ic ic_new"></span>' : "",
                            '</span>',
                            '<span class="optional">',
                            '<span data-tag="noticeArrow" class="ic ',
                            this.isNoticeVisible ? "ic_arrow3_t" : "ic_arrow3_d",
                            '"></span>',
                            '</span>',
                            '</a>',
                            '</li>');
                        $.each(data, function (k, v) {
                            var isNotice = true;
                            list.push(tplPostBbs($.extend(v, {
                                'lang': tplVar,
                                'isNotice?': isNotice,
                                'isReply?': function () {
                                    return this.id != this.thread && this.status != 'CLOSE';
                                },
                                'isClose?': function () {
                                    return this.status === 'CLOSE';
                                },
                                'isHidden?': function () {
                                    return this.status === 'CLOSE' && this.summary == " $$#HIDDEN_POST#$$ ";
                                },
                                'dateformat': function () {
                                    return GO.util.boardDate(this.createdAt, GO.lang);
                                },
                                isVisible: self.isNoticeVisible,
                                postTitle: function () {
                                    return GO.util.escapeHtml(this.title);
                                }
                            })));
                        });

                        this.$listEl.prepend(list.join(''));
                    }
                },
                toggleNotice: function (e) {
                    var $eTarget = $(e.currentTarget);
                    var arrow = $eTarget.find("span[data-tag=noticeArrow]");
                    var isHide = arrow.hasClass("ic_arrow3_d");

                    arrow.toggleClass("ic_arrow3_t", isHide);
                    arrow.toggleClass("ic_arrow3_d", !isHide);
                    this.$listEl.find('li[data-notice="true"]').toggle(isHide);
                    GO.util.store.set("isBoardNoticeVisible", isHide, {type: "local"});
                }
            }, {
                __instance__: null,
                create: function () {
                    this.__instance__ = new this.prototype.constructor({el: $('#content')});//   if(this.__instance__ === null)
                    return this.__instance__;
                },
                render: function () {
                    var instance = this.create(),
                        args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [];
                    instance.options = args[0];
                    return this.prototype.render.apply(instance, args);
                }
            });

            return PostBbs;
        });
}).call(this);