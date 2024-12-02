define([
        // libraries...
        "views/mobile/m_more_list",
        "jquery",
        "backbone",
        'i18n!nls/commons',
        "i18n!board/nls/board",
        "app",

        "views/mobile/header_toolbar",
        "hgn!board/templates/mobile/m_post_stream",
        "board/collections/post_stream",
        "board/views/mobile/m_post_attaches",
        "board/models/post_more_content",
        'board/models/board_config',

        "json",
        "json2",
        "jquery.go-validation",
        "jquery.placeholder",
        "GO.util",
        "jquery.go-sdk"
    ],
    function (
        MoreView,
        $,
        Backbone,
        commonLang,
        boardLang,
        App,
        HeaderToolBarView,
        TplPostStream,
        Posts,
        postAttachesView,
        postMoreContentModel,
        BoardModel
    ) {
        var lang = {
            'comment_count': boardLang['댓글'],
            'sort_update': boardLang['댓글 등록 기준'],
            'past_feed': boardLang['예전 피드 보기'],
            'term_custom': boardLang['사용자 지정'],
            'save': commonLang['저장'],
            'cancel': commonLang['취소'],
            'modify': commonLang['수정'],
            'del': commonLang['삭제'],
            'comment': boardLang['개의 덧글'],
            'all_view': boardLang['모두 보기'],
            'comment_modify': boardLang['덧글 수정'],
            'comment_delete': boardLang['덧글 삭제'],
            'comment_save': boardLang['댓글 작성'],
            'close': commonLang['닫기'],
            'more_view': boardLang['더 보기'],
            'more_content': boardLang['더보기'],
            'content_fold': commonLang['접기'],
            'no_content': boardLang['아직 등록된 글이 없습니다. 글을 등록해 주세요.'],
            'confirm_delete': boardLang['게시글을 삭제 하시겠습니까?'],
            'confirm_delete_message': boardLang['삭제확인메세지'],
            'confirm_comment_delete_message': boardLang['댓글삭제확인메세지'],
            'alert_fail': commonLang['실패했습니다.'],
            'label_like': boardLang['좋아요'],
            'title_recommend': commonLang['좋아요 하기'],
            'title_recommender': commonLang['좋아요 누른 사람'],
            'title_recommend_cancel': commonLang['좋아요 취소'],
            'title_open': commonLang['펼치기'],
            'title_close': commonLang['접기'],
            'user_count': commonLang['명']
        };
        var PostStream = MoreView.extend({
            initialize: function (options) {
                this.options = options || {};
                GO.util.appLoading(true);
                this.offset = GO.config('mobileListOffset') || 20;
                this.sorts = "createdAt desc";
                this.boardId = this.options.boardId;
                this.boardModel = BoardModel.get(this.boardId);
                this.bbsWritable = this.options.writable;
                this.owner = this.options.owner;
                this.isCommunity = this.options.isCommunity;
                this.boardData = this.options.boardModel;

                this.unbindEvent();
                this.bindEvent();
                this.renderToolBar();

                this.collection = new Posts([], {boardId: this.boardId});
                GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
                this.addLoaderOnce = true;
                this.$listEl = null;
                this.lastSeparateDate = null;
                var dataSet = {
                    "sorts": this.sorts
                };
                var renderListFunc = {
                    listFunc: $.proxy(function (collection) {
                        this._renderPage(collection);
                    }, this)
                };
                this.setRenderListFunc(renderListFunc);
                this.setFetchInfo(dataSet, this.collection);
            },
            unbindEvent: function () {
                this.$el.off('vclick', 'a[data-btntype="postmodify"]');
                this.$el.off('vclick', 'a[data-btntype="postdelete"]');
                this.$el.off('vclick', 'a[data-btntype="recommend"]');
                this.$el.off('vclick', 'a.comment_view');
                this.$el.off('vclick', 'a#recommend_view');
                this.$el.off('vclick', 'span[data-btntype="moreBtn"]');
                this.$el.off('vclick', 'span[data-btntype="closeBtn"]');
                this.$el.off('vclick', 'span[data-type="externalUrl"]');
                this.$el.off('vclick', 'div.meta_info_wrap a');
            },
            bindEvent: function () {
                this.$el.on('vclick', 'a[data-btntype="postmodify"]', $.proxy(this.postModify, this));
                this.$el.on('vclick', 'a[data-btntype="postdelete"]', $.proxy(this.postDelete, this));
                this.$el.on('vclick', 'a[data-btntype="recommend"]', $.proxy(this.actionRecommend, this));
                this.$el.on('vclick', 'a.comment_view', $.proxy(this.moveToComment, this));
                this.$el.on('vclick', 'a#recommend_view', $.proxy(this.moveToRecommend, this));
                this.$el.on('vclick', 'span[data-btntype="moreBtn"]', $.proxy(this.contentMoreAction, this));
                this.$el.on('vclick', 'span[data-btntype="closeBtn"]', $.proxy(this.contentCloseAction, this));
                this.$el.on('vclick', 'span[data-type="externalUrl"]', $.proxy(this.externalUrl, this));
                this.$el.on('vclick', 'div.meta_info_wrap a', $.proxy(this.externalUrl, this));
            },
            renderToolBar: function () {
                var self = this;
                var toolbarData = {
                    title: this.boardData.name,
                    isList: true,
                    isSideMenu: true,
                    isHome: true,
                    isSearch: true
                };

                if (this.bbsWritable) {
                    toolbarData.isWriteBtn = true;
                    toolbarData.writeBtnCallback = function () {
                        var url = self.isCommunity ? 'community' : 'board';
                        url += '/post/write/' + self.owner.ownerId + '/' + self.boardId;
                        GO.router.navigate(url, {trigger: true});
                    }
                }
                HeaderToolBarView.render(toolbarData);
            },

            externalUrl: function (e) {
                //e.preventDefault();
                var target = $(e.currentTarget);
                GO.util.externalUrl(target.attr('data-url'));
                return false;
            },

            render: function () {
                this.dataFetch()
                    .done($.proxy(function (collection) {

                        this.renderListFunc.listFunc(collection);
                        this.scrollToEl();
                    }, this));
                GO.util.appLoading(false);

            },

            _renderPage: function (collection) {
                var isMore = collection.page && collection.page.page > 0 ? true : false;

                if (isMore && this.$listEl) {
                    this.$listEl.append(this.makeTemplete({
                        collection: this.getStreamData(collection),
                        type: 'more',
                        boardId: this.boardId
                    }));
                } else {
                    this.$el.append(this.makeTemplete({
                        collection: this.getStreamData(collection),
                        type: '',
                        boardId: this.boardId
                    }));
                    this.$listEl = this.$('ul.feed_type');
                }
                this.setBtnMore();
                postAttachesView.initImageView(this.$el);

                GO.util.appLoading(false);
            },

            listMore: function () {
                var page = this.collection.page;

                if (page.lastPage) return false;

                var data = {
                    "page": parseInt(page.page + 1, 10) || 0,
                    "offset": this.offset,
                    "sorts": this.sorts
                };
                this.collection.fetch({data: data});
            },
            getStreamData: function (collection) {
                var _this = this,
                    today = new Date(),
                    data = [];

                $.each(collection.toJSON(), function (k, v) {
                    if (!GO.util.isSameDate(today, v.createdAt)) {
                        var tmpDate = GO.util.shortDate(v.createdAt);
                        if (_this.lastSeparateDate != tmpDate) {
                            _this.lastSeparateDate = tmpDate;
                            data.push({
                                'isSeparator': true,
                                'date': tmpDate
                            });
                        }
                    }
                    data.push(v);
                });
                return data;
            },
            setBtnMore: function (page) {
                if (this.collection.page.lastPage) {
                    $('#pullUp').hide();
                } else {
                    $('#pullUp').show();
                }
            },
            contentMoreAction: function (e) {
                var target = $(e.currentTarget);
                var liTarget = target.parents('li').first();
                var postId = liTarget.attr('data-postid');
                var url = GO.contextRoot + "api/board/" + this.boardId + "/post/" + postId + "/content";
                var _this = this;
                $.go(url, '', {
                    qryType: 'GET',
                    contentType: 'application/json',
                    responseFn: function (rs) {
                        if (rs.code == 200) {
                            target.parent().find('span.expander').hide();
                            target.parent().find('span[data-btntype="moreBtn"]').hide();
                            target.before('<span class="contentMore">' + GO.util.convertMobileRichText(rs.data.content) + '</span>');
                            target.parent().find('span[data-btntype="closeBtn"]').show();
                        }
                    }
                });
            },
            contentCloseAction: function (e) {
                var target = $(e.currentTarget);
                target.parent().find('span.expander').show();
                target.parent().find('span.contentMore').remove();
                target.parent().find('span[data-btntype="moreBtn"]').show();
                target.parent().find('span[data-btntype="closeBtn"]').hide();
                return false;
            },
            getPostId: function (eventObj) {
                if (!eventObj) return false;
                return $(eventObj.currentTarget).parents('li').first().attr("data-postId");
            },
            actionRecommend: function (e) {
                var $eTarget = $(e.currentTarget),
                    postId = this.getPostId(e),
                    postModel = this.collection.get(postId),
                    isRecommend = postModel.get('recommend');

                $eTarget.blur();
                e.stopPropagation();
                e.preventDefault();

                $.go(GO.contextRoot + "api/board/" + this.boardId + "/post/" + postId + "/recommend", '', {
                    qryType: isRecommend ? 'DELETE' : 'POST',
                    contentType: 'application/json',
                    responseFn: function (rs) {
                        var nowRecommend = !isRecommend,
                            $recommendEl = $eTarget.parents('div.optional');

                        postModel.set('recommend', nowRecommend);

                        $recommendEl.find('span.txt').text(rs.data.recommendCount);
                        $recommendEl.find('span#txt_count').text(rs.data.recommendCount);
                        if (isRecommend) {
                            $recommendEl.find('#recommendHeart').removeClass('on');
                            $recommendEl.find('#heartImg').attr("src", "/resources/images/mobile/ic_heart.png");
                        } else {
                            $recommendEl.find('#recommendHeart').addClass('on');
                            $recommendEl.find('#heartImg').attr("src", "/resources/images/mobile/ic_heart_on.png");
                        }
                    },
                    error: function () {
                        console.log('error');
                    }
                });
                return;
            },
            postModify: function (e) {
                var target = $(e.currentTarget).parents('li').first(),
                    postId = target.attr("data-postId"),
                    url = [];

                if (postId) {
                    if (this.isCommunity) {
                        url = ['community/post/put', this.owner.ownerId, this.boardId, postId];
                    } else {
                        url = ['board/post/put', this.owner.ownerId, this.boardId, postId];
                    }
                    App.router.navigate(url.join('/'), true);
                }
            },
            postDelete: function (e) {
                var _this = this;
                if (confirm(GO.util.br2nl(lang['confirm_delete_message']))) {
                    _this.postDeleteAction(e);
                } else {
                    return false;
                }
            },
            postDeleteAction: function (e) {
                //게시물 삭제
                var self = this;
                var target = $(e.target).parents('li');
                var postId = target.attr("data-postId");
                var curpage = this.collection.page && this.collection.page.page || 0;

                if (!postId) return false;

                var url = GO.contextRoot + "api/board/" + this.boardId + "/post/" + postId;

                $.go(url, {}, {
                    qryType: 'DELETE',
                    contentType: 'application/json',
                    responseFn: function (rs) {
                        target.fadeOut(500, function () {
                            var url = "";

                            if (self.isCommunity) {
                                url = 'community/' + self.owner.ownerId + '/board/' + self.boardId;
                            } else {
                                url = "board/" + self.boardId;
                            }

                            App.router.navigate(url, {trigger: true, replace: true});
                        });
                    }
                });
            },
            makeTemplete: function (opt) {

                var collection = opt.collection;
                var type = opt.type;
                var boardId = opt.boardId;
                var bbsWritable = opt.bbsWritable;

                var _this = this;

                //게시판 ID
                var boardId = function () {
                    return _this.boardId;
                };

                //데이터 유무
                var isListNull = function () {
                    if (_this.collection.length > 0) {
                        return '';
                    }
                    return 'none';
                };

                //날짜 계산
                var dateParse = function (date) {
                    return GO.util.snsDate(this.createdAt);
                };

                var commentParse = function (date) {
                    return GO.util.snsDate(this.createdAt);
                };

                //플러스 숫자 체크
                var isZero = function (type) {
                    if (parseInt(this.recommendCount) == 0) {
                        if (type == "zero") {
                            return 'zero';
                        } else {
                            return 'none';
                        }
                    }
                    return '';
                };

                //댓글 숫자 체크
                var commentCheck = function () {
                    if (parseInt(this.commentsCount) < 4) {
                        return 'none';
                    }
                };

                //댓글 숫자
                var repliesCnt = function () {
                    if (this.comments) {
                        return this.comments.length;
                    }
                    return 0;
                };

                //추천 체크
                var isRecommend = function () {
                    if (this.recommend) {
                        return 'btn_plus_favo';
                    } else {
                        return 'btn_plus';
                    }
                };

                var postAttachFiles = function () {
                    if (this.attaches) {
                        return postAttachesView.render({
                            attaches: this.attaches,
                            postId: this.id,
                            boardId: boardId
                        });
                    }

                    //return '';
                };

                var attachWrap = function () {
                    if (this.attaches && this.attaches.length > 0) {
                        return true;
                    }
                    return false;
                };

                //내용파싱
                var contentParse = function () {
                    var content = GO.util.escapeHtml(this.summary);
                    if (GO.util.ckeckBrCnt(content) > 8) {
                        return GO.util.splitBrContent(content);
                    }
                    return GO.util.convertMobileRichText(this.summary);
                };

                var summarizedFlagSet = function () {
                    var content = GO.util.escapeHtml(this.summary);
                    if (GO.util.ckeckBrCnt(content) > 8 || this.summarizedFlag) {
                        return true;
                    }
                };

                //코멘트 내용 파싱
                var commentMessage = function () {
                    return GO.util.convertMobileRichText(this.message);
                };

                //코멘트 gif이미지
                var isGif = function () {
                    if (this.extention.toLowerCase() == "gif") {
                        return true;
                    }
                    return false;
                };

                var checkFileType = function () {

                    var fileType = "def";
                    if (GO.util.fileExtentionCheck(this.extention)) {
                        fileType = this.extention;
                    }
                    return fileType;

                };

                var tplPostStream = TplPostStream({
                    isPageZero: type == 'more' ? false : true,
                    contextRoot: GO.contextRoot,
                    dataset: collection,
                    boardId: boardId,
                    isZero: isZero,
                    commentCheck: commentCheck,
                    repliesCnt: repliesCnt,
                    postAttachFiles: postAttachFiles,
                    isRecommend: isRecommend,
                    dateParse: dateParse,
                    commentParse: commentParse,
                    isListNull: isListNull,
                    lang: lang,
                    attachWrap: attachWrap,
                    contentParse: contentParse,
                    commentMessage: commentMessage,
                    bbsWritable: bbsWritable,
                    checkFileType: checkFileType,
                    summarizedFlagSet: summarizedFlagSet,
                    isCommentFlag: function () {
                        return _this.boardModel.get("commentFlag") || this.commentsCount != 0;
                    },
                    isAlimPost: function () {
                        if (this.notiMailFlag || this.notiPushFlag) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    isGif: isGif
                });

                return tplPostStream;
            },

            contentToEscape: function (content) {
                content = content.replace(/<br\>/gi, "\n");
                content = content.replace(/&nbsp;/gi, " ");
                return content;
            },

            moveToComment: function (e) {
                this.setSessionInfo(e);
                e.stopPropagation();
                var postId = this.getPostId(e),
                    url = 'board/' + this.boardId + '/post/' + postId + '/comments';

                if (this.isCommunity) url = 'community/' + this.owner.ownerId + '/' + url;
                App.router.navigate(url, true);
            },
            moveToRecommend: function (e) {
                e.stopPropagation();
                if (this.boardModel.get('anonymFlag')) {
                    return;
                }
                var postId = this.getPostId(e),
                    url = 'board/' + this.boardId + '/post/' + postId + '/recommends';

                if (this.isCommunity) url = 'community/' + this.owner.ownerId + '/' + url;
                App.router.navigate(url, true);
            }
        });

        return {
            render: function (opt) {
                var postStream = new PostStream({
                    el: '#content',
                    boardId: opt.boardId,
                    isCommunity: opt.isCommunity,
                    owner: opt.owner,
                    boardModel: opt.boardModel,
                    writable: opt.writable
                });
                return postStream.render();
            }
        };
    });