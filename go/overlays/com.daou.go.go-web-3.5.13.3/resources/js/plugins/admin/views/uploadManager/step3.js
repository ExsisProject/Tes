define('admin/views/uploadManager/step3', function (require) {
    var Backbone = require('backbone');
    var GO = require("app");

    var DownloadList = require('admin/views/uploadManager/downloadList');
    var UploadResult = require('admin/views/uploadManager/excelUpload');
    var adminLang = require("i18n!admin/nls/admin");

    require("GO.util");
    require("jquery.go-grid");

    var PopupView = Backbone.View.extend({
        tagName: "div",
        className: "step3",

        initialize: function () {
        },

        render: function () {
            var uploadResult = new UploadResult(this.getClassData()),
                downLoadList = new DownloadList(this.getClassData());

            this.$el.html(downLoadList.$el);
            this.$el.append(uploadResult.$el);

            downLoadList.render();
            uploadResult.render();
            this.setHelpMessage();
        },

        getClassData: function () {
            return {
                subjectLang: adminLang["사용자"],
                downloadFormUrl: "ad/api/user/excel/download/form",
                uploadUrl: "ad/api/user/excel/upload",
                uploadResultUrl: "ad/api/user/excel/result",
                downloadAllResultUrl: "ad/api/user/excel/download/result/all",
                downloadFailResultUrl: "ad/api/user/excel/download/result/fail",
                downloadListUrl: "ad/api/user/excel/download",
            };
        },

        setHelpMessage: function () {
            var downloadHelpTpl = "<span class='help' style='margin-left: 5px'><span class='tool_tip'>" + adminLang["사용자 다운로드 도움말"]
                + "<i class='tail_left'></i></span></span>"
            this.$el.find("#downloadList").after(downloadHelpTpl);

            var uploadHelpTpl = "<span class='help' style='margin-left: 5px'><span class='tool_tip'>" + adminLang["사용자 업로드 도움말"]
                + "<i class='tail_left'></i></span></span>"
            this.$el.find("#downloadUploadForm").after(uploadHelpTpl);

        },

    });

    return PopupView;
});