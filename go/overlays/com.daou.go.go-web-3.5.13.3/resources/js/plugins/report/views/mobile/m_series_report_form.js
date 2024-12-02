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
            "formutil",
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
                    this.model = ReportModel.get(this.options.reportId);
                    var status = this.model.get('status');
                    this.isUndone = status == "UNDONE";
                    this.isTempsave = status == "TEMP";
                    this.isDone = status == "DONE";
                    var reportFolder = this.model.get('folder');
                    this.folderModel = this.isUndone || this.isTempsave ? ReportFolderModel.get(reportFolder.id) : (new ReportFolderModel()).set(reportFolder);
                    this.useForm = this.folderModel.get('formFlag');
                    this.editorTml = '<span class="comp_wrap" data-dsl="{{editor}}"></span>';
                    this.$el.off();
                    this.headerBindEvent();
                },
                headerBindEvent: function () {
                    GO.EventEmitter.off("trigger-action");
                    GO.EventEmitter.on('trigger-action', 'report-save', this.saveReport, this);
                    GO.EventEmitter.on('trigger-action', 'report-call-prev', this.callPrevReport, this);
                },
                render: function () {
                    this.renderHeaderToolbar();
                    this.$el.html(ReportFormTmpl({
                        isPeriodic: this.folderModel.isPeriodic(),
                        title: this.folderModel.get("name") + " > " + this.model.getSeriesStr()
                    }));

                    var content = '';
                    if (this.isDone) {
                        content = this.getSavedContent();
                    } else if (this.isTempsave) {
                        content = confirm(ReportLang["작성중인 보고서가 있습니다. 불러오시겠습니까?"]) ? this.getSavedContent() : this.getCleanContent();
                    } else { //undone or invalid
                        content = this.getCleanContent();
                    }
                    this.renderContent(content);

                    if (this.useSavedContent) {
                        AttachFile.edit("#attach_placeholder", this.model.get("attaches"));
                    }

                    this.$el.addClass("write");
                    this.attachFileUploader();
                    return this;
                },
                renderHeaderToolbar: function () {
                    var actionMenus = [{
                        id: "report-call-prev",
                        text: ReportLang["이전 회차 불러오기"],
                        triggerFunc: "report-call-prev"
                    }, {
                        id: "report-save",
                        text: CommonLang["등록"],
                        triggerFunc: "report-save"
                    }];

                    var headerToolbarOpt = {
                        isClose: true,
                        actionMenu: actionMenus
                    };
                    if (!this.isDone) {
                        headerToolbarOpt.closeCallback = $.proxy(this.tempsaveReport, this);
                    }
                    HeaderToolbarView.render(headerToolbarOpt);
                },
                getSavedContent: function (content) {
                    this.useSavedContent = true;
                    var savedContent = content ? content : this.model.get('content');
                    return this.useForm ? savedContent : $(this.editorTml).append(savedContent).prop('outerHTML');
                },
                getCleanContent: function () {
                    this.useSavedContent = false;
                    return this.useForm ? this.folderModel.get("form").content : this.editorTml;
                },
                renderContent: function (content) {
                    var opts = {
                        data: content,
                        contextRoot: GO.contextRoot,
                        userId: GO.session().id,
                        userProfileApi: 'api/user/profile',
                        deptName: this.model.get("reporter").deptName
                    };
                    this.$el.find("#reportContent").setTemplate(opts);
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

                    attachOption.error = function () {
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

                callPrevReport: function () {
                    if (confirm(ReportLang['이전회차를 불러오시겠습니까?'])) {
                        var self = this;
                        var url = GO.contextRoot + "api/report/" + this.model.get("id") + "/prev";

                        $.ajax(url, {
                            type: 'GET',
                            contentType: 'application/json',
                            dataType: 'json',
                            success: function (resp) {
                                var content = self.getSavedContent(resp.data.content);
                                self.renderContent(content);
                            },
                            error: function (response) {
                                var result = JSON.parse(response.responseText);
                                alert(result.message);
                            }
                        });
                    }
                },
                tempsaveReport: function () {
                    if(confirm(CommonLang['임시저장을 하시겠습니까? 취소를 누르면 작성 중인 내용은 사라집니다.'])) {
                        var model = this.setData("TEMP");
                        model.save(null, {
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
                    var model = this.setData();
                    model.save(null, {
                        success: function (model) {
                            var url = "report/series/" + self.model.get("series").id + "/report/" + self.model.get("id");
                            GO.router.navigate(url, {trigger: true, replace: true});
                        }
                    });
                },
                setData: function (status) {
                    var model = new ReportModel();
                    var reportId = this.model.get("id");
                    var content = this.$el.find("#reportContent").getFormData();
                    model.set({
                        id: reportId,
                        content: content,
                        status: status ? status : "DONE",
                        attaches: FileUploader.getAttachInfo("#attach_wrap"),
                        contentType: "HTML",
                        folder: {
                            id: this.folderModel.get("id")
                        }
                    });
                    return model;
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