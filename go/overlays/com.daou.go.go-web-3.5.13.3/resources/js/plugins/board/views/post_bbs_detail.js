// 클래식형 게시판 글목록
;(function () {
    define([
            'jquery',
            'backbone',
            'app',
            'when',
            'board/models/post',
            'board/models/post_recommend',

            'board/collections/post_reader',
            'hgn!board/templates/post_bbs_detail',
            'hgn!board/templates/post_recommend_list',
            'hgn!board/templates/post_reader_list',
            'hgn!board/templates/post_auth_user_popup',
            'board/views/post_bbs_tiny',

            'board/views/post_attaches',
            "board/views/dept_list",
            'views/profile_card',
            "board/collections/header_list",

            "hgn!board/templates/header_select_list",
            'i18n!board/nls/board',
            'i18n!nls/commons',
            'board/models/board_config',
            'board/models/post_mail',
            'comment',

            'email_send_layer',
            "content_viewer",
            'lottie',

            'jquery.dataTables',
            'jquery.go-sdk',
            'jquery.ui',
            'jquery.go-popup',
            'GO.util',
            'go-fancybox'
        ],
        function (
            $,
            Backbone,
            App,
            When,
            PostModel,
            PostRecommendModel,
            PostReaderCollection,
            tplPostBbsDetail,
            tplPostRecommendList,
            tplPostReaderList,
            tplPostAuthUser,
            PostBbsTinyView,
            PostAttachesView,
            deptList,
            ProfileView,
            HeaderListCollection,
            TplHeaderList,
            boardLang,
            commonLang,
            BoardConfigModel,
            PostMailModel,
            CommentView,
            EmailSendLayer,
            ContentViewer,
            Lottie
        ) {
//		var instance = null,
//		var postBbsTables = null,
            var boardId = null,
                tplVar = {
                    'ok': commonLang['확인'],
                    'modify': commonLang['수정'],
                    'delete': commonLang['삭제'],
                    'list': commonLang['목록'],
                    'print': commonLang['인쇄'],
                    'copy': commonLang['복사'],
                    'move': commonLang['이동'],
                    'comment': commonLang['댓글'],
                    'count': commonLang['개'],
                    'user_count': commonLang['명'],
                    'plus_user': commonLang['좋아요 누른 사람'],
                    'post_write': boardLang['새글쓰기'],
                    'reomment_list_tab': boardLang['좋아요'],
                    'recommend': commonLang['좋아요 하기'],
                    'recommend_cancel': commonLang['좋아요 취소'],
                    'read_count': boardLang['조회'],
                    'post_reply': boardLang['답글쓰기'],
                    'board_urltoclip_ie': boardLang['게시글주소복사IE'],
                    'board_urltoclip_etc': boardLang['게시글주소복사ETC'],
                    'post_orphan_msg': boardLang['원글이 삭제된 답글'],
                    'post_delete_title': boardLang['게시글을 삭제 하시겠습니까?'],
                    'post_delete_desc': boardLang['삭제확인메세지'],
                    'post_move_title': boardLang['게시물 이동'],
                    'post_move_success': commonLang['성공했습니다.'],
                    'header_default': boardLang['말머리 선택'],
                    'post_move_desc': boardLang['게시물을 이동시킬 게시판을 선택하세요.'],
                    'post_move_header_desc': boardLang['말머리를 선택해주세요.'],
                    'post_move_reply_only': boardLang['답글은 원글과 함께 이동시킬 수 있습니다.'],
                    'post_move_orphan_desc': boardLang['원글이 삭제된 답글은 이동할 수 없습니다.'],
                    'send_mail': commonLang['메일발송'],
                    'copy_fail': commonLang['실패했습니다.'],
                    'post_copy_title': boardLang["게시물 복사"],
                    'post_copy_message': boardLang['* 원글 복사시, 답글도 함께 복사됩니다.'],
                    'post_copy_desc': boardLang['게시물을 복사할 게시판을 선택하세요.'],
                    'post_copy_success': commonLang['성공했습니다.'],
                    'post_copy_orphan_desc': boardLang['원글이 삭제된 답글은 복사할 수 없습니다.'],
                    'post_copy_reply_desc': boardLang['원글 이동 시, 답글도 함께 복사됩니다.'],
                    'post_copy_reply_only': boardLang['답글은 원글과 함께 복사시킬 수 있습니다.'],
                    'post_copy_same_board_alert': boardLang['동일한 게시판이 선택되었습니다.'],
                    'copy_url': commonLang['URL 복사'],
                    'read_auth': boardLang['열람 권한']
                };

            var Promise = function () {
                return When.promise.apply(this, arguments);
            };

            var PostBbsDetail = Backbone.View.extend({
                el: '#content #postContents',
                events: {
                    'click span.photo a[data-userid]': 'showProfileCard',
                    'click div.info a.name': 'triggerProfileCard',
                    'click span#heartbeat': 'actionPostRecommend',
                    'click a#listPostRecommend': 'showPostRecommend',
                    'click a#listPostReader': 'showPostReader',
                    'click section.tool_bar a.post_delete': 'actionPostDelete',
                    'click section.tool_bar a.post_move': 'actionPostMove',
                    'click section.tool_bar a.post_copy': 'actionPostCopy',
                    'click ul.tab_nav2 li.first': 'showPostReader',
                    'click ul.tab_nav2 li.last': 'showPostRecommend',
                    'click .btn_go_list': 'goToList',
                    'click .btn_go_print': 'print',
                    'click li a.preview': "preview",
                    'click section.tool_bar a.sendMailBtn': 'showSendMailLayer',
                    'click .btn_more': "onMoreBtnClicked",
                    'click #postAuthUserShowBtn': "onPostAuthUserShowBtnClicked"
                },
                print: function () {
                    var url = window.location.protocol + "//" + window.location.host + GO.contextRoot + "app/board/" + this.boardId + "/post/" + this.postId + "/popup";

                    window.open(url, '', 'location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
                },
                initialize: function (options) {
                    this.options = options || {};
                    var self = this;
                    this.deptId = this.options.owner.ownerId;
                    this.boardId = this.options.boardId;
                    this.postId = this.options.postId;
                    this.masterOwner = this.options.owner;
                    this.isCommunity = this.options.isCommunity || false;
                    this.commentFlag = this.options.commentFlag || false;
                    this.sendMailFlag = this.options.sendMailFlag || false;

                    this.writeUrl = this._getWriteUrl();
                    this.replyUrl = this._getReplyUrl();
                    this.editUrl = this._getEditUrl();


                    this.model = new PostModel(this.options);
                    this.model.setURL();
                    this.model.fetch({
                        async: false,
                        statusCode: {
                            403: function () {
                                GO.util.error('403', {"msgCode": "400-board"});
                            },
                            404: function () {
                                GO.util.error('404', {"msgCode": "400-board"});
                            },
                            500: function () {
                                GO.util.error('500');
                            }
                        }
                    });

                    if (this.boardId != this.model.toJSON().boardId) {
                        App.router.navigate('error/403', {trigger: true, pushState: false, replace: true});
                    }

                    this.boardModel = BoardConfigModel.get(this.boardId);
                    this.postMailModel = new PostMailModel({"boardId": this.boardId, "postId": this.postId});

                    this.recommendModel = new PostRecommendModel(this.options);
                    this.recommendModel.set('id', this.postId, {silent: true});
                    this.postReaderCollection = null;
                    this.model.on("change", function (model) {
                        if (model.hasChanged("id")) {
                            self.postId = model.id;
                            model.set({postId: self.postId}, {silent: true});
                            App.router.navigate(self._getDirectPostUrl(), {trigger: false});
                        }
                        self.render();
                    });
                },
                render: function () {
                    var listParams = App.router.getSearch(),
                        dataset = this.model.toJSON(),
                        boardActions = this.boardModel.get('actions'),
                        anonymFlag = this.boardModel.get('anonymFlag'),
                        isZero = function () {
                            if (this.dataset.recommendCount == 0) return true;
                            return false;
                        };


                    var tplDetail = tplPostBbsDetail({
                        dataset: dataset,
                        postTitle: function () {
                            return GO.util.textToHtml(this.dataset.title);
                        },
                        boardActions: boardActions,
                        boardId: this.boardId,
                        ownerId: this.masterOwner.ownerId,
                        isZero: isZero,
                        directUrl: this._getDirectPostUrl(),
                        writeUrl: this.writeUrl,
                        replyUrl: this.replyUrl,
                        editUrl: this.editUrl,
                        dateformat: function () {
                            return GO.util.basicDate(this.dataset.createdAt);
                        },
                        isActiveDept: this.boardModel.get("status") == "ACTIVE",
                        contextRoot: GO.contextRoot,
                        lang: tplVar,
                        boardLang: boardLang,
                        sendMailFlag: this.sendMailFlag,
                        isCommunity: this.isCommunity,
                        anonymFlag: anonymFlag,
                        hasAuthorizedUsers: dataset.authorizedUsers && dataset.authorizedUsers.length > 0 ? true : false
                    });
                    this.$el.html(tplDetail);

                    this.renderContentViewer();

                    if (dataset.attaches && dataset.attaches.length) {
                        PostAttachesView.render({
                            el: '#attaches' + dataset.id,
                            attaches: dataset.attaches,
                            postId: this.postId,
                            boardId: this.boardId
                        });
                        PostAttachesView.resize(this.$el);
                        $('.fancybox-thumbs').goFancybox();
                    }

                    this.commentRender();

                    // 페이지 네비게이션
                    PostBbsTinyView.render({
                        boardId: this.boardId,
                        postId: this.postId,
                        listParams: listParams,
                        masterOwner: this.masterOwner,
                        stickable: dataset.stickable
                    });

                    this.setHeartbeatAnimation(this.$el.find("#heartbeat"));
                },

                setHeartbeatAnimation: function ($heartbeat) {
                    var heartbeatAnimation = Lottie.loadAnimation({
                        container: $heartbeat[0],
                        renderer: 'svg',
                        loop: false,
                        autoplay: false,
                        path: window.location.protocol + "//" + window.location.host + GO.contextRoot
                            + "resources/js/vendors/lottie/heartbeat.json"
                    });

                    if ($heartbeat.hasClass('on')) {
                        heartbeatAnimation.play();
                    } else {
                        heartbeatAnimation.stop();
                    }

                    $heartbeat.on("click", function () {
                        if ($(this).hasClass('on')) {
                            heartbeatAnimation.stop();
                        } else {
                            heartbeatAnimation.play();
                        }
                    });
                },

                commentRender: function () {
                    this.commentView = CommentView.init({
                        el: this.$("#replyArea"),
                        typeUrl: "board/" + this.boardId + "/post",
                        typeId: this.postId,
                        isWritable: this.commentFlag,
                        anonymFlag: this.boardModel.get('anonymFlag'), //댓글에도 익명 게시판인지 여부를 알려주기 위해 사용됨
                        availableAnonymousWriterOptionInPostComment: this.boardModel.get('availableAnonymousWriterOptionInPostComment')
                    });
                    this.commentView.render().fetchComments(true);
                    var self = this;
                    this.commentView.$el.on("comment:change", function (e, type, count) {
                        self.$('#comment_num').text("[" + count + "]");
                        $("#commentCount").html(count);
                    });
                },

                popupCommentRender: function () {
                    this.commentView = CommentView.init({
                        el: this.$("#replyArea"),
                        typeUrl: "board/" + this.boardId + "/post",
                        typeId: this.postId,
                        isWritable: false,
                        popupPrint: true
                    });
                    this.commentView.fetchComments(true);
                    var self = this;
                },

                popupRender: function () {
                    var dataset = this.model.toJSON(),
                        isZero = function () {
                            if (this.dataset.recommendCount == 0) return true;
                            return false;
                        };

                    var tplDetail = tplPostBbsDetail({
                        dataset: dataset,
                        postTitle: function () {
                            return GO.util.textToHtml(this.dataset.title); //인쇄버튼
                        },
                        boardId: this.boardId,
                        ownerId: this.masterOwner.ownerId,
                        isZero: isZero,
                        directUrl: this._getDirectPostUrl(),
                        writeUrl: this.writeUrl,
                        replyUrl: this.replyUrl,
                        editUrl: this.editUrl,
                        dateformat: function () {
                            return GO.util.basicDate(this.dataset.createdAt);
                        },
                        isActiveDept: this.boardModel.get("status") == "ACTIVE",
                        contextRoot: GO.contextRoot,
                        lang: tplVar,
                        sendMailFlag: this.sendMailFlag,
                        isCommunity: this.isCommunity,
                        isPopup: true
                    });

                    this.$el.html(tplDetail);

                    this.$('#boardContent').html(this.model.get("content"));

                    //this.renderContentViewer();

                    if (dataset.attaches && dataset.attaches.length) {
                        PostAttachesView.render({
                            el: '#attaches' + dataset.id,
                            attaches: dataset.attaches,
                            postId: this.postId,
                            boardId: this.boardId
                        });
                        PostAttachesView.resize(this.$el);

                        $('.fancybox-thumbs').fancybox({
                            type: 'image',
                            padding: 5,
                            openEffect: 'elastic',
                            openSpeed: 150,
                            closeEffect: 'elastic',
                            closeSpeed: 150,
                            closeBtn: false,
                            helpers: {
                                title: {
                                    type: 'outside'
                                },
                                buttons: {
                                    tpl: '<div id="fancybox-buttons" class="top">' +
                                        '<ul>' +
                                        '<li><a class="btnPrev" title="Previous" href="javascript:;"></a></li>' +
                                        '<li><a class="btnPlay" title="Start slideshow" href="javascript:;"></a></li>' +
                                        '<li><a class="btnNext" title="Next" href="javascript:;"></a></li>' +
                                        '<li><a class="btnToggle btnDisabled" title="Toggle size" href="javascript:;"></a></li>' +
                                        '<li><a class="btnSave linkedImage" title="Save" data-bypass>Save</a></li>' +
                                        '<li><a class="btnClose" title="Close" href="javascript:jQuery.fancybox.close();"></a></li>' +
                                        '</ul>' +
                                        '</div>'
                                },
                                thumbs: {
                                    width: 75,
                                    height: 50
                                }
                            },
                            beforeShow: function () {
                                this.title = (this.title ? '' + this.title + '' : '') + '<span style="float:right">' + (this.index + 1) + ' / ' + this.group.length + '</span>';
                            }
                        });
                        $('#fancybox-buttons a.btnSave').die('click');
                        $('#fancybox-buttons a.btnSave').live('click', function () {
                            GO.util.fancyBoxImageDownLoad();
                        });
                    }
                    this.popupCommentRender();
                    return this.$el;
                },

                renderContentViewer: function () {
                    var content = GO.util.convertMSWordTag(this.model.get("content"));
                    if (this.model.get("contentType") == 'TEXT') content = GO.util.convertRichText(content);
                    this.contentViewer = ContentViewer.init({
                        $el: this.$("#boardContent"),
                        content: content,
                        css: ["resources/css/doc_editor.css"]
                    });
                },

                preview: function (e) {
                    var currentEl = $(e.currentTarget);
                    GO.util.preview(currentEl.attr("data-id"));

                    return false;
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
                    var url = GO.contextRoot;
                    if (this.isCommunity) {
                        url += 'app/community/' + this.masterOwner.ownerId + '/board/' + this.boardId + '/post/' + this.postId + '/write';
                    } else {
                        url += 'app/board/post/write/' + this.masterOwner.ownerId + '/' + this.boardId + '/' + this.postId;
                    }
                    return url;
                },
                _getEditUrl: function () {
                    var url = GO.contextRoot;
                    if (this.isCommunity) {
                        url += 'app/community/post/put/';
                    } else {
                        url += 'app/board/post/put/';
                    }
                    return url + this.masterOwner.ownerId + '/' + this.boardId + '/' + this.postId;
                },
                _getWriteUrl: function () {
                    var url = GO.contextRoot;
                    if (this.isCommunity) {
                        url += 'app/community/' + this.masterOwner.ownerId + '/board/' + this.boardId + '/post/write';
                    } else {
                        url += 'app/board/post/write/' + this.masterOwner.ownerId + '/' + this.boardId;
                    }
                    return url;
                },
                isFullSearch: function () {
                    var search = GO.router.getSearch();
                    return !_.isEmpty(search) && !_.has(search, "page");
                },

                goToList: function () {
                    var searchObject = GO.router.getSearch(),
                        param = "",
                        url = "",
                        page = searchObject.page,
                        offset = searchObject.offset,
                        sorts = searchObject.sorts;

                    if (_.has(searchObject, "keyword")) {
                        var keyword = searchObject.keyword;
                        delete searchObject["keyword"];
                        var searchParam = "keyword=" + encodeURIComponent(keyword) + "&" + $.param(searchObject);
                        param = searchParam ? "?" + searchParam : "";
                    } else {
                        var defaultParam = "page=" + page + "&offset=" + offset + "&sorts=" + encodeURIComponent(sorts);
                        param = defaultParam ? "?" + defaultParam : "";
                    }

                    if (this.isCommunity) {
                        url = "community/" + this.masterOwner.ownerId + "/board/" + this.boardId;
                    } else {

                        url = "board/" + this.boardId;
                    }

                    App.router.navigate(url, true);
                },

                showProfileCard: function (e) {
                    var userId = $(e.currentTarget).attr('data-userid');
                    if (userId != "") {
                        ProfileView.render(userId, e.currentTarget);
                    }
                },
                triggerProfileCard: function (e) {
                    var targetEl = $(e.currentTarget).parents('.article_wrap').find('.photo a');
                    ProfileView.render(targetEl.attr('data-userid'), targetEl);
                },
                actionPostDelete: function () {
                    var self = this;
                    $.goCaution(tplVar['post_delete_title'], tplVar['post_delete_desc'], function () {
                        self.model.destroy({
                            success: function (model, response) {
                                GO.EventEmitter.trigger('board', 'change:boardInfo', false);
                                GO.EventEmitter.trigger('boardTree', 'changed:nodes');
                                App.router.navigate((self.isCommunity ? "community/" + self.masterOwner.ownerId + '/' : "") + "board/" + self.boardId, {
                                    trigger: true,
                                    replace: true
                                });
                            },
                            error : function(model, response) {
                                if (response.responseJSON && response.responseJSON.message) {
                                    $.goAlert(response.responseJSON.message);
                                }
                            }
                        });
                    });
                },
                actionPostCopy: function () {
                    var self = this,
                        popupEl = null,
                        checkedIds = [],

                        moveCallback = function (popupEl) {
                            var validate = true;
                            var boards = [];
                            var targetBoardEl = popupEl.find("#boardCopyTable tr");
                            $.each(targetBoardEl, function (k, v) {
                                var boardOpt = {};
                                var boardSelect = $(v).find('.select_board option:selected');
                                var headerSelect = $(v).find('.copy_header_list option:selected');
                                if (!boardSelect.val()) {
                                    $.goError(tplVar['post_copy_desc']);
                                    validate = false;
                                    return false;
                                }
                                if (boardSelect.attr('data-headerFlag') == 'true' && boardSelect.attr('data-headerRequiredflag') == 'true' && headerSelect.val() == 0) {
                                    $.goError(tplVar['post_move_header_desc']);
                                    validate = false;
                                    return false;
                                }
                                //추가한 게시판중 같은 게시판이 있는지 검사
                                var result = $.grep(boards, function (e) {
                                    return e.id == boardSelect.val();
                                });
                                if (result.length > 0) {
                                    $.goSlideMessage(tplVar['post_copy_same_board_alert'], 'caution');
                                    validate = false;
                                    return false;
                                }

                                boardOpt.id = boardSelect.val();
                                boardOpt.headerId = (headerSelect.length) ? headerSelect.val() : '';
                                boards.push(boardOpt);
                            });

                            if (!validate) {
                                return;
                            }

                            $.goPopup.close();
                            GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
                            var url = [GO.contextRoot + 'api/board', self.boardId, 'post/copy'];

                            $.ajax({
                                type: 'POST',
                                async: true,
                                data: JSON.stringify({'postIds': checkedIds, 'boards': boards}),
                                dataType: 'json',
                                contentType: "application/json",
                                url: url.join('/')
                            }).done(function (response) {
                                $.goSlideMessage(tplVar['post_copy_success']);
                                GO.EventEmitter.trigger('board', 'change:boardInfo', false);
                                GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
                                GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            }).fail(function (error) {
                                $.goSlideMessage(tplVar['copy_fail'], 'caution');
                                GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            });

                        };

                    checkedIds.push(this.postId);

                    var moveMsg = [tplVar['post_copy_desc']];

                    if (this.model.toJSON().id != this.model.toJSON().root) {
                        $.goAlert(tplVar['post_copy_title'], tplVar['post_copy_reply_only']);
                        return;
                    }

                    if (this.model.toJSON().orphanFlag) {
                        $.goAlert(tplVar['post_copy_title'], tplVar['post_copy_orphan_desc']);
                        return;
                    }

                    var moveWarningMsg = [];
                    moveWarningMsg.push('<span class="desc">');
                    moveWarningMsg.push('<br>' + boardLang['열람권한 복사 문구']);
                    moveWarningMsg.push('</span>');
                    moveWarningMsg.push('<br><br><div id="deptList"></div>');

                    popupEl = $.goPopup({
                        pclass: 'layer_normal layer_absence',
                        width: 700,
                        header: tplVar['post_copy_title'],
                        title: moveMsg.join(''),
                        modal: true,
                        contents: moveWarningMsg.join(''),
                        buttons: [{
                            btype: 'confirm',
                            btext: tplVar['copy'],
                            autoclose: false,
                            callback: moveCallback
                        }]
                    });

                    //부서 & 게시판목록 render
                    deptList.render({
                        id: ".go_popup #deptList",  		//target ID
                        boardList: true,  		// 부서 셀렉트 박스 사용여부 (true/false)
                        deptId: this.deptId,		//부서 ID
                        boardId: this.boardId,
                        isCommunity: this.isCommunity,
                        boardType: 'classic',
                        postId: '',
                        isCopy: true
                    });

                    this.attachHeaderSelectCopy($('#boardCopyTable select.select_board'));
                    popupEl.reoffset();

                    $('#boardCopyTable select.select_board').die();
                    $('#boardCopyTable select.select_board').live('change', function (e) {
                        self.changeBoardListCopy(e);
                    });

                },
                actionPostMove: function () {
                    var self = this,
                        popupEl = null,
                        checkedIds = [],

                        moveCallback = function (popupEl) {

                            var targetBoardEl = popupEl.find('#select_board'),
                                targetBoardSelectedEl = targetBoardEl.find('option:selected'),
                                targetBoardId = targetBoardEl.val(),
                                targetBoardName = targetBoardEl.find('option:selected').text(),
                                url = [GO.contextRoot + 'api/board', self.boardId, 'post/move', targetBoardId];

                            var targetHeaderEl = popupEl.find('#move_header_list');
                            var targetHedderId = targetHeaderEl.val();
                            if (targetHedderId != '0') {
                                url.push(targetHedderId);
                            }

                            if (targetBoardSelectedEl.attr('data-headerFlag') == 'true' && targetBoardSelectedEl.attr('data-headerRequiredflag') == 'true' && targetHedderId == 0) {
                                $.goError(tplVar['post_move_header_desc']);
                                return false;
                            }

                            if (!targetBoardId) {
                                $.goError(tplVar['post_move_desc']);
                                return false;
                            }

                            $.goPopup.close();
                            GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
                            $.go(url.join('/'), JSON.stringify({'ids': checkedIds}), {
                                qryType: 'PUT',
                                contentType: 'application/json',
                                responseFn: function () {
                                    $.goMessage(targetBoardName + tplVar['post_move_success']);
                                    GO.EventEmitter.trigger('board', 'change:boardInfo', false);
                                    GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
                                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                                    if (self.isCommunity) {
                                        App.router.navigate('community/' + self.masterOwner.ownerId + '/board/' + self.boardId, {
                                            trigger: true,
                                            replace: true
                                        });
                                    } else {
                                        App.router.navigate('board/' + self.boardId, {trigger: true, replace: true});
                                    }
                                },
                                error: function(resp) {
                                    $.goAlert(resp.responseJSON.message);
                                }
                            });
                        };

                    checkedIds.push(this.postId);

                    var moveMsg = [tplVar['post_move_desc']];

                    if (this.model.toJSON().id != this.model.toJSON().root) {
                        $.goAlert(tplVar['post_move_title'], tplVar['post_move_reply_only']);
                        return;
                    }

                    if (this.model.toJSON().orphanFlag) {
                        $.goAlert(tplVar['post_move_title'], tplVar['post_move_orphan_desc']);
                        return;
                    }


                    popupEl = $.goPopup({
                        pclass: 'layer_normal layer_item_move',
                        width: 300,
                        header: tplVar['post_move_title'],
                        title: moveMsg.join(''),
                        modal: true,
                        contents: '<br /><div id="deptList"></div>',
                        buttons: [{
                            btype: 'confirm',
                            btext: tplVar['move'],
                            autoclose: false,
                            callback: moveCallback
                        }]
                    });

                    //부서 & 게시판목록 render
                    deptList.render({
                        id: ".go_popup #deptList",  		//target ID
                        boardList: true,  		// 부서 셀렉트 박스 사용여부 (true/false)
                        deptId: this.deptId,		//부서 ID
                        boardId: this.boardId,
                        isCommunity: this.isCommunity,
                        boardType: 'classic',
                        postId: '',
                        isMove: true
                    });

                    //this.attachHeaderSelect(this.boardId);
                    popupEl.reoffset();

                    $('#deptList select#select_board').die();
                    $('#deptList select#select_board').live('change', function () {
                        self.changeBoardList();
                    });
                },
                attachHeaderSelectCopy: function (target) {
                    if (target.val()) {
                        var col = [];
                        if (target.find("option:selected").attr('data-headerflag') == "true") {
                            col = HeaderListCollection.getHeaderList({boardId: target.val()}).toJSON();
                        }
                        if (col.length > 0) {
                            var tplHeaderList = TplHeaderList({
                                dataset: col,
                                defaultSelect: tplVar.header_default,
                                selectClass: 'wfix_medi copy_header_list'
                            });
                            $("#headerSelectPart").show();
                            target.parents('tr').first().find('.board_header_wrap').html(tplHeaderList);
                        } else {
                            $("#headerSelectPart").hide();
                            target.parents('tr').first().find('.board_header_wrap').html('');
                        }
                    } else {
                        $("#headerSelectPart").hide();
                    }
                },
                attachHeaderSelect: function (boardId, headerflag) {
                    var col = [];
                    if (headerflag == "true") {
                        col = HeaderListCollection.getHeaderList({boardId: boardId}).toJSON();
                    }
                    if (col.length > 0) {
                        var tplHeaderList = TplHeaderList({
                            dataset: col,
                            defaultSelect: tplVar.header_default,
                            selectId: 'move_header_list'
                        });

                        $('#header_dt').show();
                        $('.go_popup #deptList #board_header_wrap').html(tplHeaderList);
                    } else {
                        $('#header_dt').hide();
                        $('.go_popup #deptList #board_header_wrap').html('');
                    }
                },

                changeBoardList: function () {
                    var select = $("#select_board option:selected");
                    this.attachHeaderSelect(select.val(), select.attr('data-headerflag'));
                },

                changeBoardListCopy: function (e) {
                    /*var target = $(e.currentTarget).parents('tr').first();
                    var select = target.find(".select_board option:selected");*/
                    var target = $(e.currentTarget);
                    this.attachHeaderSelectCopy(target);
                },

                actionPostRecommend: function (e) {
                    var self = this,
                        options = {
                            'success': function (model, rs) {
                                if (rs.code == 200) {
                                    var countEl = self.$el.find('#listPostRecommend'),
                                        recommendCount = rs.data.recommendCount || 0;

                                    countEl.html(recommendCount);

                                    if (options.type == 'DELETE') {
                                        $(e.currentTarget).removeClass('on').attr('title', tplVar['recommend']);
                                        $(e.currentTarget).find("span.txt").html(recommendCount);
                                    } else {
                                        $(e.currentTarget).addClass('on').attr('title', tplVar['recommend_cancel']);
                                        $(e.currentTarget).find("span.txt").html(recommendCount);
                                    }

                                    self.model.set('recommend', !self.model.get('recommend'), {silent: true});
                                } else {
                                    $.goMessage(rs.message);
                                }
                            }
                        };

                    options.type = this.model.get("recommend") ? "DELETE" : "POST";

                    this.recommendModel.save({}, options);
                },

                isCurrentLayer: function (e) {
                    return $(e.currentTarget).hasClass("on");
                },

                showPostRecommend: function (e) {
                    if (this.isCurrentLayer(e)) return;

                    var tplPopupHeader = ['<ul class="tab_nav tab_nav2"><li class="first"><span>', tplVar['read_count'],
                        '</span></li><li class="last on"><span>', tplVar['reomment_list_tab'], '</span></li></ul>'];

                    var popup = $.goPopup({
                        pclass: 'layer_normal layer_reader',
                        headerHtml: tplPopupHeader.join(''),
                        contents: tplPostRecommendList(),
                        buttons: [{
                            btype: 'confirm',
                            btext: tplVar['ok']
                        }]
                    });

                    this.postPopupTabs(popup);

                    $.goGrid({
                        el: '#recommendList',
                        url: GO.contextRoot + 'api/board/' + this.boardId + '/post/' + this.postId + '/recommend',
                        displayLength: 10,
                        displayLengthSelect: false,
                        emptyMessage: boardLang['좋아요 목록이 없습니다.'],
                        method: 'GET',
                        defaultSorting: [],
                        sDom: 'rt<"tool_bar"<"critical custom_bottom">p>',
                        bProcessing: false,
                        columns: [{
                            "mData": null,
                            "sWidth": "150px",
                            "bSortable": false,
                            "sClass": "align_l",
                            "fnRender": function (obj) {
                                var data = obj.aData;
                                var displayName = [data.recommender.name, ' ', data.recommender.positionName].join('');
                                if (data.recommender.otherCompanyUser) {
                                    displayName = '<span class="multi_user">' + displayName + '</span>';
                                }
                                returnArr = [displayName, '&nbsp;<span class="date">', GO.util.basicDate(data.updatedAt), '</span>'];
                                return returnArr.join('');
                            }
                        }],
                        fnDrawCallback: function (tables, oSettings, listParams) {
                            var toolBar = popup.find('.tool_bar');
                            if (oSettings._iRecordsTotal < oSettings._iDisplayLength) {
                                $(this.el).find('tr:last-child>td').css('border-bottom', 0);
                                toolBar.hide();
                            } else {
                                toolBar.show();
                                toolBar.find('div.dataTables_paginate').css('margin-top', 0);
                            }

                            //self.$el.find('#listPostRecommend span.num').html(oSettings._iRecordsTotal);
                            popup.find('.dataTables_wrapper').css('margin-bottom', 0);
                            popup.reoffset();
                        }
                    });
                },
                postPopupTabs: function (popup) {
                    var self = this;
                    popup.on('click', 'ul.tab_nav2 li', function (e) {
                        if ($(e.currentTarget).hasClass('first')) {
                            self.showPostReader(e);
                        } else {
                            self.showPostRecommend(e);
                        }
                    });
                },
                showPostReader: function (e) {
                    if (this.isCurrentLayer(e)) return;

                    var popup = null,
                        tplPopupHeader = ['<ul class="tab_nav tab_nav2"><li class="first on"><span>', tplVar['read_count'],
                            '</span></li><li class="last"><span>', tplVar['reomment_list_tab'], '</span></li></ul>'];

                    popup = $.goPopup({
                        pclass: 'layer_normal layer_reader',
                        headerHtml: tplPopupHeader.join(''),
                        contents: tplPostReaderList(),
                        buttons: [{
                            btype: 'confirm',
                            btext: tplVar['ok']
                        }]
                    });

                    this.postPopupTabs(popup);

                    $.goGrid({
                        el: '#readerList',
                        url: GO.contextRoot + 'api/board/' + this.boardId + '/post/' + this.postId + '/reader',
                        displayLength: 10,
                        displayLengthSelect: false,
                        emptyMessage: '',
                        method: 'GET',
                        defaultSorting: [],
                        sDom: 'rt<"tool_bar"<"critical custom_bottom">p>',
                        bProcessing: false,
                        columns: [{
                            "mData": null, "bSortable": false, "sClass": "align_l", "fnRender": function (obj) {
                                var data = obj.aData;
                                var displayName = [data.reader.name, ' ', data.reader.positionName].join('');
                                if (data.reader.otherCompanyUser) {
                                    displayName = '<span class="multi_user">' + displayName + '</span>';
                                }
                                returnArr = [displayName, '&nbsp;<span class="date">', GO.util.basicDate(data.updatedAt), '</span>'];
                                return returnArr.join('');
                            }
                        }, {
                            "mData": null,
                            "sWidth": "80px",
                            "sClass": "align_l",
                            "bSortable": false,
                            "fnRender": function (obj) {
                                var data = obj.aData;
                                return ['<span class="plus_num">', tplVar['read_count'], data.point, '</span>&nbsp;'].join('');
                            }
                        }],
                        fnDrawCallback: function (tables, oSettings, listParams) {
                            var toolBar = popup.find('.tool_bar');
                            if (oSettings._iRecordsTotal < oSettings._iDisplayLength) {
                                $(this.el).find('tr:last-child>td').css('border-bottom', 0);
                                toolBar.hide();
                            } else {
                                toolBar.show();
                                toolBar.find('div.dataTables_paginate').css('margin-top', 0);
                            }
                            popup.find('.dataTables_wrapper').css('margin-bottom', 0);
                            popup.reoffset();
                        }
                    });
                },
                showSendMailLayer: function () {

                    // popup mail writing window
                    this.asyncFetch(this.postMailModel)
                        .then(_.bind(function () {

                            var data = this.postMailModel.toJSON();

                            var content = data.body;
                            var attlists = _.map(data.attachList, function (attachFile) {
                                var attachString = attachFile.path + ":"
                                    + attachFile.name + ":"
                                    + attachFile.size + ":"
                                    + attachFile.id + "\n";
                                return attachString;
                            });

                            this.openEmailPopup(content, attlists);

                        }, this))
                        .otherwise(function printError(err) {
                            console.log(err.stack);
                        })
                },

                onMoreBtnClicked: function (e) {
                    $(e.currentTarget).find('.array_option').toggle();

                    if (this.model.get('authorizedUsers').length > 0) {
                        this.$el.find('#postAuthUserShowBtn').show();
                    } else {
                        this.$el.find('#postAuthUserShowBtn').hide();
                    }
                },
                onPostAuthUserShowBtnClicked: function () {
                    $.goPopup({
                        width: '320',
                        modal: true,
                        header: boardLang['열람 권한'],
                        pclass: 'layer_normal layer_read_authority',
                        contents: tplPostAuthUser({authorizedUsers: this.model.get('authorizedUsers')}),
                        buttons: [{
                            btext: commonLang["확인"],
                            btype: "confirm",
                            autoclose: true
                        }]
                    });
                },

                openEmailPopup: function (content, attlists) {

                    var windowName = Math.floor(Math.random() * 10000);
                    var windowFeatures = "scrollbars=yes,resizable=yes,width=1280,height=760";

                    window.open("", windowName, windowFeatures);

                    var form = document.createElement("form");
                    var hiddenData = document.createElement("input");
                    hiddenData.type = "hidden";
                    hiddenData.name = "data";

                    var param = {};
                    param.content = content;

                    var attachFiles = [];
                    _.each(attlists, function (attr) {
                        attachFiles.push(attr);
                    });
                    param.attachFiles = attachFiles;
                    hiddenData.value = JSON.stringify(param);

                    form.appendChild(hiddenData);

                    form.action = GO.contextRoot + "app/mail/popup/process";
                    form.method = "post";
                    form.target = windowName;

                    // IE 환경에서 Popup으로 Form submit을 못하는 현상 처리
                    document.body.appendChild(form);
                    form.submit();
                    document.body.removeChild(form);
                },

                asyncFetch: function (model) {
                    return new Promise(function (resolve, reject, notify) {
                        model.fetch({
                            success: resolve,
                            error: reject,
                            statusCode: {
                                400: function () {
                                    $.goError(commonLang['500 오류페이지 내용']);
                                },
                                403: function () {
                                    $.goError(commonLang['권한이 없습니다.']);
                                },
                                404: function () {
                                    $.goError(GO.i18n(commonLang["{{resource}}이(가) 존재하지 않습니다."], {"resource": '게시글'}));
                                },
                                500: function () {
                                    $.goError(commonLang['500 오류페이지 내용']);
                                }
                            }
                        });
                    });
                }
            });

            return {
                render: function (opt) {
                    var postBbsDetail = new PostBbsDetail(opt);
                    return postBbsDetail.render();
                },
                popupRender: function (opt) {
                    var postBbsDetail = new PostBbsDetail(opt);
                    return postBbsDetail.popupRender();
                }
            };
        });
}).call(this);
