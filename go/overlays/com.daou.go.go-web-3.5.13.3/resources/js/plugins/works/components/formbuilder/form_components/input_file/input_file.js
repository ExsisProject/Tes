define('works/components/formbuilder/form_components/input_file/input_file', function (require) {

    var GO = require('app');
    var ComponentType = require('works/component_type');
    var FormComponent = require('works/components/formbuilder/core/form_component');
    var Registry = require('works/components/formbuilder/core/component_registry');

    var BaseFormView = require('works/components/formbuilder/core/views/base_form');
    var BaseDetailView = require('works/components/formbuilder/core/views/base_detail');
    var BaseOptionView = require('works/components/formbuilder/core/views/base_option');

    var renderFormTpl = require('hgn!works/components/formbuilder/form_components/input_file/form');
    var renderDetailTpl = require('hgn!works/components/formbuilder/form_components/input_file/detail');
    var renderOptionTpl = require('hgn!works/components/formbuilder/form_components/input_file/option');

    var AttachView = require("attach_file");
    var FileUpload = require('file_upload');
    var WorksUtil = require('works/libs/util');
    var FileUploader = require("components/go-fileuploader/mobile");
    var WebFolderView = require('webfolder/views/mobile/m_home');

    // only mobile
    var ImgTpl = Hogan.compile(
        '<li data-path="{{path}}" data-name="{{name}}" data-id="{{id}}">' +
        '<span class="item_image">' +
        '<span class="thumb">' +
        '<img src="{{thumbSmall}}" alt="{{name}}">' +
        '</span>' +
        '<span class="img_tit">{{name}}</span>' +
        '<span class="txt">({{size}})</span>' +
        '<a class="iscroll-tap-highlight">' +
        '<span class="btn_wrap" data-btntype="attachDelete">' +
        '<span class="ic ic_del"></span>' +
        '</span>' +
        '</a>' +
        '</span>' +
        '</li>'
    );

    // only mobile
    var FileTpl = Hogan.compile(
        '<li class="{{errorClass}}" data-path="{{attach.path}}" data-name="{{attach.name}}" data-id="{{attach.id}}">' +
        '<span class="item_file">' +
        '<span class="ic_file {{style}}"></span>' +
        '<span class="name">{{attach.name}}</span>' +
        '<span class="size"> ({{fileSizeStr}})</span>' +
        '<span class="optional" data-btntype="attachDelete">' +
        '<a class="wrap_ic_file"><span class="txt ic ic_file_del"></span></a>' +
        '</span> {{errorMessage}}' +
        '</span>' +
        '</li>'
    );

    var worksLang = require("i18n!works/nls/works");
    var commonLang = require('i18n!nls/commons');
    var lang = {
        "이름": commonLang["이름"],
        "이름숨기기": worksLang["이름숨기기"],
        "설명": worksLang["설명"],
        "이름을 입력해주세요": worksLang["이름을 입력해주세요."],
        "설명을 입력해주세요": worksLang["설명을 입력해주세요."],
        "툴팁으로 표현": worksLang["툴팁으로 표현"],
        "필수 입력 컴포넌트": worksLang["필수 입력 컴포넌트"],
        "파일첨부": commonLang["파일첨부"],
        "save": commonLang["다운로드"],
        "preview": commonLang["미리보기"],
        "이 곳에 파일을 드래그 하세요": commonLang["이 곳에 파일을 드래그 하세요"],
        "이 곳에 파일을 드래그 하세요 또는": commonLang["이 곳에 파일을 드래그 하세요 또는"],
        '파일선택': commonLang['파일선택'],
        '첨부파일 1개의 최대 용량은 NNN MB 이며 최대 N개 까지 등록 가능합니다':
            GO.i18n(commonLang["첨부파일 1개의 최대 용량은 {{size}} MB 이며 최대 {{number}} 개 까지 등록 가능합니다"],
                {
                    "size": GO.config('commonAttachConfig').maxAttachSize,
                    "number": GO.config('commonAttachConfig').maxAttachNumber
                })
    };

    var OptionView = BaseOptionView.extend({
        renderBody: function () {
            this.$el.html(renderOptionTpl({
                lang: lang,
                model: this.model.toJSON()
            }));
        }
    });

    var FormView = BaseFormView.extend({
        isInitFileUploader: false,
        isSaaS: GO.session().brandName == "DO_SAAS",
        totalAttachSize: 0,
        totalAttachCount: 0,

        render: function () {
            this.$body.html(renderFormTpl({
                lang: lang,
                "editable?": this.isEditable(),
                "hasAttach?": this.appletDocModel.get(this.clientId) ? true : false,
                "isMobile?": GO.util.isMobile(),
                "isMobileApp?": GO.config('isMobileApp'),
                "isAndroidApp?": GO.util.isAndroidApp(),
                "isWebFolderUsable?": GO.config('isWebFolderAvailable'),
                label: GO.util.escapeHtml(this.model.get('label')),
                model: this.model.toJSON(),
                isSaaS: this.isSaaS
            }));

            // 등록 또는 수정 화면
            if (!this.isEditable()) {
                // 수정 화면 && 첨부파일이 있을 경우
                if (this.appletDocModel.get(this.clientId)) {
                    this.renderAttaches(this.appletDocModel.get(this.clientId));
                }

                if (GO.config('isMobileApp')) {
                    this.setAttachCallBack();
                } else {
                    setTimeout($.proxy(function () { // form builder 의 구조적 결함으로 업로더가 정상적으로 생성되지 않는 케이스가 있음.
                        if (!this.isInitFileUploader) {
                            this.isInitFileUploader = true;
                            this.initFileUpload();
                        }
                    }, this), 500);
                }
            }
        },

        attachValidate: function (file) {
            var maxAttachSize = null;
            var data = GO.util.getFileNameAndTypeData(file);

            if (GO.config('allowedFileUploadSize')) {
                maxAttachSize = GO.config('allowedFileUploadSize') / 1024 / 1024;
            }

            try {
                $.goValidation.attachValidate("#attachWrap ul li", data, maxAttachSize);
                if (GO.session().brandName == "DO_SAAS") {
                    FileUploader.attachFileValidateBySaaS(data.size);
                }
            } catch (e) {
                var message = e.message;

                if (message == "AttachSizeException") {
                    GO.util.delayAlert(GO.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                } else if (message == "AttachNumberExceptionBySaaS") {
                    GO.util.delayAlert(GO.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", GO.config('commonAttachConfig').maxAttachNumber));
                    throw new Error("overMaxAttachNumber");
                } else if (message == "NotFoundExtException") {
                    GO.util.delayAlert(commonLang['첨부할 수 없는 파일 입니다.']);
                }
                throw new Error("Attach Validation Error");
            }
        },

        events: function () {
            if (GO.util.isMobile()) {
                return this.isEditable() ? BaseFormView.prototype.events : _.extend({}, BaseFormView.prototype.events, {
                    "change input[type='file']": "upload",
                    "vclick #attachWrap span[data-btntype=attachDelete]": "attachDelete",
                    'vclick #callFile': "callFile",
                    'vclick #btnAttachLayer': "btnAttachLayer",
                    'vclick #attachWebfolder': "attachWebfolder"
                });
            } else {
                return this.isEditable() ? BaseFormView.prototype.events : _.extend({}, BaseFormView.prototype.events, {
                    'click span.ic_del': 'attachDelete',

                    'dragover .dropZone': '_dragOver',
                    'dragleave .dropZone': '_dragLeave',
                    'drop .dropZone': '_drop'
                });
            }
        },

        _dragOver: function (e) {
            e.preventDefault();
            e.stopPropagation();
            e.originalEvent.dataTransfer.dropEffect = 'move';
            $(e.currentTarget).addClass('drag_file');
        },

        _dragLeave: function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(e.currentTarget).removeClass('drag_file');
        },

        _drop: function (e) {
            this._dragLeave(e);
        },

        // only mobile
        callFile: function () {
            if (!this.fileUploadCountValidate()) {
                return false;
            }

            var attachSizeLimit = GO.config('allowedFileUploadSize') ? GO.config('allowedFileUploadSize') / 1024 / 1024 : -1;
            var maxAttachNumber = GO.config('commonAttachConfig').maxAttachNumber - this.$("#attachWrap li").size();
            WorksUtil.callFile(this.clientId, attachSizeLimit, maxAttachNumber);
        },

        btnAttachLayer: function (e) {
            $("div.option_display").data("attachable", "true");
            this.toggleAttachEl();
            return false;
        },

        toggleAttachEl: function () {
            if ($('#attachLayer').css('display') == 'block') {
                this.closeAttachLayer();
            } else {
                $('input').blur().focusout();
                this.setAttachOverlay();
                this.openAttachLayer();
            }
        },

        closeAttachLayer: function () {
            $('#popAttachOverlay').remove();
            $('#attachLayer').hide();
        },

        openAttachLayer: function () {
            var attachEl = $('#attachLayer');
            if ($(window).height() < $('.go_content').height()) {
                //모바일 디바이스 높이보다 내용높이가 크면 첨부레이어위치를 약간 위로 조절
                attachEl.css("top", "25%");
            }
            attachEl.show();
            this.bindCustomEvent();
        },

        bindCustomEvent: function () {
            var self = this;
            $('#callCamera').off("vclick");
            $('#callAlbum').off("vclick");
            $('#callCamera').on('vclick', function () {
                self.closeAttachLayer();
                self.callCameraComponent();
                return false;
            });
            $('#callAlbum').on('vclick', function () {
                self.closeAttachLayer();
                self.callAlbumComponent();
                return false;
            });
        },

        setAttachOverlay: function () {
            var self = this;
            var androidAttachOverlay = $('<div id="popAttachOverlay" class="overlay" style="z-index:101"/>');
            this.closeAttachLayer();
            $('.go_wrap').after(androidAttachOverlay);
            var overlayClose = function () {
                $('#popAttachOverlay').click(function (e) {
                    self.toggleAttachEl(e);
                });
            };
            setTimeout(overlayClose, 1000);
        },

        // only mobile
        callAlbumComponent: function () {
            WorksUtil.callAlbum(this.clientId);
        },

        // only mobile
        callCameraComponent: function () {
            WorksUtil.callCamera(this.clientId);
        },

        // only mobile
        fileUploadCountValidate: function () {
            var attachCount = this.$("#attachWrap li").size();
            var configAttachCount = GO.config('commonAttachConfig').maxAttachNumber;

            if (attachCount >= configAttachCount) {
                alert(GO.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", configAttachCount));
                return false;
            }
            return true;
        },

        // only mobile
        attachWebfolder: function (e) {
            var self = this;
            this.webFolderView = new WebFolderView({});
            $("#goBody").hide();
            this.webFolderView.render({
                    callback: function (param) {
                        self.uploadWebFolder(param);
                        return false;
                    }
                }
            );
            return false;
        },

        // only mobile
        upload: function (e) {
            var self = this;
            var target = $(e.currentTarget);
            var uploadFiles = target.get(0).files || {};
            _.each(uploadFiles, function (file) {
                var fd = new FormData();
                fd.append("file", file);
                fd.append("GOSSOcookie", $.cookie("GOSSOcookie"));
                $.ajax({
                    url: GO.contextRoot + "api/file",
                    type: "POST",
                    contentType: false,
                    processData: false,
                    data: fd,
                    success: function (resp) {
                        self.attachFileSuccess(resp);
                    }
                });
            });
            target.val('');
        },

        uploadWebFolder: function (param) {
            var self = this;
            $.ajax({
                url: "/api/webfolder/mail/attach/write",
                type: 'POST',
                contentType: "application/json; charset=UTF-8",
                processData: false,
                data: JSON.stringify(param),
                async: false
            }).done(
                function (result) {
                    setTimeout(function () {
                        GO.util.appLoading(false);
                        self.checkUploadFile(result);
                    }, 1000)
                }
            )
        },

        checkUploadFile: function (response) {
            var self = this;

            _.each(response.data, function (attach) {
                var data = {code: response.code, message: response.message};
                data.data = {
                    "filePath": attach.upkey,
                    "fileSize": attach.size,
                    "fileName": attach.name,
                    "hostId": attach.hostId,
                    "uid": (attach.uid) ? attach.uid : "",
                    "type": "normal",
                    "notChage": true,
                    "fileExt": attach.extension,
                    "thumbnail": ["/thumb/temp/", attach.hostId, "/small", attach.upkey].join("")
                };
                self.attachFileSuccess(data);
            });
        },

        // only mobile
        attachParser: function (attach) {
            return {
                extention: attach.fileExt,
                name: attach.fileName,
                path: attach.filePath,
                size: attach.fileSize,
                thumbSmall: attach.thumbnail
            };
        },

        // only mobile
        attachFileSuccess: function (resp) {
            var errorMessage = "", errorClass = "";
            // GO-32366 안드로이드 앱에서 error 체크를 하고 있음
            if (!GO.config('isMobileApp') && GO.util.fileUploadErrorCheck(resp)) {
                errorMessage = "<strong class='caution'>" + GO.util.serverMessage(resp) + "</strong>";
                errorClass = "attachError";
            }

            var attach = (typeof resp === "string") ? JSON.parse(resp) : resp.data;
            try {
                this.attachValidate(attach);
            } catch (e) {
                if (e.message === "overMaxAttachNumber") {
                    $("#div.option_display").data("attachable", "false");
                }
                return;
            }

            this.$("#attachWrap").show();
            this.addAttachEl(this.attachParser(attach), errorMessage, errorClass);
            this.appletDocModel.set(this.getDataFromView());
        },

        // only mobile
        setAttachCallBack: function () {
            var self = this;
            var eventName = 'attachFileSuccess' + this.clientId;
            window[eventName] = function (resp) {
                self.attachFileSuccess(resp);
            };
        },

        // only mobile
        addAttachEl: function (attach, errorMessage, errorClass) {
            var extension = attach.extention;
            attach.size = GO.util.getHumanizedFileSize(attach.size);
            if (GO.util.isImage(extension)) {
                this.$(".img_wrap").append(ImgTpl.render(attach)).show();
            } else {
                this.$(".file_wrap").append(FileTpl.render({
                    attach: attach,
                    errorMessage: errorMessage,
                    errorClass: errorClass,
                    fileSizeStr: attach.size,
                    style: GO.util.getFileIconStyle(attach)
                })).show();
            }
        },

        // 수정 화면 && 첨부파일이 있을 경우
        renderAttaches: function (attaches) {
            var self = this;
            var id = "editModeAttachArea";
            //원래 attachView에 edit모드일때 downloadUrl을 넘겨주지 않아야 하지만 works 디자인 마크업 구조상 파일이름에 <span class="name">마크업을 넣어주어야 하기때문에 어쩔수 없이
            //세번재 인자에 의미없는 값이라도 넣어서 span태그를 그리도록 해주고 a태그는 그린 후에 제거하여 강제로 디자인을 맞춘다.
            var attachView = AttachView.create(null, attaches, 'temp', "edit");

            attachView.done(function (view) {
                self.$("#" + id).replaceWith(view.el);
                $(view.$el).find('span.name').each(function (i, v) {
                    $(v).html($(v).text()).addClass('cursor_def');
                });
                view.$el.attr({
                    id: id
                });
                if (attaches.length > 0) {
                    self.$("#attachWrap").show();
                }
                view.$el.on('removedFile', function () {
                    if (GO.util.isMobile()) {
                        self.afterMobileAttachDelete();
                    }
                });
                self.listenTo(view.observer, 'removeFile', $.proxy(function () {
                    self.appletDocModel.set(self.getDataFromView());
                }, this));

                var currentSum = 0;
                _.each(attaches, function (element, i) {
                    currentSum += parseInt(element.size, 0);
                });

                $(view.$el)
                    .closest("div.dropZone")
                    .find("span.total_size")
                    .html(GO.util.displayHumanizedAttachSizeStatus(currentSum));
            });
        },

        attachDelete: function (e) {
            e.preventDefault();
            $(e.target).closest("li").remove();

            if (GO.util.isMobile()) {
                if (this.$("#attachWrap").find('li').length < 1) {
                    this.$("#attachWrap").hide();
                }
            } else {
                this.setViewedTotalAttachSize();
            }
            this.appletDocModel.set(this.getDataFromView());
        },

        // only mobile
        afterMobileAttachDelete: function () {
            if (this.$("#attachWrap").find('li').length < 2) {
                this.$("#attachWrap").hide();
            }
        },

        initFileUpload: function (options) {
            var useButtonWindow = GO.util.useButtonWindow();
            var self = this;
            var options = {
                el: this.$('#swfupload-control'),
                context_root: GO.contextRoot,
                useButtonWindow: useButtonWindow,
                button_title: lang["파일선택"],
                button_text: "<span class='txt'>" + lang["파일선택"] + "</span>",
                url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie'),
                textTmpl: [
                    "<span class='btn_file''>",
                    "{text}",
                    "<input type='file' name='file' title='{title}' multiple='' accept={accept} />",
                    "</span>"
                ].join(""),
                dropZone: 'div[data-cid="' + this.clientId + '"] div.dropZone',
                progressEl: "div[data-cid=" + this.clientId + "] div.progress"
            };

            if (useButtonWindow) {
                options['button_height'] = 26;
            }

            self.setViewedTotalAttachSize();

            var maxAttachSize = parseInt(GO.config('commonAttachConfig').maxAttachSize);
            var maxAttachByteSize = maxAttachSize * 1024 * 1024;
            var maxAttachNumber = parseInt(GO.config('commonAttachConfig').maxAttachNumber);

            (new FileUpload(options))
                .queue(function (e, data) {

                })
                .start(function (e, data) {
                    if (!GO.config('attachFileUpload')) {
                        $.goAlert(commonLang['파일첨부용량초과']);
                        self.$el.find('div.dropZone').removeClass('drag_file');
                        return false;
                    }

                    if (self.isSaaS) {
                        if (maxAttachByteSize < data.size) {
                            $.goMessage(GO.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                            self.$el.find('div.dropZone').removeClass('drag_file');
                            return false;
                        } else {
                            self.totalAttachSize += data.size;
                        }

                        var currentTotalAttachCount = $('div[data-cid=' + this.clientId).find("li").length + self.totalAttachCount + 1;
                        if (maxAttachNumber < currentTotalAttachCount) {
                            $.goMessage(GO.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
                            self.$el.find('div.dropZone').removeClass('drag_file');
                            return false;
                        } else {
                            self.totalAttachCount++;
                        }
                    }
                })
                .progress(function (e, data) {

                })
                .success(function (e, resp, fileItemEl) {
                    if (GO.util.fileUploadErrorCheck(resp)) {
                        fileItemEl.find(".item_file").append("<strong class='caution'>" + GO.util.serverMessage(resp) + "</strong>");
                        fileItemEl.addClass("attachError");
                    } else {
                        if (GO.util.isFileSizeZero(resp)) {
                            $.goAlert(GO.util.serverMessage(resp));
                            return false;
                        }
                    }

                    var hostId = resp.data.hostId;
                    var size = resp.data.fileSize;
                    var humanSize = GO.util.getHumanizedFileSize(size);
                    var fileName = resp.data.fileName;

                    fileItemEl.attr("data-hostId", hostId);
                    fileItemEl.attr("data-size", size);

                    if (GO.util.isImage(resp.data.fileExt)) {
                        fileItemEl.find(".item_image").append("<span class='name'>" + fileName + "</span>" + "<span class='size'>(" + humanSize + ")</span>");
                        self.$el.find('#createModeAttachArea').find("ul.img_wrap").append(fileItemEl);
                    } else {
                        self.$el.find('#createModeAttachArea').find("ul.file_wrap").append(fileItemEl);
                        $(fileItemEl).find('span.name').addClass('cursor_def');
                    }

                    self.appletDocModel.set(self.getDataFromView());
                    self.setViewedTotalAttachSize();
                    self.resetAttachSizeAndCount();
                })
                .complete(function (e, data) {

                })
                .error(function (e, data) {
                    if (data.jqXHR) {
                        if (data.jqXHR.statusText == "abort") {
                            $.goAlert(commonLang['취소되었습니다.']);
                        } else {
                            $.goAlert(commonLang['업로드에 실패하였습니다.']);
                        }
                        self.resetAttachSizeAndCount();
                    }
                });
        },

        // not used?
        validate: function () {
            if (this.model.get('required') && this.$("li").length < 1) {
                this.printErrorTo(this.$('.btn_minor_s'), worksLang['필수 항목입니다.']);
                return false;
            }
            return true;
        },

        getDataFromView: function () {
            var result = {};
            result[this.clientId] = this.getAttaches();
            return result;
        },

        getAttaches: function () {
            this.setViewedTotalAttachSize();
            var attaches = [];
            _.each(this.$("li:not(.attachError)"), function (attach) {
                if ($(attach).is(":hidden")) {
                    $(attach).remove();
                    return;
                }
                attaches.push({
                    id: $(attach).attr("data-id") || null,
                    path: $(attach).attr("data-path"),
                    name: $(attach).attr("data-name"),
                    hostId: $(attach).attr("data-hostId")
                });
            });
            return attaches;
        },

        getViewedTotalAttachSize: function () {
            var viewedTotalAttachSize = 0;
            $('div[data-cid=' + this.clientId).find("#dropZone li").each(function (index, element) {
                viewedTotalAttachSize += parseInt(element.getAttribute('data-size'), 0);
            });
            return viewedTotalAttachSize;
        },

        setViewedTotalAttachSize: function () {
            if (this.isSaaS) {
                var current = this.getViewedTotalAttachSize();
                $('div[data-cid=' + this.clientId).find("span.total_size").html(GO.util.displayHumanizedAttachSizeStatus(current));
            }
        },

        resetAttachSizeAndCount: function () {
            if (this.isSaaS) {
                this.totalAttachSize = 0;
                this.totalAttachCount = 0;
            }
        }
    });

    var DetailView = BaseDetailView.extend({
        render: function () {
            this.$body.html(renderDetailTpl({
                model: this.model.toJSON(),
                label: GO.util.escapeHtml(this.model.get('label'))
            }));
            this.renderAttach();
        },

        renderAttach: function () {
            var self = this;
            var id = "attachArea";
            var attachView = AttachView.create(null, this.appletDocModel.get(this.clientId), function (attach) {
                return GO.contextRoot + "api/works/applets/" + self.getAppletId() + "/docs/" + self.docId + "/download/" + attach.id;
            });

            attachView.done(function (view) {
                self.$("#" + id).replaceWith(view.el);
                view.$el.addClass("feed origin");
                view.$el.attr({
                    id: id,
                    "data-type": "view"
                });
            });
        }
    });

    var InputFileComponent = FormComponent.define(ComponentType.File, {
        name: commonLang['파일첨부'],
        valueType: 'FILES',
        group: 'basic',
        properties: {
            "label": {defaultValue: commonLang['파일첨부']},
            "hideLabel": {defaultValue: false},
            "guide": {defaultValue: ''},
            "guideAsTooltip": {defaultValue: true},
            "required": {defaultValue: false}
        },

        OptionView: OptionView,
        FormView: FormView,
        DetailView: DetailView
    });

    Registry.addComponent(InputFileComponent);
});
