;(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "i18n!report/nls/report",
            "i18n!nls/commons",
            "views/mobile/header_toolbar",
            "report/models/report_folder",
            "report/models/report",
            "hgn!report/templates/mobile/m_report_form",
            "attach_file",
            "components/go-fileuploader/mobile",
            'formutil',
            "GO.util",
            "GO.m.util"
        ],
        function (
            $,
            Backbone,
            GO,
            ReportLang,
            CommonLang,
            HeaderToolbarView,
            ReportFolderModel,
            ReportModel,
            ReportFormTmpl,
            AttachFile,
            FileUploader
        ) {
            var ReportFormView = Backbone.View.extend({
                el: "#content",

                events: {},
                initialize: function (options) {
                    this.options = options || {};
                    this.isCreateMode = this.options.reportId ? false : true;
                    this.model = this.isCreateMode ? new ReportModel() : ReportModel.get(this.options.reportId);
                    this.folderModel = this.isCreateMode ? ReportFolderModel.get(this.options.folderId) : (new ReportFolderModel()).set(this.model.get("folder"));
                    this.useForm = this.folderModel.get('formFlag');
                    this.editorTml = '<span class="comp_wrap" data-dsl="{{editor}}"></span>';
                    this.$el.off();
                    this.headerBindEvent();
                },
                headerBindEvent: function () {
                    GO.EventEmitter.off("trigger-action");
                    GO.EventEmitter.on('trigger-action', 'report-save', this.saveReport, this);
                },
                render: function () {
                    this.renderHeaderToolbar();
                    this.$el.html(ReportFormTmpl({
                        isPeriodic: this.folderModel.isPeriodic(),
                        titleDesc: ReportLang["제목을 입력하세요."],
                        title: this.folderModel.get("name")
                    }));

                    var self = this;
                    var content = '';
                    var name = '';
                    var attaches = [];
                    if (this.isCreateMode) {
                        this.getTempsavedData()
                            .done(function (data) {
                                self.savedData = data.data;
                                if (self.savedData.tempExist && confirm(ReportLang["작성중인 보고서가 있습니다. 불러오시겠습니까?"])) {
                                    if (self.savedData.status == "INVALID") {
                                        alert(ReportLang["양식이 변경되어 임시저장값을 불러올 수 없습니다."]);
                                        content = self.getCleanContent();
                                    } else {
                                        content = self.getSavedContent(self.savedData.content);
                                        name = self.savedData.name;
                                        attaches = self.savedData.attaches;
                                    }
                                } else {
                                    content = self.getCleanContent();
                                }
                            }).fail(function (data) {
                            alert(data.responseJSON.message);
                        });
                    } else { //편집모드
                        content = this.getSavedContent(this.model.get('content'));
                        name = this.model.get('name');
                        attaches = this.model.get("attaches");
                    }
                    this.renderContentAndName(content, name);

                    if (this.useSavedContent) {
                        AttachFile.edit("#attach_placeholder", attaches);
                    }

                    this.$el.addClass("write");
                    this.attachFileUploader();
                    return this;
                },
                renderHeaderToolbar: function () {
                    var headerToolbarOpt = {
                        isClose: true,
                        actionMenu: [{
                            id: "report-save",
                            text: CommonLang["등록"],
                            triggerFunc: "report-save"
                        }]
                    };
                    if (this.isCreateMode) {
                        headerToolbarOpt.closeCallback = $.proxy(this.tempsaveReport, this);
                    }
                    HeaderToolbarView.render(headerToolbarOpt);
                },
                getTempsavedData: function () {
                    var url = GO.contextRoot + "api/report/folder/" + this.folderModel.get("id") + "/form";
                    return $.ajax(url, {
                        type: 'GET',
                        async: false,
                        contentType: 'application/json'
                    });
                },
                getSavedContent: function (content) {
                    this.useSavedContent = true;
                    return this.useForm ? content : $(this.editorTml).append(content).prop('outerHTML');
                },
                getCleanContent: function () {
                    this.useSavedContent = false;
                    return this.useForm ? this.folderModel.get("form").content : this.editorTml;
                },
                renderContentAndName: function (content, name) {
                    this.formOpts = {
                        data: content,
                        contextRoot: GO.contextRoot,
                        userId: GO.session().id,
                        userProfileApi: 'api/user/profile',
                        deptName: this.folderModel.get("department").name
                    };
                    this.$el.find("#reportContent").setTemplate(this.formOpts);
                    this.$el.find("#name").val(name);
                },
                attachFileUploader: function () {
                    var _this = this;
                    var attachOption = {};

                    attachOption.success = function (r) {
                        var obj = (typeof r === "string") ? JSON.parse(r) : r.data;
                        $('#attach_wrap').show();
                        obj.mode = "edit";
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
                                $("ul.img_wrap").show().append(item.$el);
                            } else {
                                $("ul.file_wrap").show().append(item.$el);
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
                    };

                    attachOption.error = function (attachModel) {
                        alert(CommonLang['업로드에 실패하였습니다.']);
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
                        $.goValidation.attachValidate("#attach_wrap ul li", data, maxAttachSize);
                        if (GO.session().brandName == "DO_SAAS") {
                            FileUploader.attachFileValidateBySaaS(data.size);
                        }
                    } catch (e) {
                        var message = e.message;
                        if (message == "AttachSizeException") {
                            GO.util.delayAlert(GO.i18n(CommonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                        } else if (message == "AttachNumberExceptionBySaaS") {
                            GO.util.delayAlert(GO.i18n(CommonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", GO.config('commonAttachConfig').maxAttachNumber));
                            throw new Error("overMaxAttachNumber");
                        } else if (message == "NotFoundExtException") {
                            GO.util.delayAlert(CommonLang['첨부할 수 없는 파일 입니다.']);
                        }
                        throw new Error("Attach Validation Error");
                    }
                },

                tempsaveReport: function () {
                    if(confirm(CommonLang['임시저장을 하시겠습니까? 취소를 누르면 작성 중인 내용은 사라집니다.'])) {
                        this.setData("TEMP");
                        this.model.save(null, {
                            success: function () {
                                GO.util.toastMessage(ReportLang["임시저장 되었습니다."]);
                                goToPrev();
                            },
                            error: function (model, response) {
                                GO.util.toastMessage(CommonLang["저장에 실패 하였습니다."]);
                            }
                        });
                    } else {
                        goToPrev();
                    }

                    function goToPrev() {
                        if (GO.util.isAndroidApp()) {
                            window.GOMobile.pressBackKey();
                        } else {
                            window.history.back();
                        }
                    }
                },
                saveReport: function () {
                    var self = this;
                    this.setData();
                    this.model.save(null, {
                        success: function (model) {
                            var url = "report/folder/" + self.folderModel.get("id") + "/report/" + self.model.get("id");
                            GO.router.navigate(url, {trigger: true, replace: true});
                        }
                    });
                },
                setData: function (status) {
                    this.model.set({
                        status: status ? status : "DONE",
                        folder: {
                            id: this.folderModel.get("id")
                        },
                        name: this.$el.find("#name").val(),
                        content: this.$el.find("#reportContent").getFormData(),
                        attaches: FileUploader.getAttachInfo("#attach_wrap"),
                        contentType: "HTML"
                    });
                },
            }, {
                __instance__: null,
                create: function (packageName) {
                    this.__instance__ = new this.prototype.constructor({'packageName': packageName});
                    return this.__instance__;
                }
            });

            return ReportFormView;
        });
}).call(this);