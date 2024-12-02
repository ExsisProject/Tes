(function() {
    
    define([
        "jquery",
        "underscore", 
        "backbone",
        "hogan",
        "app", 

        "i18n!nls/commons",
        "i18n!report/nls/report",

        "hgn!report/templates/report_form",
        "hgn!report/templates/report_attaches_file",
        "hgn!report/templates/report_attaches_image",

        "report/models/report",
        "report/models/report_folder",

        "file_upload",
        "report/views/report_title",
        "jquery.go-popup",
        "go-webeditor/jquery.go-webeditor",
        "formutil"
    ], 
    
    function(
        $, 
        _, 
        Backbone,
        Hogan,
        GO, 

        CommonLang,
        ReportLang,

        ReportFormTmpl,
        ReportAttachesFileTmpl,
        ReportAttachesImageTmpl,

        ReportModel,
        ReportFolderModel,

        FileUpload,
        ReportTitleView
    ) {

        var lang = {
            temp_save_call: ReportLang["임시저장 불러오기"],
            temp_report_msg: ReportLang["작성중인 보고서가 있습니다. 불러오시겠습니까?"],
            temp_report_success: ReportLang["임시저장 되었습니다."],
            temp_report_error: ReportLang["양식이 변경되어 임시저장값을 불러올 수 없습니다."],
            tiny_empty_msg: ReportLang["생성된 보고서가 없습니다."],
            save: ReportLang["등록"],
            attach_file: CommonLang["파일첨부"],
            remove: CommonLang["삭제"],
            title: ReportLang["제목"],
            temp_save: CommonLang["임시저장"],
            '이 곳에 파일을 드래그 하세요': CommonLang['이 곳에 파일을 드래그 하세요'],
            '이 곳에 파일을 드래그 하세요 또는': CommonLang['이 곳에 파일을 드래그 하세요 또는'],
            '파일선택': CommonLang['파일선택'],
            '첨부파일 1개의 최대 용량은 NNN MB 이며 최대 N개 까지 등록 가능합니다':
                GO.i18n(CommonLang["첨부파일 1개의 최대 용량은 {{size}} MB 이며 최대 {{number}} 개 까지 등록 가능합니다"],
                    {"size": GO.config('commonAttachConfig').maxAttachSize, "number": GO.config('commonAttachConfig').maxAttachNumber})
        };

        return Backbone.View.extend({
            el : "#content",
            
            events: {
                "click #actions a.save": "save",
                "click #actions a.tempSave": "tempSave",
                "click span.ic_del" : "deleteFile",

                'dragover #dropZone': '_dragOver',
                'dragleave #dropZone': '_dragLeave',
                'drop #dropZone': '_drop',
            }, 
            
            initialize: function(options) {
            	this.options = options || {};
                this.$el.off();
                this.folder = ReportFolderModel.get(this.options.folderId);
                this.isCreate = this.options.reportId ? false : true;
                this.report = this.isCreate ?  new ReportModel() : ReportModel.get(this.options.reportId);
                this.$el.addClass("go_renew");
                this.isSaaS = GO.session().brandName == "DO_SAAS";
                this.totalAttachSize = 0;
                this.totalAttachCount = 0;
            },

            render: function () {
                var self = this;
                var content = "";
                var data = this.report.toJSON();

                this.$el.html(ReportFormTmpl({
                    data: data,
                    lang: lang,
                    isCreate: this.isCreate,
                    isSaaS: this.isSaaS
                }));
                
                $("#reportCreateForm").on("edit:complete", function () {
                    $("#reportCreateForm").off("edit:complete");
                    self.checkTempSave();
                });

                if (this.folder.get("formFlag")) {
                    content = this.isCreate ? this.folder.get("form").content : this.report.get("content");
                } else if (!this.isCreate) {
                    content = GO.util.convertMSWordTag(this.report.get("content")); //ms word 태그를 공백으로 치환

                    if (this.report.get("contentType") == 'TEXT') {
                        content = GO.util.convertRichText(content);
                    }
                }

                this._setContent(content);
                this._setAttaches(data.attaches);
                this.setViewedTotalAttachSize();
                this.initFileUpload();

                ReportTitleView.create({
                    text: this.folder.get("name"),
                    meta_data: this.folder.get("department").name
                });

                $("#side").trigger("set:leftMenu", this.folder.get("id"));
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

            _setContent: function (content) {
                var editorContent = content || "",
                    self = this;

                if (this.folder.get("formFlag")) {
                    $("#reportCreateForm").html("");

                    var representativeDeptName = this.folder.get("department").name;

                    $.go(GO.contextRoot + "api/user/representative/dept", "", {
                        qryType: 'GET',
                        async: true,
                        contentType: 'application/json',
                        responseFn: function (response) {
                            var dept = response.data;
                            if (dept) {
                                representativeDeptName = dept.name;
                            }
                            var opts = {
                                data: editorContent,
                                contextRoot: GO.contextRoot,
                                userId: GO.session().id,
                                userProfileApi: 'api/user/profile',
                                deptName: representativeDeptName
                            };

                            $("#reportCreateForm").setTemplate(opts);
                        },
                        error: function () {
                            var opts = {
                                data: editorContent,
                                contextRoot: GO.contextRoot,
                                userId: GO.session().id,
                                userProfileApi: 'api/user/profile',
                                deptName: representativeDeptName
                            };

                            $("#reportCreateForm").setTemplate(opts);
                        }
                    });

                } else {
                    setTimeout(function () {
                        self._initSmartEditor("editor", editorContent);
                    }, 1000);
                }
            },

            _setAttaches: function(attaches) {
                var files = [];
                var images = [];
                if (attaches) {
                    $.each(attaches, function () {
                        this.icon = GO.util.getFileIconStyle({extention: this.extention});
                        this.humanSize = GO.util.getHumanizedFileSize(this.size);

                        if (GO.util.isImage(this.extention)) {
                            images.push(this);
                        } else {
                            files.push(this);
                        }
                    });
                }

                if(images.length > 0) {
                    this.$el.find("#imgWrap").html(ReportAttachesImageTmpl({images:  images}));
                }
                if(files.length > 0) {
                    this.$el.find("#fileWrap").html(ReportAttachesFileTmpl({files: files}));
                }
            },

            deleteFile: function (e) {
                $(e.currentTarget).parents("li").remove();
                this.setViewedTotalAttachSize();
            },

            checkTempSave: function () {
                var url = GO.contextRoot + "api/report/folder/" + this.folder.get("id") + "/form",
                    self = this;

                $.go(url, "", {
                    qryType: 'GET',
                    async: true,
                    contentType: 'application/json',
                    responseFn: function (response) {
                        if (response.data.tempExist) {
                            if (response.data.status == "INVALID") {
                                $.goAlert(ReportLang["양식이 변경되어 임시저장값을 불러올 수 없습니다."]);
                                return;
                            }

                            $.goConfirm(
                                lang.temp_save_call,
                                lang.temp_report_msg,
                                function () {
                                    $("#reportName").val(response.data.name);
                                    self._setContent(response.data.content);
                                    self._setAttaches(response.data.attaches);
                                    self.setViewedTotalAttachSize();
                                }
                            );
                        }
                    },
                    error: function (error) {
                    }
                });
            },

            tempSave: function () {
                if (!this.folder.get("formFlag") && !GO.Editor.getInstance("editor").validate()) {
                    this.showMimeError();
                    return false;
                }

                if (this.folder.get("formFlag") && !this.formValidate()) {
                    this.showMimeError();
                    return false;
                }

                this.report.set(this.getData());
                this.report.set({status: "TEMP", contentType: "HTML"});
                if (!this.validate()) {
                    return false;
                }

                var self = this;
                this.report.save(null, {
                    success: function () {
                        $.goMessage(lang.temp_report_success);
                        self.render();
                    }
                });
            },

            renderGrid: function () {
                this.dataTable = $.goGrid({
                    el: "#report_list",
                    method: 'GET',
                    url: GO.contextRoot + 'api/report/department/' + this.options.deptId + "/inactive",
                    emptyMessage:
                        "<p class='data_null'> " +
                            "<span class='ic_data_type ic_no_data'></span>" +
                            "<span class='txt'>" + lang.tiny_empty_msg + "</span>" +
                        "</p>",
                    defaultSorting: [[1, "asc"]],
                    sDomUse: true,
                    checkbox: true,
                    checkboxData: 'id',
                    columns: [{
                        mData: "createdAt",
                        bSortable: false,
                        sClass: "date",
                        sWidth: '180px',
                        fnRender: function (obj) {
                            var data = obj.aData;
                            return GO.util.basicDate(data.createdAt);
                        }
                    }, {
                        mData: "name", bSortable: false, sClass: "subject", sWidth: '1170px'
                    }, {
                        mData: null,
                        bSortable: false,
                        sClass: "reporter",
                        sWidth: '180px',
                        fnRender: function (obj) {
                            var data = obj.aData;
                            return data.reporter.name + " " + data.reporter.position;
                        }
                    }],

                    fnDrawCallback: function () {
                        self.$el.find('tr>td:nth-child(2) span').css('cursor', 'pointer').click(function (e) {
                            var $el = $(e.currentTarget),
                                url = "report/folder/series/" + $el.attr("data-id");

                            GO.router.navigate(url, {trigger: true});
                        });
                    }
                });
            },

            save: function () {
                if (!this.folder.get("formFlag") && !GO.Editor.getInstance("editor").validate()) {
                    this.showMimeError();
                    return false;
                }

                if (this.folder.get("formFlag") && !this.formValidate()) {
                    this.showMimeError();
                    return false;
                }

                var self = this;

                this.report.set(this.getData());
                this.report.set({status: "DONE", contentType: "HTML"});
                if (!this.validate()) {
                    return false;
                }

                this.report.save(null, {
                    success: function () {
                        var url = "report/folder/" + self.folder.get("id") + "/report/" + self.report.get("id");
                        GO.router.navigate(url, {trigger: true});
                    }
                });
            },
            
            // 양식편집기 selector.. formparse 에서 mime 에러 처리가 어려워 여기에서 처리한다.
            formValidate : function() {
            	var returnFlag = true;
            	
            	_.each($('span[data-dsl*="editor"]'), function(editorEl) {
					var editorId = $(editorEl).attr("id");
					returnFlag = GO.Editor.getInstance(editorId).validate(); 
				}, this);
            	
            	return returnFlag;
            },

            getData: function () {
                return {
                    name: this.$el.find("#reportName").val(),
                    content: this.getContent(),
                    attaches: this.getAttaches(),
                    folder: {
                        id: this.folder.id
                    }
                };
            },
            
            showMimeError : function() {
            	$.goError(CommonLang['마임 사이즈 초과']);
            },

            getContent: function () {
                if (this.folder.get("formFlag")) {
                    return $("#reportCreateForm").getFormData();
                } else {
                    return GO.Editor.getInstance("editor").getContent();
                }
            },

            validate: function () {
                if (this.report.get("name").length == 0) {
                    $.goMessage(CommonLang["필수항목을 입력하지 않았습니다."]);
                    $("#reportName").focus();
                    return false;
                }

                if (!$.goValidation.isCheckLength(2, 100, this.report.get("name"))) {
                    $.goMessage(GO.i18n(CommonLang["0자이상 0이하 입력해야합니다."], {arg1: 2, arg2: 100}));
                    $("#reportName").focus();
                    return false;
                }

                return true;
            },

            getAttaches: function () {
                var attaches = [];

                $.each(this.$el.find("#fileComplete li:not(.attachError)"), function (index, data) {
                    var $el = $(data);

                    attaches.push({
                        id: $el.attr("data-id"),
                        name: $el.attr("data-name"),
                        path: $el.attr("data-path"),
                        hostId: $el.attr("host-id"),
                        size: $el.attr("data-size")
                    })
                });

                return attaches;
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

                var maxAttachSize = parseInt(GO.config('commonAttachConfig').maxAttachSize);
                var maxAttachByteSize = maxAttachSize * 1024 * 1024;
                var maxAttachNumber = parseInt(GO.config('commonAttachConfig').maxAttachNumber);

                (new FileUpload(options))
                .queue(function (e, data) {

                })
                .start(function (e, data) {
                    if (!GO.config('attachFileUpload')) {
                        $.goAlert(CommonLang['파일첨부용량초과']);
                        self.$("#dropZone").removeClass('drag_file');
                        return false;
                    }

                    if (self.isSaaS) {
                        if (maxAttachByteSize < data.size) {
                            $.goMessage(GO.i18n(CommonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                            self.$("#dropZone").removeClass('drag_file');
                            return false;
                        } else {
                            self.totalAttachSize += data.size;
                        }

                        var currentTotalAttachCount = $('#fileWrap').children().size() + $("#imgWrap").children().size() + self.totalAttachCount + 1;
                        if (maxAttachNumber < currentTotalAttachCount) {
                            $.goMessage(GO.i18n(CommonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
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

                    var size = serverData.data.fileSize;
                    var humanSize = GO.util.getHumanizedFileSize(size);
                    var extension = serverData.data.fileExt;
                    var fileName = serverData.data.fileName;

                    fileItemEl.attr("data-size", serverData.data.fileSize);

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
                            $.goAlert(CommonLang['취소되었습니다.']);
                        } else {
                            $.goAlert(CommonLang['업로드에 실패하였습니다.']);
                        }
                        self.resetAttachSizeAndCount();
                    }
                });
            },

            release: function () {
                this.childView.release();
                this.$el.off();
                this.$el.empty();
                this.remove();
            },

            _initSmartEditor: function (targetId, content) {
                var lang = GO.session('locale');
                if (GO.Editor.getInstance(targetId) && GO.Editor.getInstance(targetId).$el.parents("body").length > 0) {
                    onLoad();
                }

                $("#" + targetId).goWebEditor({
                    contextRoot: GO.config("contextRoot"),
                    lang: lang,
                    onLoad: onLoad
                });

                function onLoad() {
                    GO.Editor.getInstance(targetId).setContent(content || "");
                    $("#" + targetId).trigger("edit:complete");
                }
            },

            getViewedTotalAttachSize: function () {
                var viewedTotalAttachSize = 0;
                $("#fileWrap, #imgWrap").find('li').each(function () {
                    viewedTotalAttachSize += parseInt(this.getAttribute('data-size'), 0);
                });
                return viewedTotalAttachSize;
            },

            setViewedTotalAttachSize: function () {
                if (this.isSaaS) {
                    var current = this.getViewedTotalAttachSize();
                    this.$el.find("#total_size").html(GO.util.displayHumanizedAttachSizeStatus(current));
                }
            },

            resetAttachSizeAndCount: function () {
                if (this.isSaaS) {
                    this.totalAttachSize = 0;
                    this.totalAttachCount = 0;
                }
            }
        }, {
            __instance__: null, 
            
            create: function() {
                if(this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                return this.__instance__;
            } 
        });
    });
})();