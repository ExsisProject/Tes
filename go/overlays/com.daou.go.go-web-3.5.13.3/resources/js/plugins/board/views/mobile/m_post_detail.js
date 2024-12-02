// 모바일웹 - 게시글 상세 페이지
;(function () {
    define([
            'jquery',
            'backbone',
            'app',
            "views/mobile/header_toolbar",
            'board/collections/post_classic_tiny',
            'board/models/post',
            'board/models/post_recommend',
            "board/models/board_config",
            'hgn!board/templates/mobile/m_post_detail',
            'hgn!board/templates/mobile/m_post_auth_users',
            'hgn!board/templates/mobile/m_post_detail_tiny',
            'hgn!board/templates/mobile/m_post_detail_tiny_hidden',
            "board/views/mobile/m_post_attaches",
            'i18n!board/nls/board',
            'i18n!nls/commons',
            'views/layouts/m_action_bar_default',
            "views/mobile/m_font_resize",
            'GO.util'
        ],
        function (
            $,
            Backbone,
            App,
            HeaderToolBarView,
            PostTinyCollection,
            PostModel,
            PostRecommendModel,
            BoardConfigModel,
            tplPostBbsDetail,
            tplPostAuthUsers,
            tplTinyPost,
            tplTinyHidden,
            PostAttachesView,
            boardLang,
            commonLang,
            actionBar,
            FontResize
        ) {

            var menus = {
                "답글": {
                    id: "board-reply",
                    text: boardLang['답글'],
                    triggerFunc: "board-reply"
                },
                "댓글": {
                    id: "board-comment",
                    cls: "btn_comments",
                    text: boardLang['댓글'],
                    triggerFunc: "board-comment"
                },
                "수정": {
                    id: "board-delete",
                    cls: "post_update",
                    text: commonLang['수정'],
                    triggerFunc: "board-modify",
                    inMoreBtn: true
                },
                "삭제": {
                    id: "board-delete",
                    cls: "post_delete",
                    text: commonLang['삭제'],
                    triggerFunc: "board-delete",
                    inMoreBtn: true
                },
                "열람 권한": {
                    id: "board-auth-users",
                    cls: "post_auth_users",
                    text: boardLang['열람 권한'],
                    triggerFunc: "board-auth-users",
                    inMoreBtn: true
                }
            };

            var tplVar = {
                'ok': commonLang['확인'],
                'modify': commonLang['수정'],
                'delete': commonLang['삭제'],
                'list': commonLang['목록'],
                'plus_user': commonLang['좋아요 누른 사람'],
                'recommend': commonLang['좋아요 하기'],
                'recommend_cancel': commonLang['좋아요 취소'],
                'label_like': boardLang['좋아요'],
                'comments': boardLang['댓글'],
                'read_count': boardLang['조회'],
                'post_reply': boardLang['답글쓰기'],
                'post_orphan_msg': boardLang['원글이 삭제된 답글'],
                'post_delete_desc': GO.util.br2nl(boardLang['삭제확인메세지']),
                'post_last_msg': boardLang['마지막 게시물입니다.'],
                'post_move_impossible': boardLang['이동하실 수 없습니다.'],
                'prev': commonLang['위'],
                'next': commonLang['아래'],
                'hidden_post': boardLang['열람권한이 없는 게시물입니다.'],
                'more_content': boardLang['더보기'],
                'content_fold': commonLang['접기']
            };

            var PostBbsDetail = Backbone.View.extend({
                id: 'postBbsDetailView',
                initialize: function (options) {
                    this.$el.off();
                    this.options = options || {};
                    this.postTinyCollection = new PostTinyCollection();
                    this.postTinyCollection.on("reset", this.renderTinyList, this);
                    this.boardModel = BoardConfigModel.get(this.options.boardId);
                    this.isReadablePost = true;
                },
                unbindEvent: function () {
                    this.$el.off('vclick', '#recommendUserList');
                    this.$el.off('vclick', 'span#recommendHeart');
                    this.$el.off('vclick', 'a#recommendHeart');
                    this.$el.off('vclick', 'div.tool_bar a.post_delete');
                    this.$el.off('vclick', 'div.tool_bar a.post_update');
                    this.$el.off('vclick', 'div.tool_bar a.post_auth_users');
                    this.$el.off('vclick', 'div.tool_bar a.post_url_copy');
                    this.$el.off('vclick', '.btn_go_list');
                    this.$el.off('vclick', '#detailTinyList a[data-id]');
                    this.$el.off('vclick', 'span[data-type="externalUrl"]');
                    this.$el.off('vclick', 'div.meta_info_wrap a');
                    this.$el.off('vclick', 'article a[href]');
                    this.$el.off('vclick', 'span[data-btntype="moreBtn"]');
                    this.$el.off('vclick', 'span[data-btntype="closeBtn"]');
                    this.$el.off('vclick', '#more_btn');
                    this.$el.off('vclick', '#copyUrl');
                    $(document).off("backdrop");
                    GO.EventEmitter.off("trigger-action");

                },
                bindEvent: function () {
                    this.$el.on('vclick', '#recommendUserList', $.proxy(this.goToRecommends, this));
                    this.$el.on('vclick', 'span#recommendHeart', $.proxy(this.actionPostRecommend, this));
                    this.$el.on('vclick', 'a#recommendHeart', $.proxy(this.blurEl, this));
                    this.$el.on('vclick', 'div.tool_bar a.post_delete', $.proxy(this.actionPostDelete, this));
                    this.$el.on('vclick', 'div.tool_bar a.post_update', $.proxy(this.actionPostUpdate, this));
                    this.$el.on('vclick', 'div.tool_bar a.post_auth_users', $.proxy(this.actionPostAuthUsers, this));
                    this.$el.on('vclick', '.btn_go_list', $.proxy(this.goToList, this));
                    this.$el.on('vclick', '#detailTinyList a[data-id]', $.proxy(this.goToPostById, this));
                    this.$el.on('vclick', 'span[data-type="externalUrl"]', $.proxy(this.externalUrl, this));
                    this.$el.on('vclick', 'div.meta_info_wrap a', $.proxy(this.externalUrl, this));
                    this.$el.on('vclick', 'article a[href]', $.proxy(this.articleExternalUrl, this));
                    this.$el.on('vclick', 'span[data-btntype="moreBtn"]', $.proxy(this.contentMoreAction, this));
                    this.$el.on('vclick', 'span[data-btntype="closeBtn"]', $.proxy(this.contentCloseAction, this));
                    this.$el.on('vclick', '#more_btn', $.proxy(this.moreLayout, this));
                    this.$el.on('vclick', '#copyUrl', $.proxy(this.copyUrl, this));

                    GO.EventEmitter.on('trigger-action', 'board-reply', this.goToReply, this);
                    GO.EventEmitter.on('trigger-action', 'board-comment', this.goToComments, this);
                    GO.EventEmitter.on('trigger-action', 'board-modify', this.actionPostUpdate, this);
                    GO.EventEmitter.on('trigger-action', 'board-delete', this.actionPostDelete, this);
                    GO.EventEmitter.on('trigger-action', 'board-auth-users', this.actionPostAuthUsers, this);
                    $(document).on("backdrop", $.proxy(function (e) {
                        this.closeMoreLayout(e);
                    }, this));
                },

                closeMoreLayout: function (e) {
                    var moreLayout = $(e.currentTarget).find("#more_layout");
                    if (moreLayout.is(':visible')) {
                        moreLayout.hide();
                    }
                },

                moreLayout: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var moreLayout = $(e.currentTarget).parent().find("#more_layout");
                    this.toggleMoreLayout(moreLayout);
                },

                toggleMoreLayout: function (moreLayout) {
                    if (moreLayout.is(':visible')) {
                        moreLayout.hide();
                    } else {
                        moreLayout.show();
                    }
                },

                contentCloseAction: function (e) {
                    var target = $(e.currentTarget);
                    target.parent().find('span.expander').show();
                    target.parent().find('span.contentMore').remove();
                    target.parent().find('span[data-btntype="moreBtn"]').show();
                    target.parent().find('span[data-btntype="closeBtn"]').hide();
                },
                contentMoreAction: function (e) {
                    var target = $(e.currentTarget);
                    if (!this.model.moreContent) {
                        this.model.getMoreContent();
                    }

                    target.parent().find('span.expander').hide();
                    target.parent().find('span[data-btntype="moreBtn"]').hide();
                    target.before('<span class="contentMore">' + GO.util.escapeHtml(this.model.moreContent) + '</span>');
                    target.parent().find('span[data-btntype="closeBtn"]').show();
                },
                externalUrl: function (e) {
                    //e.preventDefault();
                    var target = $(e.currentTarget);
                    GO.util.externalUrl(target.attr('data-url'));
                    return false;
                },
                articleExternalUrl: function (e) {
                    e.preventDefault();
                    var target = $(e.currentTarget);
                    GO.util.externalUrl(target.attr('href'));
                    return false;
                },
                blurEl: function (e) {
                    $(e.target).blur();
                    $(e.currentTarget).blur();
                },
                changePage: function () {

                    var self = this;
                    this.boardId = this.options.boardId;
                    this.postId = this.options.postId;
                    this.masterOwner = this.options.owner;
                    this.isStream = this.options.boardType == 'STREAM';
                    this.isCommunity = this.options.isCommunity || false;

                    this.writeUrl = this._getWriteUrl();
                    this.replyUrl = this._getReplyUrl();

                    this.options.isMobile = true;
                    this.model = new PostModel(this.options);
                    this.model.setURL();
                    this.model.fetch({
                        async: false,
                        error: function (model, error) {
                            self.isReadablePost = false;
                            setTimeout(function () {
                                GO.util.linkToErrorPage(error);
                            }, 100);
                        }
                    });

                    if(!this.isReadablePost){
                        return;
                    }

                    this.recommendModel = new PostRecommendModel(this.options);
                    this.recommendModel.set('id', this.postId, {silent: true});
                    this.model.on("change", function (model) {
                        if (model.hasChanged("id")) {
                            self.postId = model.id;
                            model.set({postId: self.postId}, {silent: true});
                            App.router.navigate(self._getDirectPostUrl(), {trigger: false});
                        }
                        self.render(true);
                    });

                    //이전/다음 이동
                    if (!this.isStream) {
                        this.postTinyCollection.boardId = this.boardId;
                        this.postTinyCollection.postId = this.postId;
                        this.postTinyCollection.fetch({
                            data: {
                                'sorts': 'sortCriteria desc,threadRootCode desc,threadCode asc',
                                'page': App.router.getSearch('page')
                            }, reset: true
                        });

                    }
                },
                updatePage: function () {
                    this.model.options.readOnly = true;
                    this.model.options.async = true;
                    this.model.fetch();
                },
                render: function () {
                    this.unbindEvent();

                    var renderOnly = arguments[0] === true ? true : false,
                        isUpdate = this.postId == this.options.postId,
                        boardActions = this.options.actions;
                    if (!isUpdate) this.changePage();

                    if(!this.isReadablePost){
                        return;
                    }

                    var dataset = this.model.toJSON(),
                        isZero = function () {
                            if (this.dataset.recommendCount == 0) return true;
                            return false;
                        };


                    dataset.title = GO.util.convertRichText(dataset.title);

                    _.each(dataset.links, function (link) {
                        if (link.url) {
                            link.url = link.url.replace(/&amp;/gi, "&");
                        }
                    });

                    var tplDetail = tplPostBbsDetail({
                        dataset: dataset,
                        boardId: this.boardId,
                        ownerId: this.masterOwner.ownerId,
                        isZero: isZero,
                        isStream: this.isStream,
                        postTitle: function () {
                            return GO.util.escapeHtml(this.dataset.title);
                        },
                        isClose: function () {
                            return this.dataset.type == 'CLASSIC' && this.dataset.status == 'CLOSE';
                        },
                        hasControlAction: function () {
                            return this.dataset.actions.updatable || this.dataset.actions.removable;
                        },
                        directUrl: this._getDirectPostUrl(),
                        writeUrl: this.writeUrl,
                        replyUrl: this.replyUrl,
                        dateformat: function () {
                            return GO.util.basicDate(this.dataset.createdAt);
                        },
                        renderStreamContent: function () {
                            return GO.util.convertMobileRichText(this.dataset.content || this.dataset.summary);
                        },
                        renderClassicContent: function () {
                            if (this.dataset.contentType == 'TEXT') {
                                this.dataset.content = GO.util.convertMobileRichText(this.dataset.content);
                            }
                            return GO.util.escapeXssFromHtml(this.dataset.content);
                        },
                        contextRoot: GO.contextRoot,
                        lang: tplVar
                    });
                    if (!this.isStream) {
                        GO.util.appLoading(true);
                        this.$el.css('visibility', 'hidden');
                    }
                    this.$el.html(tplDetail).removeClass('m_loading');
                    this.$el.find("#doc_header").css('visibility', 'visible');
                    this.$el.find('a[target]').attr('target', '_blank');

                    /*this.actionBar = new actionBar({useMenuList : this.getUseMenus(dataset,boardActions)});
                    this.$el.find("#tool_bar").append(this.actionBar.render().el);
                    this.actionBar.renderToolbar();*/
                    this.renderHeaderToolBar(dataset, boardActions);

                    if (dataset.attaches && dataset.attaches.length) {
                        PostAttachesView.render({
                            el: '#attaches' + dataset.id,
                            attaches: dataset.attaches,
                            postId: this.postId,
                            boardId: this.boardId
                        });
                        PostAttachesView.resize(this.$el);
                    }

                    if (isUpdate && !renderOnly) this.updatePage();

                    this.$el.trigger('vclick');
                    this.bindEvent();
                    this.initWindowEvent();
                    //if(this.isStream) {
                    //this.resizeContent();
                    //}
                },

                renderHeaderToolBar: function (dataset, boardActions) {
                    var toolBarData = {
                        isPrev: true,
                        actionMenu: this.getUseMenus(dataset, boardActions)
                    };
                    HeaderToolBarView.render(toolBarData);
                },

                getUseMenus: function (dataset, boardActions) {
                    var useMenuList = [];

                    if (!this.isStream && dataset.actions.writable) {
                        menus.답글.url = this.replyUrl;
                        useMenuList.push(menus.답글);
                    }
                    if (dataset.commentFlag || dataset.commentsCount != 0) {
                        menus.댓글.commentsCount = dataset.commentsCount;
                        useMenuList.push(menus.댓글);
                    }

                    if (boardActions.updatable && dataset.actions.updatable) {
                        useMenuList.push(menus.수정);
                    }
                    if (boardActions.removable && dataset.actions.removable) {
                        useMenuList.push(menus.삭제);
                    }

                    if (this.model.get('authorizedUsers').length > 0) {
                        useMenuList.push(menus['열람 권한']);
                    }

                    return useMenuList;
                },

                initWindowEvent: function () {
                    this.orientationWindowEvent = {
                        name: 'orientation',
                        event: function () {
                            this.$el.find("#postContentWrapper").width($(window).width());
                            this.decideIscrollInit();
                        }
                    };

                    this.setTimeoutToWindowEventHandler(this.orientationWindowEvent);
                },

                setTimeoutToWindowEventHandler: function (eventHandler) {
                    var self = this;
                    $(window).on(eventHandler.name, function () {
                        if (this.timeout) clearTimeout(this.timeout);
                        this.timeout = setTimeout($.proxy(eventHandler.event, self), 200);
                    });
                },

                makeTplTinyList: function (model, isPrev) {
                    if (!model && !model.id) return false;
                    var isHiddenPost = model.get('hiddenPost');
                    var isTitleHidden = model.get('summary') == ' $$#HIDDEN_POST#$$ ';
                    var tpl = '';
                    var isPrev = isPrev || false;

                    if (isHiddenPost) {
                        tpl = tplTinyHidden({
                            tplVar: tplVar,
                            isPrev: isPrev,
                            isTitleHidden: isTitleHidden,
                            title: GO.util.escapeHtml(model.get('title')),
                        });
                    } else {
                        tpl = tplTinyPost({
                            tplVar: tplVar,
                            isPrev: isPrev,
                            id: model.id,
                            title: GO.util.escapeHtml(model.get('title'))
                        });
                    }
                    return tpl;
                },
                renderTinyList: function () {

                    var postIndex = this.postTinyCollection.indexOf(this.postTinyCollection.get(this.postId)),
                        prevPost = this.postTinyCollection.at(postIndex - 1),
                        nextPost = this.postTinyCollection.at(postIndex + 1);

                    this.$tinyEl = this.$el.find('#detailTinyList').empty();
                    if (prevPost) {
                        this.$tinyEl.prepend(this.makeTplTinyList(prevPost, true));
                    }
                    if (nextPost) {
                        this.$tinyEl.append(this.makeTplTinyList(nextPost, false));
                    }
                    this.resizeContent();
                },
                resizeContent: function () {
                    var _this = this;
                    setTimeout(function () {
                        _this.decideIscrollInit();
                        _this.fontResizeLayerAdd();
                    }, 500);
                },
                decideIscrollInit: function () {
                    if ($(document).width() < $("#postContent").width()) {
                        GO.util.initDetailiScroll("postDetailWrapper", "iScrollContentWrap", "postContentWrapper");
                    } else {
                        this.$el.css('visibility', 'visible');
                        GO.util.appLoading(false);
                    }
                },
                fontResizeLayerAdd: function () {
                    FontResize.render({
                        el: "#fontResizeWrap",
                        targetContentEl: "#postContent"
                    });
                },
                _getDirectPostUrl: function () {
                    var url = App.router.getRootUrl();
                    if (this.isCommunity) {
                        url += 'community/' + this.masterOwner.ownerId + '/board/' + this.boardId + '/post/' + this.postId;
                    } else {
                        url += 'board/' + this.boardId + '/post/' + this.postId;
                    }
                    return url;
                },
                _getReplyUrl: function () {
                    var url = GO.contextRoot + 'app/' + (this.isCommunity ? 'community' : 'board');
                    url += '/post/write/' + this.masterOwner.ownerId + '/' + this.boardId + '/' + this.postId;
                    return url;
                },
                _getCommunityPrefix: function () {
                    return 'community/' + this.masterOwner.ownerId + '/';
                },

                _getWriteUrl: function () {
                    var url = '';
                    if (this.isCommunity) {
                        url += 'community/' + this.masterOwner.ownerId + '/board/' + this.boardId + '/post/write';
                    } else {
                        url += 'board/post/write/' + this.masterOwner.ownerId + '/' + this.boardId;
                    }
                    return url;
                },
                goToRecommends: function (e) {
                    e.preventDefault();
                    if (this.boardModel.get('anonymFlag')) {
                        return false;
                    }
                    var url = 'board/' + this.boardId + '/post/' + this.postId + '/recommends';
                    if (this.isCommunity) url = this._getCommunityPrefix() + url;
                    App.router.navigate(url, true);
                    return false;
                },
                goToReply: function () {
                    var url = (this.isCommunity ? 'community' : 'board') + '/post/write/' + this.masterOwner.ownerId + '/' + this.boardId + '/' + this.postId;
                    App.router.navigate(url, true);
                    return false;
                },
                goToComments: function () {
                    var url = 'board/' + this.boardId + '/post/' + this.postId + '/comments';
                    if (this.isCommunity) url = this._getCommunityPrefix() + url;
                    App.router.navigate(url, true);
                    return false;
                },
                goToList: function () {
                    var url = 'board/' + this.boardId;
                    url = App.router.getSearch('page') ? url += '/?page=' + App.router.getSearch('page') : url;
                    if (this.isCommunity) url = this._getCommunityPrefix() + url;
                    App.router.navigate(url, true);
                    return false;
                },

                swipeStart: function () {
                    this.swipeStartX = window.event.changedTouches[0].clientX;
                    this.swipeStartY = window.event.changedTouches[0].clientY;
                },
                swipeEnd: function () {
                    this.swipeEndX = window.event.changedTouches[0].clientX;
                    this.swipeEndY = window.event.changedTouches[0].clientY;

                    var collection = this.postTinyCollection,
                        postIndex = collection.indexOf(collection.get(this.postId));

                    $('#rightHandle').css('left', -50);
                    $('#leftHandle').css('right', -50);

                    //TODO - 리팩토링 & 비공개 게시물은 건너뛰기
                    if (this.isSwipeX()) {
                        //swipeLEFT
                        if (this.swipeStartX - this.swipeEndX > 100) {
                            this.goToPost(postIndex, 'next');
                        } else if (this.swipeEndX - this.swipeStartX > 100) {
                            this.goToPost(postIndex, 'prev');
                        }
                    }
                },
                isSwipeX: function () {
                    var movedX = Math.abs(this.swipeStartX - this.swipeEndX),
                        movedY = Math.abs(this.swipeEndY - this.swipeStartY);

                    return movedX > movedY && movedX > 25 && movedY < 40;
                },
                showNavigator: function (e) {
                    var clientX = window.event.changedTouches[0].clientX,
                        clientY = Math.abs(window.event.changedTouches[0].clientY),
                        movedX = 0,
                        movedY = clientY - this.swipeStartY,
                        $rightHandle = $('#rightHandle'),
                        $leftHandle = $('#leftHandle');

                    if (movedY < 40) {
                        if (clientX - this.swipeStartX > 100) {
                            movedX = clientX - this.swipeStartX;
                            $rightHandle.stop().css('left', movedX < 50 ? -50 + movedX : 0);
                        }

                        if (this.swipeStartX - clientX > 100) {
                            movedX = this.swipeStartX - clientX;
                            $leftHandle.stop().css('right', movedX < 50 ? -50 + movedX : 0);
                        }
                    } else {
                        $leftHandle.stop().animate({'right': -50}, 500);
                        $rightHandle.stop().animate({'left': -50}, 500);
                    }
                },
                goToPostById: function (e, postId) {
                    if (e) e.stopPropagation();
                    postId = postId || $(e.currentTarget).attr('data-id');
                    if (!postId) return false;

                    var url = "board/" + this.boardId + '/post/' + postId;
                    url = App.router.getSearch('page') ? url += '?page=' + App.router.getSearch('page') : url;
                    if (this.isCommunity) url = this._getCommunityPrefix() + url;
                    App.router.navigate(url, true);
                    return false;
                },
                goToPost: function (index, type) {
                    var moveModel = null;
                    index = index || 0;

                    if (type == 'next') index++;
                    else index--;

                    moveModel = this.postTinyCollection.at(index);
                    if (!moveModel) {
                        GO.util.delayAlert(tplVar['post_last_msg']);
                        return false;
                    } else {
                        if (moveModel.get('status') == 'CLOSE' && moveModel.get('summary') == ' $$#HIDDEN_POST#$$ ') {
                            this.postMove(index, type);
                        } else {
                            this.$el.empty().addClass('m_loading');
                            App.router.navigate("board/" + this.boardId + '/post/' + moveModel.id, true);
                        }
                    }
                    return false;
                },
                actionPostDelete: function () {
                    var self = this;
                    if (confirm(tplVar['post_delete_desc'])) {
                        this.model.destroy({
                            success: function (model, response) {
                                var url = "";

                                if (self.isCommunity) {
                                    url = self._getCommunityPrefix() + 'board/' + self.boardId;
                                } else {
                                    url = "board/" + self.boardId;
                                }

                                App.router.navigate(url, {trigger: true, replace: true});
                            }
                        });
                    }
                    return false;
                },
                actionPostUpdate: function () {
                    var routePath = '';
                    if (this.model.get('contentType') === 'HTML') {
                        GO.util.delayAlert(boardLang['모바일 게시글 수정불가 메세지']);
                        return false;
                    } else {
                        if (this.isCommunity) {
                            routePath += 'community/post/put/';
                        } else {
                            routePath += 'board/post/put/';
                        }
                        routePath += this.masterOwner.ownerId + '/' + this.boardId + '/' + this.postId;
                        App.router.navigate(routePath, {trigger: true});
                    }
                    return false;
                },
                copyUrl: function (e) {
                    GO.util.copyUrl(e)
                },
                actionPostAuthUsers: function (e) {
                    var authorizedUsers = this.model.get('authorizedUsers');
                    $('body').append(tplPostAuthUsers({
                        authorizedUsers: authorizedUsers,
                        boardLang: boardLang,
                        commonLang: commonLang
                    }));

                    $('#postAuthUsersLayer .btn_layer_close').on('click', function () {
                        $('#postAuthUsersLayer').remove();
                    });
                    $('#postAuthUsersLayer .btn_major_s').on('click', function () {
                        $('#postAuthUsersLayer').remove();
                    });
                },
                actionPostRecommend: function (e) {
                    var self = this,
                        options = {
                            'type': 'POST',
                            'success': function (model, rs) {
                                if (rs.code == 200) {
                                    var countEl = self.$el.find('#recommendHeart');
                                    var recommendCount = rs.data.recommendCount || 0;
                                    $('#recommendUserList span.num').html(recommendCount);

                                    if (options.type == 'DELETE') {
                                        countEl.removeClass('on').attr("title", tplVar.recommend);
                                        countEl.find('#heartImg').attr("src", "/resources/images/mobile/ic_heart.png");
                                        countEl.find('span.txt').text(recommendCount);
                                    } else {
                                        countEl.addClass('on').attr("title", tplVar.recommend_cancel);
                                        countEl.find('#heartImg').attr("src", "/resources/images/mobile/ic_heart_on.png");
                                        countEl.find('span.txt').text(recommendCount);
                                    }

                                    self.model.set('recommend', !self.model.get('recommend'), {silent: true});
                                } else {
                                    GO.util.delayAlert(rs.message);
                                }
                            }
                        };

                    if (this.model.get('recommend')) {
                        options.type = 'DELETE';
                    }

                    this.recommendModel.clear();
                    this.recommendModel.save({boardId: this.boardId, postId: this.postId}, options);
                    return false;
                }
            }, {
                __instance__: null,
                create: function (args) {
                    this.__instance__ = new this.prototype.constructor($.extend({el: $('#content')}, args[0]));//if(this.__instance__ === null)
                    //else this.__instance__.options = args[0];
                    return this.__instance__;
                },
                render: function () {
                    var args = arguments.length > 0 ? Array.prototype.slice.call(arguments) : [],
                        instance = this.create(args);

                    return this.prototype.render.apply(instance, args);
                }
            });

            return PostBbsDetail;
        });
}).call(this);