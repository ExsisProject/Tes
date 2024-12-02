;(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "i18n!nls/commons",
            "i18n!board/nls/board",

            "hgn!board/templates/post_write",
            "hgn!board/templates/post_write_auth_user",
            "hgn!board/templates/post_attaches_file",
            "hgn!board/templates/post_attaches_img",
            "hgn!board/templates/post_link",
            "hgn!board/templates/header_select_list",

            "board/views/tmp_list",
            "board/views/board_title",
            "board/views/notice_layer",
            "board/views/dept_list",
            "board/collections/clipboard",

            "board/models/post",
            "board/models/board_config",
            "board/collections/header_list",
            "file_upload",
            "jquery.go-popup",
            "jquery.ui",
            "json",
            "json2",
            "jquery.go-validation",
            "jquery.placeholder",
            "jquery.progressbar",
            "jquery.go-orgslide",

            "go-webeditor/jquery.go-webeditor",
        ],

        function (
            $,
            Backbone,
            App,
            commonLang,
            boardLang,

            layoutTpl,
            PostWriteAuthUserTpl,
            attachesFileTpl,
            attachesImgTpl,
            TplPostLink,
            TplHeaderList,

            tempList,
            BoardTitleView,
            noticeLayer,
            deptList,
            tmpList,

            PostModel,
            BoardConfigModel,
            HeaderListCollection,
            FileUpload
        ) {
            var instance = null;
            var lang = {
                'post_write': boardLang['글쓰기'],
                'detail_search': commonLang['상세검색'],
                'notice': boardLang['공지'],
                'notice_term': boardLang['공지 기간 설정'],
                'notice_clear': boardLang['공지 해제'],
                'notice_register': boardLang['공지로 등록'],
                'img_attach': commonLang['이미지 첨부'],
                'file_attach': commonLang['파일 첨부'],
                'link_add': boardLang['링크 추가'],
                'vote': boardLang['투표'],
                'search': boardLang['검색'],
                'title': commonLang['제목'],
                'tmp_posts': boardLang['임시 저장된 글'],
                'public_setting': boardLang['공개 설정'],
                'public': commonLang['공개'],
                'private': commonLang['비공개'],
                'public_setting_msg': boardLang['※ 나와 운영자만 볼 수 있도록 비공개로 글을 등록합니다.'],
                'save_post': boardLang['등록'],
                'tmp_post': boardLang['임시저장'],
                'share': boardLang['새로운 정보, 기분 좋은 소식을 동료들과 공유하세요.'],
                'link_input': boardLang['링크입력'],
                'post_stream': boardLang['이야기 하기'],
                'del': commonLang['삭제'],
                'confirm': commonLang['확인'],
                'cancel': commonLang['취소'],
                'tmpSave_success': boardLang['임시저장 했습니다.'],
                'no_subject': commonLang['제목없음'],
                'no_content': boardLang['입력된 내용이 없습니다.'],
                'alert_max_attach_cnt': boardLang['최대 첨부 갯수는 0개 입니다.'],
                'alert_max_attach_size': boardLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'],
                'alert_exclude_extension': boardLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'],
                'no_title': boardLang['제목이 없습니다.'],
                'no_header': boardLang['말머리를 선택해주세요.'],
                'alert_content': boardLang['입력된 내용이 없습니다.'],
                'alert_length': boardLang['0자이상 0이하 입력해야합니다.'],
                'alert_init_writeform': boardLang['입력하신 정보가 초기화됩니다.'],
                'input_placeholder': boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.'],
                'board_type_change': boardLang['게시판 타입이 변경되면 ,기존에 입력했던 내용은 모두 삭제됩니다.'],
                'alert_date_format': boardLang['날짜 형식이 맞지 않습니다.'],
                'alert_fail': commonLang['실패했습니다.'],
                'header_default': boardLang['말머리 선택'],
                'link_meta_delete': boardLang['메타 데이터 삭제'],
                'link_meta_title': boardLang['링크 메타정보 타이틀'],
                'link_meta_img': boardLang['메타정보 이미지'],
                'link_content_delete': boardLang['내용 삭제'],
                'link_img_delete': boardLang['이미지 삭제'],
                'alim': commonLang['알림'],
                'alim_mail': commonLang['메일알림'],
                'alim_push': commonLang['푸시알림'],
                'alim_tooltip': commonLang['해당 게시판에 접근 가능한 임직원에게만 알림이 발송됩니다.'],
                'alim_alert': commonLang['관리자 설정으로 하나의 알림은 반드시 선택되어야 합니다.'],
                'no_selected_board': boardLang['게시판을 선택해 주세요.'],
                'mail_push_desc': boardLang['메일알림안내'],
                'notice_top_register': boardLang['최상단에 등록'],
                'notice_top_register_msg': boardLang['※ 공지글이 등록되면 게시판의 최상단에 등록됩니다.'],
                '이 곳에 파일을 드래그 하세요': commonLang['이 곳에 파일을 드래그 하세요'],
                '이 곳에 파일을 드래그 하세요 또는': commonLang['이 곳에 파일을 드래그 하세요 또는'],
                '파일선택': commonLang['파일선택'],
                'public_writer_setting': boardLang['작성자 공개 설정'],
                'public_writer' :boardLang['작성자 공개']
            };

            var PostWrite = Backbone.View.extend({
                el: '#content',
                events : {
                    "click #btn-add-authUsers" : "showOrgSlider",
                    "click .authorizedUser .ic_del" : "onRemoveAuthUserBtnClicked",
                    "click #removeAllAuthUser" : "onRemoveAllAuthUserBtnClicked",

                    'dragover #dropZone': '_dragOver',
                    'dragleave #dropZone': '_dragLeave',
                    'drop #dropZone': '_drop',
                },

                unbindEvent: function () {
                    this.$el.off('keyup', '#feedContent');
                    this.$el.off('click', 'input[id=write_noti]');
                    this.$el.off('click', '.editor .btn_temp_list');
                    this.$el.off('click', 'span.btn_major[data-btntype="saveBbs"]');
                    this.$el.off('click', 'span.btn_minor[data-btntype="tmpSave"]');
                    this.$el.off('click', 'span.ic_del');
                    this.$el.off('change', 'select#select_board');
                    this.$el.off('change', 'select#dept_select');
                    this.$el.off('click', 'span.ic_link_up');
                    this.$el.off('click', 'div#classicLinkWrap span.txt');
                    this.$el.off('click', 'input[id=link_img_delete]');
                    this.$el.off('click', 'input[id=link_description_delete]');
                    this.$el.off('click', 'li.url span.ic_del');
                    this.$el.off('click', 'span[id=feedWrite]');
                    this.$el.off('click', 'input[id=post_stream_mail_noti]');
                    this.$el.off('click', 'input[id=post_stream_push_noti]');
                    this.$el.off('click', 'input[id=post_classic_mail_noti]');
                    this.$el.off('click', 'input[id=post_classic_push_noti]');
                    this.$el.off('keyup', '#feedContent');
                    this.$el.off('keyup', '#subject');
                    this.$el.off('change', '#header_list');
                    this.$el.off('click', 'input[name=writeSecret]');
                },

                bindEvent: function () {
                    this.$el.on('keyup', '#feedContent', $.proxy(this.streamKeyCheck, this));
                    this.$el.on('click', 'input[id=write_noti]', $.proxy(this.notiCheck, this));
                    this.$el.on('click', '.editor .btn_temp_list', $.proxy(this.tempList, this));
                    this.$el.on('click', 'span.btn_major[data-btntype="saveBbs"]', $.proxy(this.saveBbs, this));
                    this.$el.on('click', 'span.btn_minor[data-btntype="tmpSave"]', $.proxy(this.tmpSave, this));
                    this.$el.on('click', 'span.ic_del', $.proxy(this.attachDelete, this));
                    this.$el.on('change', 'select#select_board', $.proxy(this.setWriteForm, this));
                    this.$el.on('change', 'select#dept_select', $.proxy(this.setWriteForm, this));
                    this.$el.on('click', 'span.ic_link_up', $.proxy(this.linkShow, this));
                    this.$el.on('click', 'div#classicLinkWrap span.txt', $.proxy(this.linkInsert, this));
                    this.$el.on('click', 'input[id=link_img_delete]', $.proxy(this.linkImageDelete, this));
                    this.$el.on('click', 'input[id=link_description_delete]', $.proxy(this.linkDescriptionDelete, this));
                    this.$el.on('click', 'li.url span.ic_del', $.proxy(this.linkDelete, this));
                    this.$el.on('click', 'span[id=feedWrite]', $.proxy(this.feedWrite, this));
                    this.$el.on('click', 'input[id=post_stream_mail_noti]', $.proxy(this.streamWriteNoti, this));
                    this.$el.on('click', 'input[id=post_stream_push_noti]', $.proxy(this.streamWriteNoti, this));
                    this.$el.on('click', 'input[id=post_classic_mail_noti]', $.proxy(this.streamWriteNoti, this));
                    this.$el.on('click', 'input[id=post_classic_push_noti]', $.proxy(this.streamWriteNoti, this));
                    this.$el.on('keyup', '#feedContent', $.proxy(this.expandTextarea, this));
                    this.$el.on("keyup", "#subject", $.proxy(this.subjectKeyup, this));
                    this.$el.on("change", "#header_list", $.proxy(this.headerListChange, this));
                    this.$el.on('click', 'input[name=writeSecret]', $.proxy(this.writeSecret, this));
                },

                render: function (opt) {
                    this.unbindEvent();

                    opt = opt ? opt : {};
                    opt.id = "#deptList"; //target ID
                    opt.boardList = true; // 부서 셀렉트 박스 사용여부 (true/false)
                    opt.isCommunity = opt.communityId ? true : false;

                    this.isCommunity = opt.isCommunity;
                    this.communityId = opt.communityId || '';
                    this.deptId = opt.deptId || '';
                    this.boardId = opt.boardId || '';
                    this.postId = opt.postId || '';
                    this.boardType = '';
                    this.type = opt.type || '';
                    this.postAuthorizedUsers = [];
                    this.isSaaS = GO.session().brandName == "DO_SAAS";
                    this.totalAttachSize = 0;
                    this.totalAttachCount = 0;
                    this.boardModel = {};

                    var isAttachNumberToolTip = this.isSaaS || (GO.config('attachNumberLimit'));
                    if (isAttachNumberToolTip) {
                        var maxAttachSize = (GO.config('attachSizeLimit')) ?
                            parseInt(GO.config('maxAttachSize')) : parseInt(GO.config('commonAttachConfig').maxAttachSize);
                        var maxAttachNumber = (GO.config('attachNumberLimit')) ?
                            parseInt(GO.config('maxAttachNumber')) : parseInt(GO.config('commonAttachConfig').maxAttachNumber);
                        var m = {
                            '첨부파일 1개의 최대 용량은 NNN MB 이며 최대 N개 까지 등록 가능합니다':
                                GO.i18n(commonLang["첨부파일 1개의 최대 용량은 {{size}} MB 이며 최대 {{number}} 개 까지 등록 가능합니다"],
                                    {"size": maxAttachSize, "number": maxAttachNumber})
                        };
                        lang  = _.extend(lang, m);
                    }
                    this.$el.html(layoutTpl({
                        lang: lang,
                        boardLang : boardLang,
                        commonLang : commonLang,
                        isReply: opt.type == "reply" ? true : false,
                        isAttachNumberToolTip: isAttachNumberToolTip,
                        isEditMode: opt.postId && opt.type == "edit" || false
                    }));

                    BoardTitleView.render({
                        el: '.content_top',
                        dataset: { name : lang.post_write }
                    });

                    deptList.render(opt);
                    if (this.deptId && !this.$el.find('#dept_select option[value="' + this.deptId + '"]').length) {
                        this.setBoardTargetLowRank();
                    } else {
                        this.setCurrentBoard();
                        this.changeBoardList();
                    }

                    this.initWriteForm();
                    this.setTmpListCnt();

                    $('#side p.title').removeClass('on');

                    if (this.boardId) {
                        this.boardModel = BoardConfigModel.get(this.boardId).toJSON();
                        if (this.boardModel.anonymFlag) {
                            $("#stickableOption").hide();
                        }
                        if (this.boardModel.notificationFlag) {
                            this.changeNotiStatus(true);
                        }
                    }

                    if (opt.type == 'edit') {
                        this.changeNotiStatus(false);
                    }

                    this.setNotiMarkup();
                    this.bindEvent();
                },

                _dragOver: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.originalEvent.dataTransfer.dropEffect = 'move';
                    $("#dropZone").addClass('drag_file');
                },

                _dragLeave: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    $("#dropZone").removeClass('drag_file');
                },

                _drop: function (e) {
                    this._dragLeave(e);
                },

                /**
                 * @Override
                 *
                 * 외부의 엘리멘트를 el로 사용하므로 remove 할 때 엘리먼트를 삭제하는 대신
                 * 비워주고 바인딩된 이벤트를 해제해주어야 한다.
                 */
                remove: function () {
                    this.$el.empty();
                    this.undelegateEvents();
                },

                streamKeyCheck: function (e) {
                    if (e.shiftKey && e.keyCode == 13) {
                        this.feedWrite();
                    }
                },

                writeSecret: function (e) {
                    var self = this;
                    var target = $(e.currentTarget);
                    if (target.val() != 'OPEN') {
                        $("input:checkbox[id='post_stream_push_noti']").attr("checked", false);
                    }
                    self.setPostAuthUsersMarkup();
                    self.setNotiMarkup();
                },

                subjectKeyup: function () {
                    this.$el.find("#subject").removeClass('error').parent().siblings().remove();
                },

                headerListChange: function () {
                    this.$el.find("#subject").removeClass('error').parent().siblings().remove();
                },

                //알림 checkbox의 상태를 변경한다.
                //전사 게시판 이거나 게시판의 설정에 알림 보내기 설정이 되어 있는경우  default체크를 해주기 위함. .
                changeNotiStatus: function (needNoti, target) {
                    if (!target) {
                        if (this.boardType == "STREAM") {
                            target = $('#post_stream_push_noti');
                        } else {
                            target = $('#post_classic_push_noti');
                        }
                    }
                    target.prop('checked', needNoti);
                    var targetId = target.attr("id");
                    if (needNoti) {
                        target.siblings('label').parent().removeClass('action_off').addClass('action_on');
                        if (targetId.indexOf("mail") > 0) {
                            $("div #mail_push_desc").show();
                        }
                    } else {
                        target.siblings('label').parent().removeClass('action_on').addClass('action_off');
                        if (targetId.indexOf("mail") > 0) {
                            $("div #mail_push_desc").hide();
                        }
                    }
                },

                changeBoardList: function () {
                    var select = $("#select_board option:selected"),
                        boardId = select.val();
                    if (boardId) {
                        var board = BoardConfigModel.get(boardId);
                        var anonymFlag = board.get('anonymFlag');
                        var availableAnonymousWriterOptionInPost = board.get('availableAnonymousWriterOptionInPost');
                        if (anonymFlag) {
                            $("#stickableOption").hide();
                            $('#streamAlimpOption').hide();
                            if(availableAnonymousWriterOptionInPost) {
                                $('#publicWriterSettingPart').show();
                            }else{
                                $('#publicWriterSettingPart').hide();
                            }
                        } else {
                            $("#stickableOption").show();
                            $('#streamAlimpOption').show();
                            $('#publicWriterSettingPart').hide();
                        }
                        this.boardModel = board.toJSON();
                        this.initAuthorizedUser();
                        this.setNotiMarkup();
                        this.setPostAuthUsersMarkup();
                        this.changeNotiStatus(this.boardModel.notificationFlag);
                    }
                    if (select.attr('data-headerFlag') == 'true') {
                        var col = HeaderListCollection.getHeaderList({boardId: boardId}).toJSON();
                        var tplHeaderList = TplHeaderList({
                            dataset: col,
                            defaultSelect: lang.header_default,
                            selectId: 'header_list',
                            selectClass: 'article_head'
                        });
                        $("#headerList").show();
                        $("#headerList").html(tplHeaderList);
                    } else {
                        $("#headerList").html('');
                        $("#headerList").hide();
                    }
                },
                expandTextarea: function (e) {
                    GO.util.textAreaExpand(e);
                },
                streamWriteNoti: function (e) {
                    this.changeNoti(e);
                },
                changeNoti: function (e) {
                    var notiPart = $(e.target);
                    this.changeNotiStatus(notiPart.is(':checked'), notiPart);
                    if (this.boardModel.notificationFlag) {
                        // 사이트 어드민에서 '알림보내기' 설정되어 있으면  둘중하나는 무조건 체크 되어 있어야 한다.
                        if (this.boardType == "STREAM") {
                            if (!$('#post_stream_mail_noti').is(':checked') && !$('#post_stream_push_noti').is(':checked')) {
                                $.goError(lang['alim_alert']);
                                this.changeNotiStatus(true, $('#post_stream_push_noti'));
                            }
                        } else {
                            if (!$('#post_classic_mail_noti').is(':checked') && !$('#post_classic_push_noti').is(':checked')) {
                                $.goError(lang['alim_alert']);
                                this.changeNotiStatus(true, $('#post_classic_push_noti'));
                            }
                        }
                    }
                },

                feedWrite: function () {
                    if ($("#progressbar").length > 0) {
                        $.goMessage(commonLang['현재 파일 업로드 중입니다.']);
                        return false;
                    }

                    //	게시글 등록
                    var _this = this;
                    var notiMail = $('#post_stream_mail_noti').is(':checked');
                    var notiPush = $('#post_stream_push_noti').is(':checked');
                    var content = $('#feedContent').val();
                    var attaches = [];
                    var attachPart = $("#optionStreamDisplay").find('li[data-tmpname]');

                    if ($.trim(content) == "" || content == lang.input_placeholder) {
                        $('#feedContent').focus();
                        $.goError(lang['alert_content']); // 추가
                        return;
                    }

                    attachPart.each(function () {
                        attaches.push({
                            path: $(this).attr("data-tmpname"),
                            name: $(this).attr("data-name"),
                            hostId: $(this).attr("data-hostid"),
                            size: $(this).attr("data-size"),
                        });
                    });

                    var linkPart = $("#metaWrap li");
                    var links = [];
                    if (linkPart.length > 0) {
                        var url = $("#metaWrap a.url_type").html();
                        var thumb = this.$("#link_img_delete").is(":checked") ? null : $("#metaWrap .thumb img").attr("src");
                        var videoSrc = $("#metaWrap a.url_type").attr('data-video');
                        var title = $("#metaWrap .title").html();
                        var description = this.$("#link_description_delete").is(":checked") ? null : $("#metaWrap .meta_contents").html();

                        links.push({
                            url: url,
                            title: title,
                            description: description,
                            imageSrc: thumb,
                            videoSrc: videoSrc
                        });
                    }

                    var boardId = $("#select_board option:selected").val();

                    this.writemodel = new PostModel();
                    GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
                    this.writemodel.set({boardId: boardId, postfId: ''}, {silent: true});
                    this.writemodel.save({
                        content: content,
                        status: 'OPEN',
                        notiMailFlag: notiMail,
                        notiPushFlag: notiPush,
                        attaches: attaches,
                        links: links
                    }, {
                        success: function () {
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            //게시판 정보 갱신
                            GO.EventEmitter.trigger('board', 'change:boardInfo', true);

                            if (_this.isCommunity) {
                                App.router.navigate("community/" + _this.communityId + "/board/" + boardId, true);

                                //사이드메뉴 new 아이콘 추가

                                GO.EventEmitter.trigger('community', 'changed:lastPostedAt', boardId);
                            } else {
                                App.router.navigate("board/" + boardId, true);
                                GO.EventEmitter.trigger('board', 'changed:lastPostedAt', boardId);
                            }
                        },
                        error: function (model, response) {
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            var responseData = JSON.parse(response.responseText);
                            if (responseData.message) $.goMessage(responseData.message);
                            else $.goMessage(lang.alert_fail);
                        }
                    });
                },

                linkDelete: function (e) {
                    var target = $(e.currentTarget);
                    $('#metaWrap').children().remove();
                    $('#classicLinkWrap').css('display', 'none');
                    target.parents('ul').parent().css('display', 'none');
                    if ($("#optionStreamDisplay").find('li').length < 1) {
                        $("#optionStreamDisplay").removeClass("option_display");
                        $("#optionStreamDisplay").css("height", "1px");
                    }
                },

                linkDescriptionDelete: function (e) {
                    var target = $(e.target);
                    if (target.is(':checked')) {
                        $("#metaWrap .meta_contents").hide();
                    } else {
                        $("#metaWrap .meta_contents").show();
                    }
                },

                linkImageDelete: function (e) {
                    var target = $(e.target);
                    if (target.is(':checked')) {
                        $("#metaWrap .thumb").hide();
                    } else {
                        $("#metaWrap .thumb").show();
                    }
                },

                linkInsert: function () {
                    var boardId = $("#select_board option:selected").val();
                    var target = encodeURIComponent($("#linkUrl").val());
                    var url = GO.contextRoot + "api/board/" + boardId + "/html/parser?url=" + target;
                    $.go(url, '', {
                        qryType: 'GET',
                        contentType: 'application/json',
                        responseFn: function (rs) {
                            if (rs.code == 200) {
                                var tplPostLink = TplPostLink({dataset: rs.data, lang: lang});
                                $("#metaWrap").parent().css("display", "");
                                $("#metaWrap").html(tplPostLink);
                                $("#linkUrl").val('');
                            }
                        }
                    });
                },

                linkShow: function (e) {
                    $("#optionStreamDisplay").addClass("option_display").css("height", "auto");
                    $("#classicLinkWrap").show();
                    $("#linkUrl").focus();
                },

                initWriteForm: function (e) {
                    $('textarea[placeholder]').placeholder();
                    var select = $("#select_board option:selected");
                    if (this.boardType == '') {
                        this.boardType = select.attr("data-bbstype");
                    }

                    // if 문 사용되지 않는 것으로 판단됨
                    if (select.attr("data-bbstype") == "STREAM") {
                        window['oEditors'] = [];
                        this.boardType = "STREAM";
                        $("#classicWriteWrap").hide();
                        $("#classicWriteSubmitWrap").hide();
                        $("#feedWriteWrap").show();
                        this.initStreamUpload("#steam_file_upload");
                    } else {
                        this.boardType = "CLASSIC";
                        $("#classicWriteWrap").show();
                        $("#classicWriteSubmitWrap").show();
                        $("#feedWriteWrap").hide();
                        this.initGOWebEditor();
                        this.initFileUpload();
                    }

                    this.setViewedTotalAttachSize();
                },

                setStreamFrom: function () {
                    this.boardType = "STREAM";
                    $("#classicWriteWrap").hide();
                    $("#classicWriteSubmitWrap").hide();
                    $("#feedWriteWrap").show();

                    window['oEditors'] = [];

                    this.initStreamUpload("#steam_file_upload");

                    $('#subject').val('');

                    var deptType = $("#dept_select option:selected").attr("data-ownertype");
                    console.log("setStreamFrom deptType=" + deptType);
                    if (deptType == "Company") {
                        $("#streamAlimpOption").hide();
                    } else {
                        $("#streamAlimpOption").show();
                    }
                },

                setClassicForm: function () {
                    this.boardType = "CLASSIC";
                    $("#classicWriteWrap").show();
                    $("#classicWriteSubmitWrap").show();
                    $("#feedWriteWrap").hide();

                    // GO-19691 이슈 대응
                    if (!$('#editor').data('plugin_goWebEditor')) {
                        $('.editor iframe').remove();
                        this.initGOWebEditor();
                    }
                    this.initFileUpload();
                    $('#feedContent').val('');
                },

                setWriteForm: function (e) {
                    var _this = this;
                    var select = $("#select_board option:selected");

                    var actionChangeForm = function () {
                        _this.setCurrentBoard();
                        if (select.attr("data-bbstype") == "STREAM") {
                            _this.setStreamFrom();
                        } else {
                            _this.setClassicForm();
                        }
                        _this.changeBoardList();
                    };

                    if (this.boardType != select.attr("data-bbstype")) {
                        $.goPopup({
                            title: lang['post_write'],
                            message: lang['board_type_change'],
                            modal: true,
                            buttons: [{
                                'btext': lang['confirm'],
                                'btype': 'caution',
                                'callback': actionChangeForm
                            }, {
                                'btext': lang['cancel'],
                                'btype': 'normal',
                                'callback': function () {
                                    _this.$el.find('#select_board').val(_this.$el.find('input[name=currentBoard]').val());
                                }
                            }]
                        });
                    } else {
                        this.changeBoardList();
                    }
                },

                attachDelete: function (e) {
                    $(e.target).parents('li').first().remove();

                    if ($("#optionStreamDisplay").find('li').length < 1) {
                        $("#optionStreamDisplay").removeClass("option_display");
                        $("#optionStreamDisplay").css("height", "1px");
                    }

                    this.setViewedTotalAttachSize();
                },

                initFileUpload: function () {
                    var self = this;
                    var options = {
                        el: "#swfupload-control",
                        context_root: GO.contextRoot,
                        button_title: lang["파일선택"],
                        button_text: "<span class='txt'>" + lang["파일선택"] + "</span>",
                        url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
                        textTmpl: [
                            "<span class='btn_file''>",
                            "{text}",
                            "<input type='file' name='file' title='{title}' multiple='' accept={accept} />",
                            "</span>"
                        ].join(""),
                        dropZone: "#dropZone",
                        progressEl: "div.progress"
                    };

                    var maxAttachSize = (GO.config('attachSizeLimit')) ?
                        parseInt(GO.config('maxAttachSize')) : parseInt(GO.config('commonAttachConfig').maxAttachSize);
                    var maxAttachByteSize = maxAttachSize * 1024 * 1024;
                    var maxAttachNumber = (GO.config('attachNumberLimit')) ?
                        parseInt(GO.config('maxAttachNumber')) : parseInt(GO.config('commonAttachConfig').maxAttachNumber);

                    (new FileUpload(options))
                    .queue(function (e, data) {

                    })
                    .start(function (e, data) {
                        if (!GO.config('attachFileUpload')) {
                            $.goAlert(commonLang['파일첨부용량초과']);
                            self.$("#dropZone").removeClass('drag_file');
                            return false;
                        }

                        if (GO.config('excludeExtension') != "") {
                            var test = $.inArray(data.type.substr(1).toLowerCase(), GO.config('excludeExtension').split(','));
                            if (test >= 0) {
                                $.goMessage(App.i18n(lang['alert_exclude_extension'], "arg1", GO.config('excludeExtension')));
                                self.$("#dropZone").removeClass('drag_file');
                                return false;
                            }
                        }

                        if (self.isSaaS || GO.config('attachSizeLimit')) {
                            if (maxAttachByteSize < data.size) {
                                $.goMessage(App.i18n(lang['alert_max_attach_size'], "arg1", maxAttachSize));
                                self.$("#dropZone").removeClass('drag_file');
                                return false;
                            } else {
                                self.totalAttachSize += data.size;
                            }
                        }

                        if (self.isSaaS || GO.config('attachNumberLimit')) {
                            var currentTotalAttachCount = $("#imgWrap").find('li').length + $("#fileWrap").find('li').length + self.totalAttachCount + 1;
                            if (maxAttachNumber < currentTotalAttachCount) {
                                $.goMessage(App.i18n(lang['alert_max_attach_cnt'], "arg1", maxAttachNumber));
                                self.$("#dropZone").removeClass('drag_file');
                                return false;
                            } else {
                                self.totalAttachCount++;
                            }
                        }
                    })
                    .progress(function (e, data) {

                    })
                    .success(function (e, serverData, fileItemEl) {
                        if (GO.util.fileUploadErrorCheck(serverData)) {
                            fileItemEl.find(".item_file").append("<strong class='caution'>" + GO.util.serverMessage(serverData) + "</strong>");
                            fileItemEl.addClass("attachError");
                        } else {
                            if (GO.util.isFileSizeZero(serverData)) {
                                $.goAlert(GO.util.serverMessage(serverData));
                                return false;
                            }
                        }

                        var hostId = serverData.data.hostId;
                        var size = serverData.data.fileSize;
                        var humanSize = GO.util.getHumanizedFileSize(size);
                        var extension = serverData.data.fileExt;
                        var fileName = serverData.data.fileName;
                        var filePath = serverData.data.filePath

                        fileItemEl.attr("data-size", size);
                        fileItemEl.attr("data-name", fileName);
                        fileItemEl.attr("data-tmpname", filePath);
                        fileItemEl.attr("data-hostid", hostId);

                        if (GO.util.isImage(extension)) {
                            fileItemEl.find(".item_image").append("<span class='name'>" + fileName + "</span>" + "<span class='size'>(" + humanSize + ")</span>");
                            self.$("#imgWrap").append(fileItemEl);
                        } else {
                            self.$("#fileWrap").append(fileItemEl);
                        }

                        self.setViewedTotalAttachSize();
                        self.resetAttachSizeAndCount();
                    })
                    .complete(function (e, data) {

                    })
                    .error(function (e, data) {
                        if(data.jqXHR) {
                            if(data.jqXHR.statusText == "abort") {
                                $.goAlert(commonLang['취소되었습니다.']);
                            } else {
                                $.goAlert(commonLang['업로드에 실패하였습니다.']);
                            }
                            self.resetAttachSizeAndCount();
                        }
                    });
                },

                // 사용되지 않는 것으로 판단됨
                initStreamUpload: function (id) {
                    var self = this,
                        fileAttachLang = lang.file_attach;
                    options = {
                        el: id,
                        context_root: GO.contextRoot,
                        url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
                        mode: "IMAGE",
                        progressEl: "#progressBarWrap"
                    };

                    (new FileUpload(options))
                    .queue(function (e, data) {

                    })
                    .start(function (e, data) {
                        if (!GO.config('attachFileUpload')) {
                            $.goAlert(commonLang['파일첨부용량초과']);
                            return false;
                        }

                        if ($('input[name=disabled]:checked', this).length) {
                            e.preventDefault();
                        }

                        if (GO.config('excludeExtension') != "") {
                            var test = $.inArray(data.type.substr(1).toLowerCase(), GO.config('excludeExtension').split(','));
                            if (test >= 0) {
                                $.goMessage(App.i18n(lang['alert_exclude_extension'], "arg1", GO.config('excludeExtension')));
                                return false;
                            }
                        }

                        if (GO.config('attachSizeLimit')) {
                            var size = data.size / 1024 / 1024;  //(MB)
                            var maxAttachSize = GO.config('maxAttachSize');
                            if (maxAttachSize < size) {
                                $.goMessage(App.i18n(lang['alert_max_attach_size'], "arg1", maxAttachSize));
                                return false;
                            }
                        }

                        if (GO.config('attachNumberLimit')) {
                            var currentAttachCnt = $("#feedImgWrap").find('li').length + $("#feedFileWrap").find('li').length;
                            var limitAttachCnt = GO.config('maxAttachNumber');
                            if (limitAttachCnt <= currentAttachCnt) {
                                $.goMessage(App.i18n(lang['alert_max_attach_cnt'], "arg1", limitAttachCnt));
                                return false;
                            }
                        }
                    })
                    .progress(function (e, data) {

                    })
                    .success(function (e, serverData, fileItemEl) {
                        var alertMessage = "";
                        var attachClass = "";

                        if (GO.util.fileUploadErrorCheck(serverData)) {
                            alertMessage = "<strong class='caution'>" + GO.util.serverMessage(serverData) + "</strong>";
                            attachClass = "attachError";
                        } else {
                            if (GO.util.isFileSizeZero(serverData)) {
                                $.goAlert(GO.util.serverMessage(serverData));
                                return false;
                            }
                        }

                        if (!$("#optionStreamDisplay").hasClass("option_display")) {
                            $("#optionStreamDisplay").addClass("option_display");
                            $("#optionStreamDisplay").css("height", "auto");
                        }

                        var data = serverData.data;
                        var tmpName = data.filePath;
                        var name = data.fileName;
                        var extention = data.fileExt;
                        var size = GO.util.getHumanizedFileSize(data.fileSize);
                        var thumbnail = data.thumbnail;
                        var hostId = data.hostId;

                        var templete = "";
                        if (GO.util.isImage(extention)) {
                            templete = '<li class="' + attachClass + '" data-tmpname="' + tmpName + '" data-name="' + name + '" data-hostid="' + hostId + '">' +
                                '<span class="item_image">' +
                                '<span class="thumb"><img src="' + thumbnail + '" alt="' + name + '" /></span>' +
                                '<span class="name">' + name + '</span>' +
                                '<span class="size">(' + size + ')</span>' +
                                '</span>' +
                                '<span class="btn_wrap">' +
                                '<span class="ic_classic ic_del" title="' + lang.del + '"></span>' +
                                '</span>' +
                                '</li>';

                            $("#feedImgWrap").parent().css("display", "");
                            $("#feedImgWrap").append(templete);

                        } else {
                            var fileType = "def";
                            if (GO.util.fileExtentionCheck(extention)) {
                                fileType = extention;
                            }
                            templete = '<li class="' + attachClass + '" data-tmpname="' + tmpName + '" data-name="' + name + '" data-hostid="' + hostId + '">' +
                                '<span class="item_file">' +
                                '<span class="ic_file ic_' + fileType + '"></span>' +
                                '<span class="name">' + name + '</span>' +
                                '<span class="size">(' + size + ')</span>' +
                                '<span class="btn_bdr">' +
                                '<span class="ic_classic ic_del" title="' + lang.del + '"></span>' +
                                '</span>' + alertMessage +
                                '</span>' +
                                '</li>';
                            $("#feedFileWrap").parent().css("display", "");
                            $("#feedFileWrap").append(templete);
                        }

                        $("#progressBarWrap").hide();
                    })
                    .complete(function (e, data) {
                        console.info(data);
                    })
                    .error(function (e, data) {
                        console.info(data);
                    });
                },

                setBoardTargetLowRank: function () {
                    //소속된 게시판이 아닌 게시판의 부서아이디가 입력되면 예외처리 (상위부서 부서장)
                    var _this = this;
                    this.$el.find('#deptList select').attr('disabled', 'disabled').empty();
                    $.go(GO.contextRoot + 'api/board/' + this.boardId, {}, {
                        qryType: 'get',
                        responseFn: function (rs) {
                            if (rs.data) {
                                var masterOwners = $(rs.data.owners).map(function (k, v) {
                                    if (v.ownerShip == 'MASTER') return v;
                                }).get();

                                if (masterOwners.length) {
                                    _this.$el.find('#dept_select').html('<option value="' + masterOwners[0].ownerId + '" selected>' + masterOwners[0].ownerInfo + '</option>');
                                } else {
                                    _this.$el.find('#dept_select').hide();
                                }
                                _this.$el.find('#select_board').html('<option value="' + rs.data.id + '" selected data-headerFlag="' + rs.data.headerFlag + '" data-headerRequiredFlag="' + rs.data.headerRequiredFlag + '">' + rs.data.name + '</option>');

                                //말머리
                                _this.changeBoardList();

                            } else {
                                App.router.navigate(_this.isCommunity ? "community" : "board/post/write", {
                                    replace: true,
                                    trigger: true
                                });
                            }
                        },
                        error: function () {
                            App.router.navigate(_this.isCommunity ? "community" : "board", {
                                replace: true,
                                trigger: true
                            });
                        }
                    });
                },

                setCurrentBoard: function () {
                    var boardId = this.$el.find('#select_board').val();
                    this.$el.find('input[name=currentBoard]').val(boardId);
                },

                setWriteData: function (opt) {
                    var _self = this;

                    this.writeModel = new PostModel({
                        boardId: opt.boardId,
                        postId: opt.postId,
                        readOnly: true,
                        isStream: this.boardType == 'STREAM'
                    });
                    this.writeModel.setURL();
                    this.writeModel.fetch({async: false});

                    if (opt.type == 'edit' && !this.writeModel.checkEditAuth(GO.session().id)) {
                        GO.util.error('403', {"msgCode": "400-board"});
                    }

                    var writeObj = this.writeModel.toJSON();
                    var content = writeObj.content;
                    if (writeObj.contentType == 'TEXT') {
                        content = GO.util.convertRichText(content);
                    }

                    if (writeObj.header) {
                        $('#header_list').val(writeObj.header.id);
                    }
                    //작성자 공개 설정 반영
                    if (writeObj.publicWriter && opt.type == 'edit') {
                       $('#isPublicWriter').attr('checked', true);
                    }
                    if (opt.type == "reply") {
                        //공개설정,공지 -> 답글일 경우 hide
                        $("#publicSettingPart").hide();
                        $("#stickableOption").hide();

                        content = '<p><br></p>' +
                            '<blockquote style="PADDING-RIGHT: 0px; PADDING-LEFT: 5px; MARGIN-LEFT: 5px; BORDER-LEFT: #000000 2px solid; MARGIN-RIGHT: 0px">' +
                            '--- Original Message ---' +
                            '<br/>' +
                            content +
                            '<br/><br/>' +
                            '</blockquote>';

                        writeObj.titleParse = 'RE : ' + writeObj.title;

                        this.setNotiMarkup();
                    }

                    $("#subject").val(GO.util.unescapeHtml(writeObj.titleParse || writeObj.title));

                    if (opt.type == "edit") { //답글의 수정
                        //공개설정,공지 -> 답글 수정일경우 hide
                        this.writeOptionSetting(writeObj);

                        //첨부파일 세팅
                        var images = [];
                        var files = [];
                        $.each(writeObj.attaches, function (k, v) {
                            if (v.thumbSmall) {
                                images.push(v);
                            } else {
                                files.push(v);
                            }
                        });

                        var checkFileType = function () {
                            var fileType = "def";
                            if (GO.util.fileExtentionCheck(this.extention)) {
                                fileType = this.extention;
                            }
                            return fileType;
                        };

                        //파일 사이즈 계산
                        var sizeCal = function () {
                            var data = this.size;
                            var size = GO.util.getHumanizedFileSize(data);
                            return size;
                        };

                        this.$el.find('#fileWrap').html(attachesFileTpl({
                            dataset: files,
                            checkFileType: checkFileType,
                            sizeCal: sizeCal
                        }));

                        this.$el.find('#imgWrap').html(attachesImgTpl({
                            dataset: images,
                            sizeCal: sizeCal
                        }));

                        this.setViewedTotalAttachSize();
                    }

                    var authorizedUsers = this.writeModel.get('authorizedUsers');
                    _.forEach(authorizedUsers, function(user) {
                        _self.addAuthorizedUser(user.userId, user.displayName);
                    });

                    this.setPostAuthUsersMarkup();
                    GO.Editor.getInstance('editor').setContent(GO.util.convertMSWordTag(content));
                },

                writeOptionSetting: function (writeObj) {
                    if (writeObj.id != writeObj.thread) { //답글 수정
                        $("#writeOptionWrap").hide();
                    } else {
                        if (writeObj.repliesCount > 0) {
                            $(":input:radio[name=writeSecret]").filter('input[value=' + writeObj.status + ']').attr("checked", "checked");
                            $("#publicSettingPart").hide();
                        } else {
                            // 공개,비공개 세팅
                            $(":input:radio[name=writeSecret]").filter('input[value=' + writeObj.status + ']').attr("checked", "checked");

                            //공지세팅
                            if (writeObj.hasOwnProperty('fromDate')) {
                                var startDate = writeObj.fromDate;
                                var toDate = writeObj.toDate;
                                $("#write_noti").attr('checked', true);
                                $("#write_noti").parent().removeClass('action_off');
                                $('#notice_term_part').show();
                                $("#stickyStartDate").val(GO.util.shortDateCalenderFormat(startDate));
                                $("#stickyEndDate").val(GO.util.shortDateCalenderFormat(toDate));
                                this.datePickerInit();
                            }
                        }
                    }
                },

                editorAfterLoad: function () {
                    if (this.type == "edit" || this.type == "reply") {
                        this.setWriteData({
                            boardId: this.boardId,
                            postId: this.postId,
                            type: this.type
                        });
                    }
                },

                initGOWebEditor: function () {
                    $('#editor').goWebEditor({
                        contextRoot: GO.config('contextRoot'),
                        lang: GO.session('locale'),
                        theme: 'detail',
                        onLoad: _.bind(this.editorAfterLoad, this)
                    });
                },

                setTmpListCnt: function () {
                    var clipboardList = new tmpList();
                    clipboardList.fetch({
                        success: function (data) {
                            $("#tmpCnt").html(data.toJSON().length);
                        },
                        error: function (data, res) {
                            console.log(res);
                        }
                    });
                },

                saveBbs: function () {
                    if ($("#progressbarWrite").length > 0) {
                        $.goError(commonLang['현재 파일 업로드 중입니다.']);
                        return false;
                    }

                    var editor = GO.Editor.getInstance("editor");
                    if (!editor.validate()) {
                        $.goError(commonLang['마임 사이즈 초과']);
                        return false;
                    }

                    var content = editor.getContent();
                    var title = $("#subject").val();
                    var select = $("#select_board option:selected");
                    var _this = this;

                    if ($.trim(title) == '') {
                        $.goError(lang.no_title, $("#subject").parent());
                        this.$el.find("#subject").focus().addClass('error');
                        return;
                    } else {
                        this.$el.find("#subject").removeClass('error').parent().siblings('#goMessage').remove();
                    }

                    if (select.attr('data-headerFlag') == 'true' && select.attr('data-headerRequiredflag') == 'true' && $('#header_list').val() == 0) {
                        $.goError(lang.no_header, $("#subject").parent());
                        this.$el.find("#header_list").focus();
                        return;
                    } else {
                        this.$el.find("#subject").removeClass('error').parent().siblings('#goMessage').remove();
                    }

                    if (!$.goValidation.isCheckLength(2, 100, title)) {
                        $.goError(App.i18n(lang['alert_length'], {"arg1": "2", "arg2": "100"}), $("#subject").parent());
                        $("#subject").focus().addClass('error');
                        return;
                    } else {
                        this.$el.find("#subject").removeClass('error').parent().siblings('#goMessage').remove();
                    }
                    if (!GO.util.isEditorWriting()) {
                        $.goMessage(lang['alert_content']);
                        return;
                    }

                    var attaches = [];
                    var boardId = select.val();

                    if ($.trim(boardId).length == 0) {
                        $.goAlert(lang.no_selected_board);
                        return;
                    }

                    var postId = $("#writePostId").val();
                    var writeType = $("#writeType").val();
                    var type = 'PUT';
                    if (writeType != 'edit') {
                        type = 'POST';
                    }

                    var data = {
                        title: title,
                        content: content,
                        contentType: 'HTML',
                        modifyPCWebPlatform: true,
                    };

                    var headerListCnt = $("#header_list option").length;
                    if (headerListCnt > 0) {
                        data.headerId = $('#header_list option:selected').val();
                    }

                    var attachPart = $("#attachPart").find('li:not(.attachError)');
                    var attachOpt;
                    attachPart.each(function () {
                        attachOpt = {};
                        if ($(this).attr("data-tmpname")) {
                            attachOpt.path = $(this).attr("data-tmpname");
                        }
                        if ($(this).attr("data-name")) {
                            attachOpt.name = $(this).attr("data-name");
                        }
                        if ($(this).attr("data-id")) {
                            attachOpt.id = $(this).attr("data-id");
                        }
                        if ($(this).attr("data-hostid")) {
                            attachOpt.hostId = $(this).attr("data-hostid");
                        }
                        if ($(this).attr("data-clipboard")) {
                            attachOpt.clipboard = $(this).attr("data-clipboard");
                        }
                        attaches.push(attachOpt);
                    });

                    if (attaches.length > 0) {
                        data.attaches = attaches;
                    }

                    if ($("#publicSettingPart").is(':visible')) {
                        data.status = $('input:radio[name="writeSecret"]:checked').val();
                    }

                    data.authorizedUsers = $('#authorizedUserList').is(':visible') ? this.postAuthorizedUsers : [];

                    if ($("#stickableOption").is(':visible')) {
                        if ($("#write_noti").is(":checked")) {
                            try {
                                data.fromDate = GO.util.toISO8601($("#stickyStartDate").val());
                                data.toDate = GO.util.searchEndDate($("#stickyEndDate").val());
                                data.stickable = true;
                                if ($("#write_noti_order").is(":checked")) data.noticeSortable = true;
                            } catch (e) {
                                $.goMessage(lang.alert_date_format);
                                return;
                            }
                        } else {
                            data.stickable = false;
                        }
                    }
                    GO.EventEmitter.trigger('common', 'layout:setOverlay', true);

                    // 알림 플래그 체크
                    var notiMail = false;
                    var notiPush = false;
                    if ($("#alimOption").is(':visible')) {
                        notiMail = $('#post_classic_mail_noti').is(':checked');
                        notiPush = $('#post_classic_push_noti').is(':checked');
                    }
                    // 작성자 공개 여부 체크
                    var isPublicWriter = false;
                    if($("#publicWriterSettingPart").is(':visible')) {
                        isPublicWriter = $('#isPublicWriter').is(':checked');
                    }

                    this.writemodel = new PostModel();
                    this.writemodel.set({
                        boardId: boardId,
                        notiMailFlag: notiMail,
                        notiPushFlag: notiPush,
                        postId: postId,
                        writeType: writeType,
                        publicWriter: isPublicWriter
                    }, {
                        silent: true
                    });
                    this.writemodel.save(data, {
                        type: type,
                        success: function (data) {
                            var saveTempId = $("div.editor a.btn_temp_list").attr('data-tmpid');
                            if (saveTempId) {
                                _this.deleteSavedTmpPost(saveTempId);
                            }
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);

                            if (_this.isCommunity) {
                                App.router.navigate("community/" + _this.communityId + "/board/" + boardId + "/post/" + data.id, true);
                                //사이드메뉴 new 아이콘 추가
                                GO.EventEmitter.trigger('community', 'changed:lastPostedAt', boardId);
                            } else {
                                App.router.navigate("board/" + boardId + "/post/" + data.id, true);
                                //사이드메뉴 new 아이콘 추가
                                GO.EventEmitter.trigger('board', 'changed:lastPostedAt', boardId);
                            }
                        },
                        error: function (model, response) {
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            var responseData = JSON.parse(response.responseText);
                            if (responseData.message) $.goMessage(responseData.message);
                            else $.goMessage(lang.alert_fail);
                        }
                    });
                },

                tmpSave: function () {
                    var editor = GO.Editor.getInstance("editor");
                    if (!editor.validate()) {
                        console.log("invalid");
                        return false;
                    }

                    var content = editor.getContent();
                    if ($.trim(content) == "" || $.trim(content) == "<br>") {
                        $.goError(lang.no_content);
                        return;
                    }

                    var _this = this;
                    var url = GO.contextRoot + "api/clipboard";
                    var subject = $("#subject").val();
                    if ($.trim(subject) == '') {
                        subject = lang.no_subject;
                    }

                    var data = {title: subject, content: content, attaches: this.getAttachData()};
                    $.go(url, JSON.stringify(data), {
                        qryType: 'POST',
                        contentType: 'application/json',
                        responseFn: function (rs) {
                            if (rs.code == 200) {
                                var saveTempId = $("div.editor a.btn_temp_list").attr('data-tmpid');
                                if (saveTempId) {
                                    _this.deleteSavedTmpPost(saveTempId);
                                } else {
                                    _this.setTmpListCnt();
                                }
                                //파일의 경로 및 아이디 값을 다시 세팅 하자.
                                _this.fetchAttachData(rs.data.attaches);
                                GO.Editor.getInstance("editor").setContent(rs.data.content);
                                $.goMessage(lang.tmpSave_success);
                                $("div.editor a.btn_temp_list").attr('data-tmpid', rs.data.id);
                            }
                        }
                    });
                },

                fetchAttachData: function (attachData) {
                    var templete = "";
                    $('#fileWrap').children("li").remove();
                    $('#imgWrap').children("li").remove();
                    _.each(attachData, function (attach) {
                        var size = GO.util.getHumanizedFileSize(attach.size);
                        if (GO.util.isImage(attach.extention)) {
                            templete =
                                '<li class="" data-tmpname="' + attach.path + '" data-name="' + attach.name + '" data-hostid="' + 'unknown' + '" data-id="' + attach.id + '" data-path="' + attach.path + '" data-size="' + attach.size + '" data-clipboard="true">' +
                                    '<span class="item_image">' +
                                        '<span class="thumb">' +
                                            '<img src="' + attach.thumbSmall + '" alt="' + attach.name + '" />' +
                                        '</span>' +
                                        '<span class="name">' + attach.name + '</span>' +
                                        '<span class="size">(' + size + ')</span>' +
                                    '</span>' +
                                    '<span class="btn_wrap">' +
                                            '<span class="ic_classic ic_del"></span>' +
                                    '</span>' +
                                '</li>';
                            $('#imgWrap').append(templete);

                        } else {
                            var fileType = "def";
                            if (GO.util.fileExtentionCheck(attach.extention)) {
                                fileType = attach.extention;
                            }
                            templete =
                                '<li class="" data-tmpname="' + attach.path + '" data-name="' + attach.name + '" data-hostid="' + 'unknown' + '" data-id="' + attach.id + '" data-path="' + attach.path + '" data-size="' + attach.size + '" data-clipboard="true">' +
                                    '<span class="item_file">' +
                                        '<span class="ic_file ic_' + fileType + '"></span>' +
                                        '<span class="name">' + attach.name + '</span>' +
                                        '<span class="size">(' + size + ')</span>' +
                                        '<span class="btn_bdr">' +
                                            '<span class="ic_classic ic_del"></span>' +
                                        '</span>' +
                                    '</span>' +
                                '</li>';
                            $('#fileWrap').append(templete);
                        }
                    }, this);
                },

                getAttachData: function () {
                    var attachPart = $("#attachPart").find('li[data-name]');
                    var attachesData = [];

                    attachPart.each(function () {
                        attachOpt = {};

                        if ($(this).attr("data-name")) {
                            attachOpt.name = $(this).attr("data-name");
                        }
                        if ($(this).attr("data-id")) {
                            attachOpt.id = $(this).attr("data-id");
                        }
                        if ($(this).attr("data-clipboard")) {
                            attachOpt.clipboard = $(this).attr("data-clipboard");
                        }
                        if ($(this).attr("data-size")) {
                            attachOpt.size = $(this).attr("data-size");
                        }
                        attachOpt.path = $(this).attr("data-path") ? $(this).attr("data-path") : $(this).attr("data-tmpname");

                        attachesData.push(attachOpt);
                    });

                    return attachesData;
                },

                tempList: function () {
                    $.goPopup({
                        header: lang.tmp_posts,
                        width: 400,
                        pclass: "layer_normal layer_temporary_save",
                        contents: "",
                        buttons: [{
                            btext: lang.confirm,
                            btype: "confirm", //초록 버튼
                            callback: function () {
                                // alert('callback 이 실행되면 팝업이 닫혀요');
                            }
                        }]
                    });
                    tempList.render();
                },
                clearSticky: function () {
                    $("#stickyStartDate").html('');
                    $("#stickyEndDate").html('');
                },
                notiCheck: function (e) {
                    var notiPart = $(e.target);
                    if (notiPart.is(':checked')) {

                        this.clearSticky();

                        notiPart.siblings("label").parent().removeClass('action_off');
                        var _this = this;
                        $.goPopup({
                            header: lang.notice_term,
                            width: "350px",
                            pclass: "layer_normal layer_date_set",
                            contents: "",
                            modal: true,
                            buttons: [{
                                btext: lang.notice,
                                btype: "confirm", //초록 버튼
                                callback: function () {

                                    if (($("#noticeStartDate").val() == '' && $("#noticeEndDate").val() == '') &&
                                        $("input[name=noticeTerm]:radio:checked").length < 1) {
                                        return;
                                    }
                                    try {
                                        _this.setStickyDate();
                                    } catch (e) {
                                        $.goMessage(lang.alert_date_format);
                                        return;
                                    }
                                }
                            }],
                            closeCallback: function () {
                                if ($("#stickyStartDate").val() == '') {
                                    notiPart.siblings("label").parent().addClass('action_off');
                                    $("#write_noti").attr('checked', false);
                                }
                            }
                        });
                        noticeLayer.render();
                    } else {
                        $.goPopup.close();
                        notiPart.siblings("label").parent().addClass('action_off');
                        $('#notice_term_part').hide();
                        $("#stickyStartDate").val('');
                        $("#stickyEndDate").val('');
                    }
                },
                setStickyDate: function () {

                    var key = $("input[name=noticeTerm]:radio:checked").attr("data-key");
                    var amount = $("input[name=noticeTerm]:radio:checked").attr("data-amount");
                    var currentStartDate;
                    var currentEndDate;
                    var startAt;
                    var endAt;

                    if (($("#noticeStartDate").val() != "") && ($("#noticeEndDate").val() != "")) {
                        startAt = $("#noticeStartDate").val();
                        endAt = $("#noticeEndDate").val();

                        var regExp = /^(19|20)\d{2}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[0-1])$/;
                        if (!regExp.test(startAt) || !regExp.test(endAt)) {
                            throw new Error('invalid date format');
                        }
                    } else {
                        currentStartDate = new Date();
                        currentEndDate = new Date();
                        startAt = GO.util.toISO8601(currentStartDate);
                        endAt = GO.util.calDate(currentEndDate, key, amount);
                    }

                    var viewStartAt = GO.util.shortDate(startAt);
                    var viewEndAt = GO.util.shortDate(endAt);

                    $('#notice_term_part').show();
                    $("#stickyStartDate").val(viewStartAt);
                    $("#stickyEndDate").val(viewEndAt);

                    this.datePickerInit();
                },

                showOrgSlider: function(e) {
                    return $.goOrgSlide({
                        header : boardLang["열람자 추가"],
                        type: 'node',
                        memberTypeLabel : commonLang["열람자"],
                        contextRoot : GO.config("contextRoot"),
                        callback : $.proxy(__addAuthorizedUser, this),
                        externalLang : commonLang,
                        isBatchAdd : true
                    });

                    function __addAuthorizedUser(info) {
                        var _self = this;
                        if (info instanceof Array) {
                            _.forEach(info, function(user) {
                                _self.addAuthorizedUser(user.id, user.fullName);
                            });
                        } else {
                            this.addAuthorizedUser(info.id, info.displayName);
                        }
                    }
                },

                datePickerInit: function () {
                    var noticeStartDate = $("#stickyStartDate");
                    var noticeEndDate = $("#stickyEndDate");
                    $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);
                    noticeStartDate.datepicker({
                        //defaultDate: "+1w",
                        dateFormat: "yy-mm-dd",
                        changeMonth: true,
                        changeYear: true,
                        //numberOfMonths: 3,
                        yearSuffix: "",
                        onSelect: function (selectedDate) {
                            noticeEndDate.datepicker("option", "minDate", selectedDate);
                        }
                    });
                    noticeEndDate.datepicker({
                        //defaultDate: "+1w",
                        dateFormat: "yy-mm-dd",
                        changeMonth: true,
                        changeYear: true,
                        //numberOfMonths: 3,
                        yearSuffix: "",
                        onSelect: function (selectedDate) {
                            noticeStartDate.datepicker("option", "maxDate", selectedDate);
                        }
                    });
                },
                deleteSavedTmpPost: function (tempId) {
                    var url = GO.contextRoot + "api/clipboard/" + tempId;

                    $.go(url, {}, {
                        qryType: 'DELETE',
                        contentType: 'application/json',
                        responseFn: function (rs) {
                        }
                    });

                },
                addAuthorizedUser : function(userId, name) {
                    var self = this;
                    if (self.isOpenStatus() || !self.usePostAuthOption() || self.isDuplicatedAuthUser(userId)) {
                        return;
                    }
                    self.postAuthorizedUsers.push({userId:userId, name:name});

                    self.$el.find('#authorizedUserList').prepend(PostWriteAuthUserTpl({
                        userId : userId, name : name, commonLang : commonLang
                    }));
                    self.setNotiMarkup();
                },
                initAuthorizedUser : function() {
                    var self = this;
                    _.forEach(self.postAuthorizedUsers, function(user) {
                        self.removePostAuthorizedUser(user.userId);
                    });
                    self.$el.find('#authorizedUserList .authorizedUser').remove();
                },
                removePostAuthorizedUser : function(userId) {
                    var self = this;
                    self.postAuthorizedUsers = self.postAuthorizedUsers.filter(function (authUser) {
                        return authUser.userId != userId;
                    });
                    self.setNotiMarkup();
                },
                isDuplicatedAuthUser : function(userId) {
                    return _.any(this.postAuthorizedUsers, function (authUser) {
                        return authUser.userId == userId;
                    });
                },
                setNotiMarkup : function() {
                    var self = this;
                    var isNotEditMode = self.type != 'edit';
                    var isNotAnonymousBoard = !self.boardModel.anonymFlag;
                    var hasAuthUsers = self.postAuthorizedUsers.length > 0;
                    var usePostAuthOption = self.usePostAuthOption();
                    var isOpenStatus = self.isOpenStatus();

                    if (isOpenStatus && isNotEditMode && isNotAnonymousBoard) {
                        self.$el.find('#alimOption').show();
                    } else if (!isOpenStatus && usePostAuthOption && hasAuthUsers && isNotEditMode && isNotAnonymousBoard) {
                        self.$el.find('#alimOption').show();
                    } else {
                        self.$el.find('#alimOption').hide();
                    }
                },
                setPostAuthUsersMarkup : function() {
                    var self = this;
                    if (self.isOpenStatus()) {
                        self.$el.find('#authorizedUserList').closest('.option_display').hide();
                        self.$el.find('#publicSettingMsg').html("");
                    } else if (self.usePostAuthOption()) {
                        self.$el.find('#authorizedUserList').closest('.option_display').show();
                        self.$el.find('#publicSettingMsg').html(boardLang['비공개글 열람자 설정 안내문구']);
                    } else {
                        self.$el.find('#authorizedUserList').closest('.option_display').hide();
                        self.$el.find('#publicSettingMsg').html(boardLang['※ 나와 운영자만 볼 수 있도록 비공개로 글을 등록합니다.']);
                    }
                },
                usePostAuthOption : function() {
                    var self = this;
                    var isOpenStatus = self.$el.find('#publicSettingPart input:checked').val() == 'OPEN';
                    var usePostAuthOption = self.boardModel.postAuthOption;
                    return !isOpenStatus && usePostAuthOption;
                },
                isOpenStatus : function() {
                    var self = this;
                    return self.$el.find('#publicSettingPart input:checked').val() == 'OPEN';
                },
                onRemoveAuthUserBtnClicked : function(e) {
                    var $target = $(e.currentTarget).closest('.authorizedUser');
                    var targetUserId = $target.find('span').data('id');
                    $target.remove();
                    this.removePostAuthorizedUser(targetUserId);
                },
                onRemoveAllAuthUserBtnClicked : function() {
                    this.initAuthorizedUser();
                },

                getViewedTotalAttachSize: function () {
                    var viewedTotalAttachSize = 0;
                    $("#fileWrap, #imgWrap").find('li').each(function () {
                        viewedTotalAttachSize += parseInt(this.getAttribute('data-size'), 0);
                    });
                    return viewedTotalAttachSize;
                },

                setViewedTotalAttachSize: function () {
                    if (this.isSaaS || GO.config('attachSizeLimit')) {
                        var current = this.getViewedTotalAttachSize();
                        this.$el.find("#total_size").html(GO.util.displayHumanizedAttachSizeStatus(current));
                    }
                },

                resetAttachSizeAndCount: function () {
                    if (this.isSaaS || GO.config('attachSizeLimit')) {
                        this.totalAttachSize = 0;
                        this.totalAttachCount = 0;
                    }
                }
            }, {
                render: function (opt) {
                    if (!instance) {
                        instance = new PostWrite(opt);
                    }
                    return instance.render(opt);
                }
            });

            return PostWrite;

        });
}).call(this);
