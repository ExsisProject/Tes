define('admin/views/account/batch_regist', function (require) {
    var $ = require("jquery");
    var Backbone = require('backbone');
    var GO = require("app");

    var BatchDownloadView = require("admin/views/account/batch_download");
    var BatchUploadView = require("admin/views/account/batch_upload");
    var BatchPhotoUploadView = require("admin/views/account/batch_photo_upload");

    var BatchRegistTmpl = require("hgn!admin/templates/batch_regist");

    var MemberClassResultThTmpl = require("hgn!admin/templates/batch_upload_result_member_class_th");
    var MemberClassResultTdTmpl = require("hgn!admin/templates/batch_upload_result_member_class_td");
    var DeptResultThTmpl = require("hgn!admin/templates/batch_upload_result_dept_th");
    var DeptResultTdTmpl = require("hgn!admin/templates/batch_upload_result_dept_td");
    var MemberResultThTmpl = require("hgn!admin/templates/batch_upload_result_member_th");
    var MemberResultTdTmpl = require("hgn!admin/templates/batch_upload_result_member_td");

    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");

    require("GO.util");

    var	lang = {
        batch_regist : adminLang["일괄 등록"],
        member_class : adminLang["직위체계"],
        dept : adminLang["부서"],
        member : adminLang["멤버"],
        member_picture : adminLang["멤버"]+' '+commonLang["사진"],
        dept_org_shortcut : adminLang["조직설계"]+' '+adminLang['바로가기'],

        member_class_list_download_desc : adminLang["직위체계 설정 다운로드 설명"],
        dept_list_download_desc : adminLang["부서 설정 다운로드 설명"],
        member_list_download_desc : adminLang["멤버 설정 다운로드 설명"],

        member_class_upload_desc : adminLang["직위체계 일괄등록 설명"],
        dept_upload_desc : adminLang["부서 일괄등록 설명"],
        member_upload_desc : adminLang["멤버 일괄등록 설명"]
    };

    var BatchRegist = Backbone.View.extend({

        events : {
            "click div.tab_menu_wrap ul li" : "changeTab",
            "click span#goToDeptOrgLink" : "goToDeptOrgLink"
        },
        initialize :function(options){
            this.options = options || {};
            this.menus = this.options.menus;
            this.type = this.options.opt1 || "member_class";
        },
        render : function() {
            this.$el.empty();
            this.$el.html(BatchRegistTmpl({
                lang : lang,
                isUseOrgService : GO.util.isUseOrgService(true)
            }));
            this.renderBatchRegist();
        },

        renderBatchRegist : function() {
            this.$el.find('span.type').parent().removeClass("active");
            this.$el.find('#'+this.type).closest('li').addClass("active");
            this.$contentEl = this.$el.find(".content .tab_content");
            this.$contentEl.find("span").remove();

            this.setViewsByType();
            this.appendViews();
        },

        setViewsByType : function() {
            var type_info;
            switch(this.type) {
                case 'member_class':
                    type_info = {
                        subject: lang.member_class,
                        list_download_desc : lang.member_class_list_download_desc,
                        upload_desc : lang.member_class_upload_desc,

                        downloadFormUrl: "ad/api/domaincode/excel/download/form",
                        downloadListUrl: "ad/api/domaincode/excel/download",
                        uploadUrl: "ad/api/domaincode/excel/upload",
                        uploadResultUrl: "ad/api/domaincode/excel/result",
                        uploadFailResultUrl: "ad/api/domaincode/excel/result/fail",
                        reuploadUrl: "ad/api/domaincode/excel/reupload",

                        uploadResultThTmpl: MemberClassResultThTmpl,
                        uploadResultTdTmpl: MemberClassResultTdTmpl,
                    };
                    this.batchDownloadView = new BatchDownloadView(type_info);
                    this.batchUploadView = new BatchUploadView(type_info);
                    this.batchPhotoUploadView = null;
                    break;
                case 'dept':
                    type_info = {
                        subject: lang.dept,
                        list_download_desc : lang.dept_list_download_desc,
                        upload_desc : lang.dept_upload_desc,

                        downloadFormUrl: "ad/api/departments/excel/download/form",
                        downloadListUrl: "ad/api/departments/excel/download",
                        uploadUrl: "ad/api/department/excel/upload",
                        uploadResultUrl: "ad/api/department/excel/result",
                        uploadFailResultUrl: "ad/api/department/excel/result/fail",
                        reuploadUrl: "ad/api/department/excel/reupload",

                        uploadResultThTmpl: DeptResultThTmpl,
                        uploadResultTdTmpl: DeptResultTdTmpl,
                    };
                    this.batchDownloadView = new BatchDownloadView(type_info);
                    this.batchUploadView = new BatchUploadView(type_info);
                    this.batchPhotoUploadView = null;
                    break;
                case 'member':
                    type_info = {
                        subject: lang.member,
                        list_download_desc : lang.member_list_download_desc,
                        upload_desc : lang.member_upload_desc,

                        downloadFormUrl: "ad/api/user/excel/download/form",
                        downloadListUrl: "ad/api/user/excel/download",
                        uploadUrl: "ad/api/user/excel/upload",
                        uploadResultUrl: "ad/api/user/excel/result",
                        uploadFailResultUrl: "ad/api/user/excel/result/fail",
                        reuploadUrl: "ad/api/user/excel/reupload",
                        passwordSettingUrl: "company/password",
                        passwordMenuAccessible: this.menus.findMenuFromHref("company/password").accessible,

                        uploadResultThTmpl: MemberResultThTmpl,
                        uploadResultTdTmpl: MemberResultTdTmpl,
                    };
                    this.batchDownloadView = new BatchDownloadView(type_info);
                    this.batchUploadView = new BatchUploadView(type_info);
                    this.batchPhotoUploadView = null;
                    break;
                case 'member_picture':
                    type_info = {
                        subject: lang.member_picture,
                        uploadUrl: "ad/api/user/excel/upload"
                    };
                    this.batchDownloadView = null;
                    this.batchUploadView = null;
                    this.batchPhotoUploadView = new BatchPhotoUploadView(type_info);
                    break;
            }
        },

        appendViews : function() {
            if(this.batchDownloadView != null) {
                this.$contentEl.append(this.batchDownloadView.$el);
                this.batchDownloadView.render();
            }

            if(this.batchUploadView != null) {
                this.$contentEl.append(this.batchUploadView.$el);
                this.batchUploadView.render();
            }

            if(this.batchPhotoUploadView != null) {
                this.$contentEl.append(this.batchPhotoUploadView.$el);
                this.batchPhotoUploadView.render();
            }
        },

        changeTab : function(e){
            var target = $(e.currentTarget);
            var type = target.find("span").attr('id');
            if (this.type == type) return;
            this.type = type;
            this.renderBatchRegist();
        },

        goToDeptOrgLink : function () {
            $.goPopup({
                width : 500,
                title : "",
                pclass : "layer_confim",
                contents : "<p class='q'>" + GO.i18n(adminLang['메뉴로 이동하시겠습니까'], {"menuName":adminLang['조직설계']}) + "</p>",
                buttons : [{
                    btext : commonLang["확인"],
                    btype : "confirm",
                    autoclose : true,
                    callback : function() {
                        GO.router.navigate("/dept", true);
                    }
                }, {
                    btext : commonLang["취소"]
                }]
            });
        }

    });
    return BatchRegist;

});
