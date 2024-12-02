define('works/views/app/report/report_item_image', function (require) {
    var ReportItem = require('works/views/app/report/report_item');
    var ReportImageView = require("works/views/app/report/report_image_view");
    var SettingView = require('works/components/report/view/image_setting');

    return ReportItem.extend({
        initialize: function (options) {
            ReportItem.prototype.initialize.call(this, options);
            this.imageView = {};
            this.settingView = {};
            this.settings = {};
            this.appletId = options.appletId;
            this.reportId = options.reportId;
            this.attachId = options.attachId;
            this.contentWrap = $(options.contentWrap);
            this._initBase(options);
            this.render();
        },

        _initBase: function (data) {
            this.type = 'image';
            if (data.attachId) {
                this.attachId = data.attachId;
            } else if (data.filePath) {
                this.filePath = data.filePath;
                this.fileName = data.fileName;
                this.attach = data.attach;
            }
            if (data.settings) {
                this.settings = data.settings;
            }
        },

        render: function () {
            this._initImageView();
        },

        _initImageView: function () {
            var options = {
                rid: this.rid,
                appletId: this.appletId,
                reportId: this.reportId,
                attachId: this.attachId,
                settings: this.settings,
                attach: this.attach
            }
            this.imageView = new ReportImageView(options);
            this.contentWrap.empty();
            this.contentWrap.append(this.imageView.$el);
            this.imageView.render();
        },

        reload_setting: function () {
            var attachFile = this.settingView.getAttach();
            this.settings.viewType = this.settingView.getViewType();
            this.settings.existBorder = this.settingView.getExistBorder();
            this.imageView.updateSettings(this.settings);

            if (attachFile) {
                this.imageView.saveImageAttach(attachFile);
                this.imageView._initImageView();
                this.imageView._renderImage();
            }
            return true;
        },

        getSettingTmpl: function () {
            this.settingView = new SettingView({
                settings: this.settings,
                rid: this.rid
            });
            return this.settingView.render().el;
        },

        getFilterTmpl: function () {
            return {};
        },

        getAttachId: function () {
            if (this.imageView.attachId) {
                return this.imageView.attachId;
            }
        },

        getRid: function () {
            if (this.rid) {
                return this.rid;
            }
        },

        toJSON: function () {
            var attach = this.imageView.getImageData();
            var attachId = attach ? null : this.getAttachId();
            var options = {
                type: this.type,
                settings: this.imageView.getSettings(),
                filePath: this.imageView.getFilePath(),
                fileName: this.imageView.getFileName(),
                attachId: attachId,
                attach: attach
            };
            return options;
        },

        toObject: function (item) {
            var data = item.data ? item.data : item;
            this._initBase(data);
        }
    });
});
