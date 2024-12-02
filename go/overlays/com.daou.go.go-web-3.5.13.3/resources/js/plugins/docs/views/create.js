define('docs/views/create', function(require) {
    var _ = require("underscore");
    var BaseDocsView = require("docs/views/base_docs");
    var createTmpl = require("hgn!docs/templates/create");
    var ContentTopView = require('docs/views/content_top');
    var Backbone = require('backbone');
    var docsLang = require('i18n!docs/nls/docs');
    var approvalLang = require("i18n!approval/nls/approval");
    var commonLang = require("i18n!nls/commons");
    var App = require('app');
    var FileUpload = require("file_upload");
    var docsModel = require("docs/models/docs_doc_item");
    var folderModel = require("docs/models/doc_folder_info");
    var SelectFolderPopup = require('docs/views/select_folder_popup');

    require("go-webeditor/jquery.go-webeditor");

    var VesionsCollection = Backbone.Collection.extend({
        model: docsModel,

        initialize: function (options) {
            this.docsId = options.docsId;
        },

        url: function () {
            return GO.contextRoot + "api/docs/" + this.docsId + "/versions";
        }
    });

    var DocsYearModel = Backbone.Model.extend({
        initialize: function (option) {
            this.option = option || {docYear: 5};
        }
    }, {
        PRESERVE_YEARS: [1, 3, 5, 10, 0]
    });

    var lang = {
        'attach': commonLang["파일첨부"],
        'docsYear': docsLang["보존연한"],
        'docNum': docsLang["문서번호"],
        'title': docsLang["제목"],
        'location': docsLang["위치"],
        'reason': docsLang["변경 사유"],
        'regist': commonLang["등록"],
        'tempsave': docsLang["임시저장"],
        '이 곳에 파일을 드래그 하세요': commonLang['이 곳에 파일을 드래그 하세요'],
        '이 곳에 파일을 드래그 하세요 또는': commonLang['이 곳에 파일을 드래그 하세요 또는'],
        '파일선택': commonLang['파일선택'],
        '첨부파일 1개의 최대 용량은 NNN MB 이며 최대 N개 까지 등록 가능합니다':
            GO.i18n(commonLang["첨부파일 1개의 최대 용량은 {{size}} MB 이며 최대 {{number}} 개 까지 등록 가능합니다"],
                {"size": GO.config('commonAttachConfig').maxAttachSize, "number": GO.config('commonAttachConfig').maxAttachNumber})
    };

    return BaseDocsView.extend({
        events : {
            "click span.ic_del" : "attachDelete",
            "click #submitDocs" : "submitDocs",
            "click #folderBtn" : "selectFolder",
            "click #tempSaveDocs" : "tempSaveDocs",

            'dragover #dropZone': '_dragOver',
            'dragleave #dropZone': '_dragLeave',
            'drop #dropZone': '_drop'
        },

        initialize: function (options) {
            BaseDocsView.prototype.initialize.apply(this, arguments);
            this.isCreate = this.options.docsId ? false : true;
            this.docsId = this.options.docsId;
            this.folderId = this.options.folderId;
            this.isSaaS = GO.session().brandName == "DO_SAAS";
            this.totalAttachSize = 0;
            this.totalAttachCount = 0;
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

        dataFetchForEdit: function () {
            var fetchFolder = $.Deferred();
            var fetchDocs = $.Deferred();
            var fetchVersions = $.Deferred();
            var self = this;

            if (this.docsId) {
                this.docsModel = new docsModel({id: this.docsId});
                this.docsModel.fetch({
                    statusCode: {
                        400: function () {
                            GO.util.error('404', {"msgCode": "400-common"});
                        },
                        403: function () {
                            GO.util.error('403', {"msgCode": "400-common"});
                        },
                        404: function () {
                            GO.util.error('404', {"msgCode": "400-common"});
                        },
                        500: function () {
                            GO.util.error('500');
                        }
                    }
                }).done($.proxy(function () {
                    fetchDocs.resolve();
                    this.folderId = this.docsModel.getFolderId();
                    this.folderModel = new folderModel({id: this.folderId});
                    this.folderModel.fetch({
                        statusCode: {
                            400: function () {
                                GO.util.error('404', {"msgCode": "400-common"});
                            },
                            403: function () {
                                GO.util.error('403', {"msgCode": "400-common"});
                            },
                            404: function () {
                                GO.util.error('404', {"msgCode": "400-common"});
                            },
                            500: function () {
                                GO.util.error('500');
                            }
                        }
                    }).done(function () {
                        fetchFolder.resolve();
                    });
                }, this));
            } else {
                this.docsModel = new docsModel();
                fetchDocs.resolve();
                fetchFolder.resolve();
            }

            this.setEditFolderOption(fetchVersions);

            var deferred = $.Deferred();
            $.when(fetchDocs, fetchFolder, fetchVersions).done(function () {
                deferred.resolve(self);
            });

            return deferred;
        },

        dataFetchForCreate: function () {
            var fetchFolder = $.Deferred();
            var self = this;

            if (this.folderId) {
                this.folderModel = new folderModel({id: this.folderId});
                this.folderModel.fetch({
                    statusCode: {
                        400: function () {
                            GO.util.error('404', {"msgCode": "400-common"});
                        },
                        403: function () {
                            GO.util.error('403', {"msgCode": "400-common"});
                        },
                        404: function () {
                            GO.util.error('404', {"msgCode": "400-common"});
                        },
                        500: function () {
                            GO.util.error('500');
                        }
                    }
                }).done(function () {
                    fetchFolder.resolve();
                });
            } else {
                fetchFolder.resolve();
            }

            var deferred = $.Deferred();
            $.when(fetchFolder).done(function () {
                deferred.resolve(self);
            });

            return deferred;
        },

        render: function () {
            if (this.docsModel && this.docsModel.getDocsStatus() == "APPROVEWAITING") {
                var url = "docs";
                $.goAlert("승인 대기 중 문서는 수정 할 수 없습니다.", '', function () {
                    GO.router.navigate(url, true);
                });
                return;
            }

            BaseDocsView.prototype.render.apply(this, arguments);
            this.$el.parent().parent().find(".docs_side").find('.on').removeClass('on');
            if (this.docsModel) {
                this.isCreate = this.disableEditFolder ? false : true;
            }

            var year;
            if (this.docsModel) {
                year = this.makeDocInfo(this.docsModel.getDocsYear());
            } else if (this.folderModel) {
                year = this.makeDocInfo(this.folderModel.getDocYear());
            } else {
                year = this.makeDocInfo();
            }

            this.$el.html(createTmpl({
                lang: lang,
                docsId: this.options.id,
                isCreate: this.isCreate,
                docsData: this.docsModel ? this.docsModel.toJSON() : null,
                isTempsave: this.docsModel ? this.docsModel.get('docsStatus') == "TEMPSAVE" : false,
                folderData: this.folderModel ? this.folderModel.toJSON() : null,
                files: this.docsModel ? this.docsModel.getFiles() : null,
                images: this.docsModel ? this.docsModel.getImages() : null,
                disableEditFolder: this.disableEditFolder,
                preserveYears: year,
                isSaaS: this.isSaaS
            }));

            this.initSmartEditor();
            this.initFileUpload();
            this.docsFolderSelectListener();
            this.setViewedTotalAttachSize();

            return this;
        },

        renderContentTop: function(layoutView){
            var self = this;
            var contentTopView = new ContentTopView({});

            layoutView.getContentElement().html(contentTopView.el);
            contentTopView.render();
            layoutView.setContent(self);

            contentTopView.setTitle(this.isCreate ? docsLang["문서 등록"] : docsLang["문서 업데이트"]);
        },

        makeDocInfo : function(docYear){
            if(typeof docYear != "number"){
                docYear = 5;
            }
            this.yearsModel = new DocsYearModel({docYear : docYear});
            var preserveYears = _.map(DocsYearModel.PRESERVE_YEARS, function(num) {
                return {
                    'value' : num,
                    'label' : (num == 0) ? approvalLang['영구'] : num + approvalLang['년'],
                    'isSelected' : (this.yearsModel.get('docYear') * 1 == num * 1) ? true : false
                };
            }, this);
            return preserveYears;
        },

        attachDelete : function(e) {
            $(e.target).parents("li").remove();
            this.setViewedTotalAttachSize();
        },

        editorCallback : function(){
            GO.Editor.getInstance("editor").setContent(this.docsModel.get("content") || "");
        },

        initSmartEditor : function() {
            $("#editor").goWebEditor({
                contextRoot: GO.config('contextRoot'),
                lang: GO.session('locale'),
                onLoad : _.bind(this.editorCallback, this)
            });
        },

        initFileUpload: function (options) {
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
                    $.goAlert(commonLang['파일첨부용량초과']);
                    self.$("#dropZone").removeClass('drag_file');
                    return false;
                }

                if (self.isSaaS) {
                    if (maxAttachByteSize < data.size) {
                        $.goMessage(GO.i18n(commonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                        self.$("#dropZone").removeClass('drag_file');
                        return false;
                    } else {
                        self.totalAttachSize += data.size;
                    }

                    var currentTotalAttachCount = $('#fileWrap').children().size() + $("#imgWrap").children().size() + self.totalAttachCount + 1;
                    if (maxAttachNumber < currentTotalAttachCount) {
                        $.goMessage(GO.i18n(commonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
                        self.$("#dropZone").removeClass('drag_file');
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
                var extension = resp.data.fileExt;
                var fileName = resp.data.fileName;

                fileItemEl.attr("data-hostId", hostId);
                fileItemEl.attr("data-size", size);

                if (App.util.isImage(extension)) {
                    fileItemEl.find(".item_image").append("<span class='name'>" + fileName + "</span>" + "<span class='size'>(" + humanSize + ")</span>");
                    self.$("#attachArea").find("ul.img_wrap").append(fileItemEl);
                } else {
                    self.$("#attachArea").find("ul.file_wrap").append(fileItemEl);
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

        _getData: function () {
            return {
                folderId: this.folderId,
                title: $("#docsName").val(),
                reason: this.isCreate ? docsLang["최초 등록"] : $("#docsReason").val(),
                docNum: $("#docsNum").val() ? $("#docsNum").val() : "",
                docsYear: $("#docYear").val() * 1,
                attaches: this._getFiles(),
                content: this.getContent()
            };
        },

        submitDocs : function() {
            if (!GO.Editor.getInstance("editor").validate()) {
                $.goError(commonLang['마임 사이즈 초과']);
                return false;
            }

            var docsData = this._getData();
            if(this.validate(docsData) == false) {
                return;
            }
            docsData.docsStatus =  "COMPLETE";
            this.saveRequest(docsData);
        },

        tempSaveDocs: function () {
            if (!GO.Editor.getInstance("editor").validate()) {
                $.goError(commonLang['마임 사이즈 초과']);
                return false;
            }

            var docsData = this._getData();
            if (this.validate(docsData) == false) {
                return;
            }
            docsData.docsStatus = "TEMPSAVE";
            this.saveRequest(docsData);
        },

        saveRequest: function (docsData) {
            if (this.docsModel == undefined) {
                this.docsModel = new docsModel();
            }

            this.docsModel.set(docsData);

            if (this.docsId == undefined) {
                this.docsModel.save({}, {
                    success: function (e) {
                        if (e.get('docsStatus') == "TEMPSAVE") {
                            $.goAlert(docsLang["문서임시저장확인"], '', function () {
                                App.router.navigate("docs/edit/" + e.get('id'), true);
                            });
                        } else {
                            App.router.navigate("docs/detail/" + e.get('id'), true);
                        }
                    },
                    error: function (model, resp) {
                        $.goError(resp.responseJSON.message);
                    }
                });
            } else {
                this.docsModel.id = this.docsId;
                this.docsModel.save({}, {
                    type: 'PUT',
                    success: function (e) {
                        if (e.get('docsStatus') == "TEMPSAVE") {
                            $.goAlert(docsLang["문서임시저장확인"], '', function () {
                                App.router.navigate("docs/edit/" + e.get('id'), true);
                            });
                        } else {
                            App.router.navigate("docs/detail/" + e.get('id'), true);
                        }
                    },
                    error: function (model, resp) {
                        $.goError(resp.responseJSON.message);
                    }
                });
            }
        },

        getContent: function () {
            var content = GO.Editor.getInstance("editor").getContent();
            return (content == "" || $.trim(content) == "<br>") ? "" : content;
        },

        validate: function (docs) {
            if (!docs.folderId) {
                $.goError(docsLang["문서함선택해주세요"], $("#folderBtn"), false, true);
                $(document).scrollTop(0);
                return false;
            }
            var trimTitle = $.trim(docs.title);
            if (trimTitle.length > 100 || trimTitle.length < 2) {
                var errorMsg = App.i18n(docsLang["0은 0자이상 0자이하 입력해야 합니다."], {
                    "arg0": docsLang["제목"],
                    "arg1": "2",
                    "arg2": "100"
                });
                $.goError(errorMsg, $("#docsName"), false, true);
                $(document).scrollTop(0);
                return false;
            }
            var trimReason = $.trim(docs.reason);
            if (trimReason.length > 64 || trimReason.length < 2) {
                var errorMsg = App.i18n(docsLang["0은 0자이상 0자이하 입력해야 합니다."], {
                    "arg0": docsLang["변경 사유"],
                    "arg1": "2",
                    "arg2": "64"
                });
                $.goError(errorMsg, $("#docsReason"), false, true);
                $(document).scrollTop(0);
                return false;
            }

            var trimDocNum = $.trim(docs.docNum);
            if (trimDocNum && (trimDocNum.length > 32 || trimDocNum.length < 2)) {
                var errorMsg = App.i18n(docsLang["0은 0자이상 0자이하 입력해야 합니다."], {
                    "arg0": docsLang["문서번호"],
                    "arg1": "2",
                    "arg2": "32"
                });
                $.goError(errorMsg, $("#docsNum"), false, true);
                $(document).scrollTop(0);
                return false;
            }
            return true;
        },

        _getFiles: function () {
            var files = [];
            _.each($("#attachArea").find("li:not(.attachError)"), function (file) {
                files.push({
                    id: $(file).attr("data-id") || null,
                    path: $(file).attr("data-id") ? "" : $(file).attr("data-path"),
                    name: $(file).attr("data-name"),
                    hostId: $(file).attr("data-hostId"),
                    size: $(file).attr("data-size"),
                });
            });
            return files;
        },

        selectFolder: function () {
            this.popup = $.goPopup({
                pclass: "layer_normal doc_layer",
                header: docsLang["위치 선택"],
                width: 300,
                top: "40%",
                contents: "<div class='list_wrap'></div>",
                buttons: [{
                    btext: commonLang["취소"],
                    btype: "normal",
                    callback: function () {
                    }
                }]
            });
            new SelectFolderPopup().renderList().then($.proxy(function () {
                this.popup.reoffset();
            }, this));
        },

        docsFolderSelectListener: function () {
            $("#docsPath").on("docsFolder:select", $.proxy(function (e, model) {
                this.folderId = model.id;
                if (this.folderModel == undefined) {
                    this.folderModel = new folderModel();
                }
                this.folderModel.id = this.folderId;
                this.folderModel.fetch({
                    statusCode: {
                        400: function () {
                            GO.util.error('404', {"msgCode": "400-common"});
                        },
                        403: function () {
                            GO.util.error('403', {"msgCode": "400-common"});
                        },
                        404: function () {
                            GO.util.error('404', {"msgCode": "400-common"});
                        },
                        500: function () {
                            GO.util.error('500');
                        }
                    }
                }).done($.proxy(function () {
                    document.getElementById('docYear').options[this.folderModel.getDocYearIndex()].selected = true;
                    $("#docsPath").empty().append(model._getParentPathName() + " ");
                    $("#docsNum").val('');
                    if (model.useDocNum()) {
                        $("#docsNumLayout").show();
                    } else {
                        $("#docsNumLayout").hide();
                    }
                    this.popup.close();
                }, this));
            }, this));
        },

        setEditFolderOption: function (fetchVersionsDeferred) {
            var self = this;
            var versions = new VesionsCollection({docsId: this.docsModel.id});
            versions.comparator = "completDate";
            versions.fetch({
                statusCode: {
                    400: function () {
                        GO.util.error('404', {"msgCode": "400-common"});
                    },
                    403: function () {
                        GO.util.error('403', {"msgCode": "400-common"});
                    },
                    404: function () {
                        GO.util.error('404', {"msgCode": "400-common"});
                    },
                    500: function () {
                        GO.util.error('500');
                    }
                },

                success: function (collection) {
                    self.disableEditFolder = collection.length > 0;
                }
            }).done(function () {
                fetchVersionsDeferred.resolve();
            });
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
    });
});