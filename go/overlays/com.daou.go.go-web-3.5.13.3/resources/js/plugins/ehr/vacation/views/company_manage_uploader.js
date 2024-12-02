define("vacation/views/company_manage_uploader", function (require) {
    var Backbone = require("backbone");
    var GO = require("app");
    var Tmpl = require("hgn!vacation/templates/company_manage_uploader");
    var VacationLang = require("i18n!vacation/nls/vacation");
    var CommonLang = require("i18n!nls/commons");
    var AdminLang = require("i18n!admin/nls/admin");
    var FileUpload = require("file_upload");

    require("GO.util");
    require("jquery.go-preloader");
    var lang = {
        "업로드설명": VacationLang["샘플양식을 다운받아 양식에 맞게 작성 후 업로드해주시기 바랍니다.<br/>재 업로드시, 가장 최근 업데이트 파일로 대체 됩니다."],
        "샘플양식 다운로드": VacationLang["샘플양식 다운로드"],
        "초기설정 파일 등록": VacationLang["초기설정 파일 등록"],
        "파일첨부": CommonLang["파일첨부"],
        "{{extension}} 파일만 등록 가능합니다.": CommonLang["{{extension}} 파일만 등록 가능합니다."],
        "등록일": CommonLang["등록일"],
        "종료일": AdminLang["종료일"],
        "총 계정수": VacationLang["총"],
        "실패 계정수": CommonLang["실패"],
        "성공 계정수": CommonLang["성공"],
        "일괄 등록": AdminLang["일괄 등록"],
        "전체 처리 결과 다운로드": AdminLang["전체 처리 결과 다운로드"],
        "CSV 파일 재업로드 시": VacationLang["CSV 파일 재업로드 시"],
        "정보 변경으로 발생 연차와 조정 연차, 사용내역이 초기화됩니다": VacationLang["정보 변경으로 발생 연차와 조정 연차, 사용내역이 초기화됩니다."],
        "일괄 조정 기능을 이용하여 연차를 조정하시기 바랍니다": VacationLang["일괄 조정 기능을 이용하여 연차를 조정하시기 바랍니다"],
        "연차초기설정 시 결재문서 안내사항": VacationLang["연차초기설정 시 결재문서 안내사항"],
        "일괄 등록 시 규칙 사항": VacationLang["일괄 등록 시 규칙 사항"],
        "ID(계정) 은 그룹웨어 계정 이메일 주소에서 id 값": VacationLang["ID(계정) 은 그룹웨어 계정 이메일 주소에서 id 값"],
        "입사일은 yyyy-mm-dd 형식으로 입력 (ex 2018-01-01)": VacationLang["입사일은 yyyy-mm-dd 형식으로 입력 (ex 2018-01-01)"],
        "연차와 사용일수 입력 단위 설명": VacationLang["연차와 사용일수는 1일, 0.5일, 0.25일 단위로 입력"],
        "입사일을 미 입력 시,  연차는 자동 생성되지 않음": VacationLang["입사일을 미 입력 시,  연차는 자동 생성되지 않음"],
        "정보 변경으로 발생 연차와 조정 연차, 사용내역, 입사일이 초기화됩니다" : VacationLang["정보 변경으로 발생 연차와 조정 연차, 사용내역, 입사일이 초기화됩니다."]
    };

    var CompanyManageUploaderPopup = Backbone.View.extend({
        events: {
            "click #sampleDownload": "sampleDownload",
            "click #registerBtn": "fileRegister",
            "click #resultDownload": "resultDownload",
        },

        initialize: function (accountUseEhr) {
            this.preloader = $.goPreloader();
            this.accountUseEhr = _.isUndefined(accountUseEhr) ? false : accountUseEhr;
        },

        resultDownload: function(){
            window.location.href = GO.contextRoot + "api/vacation/upload/result/download?accountUseEhr=" + this.accountUseEhr;
        },

        // TODO : download url 설정
        sampleDownload: function () {
            window.location.href = GO.contextRoot + "api/ehr/vacation/company/upload/sample?accountUseEhr=" + this.accountUseEhr;
        },

        fileRegister: function () {
            this.preloader.render();

            var self = this,
                url = GO.contextRoot + "api/vacation/upload?accountUseEhr=" + this.accountUseEhr,
                $file = $("#fileComplete li");

            if (!$file.data("name")) {
                $.goError(CommonLang["첨부파일을 등록해 주세요."]);
                this.preloader.$el.hide();
                return;
            }

            var options = $file.data();
            $.go(url, JSON.stringify(options), {
                qryType: 'POST',
                timeout: 0,
                contentType: 'application/json',
                responseFn: function (response) {
                    self.getStatus();
                },
                error: function (error) {
                    $('#statusResult').show();
                    $.goError(CommonLang["업로드에 실패하였습니다."]);
                    this.preloader.$el.hide();
                }
            });
        },

        getStatus: function () {
            _this = this;
            $.ajax({
                url: GO.contextRoot + "api/vacation/upload/result",
                success: function (response) {
                    _this.data = response.data;
                },
                complete: function () {
                    if(!_this.data||!_this.data.jobStatus){
                        _this.preloader.$el.hide();
                        $.goError(CommonLang["업로드에 실패하였습니다."]);
                        return;
                    }
                    var status = _this.data.jobStatus;
                    if (status == "DONE") {
                        _this.preloader.$el.hide();
                        $('#statusResult').show();
                        $('#resultInfo').show();
                        $('#resultInfo').empty();
                        var registDate =  GO.util.customDate(_this.data.startedAt , 'YYYY-MM-DD');
                        var endDate = GO.util.customDate(_this.data.endedAt , 'YYYY-MM-DD');
                        var totalSize = _this.data.size;
                        var failCount = _this.data.failCount;
                        var successCount = _this.data.successCount;

                        var $itemEl = $([
                                "<li>" + lang['등록일'] + " : " + registDate + "</li>" +
                                "<li>" + lang['종료일'] + " : " + endDate + "</li>" +
                                "<li>" + lang['총 계정수']+" : " + totalSize + " / "+lang['실패 계정수']+" : " + failCount + " / "+lang['성공 계정수']+" : " + successCount + "</li>"
                            ].join("")
                        );
                        $('#resultInfo').append($itemEl);
                    } else if (status == "CANCELLED" || status == "DELETE") {
                        _this.preloader.$el.hide();
                        $.goError(CommonLang["업로드에 실패하였습니다."]);
                    } else if(status == "WAIT") {
                        _this.preloader.$el.hide();
                        return;
                    } else {//WAIT, PREPARE, DOING
                        setTimeout(function() {_this.getStatus();},3000);
                    }
                },
                dataType: "json",
                timeout: 30000
            });
        },

        render: function () {
            this.initCheck();

            this.$el.html(Tmpl({
                accountUseEhr : this.accountUseEhr,
                lang: lang
            }));

            this.initFileUpload();

            return this;
        },

        initCheck: function () {
            _this = this;
            this.preloader.render();
            $.ajax({
                url: GO.contextRoot + "api/vacation/upload/result",
                success: function (response) {
                    var status = response.data.jobStatus;
                    if (status == "DONE" || status == "CANCELLED" || status == "DELETE") {//진행중인 작업이 없으면,
                        _this.preloader.$el.hide();
                    } else {//WAIT, PREPARE, DOING
                        _this.getStatus();
                    }
                },
                dataType: "json"
            });
        },

        // TODO : upload url 설정
        submit: function () {
            this.preloader.release();
        },

        initFileUpload: function () {
            var useButtonWindow = GO.util.useButtonWindow();//DOCUSTOM-5963 IE9 에서 button mode를 바꿔야함
            var options = {
                el: "#uploadBtn",
                context_root: GO.contextRoot,
                useButtonWindow: useButtonWindow,
                button_text: "<span class='buttonText'>" + lang["파일첨부"] + "</span>",
                url: "api/file?GOSSOcookie=" + $.cookie('GOSSOcookie')
            };
            if (useButtonWindow) {
                options['button_height'] = 26;
            }
            (new FileUpload(options))
                .queue(function (e, data) {

                })
                .start(function (e, data) {
                    var reExt = new RegExp("(.csv|.xls|.xlsx)", "gi"),
                        fileExt = data.type.toLowerCase();

                    if (!reExt.test(fileExt)) {
                        $.goError(GO.i18n(lang["{{extension}} 파일만 등록 가능합니다."], {"extension": 'exel, csv'}));
                        return false;
                    }

                    $("#fileComplete").empty();
                })
                .progress(function (e, data) {

                })
                .success(function (e, data, attachEl) {
                    if (GO.util.fileUploadErrorCheck(data)) {
                        attachEl.find(".item_file").append("<strong class='caution'>" + GO.util.serverMessage(data) + "</strong>");
                        attachEl.addClass("attachError");
                    }

                    attachEl.data('file-path', data.data.filePath);
                    attachEl.data('file-name', data.data.fileName);
                    attachEl.data('file-ext', data.data.fileExt);
                    attachEl.data('hostid', data.data.hostId);

                    attachEl.find('.ic_del').hide();
                    $("#fileComplete").append(attachEl);
                })
                .complete(function (e, data) {
                })
                .error(function (e, data) {
                });

        }
    });

    return CompanyManageUploaderPopup;
});