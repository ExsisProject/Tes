define('works/views/app/report/report_image_view', function (require) {
    var worksLang = require("i18n!works/nls/works");

    return Backbone.View.extend({
        initialize: function (options) {
            this.rid = options.rid;
            this.appletId = options.appletId;
            this.reportId = options.reportId;
            this.attachId = options.attachId;
            this.settings = options.settings;
            this.attach = options.attach;
            this.isUpload = false;
            this.filePath;
            this.fileName;
            this.fileInputKey = '#file' + this.rid;
            this.imgKey = '#img' + this.rid;
            this.imageKey = '#image' + this.rid;
            this.point = {curX: 0, curY: 0};
        },

        render: function () {
            this._initImageView();
            if (this.attach) {
                this.saveImageAttach(this.attach);
                this._initImageView();
                this._renderImage();
            }

            return this;
        },

        _initImageView: function () {
            var viewHtml;
            if (this._hasImage()) {
                var imageUrl = this._makeImageUrl();
                var width = this._calculateWidth();
                var height = this._calculateHeight();
                viewHtml = Hogan.compile([
                    '<span class="item_image" id="image' + this.rid + '">' +
                    '<span class="thumb">' +
                    '<input type="file" id="file' + this.rid + '" accept="image/*" style="display: none;">' +
                    '<img id="img' + this.rid + '" src="' + imageUrl + '" height="' + height + '" width="' + width + '">' +
                    '</span><span class="btn_wrap"></span></span>'
                ].join(""));
            } else {
                viewHtml = Hogan.compile([
                    '<div class="widget_nulldata" id="image' + this.rid + '">' +
                    '<div class="nulldata">' +
                    '  <div class="img"><span class="icx2 ic_box_nulldata"></span></div>' +
                    '<input type="file" id="file' + this.rid + '" accept="image/*" style="display: none;">' +
                    '  <p class="nulldata_tit">' + worksLang['이미지가 없습니다'] +
                    '</p><p class="nulldata_txt">' + worksLang['더블클릭하여 이미지를 추가해주세요'] + '</p>' +
                    '</div>' +
                    '</div>'].join(""));
            }

            this.$el.addClass('item_image');
            this.$el.empty();
            this.$el.append(viewHtml.render());

            if (this._hasImage()) {
                this._updateStyle();
            }
            this._createEvent();
        },

        _calculateHeight: function () {
            if (!this.attachId || 'EXPANSION' == this.settings.viewType) {
                return '100%';
            }
            return this.settings.height >= this.settings.width ? '100%' : '';
        },

        _calculateWidth: function () {
            if (!this.attachId || 'EXPANSION' == this.settings.viewType) {
                return '100%';
            }
            return this.settings.width >= this.settings.height ? '100%' : '';
        },

        _createEvent: function () {
            this._registerImageChangeEvent();
            this._registerViewClick();
        },

        _registerImageChangeEvent: function () {
            var self = this;
            $(this.fileInputKey).on('change', function (e) {
                if (e.target.files.length == 0) {
                    return;
                }
                var attachFile = e.target.files[0];
                var fileType = attachFile.type;
                if (!_.startsWith(fileType, 'image')) {
                    $.goError(worksLang['이미지 파일만 업로드 가능합니다']);
                    return;
                }
                self.saveImageAttach(attachFile);
                self._initImageView();
                self._renderImage();
            });
        },

        _registerViewClick: function () {
            var self = this;
            $(this.imageKey).closest('div').on('dblclick', function () {
                var itemRid = $('.card_edit').attr('item-rid');
                if (self.rid == itemRid) {
                    $(self.fileInputKey).click();
                }
            });
        },

        _hasImage: function () {
            return this.attach || this.attachId;
        },

        _makeImageUrl: function () {
            if (!this.attachId) {
                return '';
            }
            var url = "api/works/applet/" + this.appletId + '/report/' + this.reportId + '/download/' + this.attachId;
            return GO.contextRoot + url;
        },

        getFilePath: function () {
            if (this.filePath) {
                return this.filePath;
            }
        },

        getFileName: function () {
            if (this.attach) {
                return this.attach.name;
            } else if (this.fileName) {
                return this.fileName;
            }
        },

        getImageData: function () {
            if (this.attach) {
                return this.attach;
            }
        },

        getSettings: function () {
            return {
                viewType: this.settings.viewType,
                existBorder: this.settings.existBorder,
                height: this.settings.height,
                width: this.settings.width
            }
        },

        saveImageAttach: function (attachFile) {
            var self = this;
            var fd = new FormData();
            this.attach = attachFile;
            fd.append("file", this.attach);
            fd.append("GOSSOcookie", $.cookie("GOSSOcookie"));
            $.ajax({
                url: GO.contextRoot + "api/file",
                type: "POST",
                contentType: false,
                processData: false,
                data: fd,
                success: function (resp) {
                    var attach = (typeof resp === "string") ? JSON.parse(resp) : resp.data;
                    self.isUpload = true;
                    self.attachId = null;
                    self.filePath = attach.filePath;
                }
            });
        },

        updateSettings: function (settings) {
            this.settings.viewType = settings.viewType;
            $(this.imgKey).attr("height", "");
            $(this.imgKey).attr("width", "");
            if (settings.attach) {
                this.saveImageAttach(settings.attach);
                this._initImageView();
                this._renderImage();
            } else {
                this._updateStyle();
            }
        },

        _updateStyle: function () {
            if ('EXPANSION' == this.settings.viewType) {
                $(this.imageKey).closest('div').css("display", "block");
                $(this.imageKey).css("display", "inline");
                $(this.imageKey).css("vertical-align", "");
                $(this.imgKey).attr("height", "100%");
                $(this.imgKey).attr("width", "100%");
            } else if (this.settings.height >= this.settings.width) {
                $(this.imgKey).attr("height", "100%");
                $(this.imageKey).closest('div').css("display", "block");
                $(this.imageKey).css("display", "");
                $(this.imageKey).css("vertical-align", "");
            } else if (this.settings.width > this.settings.height) {
                $(this.imgKey).attr("width", '100%');
                $(this.imageKey).closest('div').css("display", "table");
                $(this.imageKey).css("display", "table-cell");
                $(this.imageKey).css("vertical-align", "middle");
            }

            var borderStyle = this.settings.existBorder == false ? '1px solid #fff' : '1px solid #ddd';
            $('div[item-rid=' + this.rid + '] .grid-stack-item-content').css('border', borderStyle);
        },

        _renderImage: function () {
            if (!this.attach) {
                return;
            }
            $(this.imgKey).attr('height', '');
            $(this.imgKey).attr('width', '');
            var reader = new FileReader();
            var self = this;
            reader.onload = function () {
                var img = new Image();
                img.onload = function () {
                    $(self.imgKey).attr("src", reader.result);
                    self.settings.height = this.height;
                    self.settings.width = this.width;
                    self._updateStyle();
                }
                img.src = reader.result;
            }
            reader.readAsDataURL(this.attach);
        },
    });
});
