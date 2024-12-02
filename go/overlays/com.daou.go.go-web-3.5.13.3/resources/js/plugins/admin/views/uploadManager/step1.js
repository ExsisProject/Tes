define('admin/views/uploadManager/step1', function (require) {
    var Backbone = require('backbone');
    var GO = require("app");

    var DownloadList = require('admin/views/uploadManager/downloadList');
    var UploadResult = require('admin/views/uploadManager/excelUpload');
    var adminLang = require("i18n!admin/nls/admin");

    require("GO.util");
    require("jquery.go-grid");
    require("jquery.go-preloader");

    var PopupView = Backbone.View.extend({
        tagName: "div",
        className: "step1",

        initialize: function () {
        },

        render: function () {
            var uploadResult = new UploadResult(this.getDeptData()),
                downLoadList = new DownloadList(this.getDeptData());

            this.$el.html(downLoadList.$el);
            this.$el.append(uploadResult.$el);

            downLoadList.render();
            uploadResult.render();
            //todo dami : 부서 초과할 수 도 있음 부서 갯수 체크

            this.setHelpMessage();
        },

        getDeptData: function () {
            return {
                subjectLang: adminLang["부서"],
                downloadFormUrl: "ad/api/departments/excel/download/form",
                uploadUrl: "ad/api/department/excel/upload",
                uploadResultUrl: "ad/api/department/excel/result",
                downloadAllResultUrl: "ad/api/department/excel/download/result/all",
                downloadFailResultUrl: "ad/api/department/excel/download/result/fail",
                downloadListUrl: "ad/api/departments/excel/download"
            };
        },

        setHelpMessage: function () {
            this.$el.find("#downloadList").after(downloadHelpTpl);
            var downloadHelpTpl = "<span class='help' style='margin-left: 5px'><span class='tool_tip'>" + adminLang["부서 다운로드 도움말"]
                + "<i class='tail_left'></i></span></span>"
            this.$el.find("#downloadList").after(downloadHelpTpl);

            var uploadHelpTpl = "<span class='help' style='margin-left: 5px'><span class='tool_tip'>" + adminLang["부서 업로드 도움말"]
                + "<i class='tail_left'></i></span></span>"
            this.$el.find("#downloadUploadForm").after(uploadHelpTpl);

        },

    });


    return PopupView;
});