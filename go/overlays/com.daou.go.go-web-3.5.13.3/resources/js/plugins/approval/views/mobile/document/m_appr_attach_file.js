define([
        "jquery",
        "backbone",
        "app",
        "i18n!nls/commons",
        "i18n!approval/nls/approval",

        "approval/models/ref_document",

        "approval/views/mobile/document/m_preview",
        "views/mobile/layer_toolbar",
        "views/mobile/header_toolbar",
        "approval/views/mobile/document/m_related_document_attach",

        "hgn!approval/templates/mobile/document/m_appr_attach_file",
        "hgn!approval/templates/mobile/document/m_attach_reference_item",

        "attach_file",
        "components/go-fileuploader/mobile"
    ],
    function (
        $,
        Backbone,
        App,
        commonLang,
        approvalLang,
        RefDocumentModel,
        PreView,
        LayerToolbarView,
        HeaderToolbarView,
        RelatedDocumentAttachView,
        ApprAttachFileTpl,
        AttachReferenceItemTpl,
        MobileAttachFile,
        FileUploader
    ) {
        var lang = {
            'del': commonLang['삭제'],
            '확인': commonLang['확인'],
            'msg_duplicate_approval_document': approvalLang['중복된 관련문서가 있습니다'],
            '상세내용조회': approvalLang['상세 내용 조회'],
            '결재문서첨부': approvalLang['결재 문서 첨부']
        };

        var apprAttachFile = Backbone.View.extend({

            initialize: function (options) {
                GO.util.appLoading(true);
                this.docModel = this.options.docModel;
                this.docId = this.docModel.documentId;
                this.toolBarData = this.options.toolBarData;
                this.mode = this.options.mode;
                this.layerToolbarView = LayerToolbarView;
            },

            unbindEvent: function () {
                this.$el.off('vclick', '#related_document_upload');
                this.$el.off('vclick', '#filePreview');
                this.$el.off('vclick', '#tempFilePreview');
                this.$el.off("vclick", "#referenceAttachDelete");
            },

            bindEvent: function () {
                this.$el.on('vclick', '#related_document_upload', $.proxy(this.doRelatedDocument, this));
                this.$el.on('vclick', '#filePreview', $.proxy(this.refDocPreview, this));
                this.$el.on('vclick', '#tempFilePreview', $.proxy(this.tempFilePreview, this));
                this.$el.on("vclick", "#referenceAttachDelete", $.proxy(this.referenceAttachDelete, this));
            },

            render: function () {
                GO.util.pageDone();
                GO.util.appLoading(true);
                this.unbindEvent();
                this.bindEvent();

                this.$el.html(ApprAttachFileTpl({
                    isMobileApp: GO.config('isMobileApp'),
                    isAndroidApp: GO.util.isAndroidApp()
                }));
                this.makeAttachTmpl();
                return this;
            },
            attachFileUploader: function () {
                var attachOption = {};

                attachOption.success = $.proxy(function (r) {
                    var _this = this;
                    var obj = (typeof r === "string") ? JSON.parse(r) : r.data;
                    $("#attachPart").show();
                    obj.mode = "edit";
                    var deferred = MobileAttachFile.makeTempItem(obj);

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
                            $(".img_wrap").append(item.$el);
                        } else {
                            $(".file_wrap").append(item.$el);
                        }
                        item.$el.on('removedFile', function (o, list) {
                            var e = list.el;
                            e.preventDefault();
                            $(e.currentTarget).parents('li').first().remove();
                            var $attachPart = $("#attachPart");
                            $("div.option_display").data("attachable", "true");
                            if ($attachPart.find("li").size() < 1) {
                                $attachPart.hide();
                            }
                            return false;
                        });
                    });
                    return deferred.promise();
                }, this);

                attachOption.error = function (e) {
                    alert(commonLang['업로드에 실패하였습니다.']);
                };

                FileUploader.bind(this.$el.find('#go-fileuploader'), attachOption);
            },

            attachValidate: function (file) {
                var maxAttachSize = null;
                var data = GO.util.getFileNameAndTypeData(file);
                if (GO.config('allowedFileUploadSize')) {
                    maxAttachSize = GO.config('allowedFileUploadSize') / 1024 / 1024;
                }
                try {
                    $.goValidation.attachValidate("#attachPart ul li", data, maxAttachSize);
                    if (GO.session().brandName == "DO_SAAS") {
                        FileUploader.attachFileValidateBySaaS(data.size);
                    }
                } catch (e) {
                    var message = e.message;

                    if (message == "AttachSizeException") {
                        GO.util.delayAlert(App.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                    } else if (message == "AttachNumberExceptionBySaaS") {
                        GO.util.delayAlert(App.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", GO.config('commonAttachConfig').maxAttachNumber));
                        throw new Error("overMaxAttachNumber");
                    } else if (message == "NotFoundExtException") {
                        GO.util.delayAlert(commonLang['첨부할 수 없는 파일 입니다.']);
                    }
                    throw new Error("Attach Validation Error");
                }
            },

            referenceAttachDelete: function (e) {
                $(e.target).parents("li").first().remove();
                var attachWrap = $(".option_display");
                attachWrap.find("li").length < 1 && attachWrap.removeClass("option_display");
                return false;
            },

            makeAttachTmpl: function () {
                var _this = this;
                $.each(this.docModel.attaches, function (i, v) {
                    var obj = {
                        id: v.id,
                        fileName: v.name,
                        fileExt: v.extention,
                        fileSize: v.size,
                        filePath: v.path,
                        mobilePreview: v.mobilePreview,
                        download: v.download,
                        preview: v.preview,
                        encrypt: v.encrypt,
                        thumbnail: v.thumbSmall,
                        mode: !_.isUndefined(v.mode) ? v.mode : _this.mode
                    };
                    var deferred = MobileAttachFile.makeTempItem(obj);
                    deferred.done(function (item) {
                        var $wrapAttach = $(".wrap_attach");
                        if (GO.util.isImage(obj.fileExt)) {
                            $wrapAttach.children(".img_wrap").append(item.$el);
                        } else {
                            $wrapAttach.children(".file_wrap").append(item.$el);
                        }
                    });
                });

                $.each(this.docModel.references, function (i, v) {
                    _this.$el.find("#attachPart ul.file_wrap").append(AttachReferenceItemTpl({
                        docnum: v.docNum,
                        id: v.id,
                        title: v.title,
                        lang: lang
                    }));
                });

            },

            doRelatedDocument: function () {
                console.log("doRelatedDocument");
                var $documentAction = $('#document_action');

                var toolBarData = {
                    title: lang['결재문서첨부'],
                    rightButton: {
                        text: lang['확인'],
                        callback: $.proxy(function () {
                            var selected = $('.list_apprChk > li');
                            var count = 0;
                            var ids = [];
                            var docnums = [];
                            var title = [];
                            $(selected).each(function (index, html) {
                                if ($(html).find("input[type=checkbox]").is(':checked')) {
                                    count++;
                                    ids.push($(html).find("input[type=checkbox]").attr('data-id'));
                                    docnums.push($(html).find("input[type=checkbox]").attr('data-docnum'));
                                    title.push($(html).find(".txt").text());
                                }
                            });
                            var original_ids = [];
                            var original_li = $(".file_wrap").children(".refDoc");

                            var isExist = false;
                            $(original_li).each(function (k, v) {
                                original_ids.push($(v).attr('data-id'));
                            });
                            $(ids).each(function (k, v) {
                                $(original_ids).each(function (index, value) {
                                    if (v == value) {
                                        isExist = true;
                                    }
                                });
                            });

                            if (isExist) {
                                GO.util.toastMessage(lang.msg_duplicate_approval_document);
                                return false;
                            }

                            for (var i = 0; i < count; i++) {
                                $(".wrap_attach").find('ul.file_wrap').append(AttachReferenceItemTpl({
                                    docnum: docnums[i],
                                    id: ids[i],
                                    title: title[i],
                                    lang: lang
                                }));
                            }
                            this.docActionRelease();
                        }, this)
                    },
                    cancelButton: {
                        callback: $.proxy(function () {
                            this.docActionRelease();
                        }, this)
                    }
                };

                this.relatedDocumentView = new RelatedDocumentAttachView({
                    toolBarData: toolBarData,
                    isCheckboxVisible: true,
                    docId: this.docId
                });

                $('#document_main').hide();
                $documentAction.show();
                this.relatedDocumentView.setElement($documentAction).render();
            },

            refDocPreview: function (e) {
                var refDocId = $(e.currentTarget).attr('data-id');
                var refDocModel = RefDocumentModel.create(this.docId, refDocId);
                refDocModel.fetch({async: false});
                var docBody = refDocModel.get('document').docBodyContent;
                var docAttaches = refDocModel.get('document').attaches;
                var docReferences = refDocModel.get('document').references;
                this.preView = new PreView({
                    title: lang['view'],
                    docId: refDocId,
                    docBody: docBody,
                    attaches: docAttaches,
                    references: docReferences,
                    callback: function (e) {
                        this.$el.remove();
                        if (e) {
                            e.stopPropagation();
                        }
                        return false;
                    }
                });
                this.preView.render();
                $('html').scrollTop(0);
            },

            tempFilePreview: function (e) {
                e.stopPropagation();
                e.preventDefault();
                var currentEl = $(e.currentTarget).closest('li');
                var param = {
                    "filePath": currentEl.data('path'),
                    "fileName": currentEl.data('name'),
                    "hostId": $(e.currentTarget).data("hostid")
                };
                GO.util.showTempAttach(param);
            },

            docActionRelease: function () {
                HeaderToolbarView.render(this.toolBarData);
                $('#document_main').show();
                $('#document_action').hide();
                this.relatedDocumentView.release();
            }
        });
        return apprAttachFile;
    });