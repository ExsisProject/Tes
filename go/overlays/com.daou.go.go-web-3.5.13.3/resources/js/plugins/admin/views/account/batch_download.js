define('admin/views/account/batch_download', function (require) {
    var Backbone = require('backbone');
    var GO = require("app");

    var BatchDownloadTpl = require('hgn!admin/templates/batch_download');
    var adminLang = require("i18n!admin/nls/admin");

    require("GO.util");
    require("jquery.go-grid");
    require("jquery.go-preloader");
    require("jquery.filedownload");

    var lang = {
        form_download: adminLang["샘플 양식 다운로드"],
        form_download_desc: adminLang["샘플 양식 다운로드 설명"],
        list_download: adminLang["현재 설정 다운로드"]
    };
    var BatchDownloadView = Backbone.View.extend({

        id : "batch_download",
        tagName : "span",

        initialize: function (data) {
            this.list_download_desc = data.list_download_desc;
            this.downloadListUrl = GO.contextRoot + data.downloadListUrl;
            this.downloadFormUrl = GO.contextRoot + data.downloadFormUrl;
        },

        events: {
            'click a#download_form': 'downloadForm',
            'click a#download_list': 'downloadList'
        },

        render: function () {
            $.extend(lang, {"list_download_desc": this.list_download_desc});
            this.$el.html(BatchDownloadTpl({
                lang: lang,
                downloadFormUrl: this.downloadFormUrl,
                downloadListUrl: this.downloadListUrl
            }));
        },

        downloadForm: function (e) {
            this.checkDownloading(this.downloadFormUrl);
        },

        downloadList: function (e) {
            this.checkDownloading(this.downloadListUrl);
        },

        checkDownloading: function (url) {
            this.preloader = $.goPreloader();
            var self = this;
            $.fileDownload(url, {
                    successCallback: function (url) {
                        self.preloader.release();
                    },
                    failCallback: function (html, url) {
                        $.goAlert(adminLang["파일 다운로드에 실패하였습니다."]);
                        self.preloader.release();
                    }
                }
            );
        }
    });

    return BatchDownloadView;
});