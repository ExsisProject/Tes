;(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hogan",

            "hgn!board/templates/mobile/m_post_write",
            "hgn!board/templates/mobile/m_post_auth_user",
            "board/views/dept_list",
            "i18n!nls/commons",
            "i18n!board/nls/board",

            "views/mobile/header_toolbar",
            "board/models/post",
            "board/collections/header_list",
            "attach_file",
            "admin/models/community_base_config",
            "admin/models/board_base_config",
            "board/models/board_config",
            "components/go-fileuploader/mobile",
            "views/mobile/m_org",

            "jquery.go-validation",
            "jquery.progressbar",
            "jquery.go-sdk",
            "GO.util",
            "jquery.cookie",
            "jquery.go-validation"
        ],
        function (
            $,
            Backbone,
            App,
            Hogan,
            layoutTpl,
            PostAuthUserTmpl,
            deptList,
            commonLang,
            boardLang,
            HeaderToolbarView,
            PostModel,
            HeaderListCollection,
            AttachFile,
            CommunityBaseConfigModel,
            BoardBaseConfigModel,
            BoardConfigModel,
            FileUploader,
            OrgView
        ) {
            var instance = null;
            var lang = {
                'post_write': boardLang['글쓰기'],
                'post_edit': boardLang['글수정'],
                'post_reply': boardLang['답글쓰기'],
                'img_attach': commonLang['이미지 첨부'],
                'file_attach': commonLang['파일 첨부'],
                'title': commonLang['제목'],
                'tmp_posts': boardLang['임시 저장된 글'],
                'private': commonLang['비공개'],
                'public_setting': boardLang['공개 설정'],
                'save_post': boardLang['등록'],
                'link_input': boardLang['링크입력'],
                'post_stream': boardLang['이야기 하기'],
                'del': commonLang['삭제'],
                'confirm': commonLang['확인'],
                'cancel': commonLang['취소'],
                'no_header': boardLang['말머리를 선택해주세요.'],
                'no_subject': commonLang['제목없음'],
                'no_content': boardLang['입력된 내용이 없습니다.'],
                'alert_max_attach_cnt': boardLang['최대 첨부 갯수는 0개 입니다.'],
                'alert_max_attach_size': boardLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'],
                'no_title': boardLang['제목이 없습니다.'],
                'alert_content': boardLang['입력된 내용이 없습니다.'],
                'alert_length': boardLang['0자이상 0이하 입력해야합니다.'],
                'alert_init_writeform': boardLang['입력하신 정보가 초기화됩니다.'],
                'input_placeholder': boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.'],
                'board_type_change': GO.util.br2nl(boardLang['게시판 타입이 변경되면 ,기존에 입력했던 내용은 모두 삭제됩니다.']),
                'alert_fail': commonLang['실패했습니다.'],
                'placeholder_subject': boardLang['제목을 입력하세요.'],
                'placeholder_content': boardLang['내용을 입력하세요.'],
                'header_default': boardLang['말머리 선택'],
                'link_meta_delete': boardLang['메타 데이터 삭제'],
                'link_meta_title': boardLang['링크 메타정보 타이틀'],
                'link_meta_img': boardLang['메타정보 이미지'],
                'link_content_delete': boardLang['내용 삭제'],
                'link_img_delete': boardLang['이미지 삭제'],
                'alert_url': boardLang['잘못된 url입니다.'],
                'alim_mail': commonLang['메일알림'],
                'alim_push': commonLang['푸시알림'],
                'alim_alert': commonLang['관리자 설정으로 하나의 알림은 반드시 선택되어야 합니다.'],
                'no_board': boardLang['선택가능한 게시판이 없습니다.'],
                'public_writer' :boardLang['작성자 공개']
            };

            var PostWrite = Backbone.View.extend({
                el: '#content',
                events: {
                    "vclick a[data-btntype='userAddBtn']": "callUserAddBtn",
                    "vclick .postAuthUser .ic_del": "onClickedRemoveAuthUserBtn",
                },
                unbindEvent: function () {
                    this.$el.off('vclick', 'span[data-btntype="attachDelete"]');
                    this.$el.off('change', 'select#select_board');
                    this.$el.off('change', 'select#dept_select');
                    this.$el.off('change', '#post_mail_noti');
                    this.$el.off('change', '#post_push_noti');
                    this.$el.off('change', '#secret');
                    this.$el.off('keyup', '#mobileContent');
                    this.$el.off('vclick', '#btnLink');
                    this.$el.off('vclick', 'input[data-btntype="linkSubmit"]');
                    this.$el.off('change', 'input[type="file"]');
                    this.$el.off('vclick', 'input[type="file"]');
                    GO.EventEmitter.off("trigger-action");
                },
                bindEvent: function () {
                    this.$el.on('change', 'select#select_board', $.proxy(this.setWriteForm, this));
                    this.$el.on('change', 'select#dept_select', $.proxy(this.setWriteForm, this));
                    this.$el.on('change', '#post_mail_noti', $.proxy(this.streamWriteNoti, this));
                    this.$el.on('change', '#post_push_noti', $.proxy(this.streamWriteNoti, this));
                    this.$el.on('change', '#secret', $.proxy(this.toggleSecret, this));
                    this.$el.on('keyup', '#mobileContent', $.proxy(this.expandTextarea, this));
                    this.$el.on('vclick', '#btnLink', $.proxy(this.linkInputShow, this));
                    this.$el.on('vclick', 'input[data-btntype="linkSubmit"]', $.proxy(this.linkSubmit, this));
                    GO.EventEmitter.on('trigger-action', 'board-save', this.saveBbs, this);
                },
                initialize: function () {
                    GO.util.appLoading(true);
                    this.headerToolbarView = HeaderToolbarView;

                    var tplPostLink = [
                        '<ul><li class="thumb">',
                        '{{#imageSrc}}<a href="javascript:;" class="meta_thumb"><img class="" src="{{imageSrc}}" alt="{{lang.link_meta_img}}" title="{{lang.link_meta_title}}"></a>{{/imageSrc}}',
                        '</li>',
                        '<li class="url"><a href="javascript:;" class="url_type">{{url}}</a></li>',
                        '<li><a href="javascript:;" class="title">{{title}}</a></li>',
                        '<li><p href="javascript:;" class="meta_contents">{{description}}</p></li></ul>',
                    ];
                    var tplHeaderList = [
                        '<select id="{{selectId}}" class="{{selectClass}}"><option value="0">{{defaultSelect}}</option>',
                        '{{#dataset}}{{^deletedFlag}}<option value="{{id}}">{{name}}</option>{{/deletedFlag}}{{/dataset}}',
                        '</select>'
                    ];

                    this.hogan = {
                        tplPostLink: Hogan.compile(tplPostLink.join('')),
                        tplHeaderList: Hogan.compile(tplHeaderList.join(''))
                    };
                    this.isSaving = false;
                    this.postAuthorizedUsers = [];

                    this.setAppCallBack();
                },
                render: function (opt) {
                    GO.util.pageDone();
                    GO.util.appLoading(true);
                    this.unbindEvent();
                    this.bindEvent();

                    var self = this;

                    this.communityId = opt.communityId || '';
                    this.isCommunity = opt.communityId ? true : false;
                    this.deptId = opt.deptId || '';
                    this.boardId = opt.boardId || '';
                    this.boardType = '';
                    this.type = opt.type || '';
                    this.postId = opt.postId && opt.postId.indexOf('?') > 0 ? opt.postId.split("?")[0] || '' : opt.postId || '';
                    this.boardModel = opt.boardId ? BoardConfigModel.get(this.boardId) : {}

                    var writeTitle = lang.post_write;
                    if (this.type == "edit") {
                        writeTitle = lang.post_edit;
                    } else if (this.type == "reply") {
                        writeTitle = lang.post_reply;
                    }

                    this.$el.html(layoutTpl({
                        lang: lang,
                        boardLang: boardLang,
                        isCommunity: this.isCommunity,
                        isMobileApp: GO.config('isMobileApp'),
                        isAndroidApp: GO.util.isAndroidApp(),
                        isReply: this.type == "reply" ? true : false,
                        anonymFlag: this.boardId ? BoardConfigModel.get(this.boardId).get('anonymFlag') : false, // TODO (shidn) : 뭐냐 이건 되지도 않는거..
                        isEditMode: this.boardId && this.type == 'edit' || false,
                        isAvailableAnonymousWriterPost: this.boardId ? this.boardModel.get('availableAnonymousWriterOptionInPost') : false,
                        isAvailableAnonymousWriterComment: this.boardId ? this.boardModel.get('availableAnonymousWriterOptionInPostComment') : false
                    }));

                    deptList.render({
                        id: "#deptList",  		//target ID
                        boardList: true,  		// 부서 셀렉트 박스 사용여부 (true/false)
                        communityId: this.communityId,
                        deptId: this.deptId,		//부서 ID
                        boardId: this.boardId,  //게시판 ID
                        postId: this.postId,		//게시물 ID
                        type: this.type,			//수정 or 댓글
                        selectClass: 'w_max',
                        isCommunity: this.isCommunity
                    });
                    var saveLang = lang.save_post;
                    if (this.boardType == "STREAM") {
                        saveLang = lang.post_stream;
                    }
                    this.headerToolbarView.render({
                        isClose: true,
                        title: writeTitle,
                        actionMenu: [{
                            id: 'board-save',
                            text: saveLang,
                            triggerFunc: 'board-save'
                        }]
                    });

                    setTimeout(function () {
                        GO.util.appLoading(false);
                    }, 500);

                    var select = $("#select_board option:selected");
                    if (select.val() === "") {
                        return;
                    }

                    this.initWriteForm();
                    this.setCurrentBoard();
                    this.changeBoardModel();

                    if ((this.type == "edit" || this.type == 'reply') && this.postId) {
                        this.setWriteData({
                            boardId: this.boardId,
                            postId: this.postId,
                            type: this.type
                        });
                        _.each(this.writeModel.get("links"), function (link) {
                            this.renderLink(link);
                        }, this);
                    }


                    this.configModel = this.isCommunity ?
                        CommunityBaseConfigModel.read({admin: false}) : BoardBaseConfigModel.read({admin: false});
                    if (this.isCommunity) {
                        this.configModel = CommunityBaseConfigModel.read({admin: false});
                    } else {
                        this.configModel = BoardBaseConfigModel.read({admin: false});
                    }
                    this.attachFileUploader();
                    self.setPostAuthUsersMarkup();
                    self.setNotiMarkup();
                },
                attachFileUploader: function () {
                    var attachOption = {};

                    attachOption.success = $.proxy(function (r) {
                        var _this = this;
                        var obj = (typeof r === "string") ? JSON.parse(r) : r.data;
                        obj.mode = "edit";
                        $("#attach_wrap").show();
                        //사이즈 체크 로직 넣기
                        var deferred = AttachFile.makeTempItem(obj);
                        deferred.done(function (item) {
                            if ($("div.option_display").data("attachable") === "false") {
                                return;
                            }
                            try {
                                _this.attachValidate(obj)
                            } catch (e) {
                                if (e.message === "overMaxAttachNumber") {
                                    $("div.option_display").data("attachable", "false");
                                }
                                return;
                            }
                            if (GO.util.isImage(obj.fileExt)) {
                                $("#img_attach_wrap_ul").append(item.$el);
                            } else {
                                $("#file_attach_wrap_ul").append(item.$el);
                            }
                            item.$el.on('removedFile', function (o, list) {
                                var e = list.el;
                                e.preventDefault();
                                $(e.currentTarget).parents('li').first().remove();
                                $("div.option_display").data("attachable", "true");
                                if ($("#attach_wrap").find("li").size() < 1) {
                                    $("#attach_wrap").hide();
                                }
                            });
                        });
                        return deferred.promise();
                    }, this);

                    attachOption.error = function (e) {
                        alert(commonLang['업로드에 실패하였습니다.']);
                    };

                    attachOption.androidCallFile = $.proxy(function () {
                        this.callFile();
                    }, this);

                    FileUploader.bind(this.$el.find('#go-fileuploader'), attachOption);
                },
                linkInputShow: function (e) {
                    e.preventDefault();
                    $('#linkInputPart').show();
                },
                linkSubmit: function () {
                    var self = this;
                    var boardId = $("#select_board option:selected").val();
                    var target = encodeURIComponent($("#linkUrl").val());

                    if ($.trim(target) == "") {
                        GO.util.delayAlert(boardLang['링크를 입력하세요.']);
                        return;
                    }

                    var url = GO.contextRoot + "api/board/" + boardId + "/html/parser?url=" + target;
                    $.go(url, '', {
                        qryType: 'GET',
                        contentType: 'application/json',
                        responseFn: function (rs) {
                            if (rs.code == 200) {
                                self.renderLink(rs.data);
                            } else {
                                GO.util.delayAlert(lang.alert_url);
                            }
                        },
                        error: function (error) {
                            GO.util.delayAlert(lang.alert_url);
                        }
                    });
                },

                attachValidate: function (file) {
                    var data = GO.util.getFileNameAndTypeData(file);
                    var maxAttachSize = this.configModel.get("attachSizeLimit") ? this.configModel.get("maxAttachSize") : -1,
                        maxAttachNumber = this.configModel.get("attachNumberLimit") ? this.configModel.get("maxAttachNumber") : -1,
                        excludeExtension = this.configModel.get("excludeExtension") == undefined ? "" : this.configModel.get("excludeExtension");
                    if (this.configModel.get("attachSizeLimit")) {
                        maxAttachSize = this.configModel.get("maxAttachSize");
                    } else if (GO.config('allowedFileUploadSize')) {
                        maxAttachSize = GO.config('allowedFileUploadSize') / 1024 / 1024;
                    }

                    try {
                        $.goValidation.attachValidate("#attach_wrap ul li", data, maxAttachSize, maxAttachNumber, excludeExtension);
                        if (GO.session().brandName == "DO_SAAS") {
                            FileUploader.attachFileValidateBySaaS(data.size);
                        }
                    } catch (e) {
                        var message = e.message;

                        if (message == "ExtentionException") {
                            GO.util.delayAlert(App.i18n(commonLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'], "arg1", excludeExtension));
                        } else if (message == "AttachSizeException") {
                            GO.util.delayAlert(App.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                        } else if (message == "AttachNumberException") {
                            GO.util.delayAlert(App.i18n(commonLang['첨부 파일 개수를 초과하였습니다.'], "arg1", maxAttachNumber));
                            throw new Error("overMaxAttachNumber");
                        } else if (message == "AttachNumberExceptionBySaaS") {
                            GO.util.delayAlert(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
                            throw new Error("overMaxAttachNumber");
                        } else if (message == "NotFoundExtException") {
                            GO.util.delayAlert(commonLang['첨부할 수 없는 파일 입니다.']);
                        }
                        throw new Error("Attach Validation Error");
                    }
                },

                callFile: function () {
                    var maxAttachSize = -1;
                    if (this.configModel.get("attachSizeLimit")) {
                        maxAttachSize = this.configModel.get("maxAttachSize");
                    } else if (GO.config('allowedFileUploadSize')) {
                        maxAttachSize = GO.config('allowedFileUploadSize') / 1024 / 1024;
                    }
                    var maxAttachNumber = this.configModel.get("attachNumberLimit") ? this.configModel.get("maxAttachNumber") : -1,
                        excludeExtension = this.configModel.get("excludeExtension");
                    if (!this.fileUploadCountValidate()) {
                        return false;
                    }

                    if (this.configModel.get("attachNumberLimit")) {
                        maxAttachNumber = maxAttachNumber - $("#attach_wrap li").size();
                    }

                    GO.util.callFile(maxAttachSize, maxAttachNumber, excludeExtension);
                },
                fileUploadCountValidate: function () {

                    if (this.configModel.get("attachNumberLimit")) {
                        var attachCount = $("#attach_wrap li").size(),
                            configAttachCount = this.configModel.get("maxAttachNumber");

                        if (attachCount >= configAttachCount) {
                            GO.util.delayAlert(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", configAttachCount));
                            return false;
                        }
                    }

                    return true;
                },

                changeBoardList: function () {
                    var select = $("#select_board option:selected"),
                        boardId = select.val();

                    var col = HeaderListCollection.getHeaderList({boardId: boardId}).toJSON();
                    if (col.length > 0) {
                        $("#headerList").html(this.hogan.tplHeaderList.render({
                            dataset: col,
                            defaultSelect: lang.header_default,
                            selectId: 'header_list',
                            selectClass: 'w_max'
                        })).show();
                    } else {
                        $("#headerList").html('').hide();
                    }
                },
                changeDeptList: function () {
                    var select = $("#dept_select option:selected"),
                        boardSelect = $("#select_board option:selected");

                    var notiMailEl = $('#post_mail_noti').parents("span.streamPart:first");
                    var notiPushEl = $('#post_push_noti').parents("span.streamPart:first");

                    if (select.attr('data-ownertype') == 'Company') {
                        this.$el.find("#linkInputPart").hide();
                    } else {
                        var board = BoardConfigModel.get(boardSelect.val()),
                            anonymFlag = board.get('anonymFlag');

                        if (anonymFlag) {
                            notiMailEl.hide();
                            notiPushEl.hide();
                        } else {
                            notiMailEl.show();
                            notiPushEl.show();
                        }
                    }
                },
                expandTextarea: function (e) {
                    GO.util.textAreaExpand(e);
                },
                streamWriteNoti: function (e) {
                    var target = $(e.currentTarget);
                    var isNoti = target.is(":checked");
                    target.parent("span").toggleClass("btn_action", isNoti).toggleClass("btn_action_off", !isNoti);
                },
                toggleSecret: function (e) {
                    this.setPostAuthUsersMarkup();
                    this.setNotiMarkup();
                },
                initWriteForm: function (e) {
                    var select = $("#select_board option:selected");
                    if (this.boardType == '') {
                        this.boardType = select.attr("data-bbstype");
                    }
                    if (select.attr("data-bbstype") == "STREAM") {
                        this.setStreamFrom();
                    } else {
                        this.setClassicForm();
                    }
                    this.changeBoardList();
                    this.changeDeptList();
                },
                setStreamFrom: function () {
                    this.boardType = "STREAM";
                    if (this.type == "edit") {
                        $('.streamPart').first().show();
                    } else {
                        $('.streamPart').show();
                    }
                    $('.classicPart').hide();
                    $('#btnToolbarRight span').html(lang.post_stream);

                },
                setClassicForm: function () {
                    this.boardType = "CLASSIC";
                    $('.classicPart').show();
                    $("#linkInputPart").hide();
                    $('#btnToolbarRight span').html(lang.confirm);
                },
                setWriteForm: function (e) {
                    var self = this;
                    var select = $("#select_board option:selected");

                    if (select.val() === "") {
                        return;
                    }

                    var actionChangeForm = function () {
                        self.setCurrentBoard();
                        if (select.attr("data-bbstype") == "STREAM") {
                            self.setStreamFrom();
                        } else {
                            self.setClassicForm();
                        }
                        self.changeBoardList();
                        self.changeDeptList();
                    };

                    if (this.boardType != select.attr("data-bbstype")) {

                        if (confirm(lang['board_type_change'])) {
                            actionChangeForm();
                        } else {
                            self.$el.find('#select_board').val(self.$el.find('input[name=currentBoard]').val());
                        }

                    } else {
                        actionChangeForm();
                    }

                    self.changeBoardModel();
                },
                setCurrentBoard: function () {
                    var boardId = this.$el.find('#select_board').val();
                    this.$el.find('input[name=currentBoard]').val(boardId);
                },
                setWriteData: function (opt) {
                    var self = this;
                    this.writeModel = new PostModel({
                        boardId: opt.boardId,
                        postId: opt.postId,
                        readOnly: true
                    });
                    this.writeModel.setURL();
                    this.writeModel.fetch({async: false});

                    var writeObj = this.writeModel.toJSON();
                    //작성자 공개 설정 반영
                    if (writeObj.publicWriter && opt.type == 'edit') {
                        $('#isPublicWriter').attr('checked', true);
                    }

                    if (writeObj.status == "CLOSE") {
                        this.$("#notiMailBtn").hide();
                        this.$("#notiPushBtn").hide();
                    }

                    if (opt.type == 'reply') {
                        $("#subject").val(GO.util.unescapeHtml('RE : ' + writeObj.title));
                    } else {
                        $("#subject").val(GO.util.unescapeHtml(writeObj.title));
                        $("#mobileContent").val(GO.util.unescapeHtml(writeObj.content));
                        GO.util.textAreaExpandByNode($("#mobileContent")[0]);
                        if (writeObj.header) {
                            $('#header_list').val(writeObj.header.id);
                        }

                        if (writeObj.status == "CLOSE") {
                            $("#secret").attr("checked", "checked");
                        }

                        if (writeObj.attaches.length > 0) {
                            $('#attach_wrap').show();
                            $('#attach_wrap').append('<ul class="file_wrap" id="file_attach_wrap_ul"></ul><ul class="img_wrap" id="img_attach_wrap_ul"></ul>');
                            AttachFile.edit("#file_attach_wrap_ul", writeObj.attaches);
                        }
                    }

                    self.setPostAuthorizedUsers(self.writeModel.get('authorizedUsers'));
                },

                renderLink: function (link) {
                    var tplPostLink = this.hogan.tplPostLink.render($.extend(link, {lang: lang}));
                    this.$("#linkAttachPart").css("display", "");
                    this.$("#linkInfo").html(tplPostLink);
                    this.$("#linkUrl").val('');
                },

                writeOptionSetting: function (writeObj) {
                    if (writeObj.id != writeObj.thread) {
                        $("#writeOptionWrap").hide();
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
                },
                callUserAddBtn: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var postAuthUsers = [];
                    var self = this;
                    $.each($('#postAuthUsersUL li'), function () {
                        postAuthUsers.push({
                            id: $(this).attr('data-userid'),
                            username: $(this).attr('data-username'),
                            position: $(this).attr('data-userposition')
                        });
                    });
                    if (GO.config('isMobileApp')) {
                        GO.util.callOrg(postAuthUsers);
                    } else {
                        App.router.navigate(App.router.getUrl() + '#org', {trigger: false, pushState: true});
                        this.orgView = new OrgView({});
                        this.orgView.render({
                            title: boardLang["열람자 추가"],
                            checkedUser: postAuthUsers,
                            callback: function (data) {
                                self.setPostAuthorizedUsers(_.map(data, function (user) {
                                    return {userId: user.id, name: user.name, positionName: user.position};
                                }));
                                return false;
                            }
                        });
                    }
                },
                setAppCallBack: function () {
                    var self = this;
                    window.addSuccess = function (data) {
                        self.setPostAuthorizedUsers(_.map(JSON.parse(data), function (user) {
                            return {userId: user.id, name: user.name, positionName: user.position};
                        }));
                    };
                },
                changeBoardModel: function () {
                    this.toggleAnonymousPost();
                    var self = this;
                    var boardId = self.$el.find("#select_board option:selected").val();
                    if (boardId === "") {
                        return;
                    }
                    self.boardModel = BoardConfigModel.get(boardId);

                    self.setPostAuthUsersMarkup();
                    self.setPostAuthorizedUsers(self.getPostAuthorizedUsers());
                    self.setNotiMarkup();
                },
                toggleAnonymousPost: function() {
                    if(!this.boardId) {
                        $('#publicWriterSettingPart').hide();
                        return;
                    }
                    if(this.boardModel.get('anonymFlag') && this.boardModel.get('availableAnonymousWriterOptionInPost')) {
                        $('#publicWriterSettingPart').show();
                    }
                },
                getPostAuthorizedUsers: function () {
                    return $('#authorizedUserList').is(':visible') ? this.postAuthorizedUsers : [];
                },
                setPostAuthorizedUsers: function (authUsers) {
                    var self = this;
                    self.postAuthorizedUsers = [];

                    if (!self.usePostAuthOption()) {
                        return;
                    }

                    _.forEach(authUsers, function (user) {
                        if (!self.isDuplicatedAuthUser(user.userId)) {
                            self.postAuthorizedUsers.push({
                                userId: user.userId,
                                name: user.name,
                                positionName: user.positionName
                            });
                        }
                    });

                    $("#postAuthUsersUL").html(PostAuthUserTmpl({data: self.postAuthorizedUsers}));
                    self.setNotiMarkup();
                },
                removePostAuthorizedUser: function (userId) {
                    var self = this;
                    self.postAuthorizedUsers = self.postAuthorizedUsers.filter(function (authUser) {
                        return authUser.userId != userId;
                    });
                    self.setNotiMarkup();
                },
                isDuplicatedAuthUser: function (userId) {
                    var self = this;
                    return _.any(self.postAuthorizedUsers, function (authUser) {
                        return authUser.userId == userId;
                    });
                },
                setNotiMarkup: function () {
                    var self = this;
                    var isNotEditMode = self.type != 'edit';
                    var isNotAnonymousBoard = !self.boardModel.get('anonymFlag');
                    var hasAuthUsers = self.postAuthorizedUsers.length > 0;
                    var usePostAuthOption = self.usePostAuthOption();
                    var isOpenStatus = self.isOpenStatus();

                    if (isOpenStatus && isNotEditMode && isNotAnonymousBoard) {
                        self.$el.find('.postNotiBtn').show();
                    } else if (usePostAuthOption && hasAuthUsers && isNotEditMode && isNotAnonymousBoard) {
                        self.$el.find('.postNotiBtn').show();
                    } else {
                        self.$el.find('.postNotiBtn').hide();
                    }
                },
                setPostAuthUsersMarkup: function () {
                    var self = this;
                    if (self.usePostAuthOption()) {
                        self.$el.find('#authorizedUserList').show();
                    } else {
                        self.$el.find('#authorizedUserList').hide();
                    }
                },
                isOpenStatus: function () {
                    var self = this;
                    return !(self.boardType == "CLASSIC" && $("#secret").is(":checked"));
                },
                usePostAuthOption: function () {
                    var self = this;
                    var isOpenStatus = self.isOpenStatus();
                    var usePostAuthOption = self.boardModel.get('postAuthOption');
                    return !isOpenStatus && usePostAuthOption;
                },
                onClickedRemoveAuthUserBtn: function (e) {
                    e.stopPropagation();
                    var $target = $(e.currentTarget).closest('.postAuthUser');
                    var targetUserId = $target.data('userid');
                    $target.remove();
                    this.removePostAuthorizedUser(targetUserId);
                },
                saveBbs: function () {
                    var content = $('#mobileContent').val();
                    var title = $("#subject").val();
                    var self = this;

                    if (this.isSaving) {
                        return;
                    }
                    this.isSaving = true;

                    if (this.boardType == "CLASSIC") {
                        if ($.trim(title) == '') {
                            GO.util.delayAlert(lang.no_title);
                            $('#subject').focus();
                            this.isSaving = false;
                            return;
                        }
                        if (!$.goValidation.isCheckLength(2, 100, title)) {
                            GO.util.delayAlert(App.i18n(lang['alert_length'], {"arg1": "2", "arg2": "100"}));
                            this.$el.find("#subject").focus();
                            this.isSaving = false;
                            return false;
                        }

                        var select = $("#select_board option:selected");
                        if (select.attr('data-headerFlag') == 'true' && select.attr('data-headerRequiredflag') == 'true' && $('#header_list').val() == 0) {
                            GO.util.delayAlert(lang['no_header']);
                            this.isSaving = false;
                            return false;
                        }
                    }

                    if ($.trim(content) == '') {
                        GO.util.delayAlert(lang.no_content);
                        this.$el.find("#mobileContent").focus();
                        this.isSaving = false;
                        return false;
                    }

                    if ($("#select_board").val() === "") {
                        GO.util.delayAlert(lang.no_board);
                        this.isSaving = false;
                        return false;
                    }

                    GO.util.appLoading(true);

                    var select = $("#select_board option:selected");
                    var boardId = select.val();
                    var postId = $("#writePostId").val();
                    var writeType = $("#writeType").val();
                    var type = 'PUT';
                    if (writeType != 'edit') {
                        type = 'POST';
                    }

                    var data = {
                        content: content,
                        contentType: 'TEXT'
                    };

                    if (this.boardType == "CLASSIC") data.title = title;

                    // 작성자 공개 여부 체크
                    var isPublicWriter = false;
                    if($("#publicWriterSettingPart").is(':visible')) {
                        isPublicWriter = $('#isPublicWriter').is(':checked');
                    }
                    data.publicWriter = isPublicWriter;

                    data.notiMailFlag = this.$("#notiMailBtn").is(":visible") && $('#post_mail_noti').is(':checked');
                    data.notiPushFlag = this.$("#notiPushBtn").is(":visible") && $('#post_push_noti').is(':checked');

                    data.status = this.isOpenStatus() ? 'OPEN' : 'CLOSE';
                    data.authorizedUsers = this.getPostAuthorizedUsers();

                    var headerListCnt = $("#header_list option").length;
                    if (headerListCnt > 0) {
                        data.headerId = $('#header_list option:selected').val();
                    }

                    var attaches = FileUploader.getAttachInfo("#attach_wrap");

                    if (attaches.length > 0) {
                        data.attaches = attaches;
                    }

                    var linkPart = $("#linkInfo li");
                    var links = [];
                    if (linkPart.length > 0) {
                        var url = $("#linkInfo a.url_type").html();
                        var thumb = $("#linkInfo .thumb img").attr("src");
                        var videoSrc = $("#linkInfo a.url_type").attr('data-video');
                        var title = $("#linkInfo .title").html();
                        var description = $("#linkInfo .meta_contents").html();

                        links.push({
                            url: url,
                            title: title,
                            description: description,
                            imageSrc: thumb,
                            videoSrc: videoSrc
                        });
                        data.links = links;
                    }

                    this.writeModel = new PostModel();
                    this.writeModel.set({boardId: boardId, postId: postId, writeType: writeType}, {silent: true});
                    this.writeModel.save(data, {
                        type: type,
                        success: function (data) {
                            var fragment = '';
                            if (self.isCommunity) {
                                fragment = "community/" + self.communityId + "/board/" + boardId + "/post/" + data.id;
                            } else {
                                fragment = "board/" + boardId + "/post/" + data.id;
                            }
                            GO.util.appLoading(false);
                            App.router.navigate(fragment, {replace: true, trigger: true});
                        },
                        error: function (model, response) {
                            GO.util.appLoading(false);
                            var responseData = JSON.parse(response.responseText || {});
                            if (responseData.message) GO.util.delayAlert(responseData.message);
                            else GO.util.delayAlert(lang.alert_fail);
                        }
                    });
                }
            });

            return {
                render: function (opt) {
                    instance = new PostWrite(opt);
                    return instance.render(opt);
                }
            };

        });
}).call(this);