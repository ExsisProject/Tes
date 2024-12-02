define('admin/views/uploadManager/downloadList', function (require) {
    var Backbone = require('backbone');
    var GO = require("app");

    var DownloadListTpl = require('hgn!admin/templates/uploadManager/downloadList');
    var adminLang = require("i18n!admin/nls/admin");

    require("GO.util");
    require("jquery.go-grid");
    require("jquery.go-preloader");

    var lang = {
        "list_download": adminLang["목록 다운로드"],
        "list_total_download": adminLang["목록 일괄 다운로드"],
    };
    var PopupView = Backbone.View.extend({
        events: {
            "click #downloadList": "downloadList",
        },
        initialize: function (data) {
            this.subjectLang = data.subjectLang;
            this.downloadListUrl = data.downloadListUrl;
        },

        render: function () {
            $.extend(lang, {"subject": this.subjectLang});
            this.$el.html(DownloadListTpl({
                lang: lang
            }));
            //todo dami : 부서 초과할 수 도 있음 부서 갯수 체크

        },

        downloadList: function () {
            window.location.href = GO.contextRoot + this.downloadListUrl;
        },


    });


    return PopupView;
});