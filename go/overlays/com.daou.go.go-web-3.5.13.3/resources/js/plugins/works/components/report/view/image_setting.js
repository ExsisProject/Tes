define("works/components/report/view/image_setting", function (require) {
    var Backbone = require('backbone');
    var worksLang = require("i18n!works/nls/works");
    var Template = require('hgn!works/components/report/template/image_setting');

    var lang = {
        "맞춤 설정": worksLang["맞춤 설정"],
        "파일 선택": worksLang["파일 선택"],
        "이미지 선택": worksLang["이미지 선택"],
        "테두리 설정": worksLang["테두리 설정"]
    }
    var imageViewOptions = {
        "맞추기": worksLang["맞추기"],
        "늘이기": worksLang["늘이기"],
        "사용": worksLang["사용"],
        "사용안함": worksLang["사용안함"]
    }

    return Backbone.View.extend({
        events: {
            'click .wrap_select #uploadButton': 'callUploader',
            'change #uploadButton #reportImageUpload': 'changeFileImage'
        },

        initialize: function (options) {
            this.rid = options.rid;
            this.viewType = '';
            this.attach;
            if (options.settings) {
                this.viewType = options.settings.viewType;
                this.existBorder = options.settings.existBorder;
            }
        },

        render: function () {
            this.$el.html(Template({
                lang: lang,
                imageViewOptions: imageViewOptions
            }));
            this._initViewType();
            this._initExistBorder();
            return this;
        },

        _initViewType: function () {
            if (!this.viewType) {
                this.viewType = 'ORIGINAL';
            }
            this.$('#viewSetting').val(this.viewType);
        },
        _initExistBorder: function () {
            if (GO.util.isInvalidValue(this.existBorder)) {
                this.existBorder = true;
            }
            this.$el.find('#used').prop("checked", this.existBorder);
            this.$el.find('#unused').prop("checked", !this.existBorder);
        },
        getViewType: function () {
            return $('#viewSetting').val();
        },
        getExistBorder: function () {
            return this.$el.find('#used').prop("checked");
        },
        getAttach: function () {
            if (this.attach) {
                return this.attach;
            }
        },

        changeFileImage: function (e) {
            if (e.target.files.length == 0) {
                return;
            }
            var uploadFile = e.target.files[0];
            var fileType = uploadFile.type;
            if (!_.startsWith(fileType, 'image')) {
                $.goError(worksLang['이미지 파일만 업로드 가능합니다']);
                return;
            }
             $('#reportFileName').text(uploadFile.name);
            this.attach = uploadFile;
        },

        callUploader: function (e) {
            e.stopPropagation();
            $('#callUploadPopup').click();
        }
    });
});
