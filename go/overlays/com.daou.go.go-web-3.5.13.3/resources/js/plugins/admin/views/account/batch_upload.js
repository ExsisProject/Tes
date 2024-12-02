define('admin/views/account/batch_upload', function (require) {
    var $ = require('jquery');
    var Backbone = require('backbone');
    var GO = require("app");

    var AttachedFileTpl = require('hgn!admin/templates/attached_file');
    var BatchUploadTpl = require('hgn!admin/templates/batch_upload');
    var BatchUploadResultTpl = require('hgn!admin/templates/batch_upload_result');

    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var FileUpload = require("file_upload");
    var OrgSyncButton = require('admin/views/org_sync_button');

    require("GO.util");
    require("jquery.go-grid");
    require("jquery.go-preloader");

    var lang = {
        "upload": adminLang["일괄 등록"],
        "upload_form_help": adminLang["업로드 양식 도움말"],
        "password_setting": adminLang["비밀번호 관리 설정"],
        "password_setting_desc": GO.i18n(adminLang["비밀번호 관리 설정 설명"],
            'arg1', "<a class='goToPwSettingLink'>[" + adminLang["비밀번호 관리 설정"] + "]</a>"),
        "upload_result": adminLang["일괄 등록 결과"],
        "upload_result_guide": adminLang["파일을 등록하면, 아래 화면에서 추가한 내용을 확인 및 정정할 수 있습니다."],
        "upload_result_cnt": adminLang["파일에서 확인한 총 0건 중 정상 0개, 오류 0개 입니다"],
        "upload_result_table_desc": adminLang["일괄등록 결과 테이블 설명"],
        "reupload": adminLang["재등록"],
        "list_download": adminLang["목록 다운로드"],
        "status": adminLang["상태"],
        "excel_sheet_name": adminLang["엑셀시트명"],
        "code": adminLang["코드"],
        "ko_name": adminLang["한글명"],
        "en_name": adminLang["영문명"],
        "jp_name": adminLang["일문명"],
        "zhcn_name": adminLang["중문 간체명"],
        "zhtw_name": adminLang["중문 번체명"],
        "vi_name": adminLang["베트남어명"],
        "max1000": adminLang["한번에 최대 1,000건의 정보를 일괄 추가할 수 있습니다."],
        "dept_code": adminLang["부서코드"],
        "parent_dept_code": adminLang["상위 부서"] + adminLang["코드"],
        "order_code": adminLang["정렬코드"],
        "dept_name_ko": adminLang["부서명 (한글)"],
        "dept_name_en": adminLang["부서명 (영문)"],
        "dept_name_jp": adminLang["부서명 (일문)"],
        "dept_name_zhcn": adminLang["부서명 (중문 간체)"],
        "dept_name_zhtw": adminLang["부서명 (중문 번체)"],
        "dept_name_vi": adminLang["부서명 (베트남어)"],
        "dept_mail_id": adminLang["부서메일아이디"],
        "dept_acronym": adminLang["부서약어"],
        "name_ko": adminLang["이름 (한글)"],
        "name_en": adminLang["이름 (영문)"],
        "name_jp": adminLang["이름 (일문)"],
        "name_zhcn": adminLang["이름 (중문 간체)"],
        "name_zhtw": adminLang["이름 (중문 번체)"],
        "name_vi": adminLang["이름 (베트남어)"],
        "password": adminLang["비밀번호"],
        "id": adminLang["아이디"],
        "emp_no": adminLang["사번"],
        "mail_group": adminLang["메일그룹"],
        "dept_code": adminLang["부서코드"],
        "member_type": adminLang["멤버타입"],
        "position": adminLang["직위"],
        "grade": adminLang["직급"],
        "duty": adminLang["직책"],
        "user_group": adminLang["사용자그룹"],
        "id_alias": adminLang["가상 메일 아이디"],
        "dir_phone": adminLang["직통전화"],
        "mobile": adminLang["휴대폰"],
        "rep_phone": adminLang["대표전화"],
        "fax": adminLang["팩스"],
        "address_home": adminLang["주소(집)"],
        "homepage": adminLang["홈페이지"],
        "messenger": adminLang["메신저"],
        "birthday": adminLang["생일"],
        "anniversary": adminLang["기념일"],
        "memo": adminLang["메모"],
        "concurrent_dept": adminLang["겸직 및 직책"],
        'manual_sync': adminLang['채널 즉시 동기화']
    };

    var BatchUploadView = Backbone.View.extend({

        id: "batch_upload",
        tagName: "span",
        events: {
            "click #fileComplete .ic_del": "deleteFile",
            "click #upload": "upload",
            "click #reupload": "reupload",
            "click #listDownload": 'downloadList',
            "click #checkAll": 'checkAll',
            "click a.goToPwSettingLink": "goToPasswordSettingLink",
        },

        initialize: function (data) {
            this.subject = data.subject;
            this.upload_desc = data.upload_desc;

            this.uploadUrl = data.uploadUrl;
            this.passwordSettingUrl = data.passwordSettingUrl;
            this.passwordMenuAccessible = data.passwordMenuAccessible;
            this.uploadResultUrl = data.uploadResultUrl;
            this.uploadFailResultUrl = data.uploadFailResultUrl;
            this.reuploadUrl = data.reuploadUrl;
            this.downloadListUrl = data.downloadListUrl;

            this.uploadResultThTmpl = data.uploadResultThTmpl;
            this.uploadResultTdTmpl = data.uploadResultTdTmpl;
            var systemInfo = new Backbone.Model();
            systemInfo.url = GO.contextRoot + "ad/api/systeminfo";
            systemInfo.fetch({async: false});
            this.installLocale = systemInfo.toJSON().language;

            this.orgSyncable = GO.config('orgSyncWaitMin') > 0;
            this.$el.on('orgChanged', _.bind(this.handleOrgChanged, this));
        },

        render: function () {
            $.extend(lang, {"subject": this.subject, "upload_desc": this.upload_desc});
            this.$el.html(BatchUploadTpl({
                lang: lang,
                isMemberType : this.passwordSettingUrl ? true : false
            }));

            this.initResultEl();
            this.initFileUpload();
        },

        initResultEl:function(){
            this.$el.find("#resultArea").html(BatchUploadResultTpl({
                lang: lang,
                orgSyncable: this.orgSyncable
            }));
            this.$el.find("#uploadResultTh").html(this.uploadResultThTmpl({
                lang: lang,
                isKoLocale: this.installLocale === 'ko',
                isEnLocale: this.installLocale === 'en',
                isJpLocale: this.installLocale === 'ja',
                isZhcnLocale: this.installLocale === 'zhcn',
                isZhtwLocale: this.installLocale === 'zhtw',
                isViLocale: this.installLocale === 'vi'
            }));
            this.$el.find("#uploadResultList").html(this.getColspanTmpl(lang.max1000));

            this.orgSyncButton = new OrgSyncButton({
                description: GO.i18n(adminLang['조직일괄등록 동기화 설명'], {
                    'term': GO.config('orgSyncWaitMin')
                })
            });
            this.orgSyncButton.setElement(this.$('#manualSync'));
            this.orgSyncButton.render();
        },

        getColspanTmpl: function(text) {
            var colspan = this.$el.find("#uploadResultTh th").size();
            return "<tr class='null_data'><td colspan="+colspan+"><span class='txt'>"+text+"</span></td></tr>";
        },

        initFileUpload: function () {
            var self = this;
            var options = {
                el: "#swfupload-control",
                context_root: GO.contextRoot,
                button_text: "<span class='buttonText' style='font-family: notosanskr'> " + adminLang["파일 찾기"] + "</span>",
                button_style: "cursor:pointer;font-size:12px;text-align: center;vertical-align: middle;",
                accept : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                progressBarUse: true,
                progressEl : "#progressBarWrap",
                url: "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
            };
            (new FileUpload(options))
                .queue(function (e, data) {})
                .start(function (e, data) {
                    var reExt = new RegExp("(.xls|.xlsx)", "gi"),
                        fileExt = data.type.toLowerCase();

                    if (!reExt.test(fileExt)) {
                        $.goAlert((GO.i18n(commonLang["{{extension}} 파일만 등록 가능합니다."], {"extension": 'excel'})));
                        self.$el.find("#progressbar").hide();
                        return false;
                    }
                })
                .progress(function (e, data) {})
                .success(function (e, serverData, fileItemEl) {
                    if (GO.util.fileUploadErrorCheck(serverData)) {
                        $.goAlert(GO.util.serverMessage(serverData));
                        return false;
                    }
                    var data = serverData.data;
                    data.fileSize = GO.util.getHumanizedFileSize(data.fileSize);
                    data.deleteTxt = commonLang['삭제'];
                    self.$el.find("#fileComplete").html(AttachedFileTpl({data:data}));
                    self.initResultEl();
                })
                .complete(function (e, data) {})
                .error(function (e, data) {});
        },

        getBatchUploadFailResults : function() {
            var failResults = {};
            $.ajax({
                url : GO.contextRoot + this.uploadFailResultUrl,
                type : "GET",
                async : false,
                success : function(resp) {
                    failResults = resp.data;
                }
            });
            return failResults;
        },

        renderBatchUploadResult : function() {
            var self = this;
            var targetTable = this.$el.find('#batchUploadResultTable');
            targetTable.find("#uploadResultList").empty();

            var failResults = this.getBatchUploadFailResults();
            $.each(failResults, function(index, data) {
                _.extend(data, {errorText :commonLang['오류']});
                if(data.codeType){
                    data.sheetName = self.convertTypeToSheetName(data.codeType);
                }
                targetTable.append(self.uploadResultTdTmpl({
                    data : data
                }));
            });
        },

        deleteFile: function () {
            this.$el.find("#fileComplete").empty();
        },

        convertTypeToSheetName: function (codeType) {
            switch (codeType){
                case "POSITION" :
                    return adminLang["직위"];
                case "GRADE" :
                    return adminLang["직급"];
                case "DUTY" :
                    return adminLang["직책"];
                case "USERGROUP" :
                    return adminLang["사용자그룹"];
            }

        },

        reupload : function () {
            var self = this;
            var errorList = this.$el.find("#uploadResultList tr").not("[class*='error']");
            var reuploadTarget = [];

            $.each(errorList, function(k,v){
                var options = {};
                var inputs = $(v).closest('tr').find("input[type='text']");
                $.each(inputs, function(index, item){
                    var option = {};
                    option[item.name] = $(item).data('type') ? $(item).data('type') : item.value;
                    _.extend(options, option);
                });
                reuploadTarget.push(options);
            });

            $.ajax({
                url : GO.contextRoot + this.reuploadUrl,
                type : "POST",
                contentType: 'application/json',
                data : JSON.stringify(reuploadTarget),
                success : function(resp) {
                    self.getUploadStatus();
                }
            });

        },

        upload: function () {
            this.preloader = $.goPreloader();
            this.preloader.render();

            var self = this,
                url = GO.contextRoot + this.uploadUrl,
                options = {
                    fileName: this.$el.find("#file_name").val(),
                    filePath: this.$el.find("#file_path").val(),
                    hostId: this.$el.find("#host_id").val(),
                    fileExt: this.$el.find("#file_ext").val()
                };

            if (options.fileName == undefined || options.filePath == undefined) {
                $.goError(adminLang["일괄등록 파일 선택"]);
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
                    $.goError(error.responseJSON ? error.responseJSON.message : commonLang["업로드에 실패하였습니다."]);
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
            var state = data.jobStatus;
            var total = data.size;			// 총 개수?
            var successCnt = data.successCount;	//성공개수
            var failCnt = data.failCount;		//실패개수
            var doingCnt = successCnt + failCnt;	//총 계정수

            if (state == 'DONE') {
                this.$('#manualSync').toggle(successCnt > 0);
                this.$el.trigger('orgChanged');
                $('#progressbar').hide();
                $('#progressbar').progressBar(0, progressBarOpt);
                $('#upload').show();
                $('#swfupload-control').show();
                this.initFileUpload();

                $("div.file_upload_result .desc").hide();

                if(failCnt > 0) {
                    $("div.file_upload_result .info_type1").show();
                    $("#resultTotal").text(doingCnt);
                    $("#successCnt").text(successCnt);
                    $("#failCnt").text(failCnt);
                    $("#reupload").show();
                    $("#listDownload").hide();
                    $("div.file_upload_result p.tit").empty().append(GO.i18n(lang.upload_result_cnt,
                        {'totalCnt' : doingCnt, 'successCnt' : successCnt, 'failCnt' : failCnt}));

                    this.renderBatchUploadResult();
                } else {
                    $("div.file_upload_result .info_type1").hide();
                    $("#reupload").hide();
                    $("#listDownload").show();
                    $("#batchUploadResultTable tbody").empty().html(
                        this.getColspanTmpl(adminLang['파일의 모든 정보가 정상적으로 일괄등록되었습니다.']));
                }

            } else if (state == 'WAIT') {
                this.initFileUpload();

            } else if (state == 'DOING') {
                $('#upload').hide();
                $("#item_file").remove();
                $('#swfupload-control').hide();
                $('#progressbar').show();
                $('#progressbar').progressBar((doingCnt / total) * 100, progressBarOpt);
                window.setTimeout(function () {
                    self.getUploadStatus();
                }, 1500);

            } else if (state == 'PREPARE') {
                $('#upload').hide();
                $("#item_file").remove();
                $('#swfupload-control').hide();
                $('#progressbar').show();
                $('#progress_content').empty();
                window.setTimeout(function () {
                    self.getUploadStatus();
                }, 1500);

            } else { //canceled and deleted
                this.initFileUpload();
                $('#progressbar').hide();
                $('#upload').show();
                $('#swfupload-control').show();
            }
        },

        downloadList : function() {
            window.location.href = GO.contextRoot + this.downloadListUrl;
        },

        goToPasswordSettingLink: function () {
            var self = this;
            var contents = adminLang["해당 화면으로 이동하기 위한 권한이 없습니다."];
            var buttons = [];
            if(this.passwordMenuAccessible) {
                contents = GO.i18n(adminLang['메뉴로 이동하시겠습니까'], {"menuName":adminLang['비밀번호']});
                buttons = [{
                    btext : commonLang["확인"],
                    btype : "confirm",
                    autoclose : true,
                    callback : function() {
                        GO.router.navigate(self.passwordSettingUrl, true);
                    }
                }, {
                    btext : commonLang["취소"]
                }];

            }
            $.goPopup({
                width : 600,
                title : "",
                pclass : "layer_confim",
                contents : "<p class='q'>" + contents + "</p>",
                buttons : buttons
            });
        },

        handleOrgChanged: function() {
            this.orgSyncButton.disable();
        },
    });
    return BatchUploadView;
});
