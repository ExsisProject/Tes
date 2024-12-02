define('admin/views/uploadManager/excelUpload', function (require) {
    var Backbone = require('backbone');
    var GO = require("app");

    var ExcelUploadTpl = require('hgn!admin/templates/uploadManager/excelUpload');
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var FileUpload = require("file_upload");

    require("GO.util");
    require("jquery.go-grid");
    require("jquery.go-preloader");

    var lang = {
        "select_upload_file": adminLang["일괄등록 파일선택"],
        "upload_file": adminLang["일괄 등록 파일"],
        "download_upload_form": adminLang["일괄 등록 파일 양식 다운로드"],
        "upload": adminLang["일괄 등록"],
        "dept_upload_result": adminLang["일괄 등록 파일 업로드 현황"],
        "download_all_result": adminLang["전체 처리 결과 다운로드"],
        "download_fail_result": adminLang["오류 목록 다운로드"],
        "upload_form_help": adminLang["업로드 양식 도움말"]
    };

    var PopupView = Backbone.View.extend({
        events: {
            "click #downloadUploadForm": "downloadUploadForm",
            "click #fileComplete .ic_del": "deleteFile",
            "click #upload": "upload",
            "click #download_all": "downloadAllResult",
            "click #download_fail": "downloadFailResult",
        },
        initialize: function (data) {
            this.subjectLang = data.subjectLang;
            this.downloadFormUrl = data.downloadFormUrl;
            this.uploadUrl = data.uploadUrl;
            this.uploadResultUrl = data.uploadResultUrl;
            this.downloadAllResultUrl = data.downloadAllResultUrl;
            this.downloadFailResultUrl = data.downloadFailResultUrl;
        },

        render: function () {
            $.extend(lang, {"subject": this.subjectLang});
            this.$el.html(ExcelUploadTpl({
                lang: lang
            }));
            this.initFileUpload();
        },

        initFileUpload: function () {
            var self = this;
            var options = {
                el: "#swfupload-control",
                context_root: GO.contextRoot,
                button_text: "<span class='buttonText'>" + adminLang["파일 찾기"] + "</span>",
                button_style: "cursor:pointer;font-size:12px;text-align: center;vertical-align: middle;font-family:Noto Sans KR;",
                progressBarUse: true,
                url: "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
            };

            (new FileUpload(options))
                .queue(function (e, data) {
                })
                .start(function (e, data) {
                    var reExt = new RegExp("(.xls|.xlsx)", "gi"),
                        fileExt = data.type.toLowerCase();

                    if (!reExt.test(fileExt)) {
                        $.goAlert((GO.i18n(commonLang["{{extension}} 파일만 등록 가능합니다."], {"extension": 'exel'})));
                        self.$el.find("#progressbar").hide();
                        return false;
                    }
                })
                .progress(function (e, data) {
                })
                .success(function (e, serverData, fileItemEl) {
                    if (GO.util.fileUploadErrorCheck(serverData)) {
                        $.goAlert(GO.util.serverMessage(serverData));
                        return false;
                    }
                    var data = serverData.data,
                        fileName = data.fileName,
                        filePath = data.filePath,
                        hostId = data.hostId,
                        fileSize = GO.util.getHumanizedFileSize(data.fileSize),
                        fileExt = data.fileExt,
                        fileTmpl = "<li id='item_file'>" +
                            "<span class='item_file'>" +
                            "<span class='ic_file ic_def'></span>" +
                            "<span class='name'>" + fileName + "</span>" +
                            "<span class='size'>(" + fileSize + ")</span>" +
                            "<span class='btn_wrap' title='삭제'>" +
                            "<span class='ic_classic ic_del'></span>" +
                            "</span>" +
                            "</span>" +
                            "<input type='hidden' value='" + filePath + "' id='file_path'/>" +
                            "<input type='hidden' value='" + fileName + "' id='file_name'/>" +
                            "<input type='hidden' value='" + hostId + "' id='host_id'/>" +
                            "<input type='hidden' value='" + fileExt + "' id='file_ext'/>" +
                            "</li>";
                    self.$el.find("#fileComplete").html(fileTmpl);
                })
                .complete(function (e, data) {
                    console.info(data);
                })
                .error(function (e, data) {
                    console.info(data);
                });
        },

        downloadUploadForm: function () {
            window.location.href = GO.contextRoot + this.downloadFormUrl;
        },

        deleteFile: function () {
            this.$el.find("#fileComplete").empty();
        },

        upload: function () {
            this.preloader = $.goPreloader();
            this.preloader.render();

            var self = this,
                url = GO.contextRoot + this.uploadUrl,
                options = {
                    fileName: $("#file_name").val(),
                    filePath: $("#file_path").val(),
                    hostId: $("#host_id").val(),
                    fileExt: $("#file_ext").val()
                };

            if (options.fileName == undefined || options.filePath == undefined) {
                $.goError(commonLang["첨부파일을 등록해 주세요."]);
                this.preloader.$el.hide();
                return;
            }

            $.go(url, JSON.stringify(options), {
                qryType: 'POST',
                timeout: 0,
                contentType: 'application/json',
                responseFn: function (response) {
                    self.getUploadStatus();
                },
                error: function (error) {
                    var responseData = JSON.parse(error.responseText);
                    if (responseData.message != null) {
                        $.goError(responseData.message);
                    } else {
                        $.goError(commonLang["업로드에 실패하였습니다."]);
                    }
                    self.preloader.release();
                }
            });
        },
        getUploadStatus: function () {
            var self = this;
            $.ajax({
                url: GO.contextRoot + this.uploadResultUrl,
                dataType: "json",
                timeout: 30000,
                success: function (response) {
                    self.preloader.release();
                    self.changeUIWithUploadStatus(response.data);
                },
                error: function () {
                    $.goAlert(commonLang["업로드에 실패하였습니다."]);
                    self.preloader.release();
                },
            });
        },
        changeUIWithUploadStatus: function (data) {
            var self = this;
            var progressBarOpt = {
                boxImage: GO.contextRoot + 'resources/images/progressbar.gif',
                barImage: GO.contextRoot + 'resources/images/progressbg_green_200.gif',
                width: 200,
                max: 100
            };
            var state = data.jobStatus,
                total = data.size,			// 총 개수?
                successCnt = data.successCount,	//성공개수
                failCnt = data.failCount,		//실패개수
                startedAt = GO.util.basicDate3(data.startedAt),	//등록시작일
                endedAt = GO.util.basicDate3(data.endedAt),	//등록종료일
                doingCnt = successCnt + failCnt;	//총 계정수
            if (state == 'DONE') {
                $('#progressbar').hide();
                $('#progressbar').progressBar(0, progressBarOpt);
                $('#progress_content').empty();
                $('#upload').show();
                $('#select_file').show();
                $('#swfupload-control').show();
                $('#upload_progress').show();
                $('#upload_progress div.header').html('<h2 style="margin-top: 0;">' + adminLang["최근 일괄 등록 결과"] + '</h2>');
                $("#upload_result").show();
                $('#progress_content').append('<div class="desc" style="color:red;">' + adminLang["계정 등록 결과 도움말"] + '</div>');
                $('#progress_content').append('<div>' + adminLang["등록일"] + ': ' + startedAt + '</div>');
                $('#progress_content').append('<div>' + adminLang["종료일"] + ': ' + endedAt + '</div>');
                $('#progress_content').append('<div>' + adminLang["총 건수"] + ': ' + doingCnt + '</div>');
                $('#progress_content').append('<div>' + adminLang["실패 건수"] + ': ' + failCnt + '</div>');
                $('#progress_content').append('<div>' + adminLang["성공 건수"] + ': ' + successCnt + '</div>');
                $('#rightButton').show();
                $(document).scrollTop($(document).height());
                this.initFileUpload();

            } else if (state == 'WAIT') {
                this.initFileUpload();
            } else if (state == 'DOING') {
                $('#upload').hide();
                $("#item_file").remove();
                $('#swfupload-control').hide();
                $('#upload_progress').show();
                $('#progress_content').empty();
                $("#upload_result").hide();
                $('#upload_progress div.header').html('<h2 style="margin-top: 0;">' + adminLang["계정 일괄 등록 파일 업로드 현황"] + '</h2>');
                $('#progressbar').show();
                $('#progressbar').progressBar((doingCnt / total) * 100, progressBarOpt);
                window.setTimeout(function () {
                    self.getUploadStatus();
                }, 1500);
                $(document).scrollTop($(document).height());
            } else if (state == 'PREPARE') {
                $('#upload').hide();
                $("#item_file").remove();
                $('#swfupload-control').hide();
                $('#upload_progress').show();
                $('#progress_content').empty();
                window.setTimeout(function () {
                    self.getUploadStatus();
                }, 1500);
                $(document).scrollTop($(document).height());
            } else { //canceled and deleted
                this.initializeFileUpload();
                $('#progressbar').hide();
                $('#upload').show();
                $('#select_file').show();
                $('#swfupload-control').show();
                $('#upload_progress').show();
                $('#upload_progress div.header').html('<h2 style="margin-top: 0;">' + adminLang["최근 일괄 등록 결과"] + '</h2>');
                $("#upload_result").show();
                $('#progress_content').append('<p class="go_alert">' + adminLang["계정일괄등록 중지"] + '</p>');
                $('#progress_content').append('<div>' + adminLang["등록일"] + ': ' + startedAt + '</div>');
                $('#progress_content').append('<div>' + adminLang["종료일"] + ': ' + endedAt + '</div>');
                $('#progress_content').append('<div>' + adminLang["총 건수"] + ': ' + doingCnt + '</div>');
                $('#progress_content').append('<div>' + adminLang["실패 건수"] + ': ' + failCnt + '</div>');
                $('#progress_content').append('<div>' + adminLang["성공 건수"] + ': ' + successCnt + '</div>');
                $(document).scrollTop($(document).height());
            }
        },
        downloadAllResult: function () {
            window.location.href = GO.contextRoot + this.downloadAllResultUrl;
        },

        downloadFailResult: function () {
            window.location.href = GO.contextRoot + this.downloadFailResultUrl;
        }
    });


    return PopupView;
});