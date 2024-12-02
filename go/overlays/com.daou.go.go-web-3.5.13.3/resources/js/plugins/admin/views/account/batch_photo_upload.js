define('admin/views/account/batch_photo_upload', function (require) {
    var Backbone = require('backbone');
    var GO = require("app");

    var AttachedFileTpl = require('hgn!admin/templates/attached_file');
    var BatchPhotoUploadTpl = require('hgn!admin/templates/batch_photo_upload');
    var FileUpload = require("file_upload");

    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    var approvalLang = require("i18n!approval/nls/approval");
    var OrgSyncButton = require('admin/views/org_sync_button');

    require("GO.util");
    require("jquery.go-grid");
    require("jquery.go-preloader");

    require("swfupload");
    require("swfupload.plugin");
    require("jquery.progressbar");

    var lang = {
        'member_photo_regist' : adminLang['멤버사진 일괄등록'],
        'batch_regist' : adminLang['일괄 등록'],
        'id' : adminLang['아이디로 매핑하여 등록'],
        'id_number' : adminLang['인식번호(사번/학번)으로 매핑하여 등록'],
        'select_file' : adminLang['파일 찾기'],
        "save" : commonLang["저장"],
        'cancel' : commonLang['취소'],
        'upload_must_zipfile' : adminLang['멤버사진 일괄등록 설명'],
        'file_standard_extension' : adminLang['사진 파일 규격 종류'],
        'photo_size_info': adminLang["150x150 사이즈"],
        'impossible_to_see_result_below' : adminLang["일괄등록한 사진은 아래 결과에서 확인할 수 없습니다."],
        'manual_sync': adminLang['채널 즉시 동기화']
    };

    var progressBarOpt = {
        boxImage: GO.contextRoot + 'resources/images/progressbar.gif',
        barImage: GO.contextRoot + 'resources/images/progressbg_green_200.gif',
        width: 200,
        max : 100
    };

    var BatchPhotoUploadModel = Backbone.Model.extend({
        url: function() {
            return "/ad/api/account/photo/regist";
        }
    });

    var BatchPhotoUploadView = Backbone.View.extend({

        id : "batch_photo_upload",
        tagName : "span",
        events: {
            "click.photoReg #add_photo" : "uploadStart",
            "click.photoReg span.ic_del" : "deleteFile",
        },

        initialize: function (data) {
            this.subject = data.subject;
            this.uploadUrl = data.uploadUrl;

            this.$el.on('orgChanged', _.bind(this.handleOrgChanged, this));
            this.orgSyncable = GO.config('orgSyncWaitMin') > 0;
        },

        render : function() {
            this.$el.html(BatchPhotoUploadTpl({
                lang : lang,
                orgSyncable: this.orgSyncable
            }));

            this.orgSyncButton = new OrgSyncButton({
                description: GO.i18n(adminLang['조직일괄등록 동기화 설명'], {
                    'term': GO.config('orgSyncWaitMin')
                })
            });
            this.orgSyncButton.setElement(this.$('#manualSync'));
            this.orgSyncButton.render();

            this.initFileUpload();
            $("#photoResultDiv").hide();
        },

        deleteFile : function(){
            $("#fileComplete").html("");
        },

        uploadStart: function(){
            var self = this;
            var photoType = $(':radio[name="photoType"]:checked').attr("id");
            if (!photoType) {
                $.goError(approvalLang["구분을 선택 하지 않았습니다."]);
                return false;
            }
            if (!$("#file_name").val()) {
                $.goError(adminLang["일괄등록 파일 선택"]);
                return false;
            }
            var model = new BatchPhotoUploadModel();
            $.goConfirm(approvalLang['저장하시겠습니까?'],
                '',
                function() {
                    model.set({
                        'fileName' :  $("#file_name").val(),
                        'filePath' : $("#file_path").val(),
                        'hostId' : $("#host_id").val(),
                        "signType" : photoType
                    }, { silent : true });
                    GO.EventEmitter.trigger('common', 'layout:setOverlay', adminLang["로딩중"]);
                    model.save({}, {
                        type : 'PUT',
                        success: function(model, result) {
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            if (result.code == 200){
                                self.$el.trigger('orgChanged');
                                $.goMessage(approvalLang["저장이 완료되었습니다."]);
                                self.drawSuccessList(result.data);
                                self.deleteFile();
                            }
                        }, error : function(model, rs){
                            GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            $.goError(adminLang["등록에 실패했습니다."]);
                            self.drawFileUploadFailView(rs.data);
                            self.deleteFile();
                            return false;
                        }
                    });
                });
        },
        drawSuccessList : function(data) {
            $("#photoResultDiv").show();
            var html = "";
            html += '<li><span class="txt">' + adminLang["이미지 파일"] + ' ' + $('#file_name').val() + ' ' + adminLang["업로드 완료"] + '</span></li>';
            $("#photoResultDiv ul").empty();
            $("#photoResultDiv ul").append(html);
            var hasSuccess = false;
            $.each(data, function(k,v) {
                if (v.resultFlag) {
                    html = '<li><span class="txt">' + v.zipFileName + ' ' + commonLang['저장'] + ' [' + v.userName + ' ] ' + '</span></li>';
                    hasSuccess = true;
                } else {
                    html = '<li><span class="txt">' + v.zipFileName + ' ' + commonLang['실패'] + '</span></li>';
                }
                $("#photoResultDiv ul").append(html);
            });
            this.orgSyncButton.$el.toggle(hasSuccess);
        },

        drawFileUploadFailView : function(data) {
            $("#photoResultDiv").show();
            var html ='<li><span class="txt">' + adminLang["이미지 파일"] + ' ' + $('#file_name').val() + ' ' + adminLang["업로드 실패"] + '</span></li>';
            $("#photoResultDiv ul").empty().append(html);
        },

        initFileUpload : function(){
            var options = {
                el : "#swfupload-control",
                context_root : GO.contextRoot ,
                button_text : "<span class='buttonText'>"+adminLang["파일 찾기"]+"</span>",
                accept : ".zip",
                progressBarUse : true,
                url : "ad/api/file?GOAdminSSOcookie=" + $.cookie('GOAdminSSOcookie')
            };

            (new FileUpload(options))
                .queue(function(e, data){})
                .start(function(e, data){
                    var reExt = new RegExp("(.zip)","gi"),
                        fileExt = data.type.toLowerCase();

                    if(!reExt.test(fileExt)){
                        $.goAlert(approvalLang["zip 파일만 등록 가능합니다."]);
                        $("#progressbar").hide();
                        return false;
                    }
                })
                .progress(function(e, data){})
                .success(function(e, serverData, fileItemEl){
                    if(GO.util.fileUploadErrorCheck(serverData)){
                        $.goAlert(GO.util.serverMessage(serverData));
                        return false;
                    }
                    $("#photoResultDiv").hide();
                    var data = serverData.data;
                    data.fileSize = GO.util.getHumanizedFileSize(data.fileSize);
                    data.deleteTxt =  commonLang['삭제'];
                    $("#fileComplete").html(AttachedFileTpl({data:data}));
                })
                .complete(function(e, data){})
                .error(function(e, data){});
        },

        release: function() {
            this.$el.off();
            this.$el.empty();
        },

        handleOrgChanged: function() {
            this.orgSyncButton.disable();
        },
    });

    return BatchPhotoUploadView;
});
