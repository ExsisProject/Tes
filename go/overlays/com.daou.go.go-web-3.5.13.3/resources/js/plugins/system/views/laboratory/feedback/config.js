define(function (require) {
    var $ = require('jquery');
    var Backbone = require('backbone');
    var GO = require('app');

    var LaboratoryConfigModel = require('system/models/laboratory/feedback_config');
    var FileUpload = require('file_upload');

    var Template = require('hgn!system/templates/laboratory/feedback/config');

    var adminLang = require('i18n!admin/nls/admin');
    var commonLang = require('i18n!nls/commons');

    require("jquery.go-preloader");
    require("attach_file");
    require("GO.util");

    var lang = {
        "save": commonLang["저장"],
        "cancel": commonLang["취소"],
        "file_ext_error": commonLang["확장자가 {{arg1}}인 것만 첨부할 수 있습니다."]
    };

    return Backbone.View.extend({
            events: {
                "click #save": "save",
                "click #cancel": "cancel",
                'click input:checkbox': "_toggleUseConfigCheckbox",
                'click span.ic_del': "_clickDeleteAttack"
            },

            initialize: function () {
                var _this = this;
                $('.breadcrumb .path').html("실험실 피드백 설정");
                if (!GO.useLabFeedback) {
                    $.goMessage("사용이 불가능한 서비스입니다.");
                    this.cancel();
                }

                this.isCreate = (this.options.feedbackConfigId === undefined);
                this.model = new LaboratoryConfigModel();
                if (this.isCreate) {
                    this.model.setData();
                } else {
                    this.model.set({id: this.options.feedbackConfigId});
                    this.model.fetch({async: false})
                        .done(function () {
                            _this.model.setOldUseConfig(_this.model.get("useConfig"))
                        });
                }
            },

            render: function () {
                this._initContent();
                this._initDatepicker();
                this._initFileUpload("file-control-simple", "fileCompleteSimple");
                this._initFileUpload("file-control-content", "fileCompleteContent");
            },

            save: function () {
                var preloader = $.goPreloader();
                preloader.render();

                this._setData();

                if (!this._validate()) {
                    preloader.release();
                    return false;
                }

                this.model.save(null, {
                    success: function () {
                        preloader.release();
                        var url = "system/extension/laboratory/feedback/configs";
                        GO.router.navigate(url, {trigger: true});
                        $.goMessage("저장되었습니다.");
                    },
                    error: function (model, response) {
                        preloader.release();
                        if (response.message) $.goAlert(response.message);
                        else $.goMessage(commonLang["실패했습니다."]);
                    }
                });
            },

            cancel: function () {
                GO.router.navigate('system/extension/laboratory/feedback/configs', {trigger: true});
            },

            _initContent: function () {
                this.$el.html(Template({
                    lang: lang,
                    data: $.extend({}, this.model.toJSON(), {
                        id: this.model.get("id"),
                        usgConfig: this.model.get("useConfig"),
                        startDate: this.model.getDisplayStartDate(),
                        endDate: this.model.getDisplayEndDate()
                    })
                }));

                if (!this.isCreate) {
                    var simpleImg = this.model.get("simpleImg");
                    var contentImg = this.model.get("contentImg");
                    if (!_.isUndefined(simpleImg)) {
                        var simpleImgTmpl = this._initImgContent(this.model.id, simpleImg);
                        this.$el.find("#fileCompleteSimple").html(simpleImgTmpl);
                    }

                    if (!_.isUndefined(contentImg)) {
                        var contentImgTmpl = this._initImgContent(this.model.id, contentImg);
                        this.$el.find("#fileCompleteContent").html(contentImgTmpl);
                    }
                }

            },

            _initImgContent: function (id, imgModel) {
                return '<li data-config-id="' + id + '" data-id="' + imgModel.id + '" data-name="' + imgModel.name + '" data-size="' + imgModel.size + '">' +
                    '<span class="item_image">' +
                    '<span class="thumb">' +
                    '<a class="fancybox-button">' +
                    '<img src="' + imgModel.thumbSmall + '">' +
                    '</a>' +
                    '</span>' +
                    '<span class="btn_wrap" title="삭제">' +
                    '<span class="ic_classic ic_del"></span>' +
                    '</span>' +
                    '</span>' +
                    '</li>';
            },

            _initFileUpload: function ($fileControlId, $fileCompleteId) {
                var self = this,
                    options = {
                        el: "#" + $fileControlId,
                        context_root: GO.contextRoot,
                        button_text: "<span class='buttonText'>파일첨부</span>",
                        url: "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
                    };

                (new FileUpload(options))
                    .queue(function (e, data) {
                    })
                    .start(function (e, data) {
                        var attachCount = self.$el.find("#" + $fileCompleteId + " > li").size();
                        if (attachCount > 0) {
                            $.goMessage("이미지 파일은 한개만 업로드 가능합니다.");
                            return false;
                        }

                        var reExt = new RegExp("png|jpg|jpeg|gif|bmp", "gi");
                        if (!reExt.test(data.name)) {
                            $.goMessage(GO.i18n(lang.file_ext_error, {arg1: "이미지 파일만 가능 합니다(png, jpg, jpeg, gif, bmp)"}));
                            return false;
                        }
                    })
                    .progress(function (e, data) {
                    })
                    .success(function (e, data, fileItemEl) {
                        if (GO.util.fileUploadErrorCheck(data)) {
                            fileItemEl.find(".item_file").append("<strong class='caution'>" + GO.util.serverMessage(data) + "</strong>");
                            fileItemEl.addClass("attachError");
                        } else {
                            if (GO.util.isFileSizeZero(data)) {
                                $.goAlert(GO.util.serverMessage(data));
                                return false;
                            }
                        }

                        fileItemEl.attr("data-hostId", data.data.hostId);
                        fileItemEl.attr("data-file-size", data.data.fileSize);
                        self.$el.find("#" + $fileCompleteId).html(fileItemEl);
                    })
                    .complete(function (e, data) {
                    })
                    .error(function (e, data) {
                    });
            },

            _initDatepicker: function () {
                var startDate = $("#startDate");
                var endDate = $("#endDate");

                $.datepicker.setDefaults($.datepicker.regional[GO.config("locale")]);

                startDate.datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: true,
                    changeYear: true,
                    yearSuffix: "",
                    minDate: GO.util.customDate(new Date(), "YYYY-MM-DD"),
                    onSelect: function (selectedDate) {
                        endDate.datepicker("option", "minDate", selectedDate);
                    }
                });

                endDate.datepicker({
                    dateFormat: "yy-mm-dd",
                    changeMonth: true,
                    changeYear: true,
                    yearSuffix: "",
                    minDate: this.model.getDisplayStartDate()
                });
            },

            _setData: function () {
                var $simpleImg = $("#fileCompleteSimple > li");    // 업로드 1개만 가능!!
                var $contentImg = $("#fileCompleteContent > li");    // 업로드 1개만 가능!!
                this.model.set({
                    "title": this.$el.find("#title").val().trim(),
                    "appliedVersion": this.$el.find("#appliedVersion").val(),
                    "startDate": this.model.convertToSaveDate(this.$el.find("#startDate").val(), '00', '00'),
                    "endDate": this.model.convertToSaveDate(this.$el.find("#endDate").val(), '23', '59'),
                    "useConfig": $('#usgConfig').is(':checked'),
                    "simpleTitle": this.$el.find("#simpleTitle").val().trim(),
                    "simpleDesc": this.$el.find("#simpleDesc").val().trim(),
                    "simpleImg": {
                        id: $simpleImg.attr("data-id") || null,
                        path: $simpleImg.attr("data-id") ? "" : $simpleImg.attr("data-path"),
                        name: $simpleImg.attr("data-name"),
                        hostId: $simpleImg.attr("data-hostId"),
                        size: $simpleImg.attr("data-size")
                    },
                    "contentImg": {
                        id: $contentImg.attr("data-id") || null,
                        path: $contentImg.attr("data-id") ? "" : $contentImg.attr("data-path"),
                        name: $contentImg.attr("data-name"),
                        hostId: $contentImg.attr("data-hostId"),
                        size: $contentImg.attr("data-size")
                    }
                });
            },

            _toggleUseConfigCheckbox: function (e) {
                if ($(e.currentTarget).is(':checked')) {
                    $(e.currentTarget).attr('checked', true);
                    $('label[for=usgConfig]').text("사용중");
                } else {
                    this.$el.find('#checkedAll').attr('checked', false);
                    $(e.currentTarget).attr('checked', false);
                    $('label[for=usgConfig]').text("사용해제");
                }
            },

            _clickDeleteAttack: function (e) {
                console.log("system feedback form _clickDeleteAttack");
                $(e.target).parents('li').first().remove();
            },

            _validate: function () {
                if (!$.goValidation.isCheckLength(0, 20, this.model.get("title"))) {
                    this.$el.find("#title_validation").show();
                    this.$el.find("#title").focus();
                    return false;
                } else {
                    this.$el.find("#title_validation").hide();
                }

                var regex = /\d+.\d+.\d+.\d+/;
                if (!regex.test(this.model.get("appliedVersion"))) {
                    $.goMessage("포맷에 맞게 입력해주세요. ex) 3.5.0.0");
                    this.$el.find("#appliedVersion").focus();
                    return false;
                }

                if (!$.goValidation.isCheckLength(1, 20, this.model.get("simpleTitle"))) {
                    $.goMessage("1자 이상 20자 이하로 입력해주세요.");
                    this.$el.find("#simpleTitle").focus();
                    return false;
                }

                if (!$.goValidation.isCheckLength(1, 128, this.model.get("simpleDesc"))) {
                    $.goMessage("1자 이상 128자 이하로 입력해주세요.");
                    this.$el.find("#simpleDesc").focus();
                    return false;
                }

                var simpleImgCount = this.$el.find("#fileCompleteSimple > li").size();
                if (simpleImgCount < 1) {
                    $.goMessage("팝업 심플 이미지 파일은 반드시 한개를 첨부해야합니다.");
                    return false;
                }

                var contentImgCount = this.$el.find("#fileCompleteContent > li").size();
                if (contentImgCount < 1) {
                    $.goMessage("상세페이지 본문 이미지 파일은 반드시 한개를 첨부해야합니다.");
                    return false;
                }

                return true;
            }
        },

        {
            __instance__: null
        });

});