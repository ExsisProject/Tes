define([
        "jquery",
        "backbone",
        "app",
        "hgn!components/attach_file/templates/attach_file",
        "i18n!nls/commons",
        "GO.util",

        "jquery.cookie"
    ],

    function (
        $,
        Backbone,
        GO,
        AttachFileTpl,
        Lang
    ) {

        var BaseAttachFileItem = Backbone.View.extend({
            tagName: "li",
            downloadUrl: null,
            events: {
                "click .btn-download": "_download",
                "click .btn-preview": "_preview",
                "click .wrap_ic_file_preview": "_preview",
                "click .btn-file-remove": "_remove",
                "click span.btn_wrap span.ic_classic": "_remove",
                "vclick span.btn_wrap span.ic_del": "_remove", //모바일 이미지
                "vclick span.optional a.btn-text.ic_del": "_remove", //모바일 첨부파일
                "vclick span.optional span.ic_file_del": "_remove" //모바일 첨부파일
            },
            initialize: function (options) {
                this.options = options || {};
                this.model = this.options.model;
                this.fancyGroupId = this.options.fancyGroupId;
                this.observer = options.observer;
            },

            render: function () {
                var self = this;
                var isEditMode = this.options.mode == "edit" || this.model.get('mode') == "edit";
                var downloadable = isEditMode ? false : (isMobileWeb() ? this.model.get('download') : true);
                var previewable = this.model.get('preview');
                var useMobilePreview = isEditMode ? false : previewable && this.model.get("encrypt");
                var useMobileTempPreview = isEditMode && GO.router.getUrl().indexOf("approval") > -1 && previewable;
                var isImageType = self.isImage();
                var opt = {
                    "name": this.model.get('name'),
                    "extension": this.model.get('extention'),
                    "file_size": GO.util.getHumanizedFileSize(this.model.get('size')),
                    "icon_class": GO.util.getFileIconStyle(this.model.toJSON()),
                    "editable?": isEditMode,
                    "downloadable?": downloadable,
                    "previewable?": previewable,
                    "useMobilePreview": useMobilePreview,
                    "useMobileTempPreview": useMobileTempPreview,
                    "hostId": this.model.get("hostId"),
                    "download_url": this.options.downloadUrl == undefined ? "#" : this.options.downloadUrl(this.model),
                    "encrypt": this.model.get("encrypt"),
                    "thumbSmall": this.model.get('thumbSmall'),
                    "isImageType": isImageType,
                    "imageGroupId": this.fancyGroupId,
                    "isMobile": isMobileWeb(),
                    "editable": this.options.editable !== false,
                    "isMobileApp": GO_config.__config__.isMobileApp
                };

                var itemTpl = renderTemplate(opt);
                this.$el.html(itemTpl);
                this.$el.attr("data-name", this.model.get("name"));
                this.$el.attr("data-size", this.model.get("size"));

                if (this.model.get('id') == undefined) {
                    this.$el.attr("data-path", this.model.get("filePath"));
                } else {
                    this.$el.attr("data-id", this.model.get("id"));
                }
                return this;
            },

            isImage: function () {
                return !!GO.util.isImage(this.model.get('extention'));
            },

            isFile: function () {
                return !this.isImage();
            },
            _preview: function (e) {
                e.preventDefault();
                e.stopPropagation();
                var currentEl = $(e.currentTarget);
                return GO.util.preview(currentEl.attr("data-id"));
            },
            on: function () {
                this.$el.on.apply(this.$el, arguments);
            },

            off: function () {
                this.$el.off.apply(this.$el, arguments);
            },

            _download: function (e) {
                var $el = $(e.currentTarget),
                    $li = $el.closest('li');

                if (GO.config('deviceType') === 'mobile') {
                    previewFileForMobile($li.data('model'), $el.attr('href'));
                } else {
                    return true;
                }
                return false;
            },

            _remove: function (e) {
                this.$el.trigger('removedFile', [{"id": this.$el.data('id'), "name": this.$el.data('name'), "el": e}]);
                this.$el.remove();
                if (!_.isUndefined(this.observer)) { //컨포넌트에서 첨부파일 시 실행됨.
                    this.observer.trigger('removeFile', [{
                        "id": this.$el.data('id'),
                        "name": this.$el.data('name'),
                        "el": e
                    }]);
                }
                return false;
            }
        });

        return Backbone.View.extend({
            className: 'wrap_attach',

            events: {},

            initialize: function (options) {
                this.options = options || {};

                if (this.options.placeholder) {
                    $(this.options.placeholder).replaceWith(this.$el);
                }

                if (!this.collection) {
                    this.collection = new Backbone.Collection();
                }

                if (!this.options.downloadUrl) {
                    this.options.downloadUrl = function () {
                    };
                }

                if (this.options.mode != "item") {
                    this.$el.append('<ul class="file_wrap" style="display:none"></ul>', '<ul class="img_wrap" style="display:none"></ul>');
                }
                this.observer = _.extend({}, Backbone.Events);
            },

            /**
             * TODO: 첨부파일에 대한 퍼미션 구현(삭제 가능 여부)
             */
            render: function () {
                var self = this;
                var groupedList = this.collection.groupBy(function (model) {
                    return self.isImageType(model) ? 'images' : 'files';
                });

                renderFileListView.call(this, groupedList['files'] || []);
                renderImageListView.call(this, groupedList['images'] || []);
            },

            isImageType: function (model) {
                if (GO.util.isImage(model.get('extention'))) {
                    var editable = this.options.mode != undefined && this.options.mode == "edit";
                    return !(isMobileWeb() && !editable && !model.get('mobilePreview'));
                }
                return false;
            },

            /**
             * 파일업로드 후 첨부된 파일정보 추가
             * @param fileData <AttachFileModel> 참고
             */
            attach: function (fileData) {
                var attachModel = getAttachModelFromFileData(fileData);

                if (GO.util.isImage(fileData.extension)) {
                    renderImageListView.call(this, [attachModel]);
                } else {
                    renderFileListView.call(this, [attachModel]);
                }
            }
        }, {
            create: function (placeholder, attaches, downloadUrl, mode) {

                var instance = new this.prototype.constructor({
                    "placeholder": placeholder,
                    "collection": _.isArray(attaches) ? new Backbone.Collection(attaches) : attaches,
                    "downloadUrl": _.isFunction(downloadUrl) ? downloadUrl : function () {
                        return downloadUrl;
                    },
                    "mode": mode
                });

                instance.render();

                return instance;
            },
            edit: function (placeholder, attaches, downloadUrl, editable) {
                var instance = new this.prototype.constructor({
                    "placeholder": placeholder,
                    "collection": _.isArray(attaches) ? new Backbone.Collection(attaches) : attaches,
                    "mode": "edit",
                    "editable": editable
                });

                instance.render();

                return instance;
            },
            makeItem: function (attache, downloadUrl) {
                var attachFileItem = new BaseAttachFileItem({
                    model: new Backbone.Model(attache),
                    downloadUrl: downloadUrl
                });
                return attachFileItem.render();
            }
        });

        function renderImageListView(images) {
            renderAttachListView.call(this, 'image', images);
        }

        function renderFileListView(files) {
            renderAttachListView.call(this, 'file', files);
        }

        function renderAttachListView(type, flist) {
            var cn = {'image': 'img_wrap', 'file': 'file_wrap'}[type],
                selector = '.' + cn,
                fancyGroupId = getUUID(),
                self = this;

            if (flist.length <= 0) return;

            _.each(flist, function (model) {
                var $el = compileAttachItemView.call(self, model, fancyGroupId).$el;
                $el.data('model', model.toJSON());
                this.$el
                    .find(selector)
                    .show()
                    .append($el);
            }, this);
        }

        function compileAttachItemView(attachModel, fancyGroupId) {
            var newVar = {
                model: attachModel,
                downloadUrl: this.options.downloadUrl,
                mode: this.options.mode,
                fancyGroupId: fancyGroupId,
                editable: _.isUndefined(this.options.editable) ? false : this.options.editable,
                observer: this.observer
            };
            return (new BaseAttachFileItem(newVar)).render();
        }

        function getAttachModelFromFileData(fileData) {
            return new Backbone.Model({
                "name": fileData.name,
                "extention": fileData.extension,
                "size": fileData.size,
                "download": false,
                "preview": !!fileData.preview,
                "thumbSmall": fileData.thumbnail,
                "encrypt": ''
            });
        }

        function previewFileForMobile(model, downloadPath) {

            var reExt = new RegExp("(jpeg|jpg|png|bmp)", "gi"),
                extension = model.extention,
                fileName = model.name;

            if (GO.config('deviceType') !== 'mobile') return false;

            if (reExt.test(extension) && GO_config.__config__.mobileConfig.useMobilePreview) {
                GO.util.attachImages([{"fileName": fileName, "url": model.thumbLarge}], 0);
            } else {
                var host = location.protocol + "//" + location.host;
                GO.util.attachFiles(host + downloadPath, fileName, model.size);
            }
            return true;
        }

        function renderTemplate(options) {
            _.defaults(options || {}, {
                "id": 0,
                "name": 'no name',
                "extension": 'def',
                "file_size": 0,
                "icon_class": (options.icon_class == undefined) ? 'ic_def' : options.icon_class,
                "download_url": null,
                "downloadable?": false,
                "removable?": true,
                "previewable?": options.preview !== undefined,
                "label": {
                    "save": Lang["다운로드"],
                    "remove": Lang["삭제"],
                    "preview": Lang["미리보기"]
                }
            });

            return AttachFileTpl(options);
        }

        function getUUID() {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }

        // TODO: 공통 유틸로 빼야 함...
        // 아직 빼지 않은 이유... go-util.js에 $.cookie 플러그인이 묶이게 되는데, 먼저 로드되리라는 보장이 없기 때문...
        function isMobileWeb() {
            var deviceType = GO.config('deviceType');
            var pcVersion = $.cookie('pcVersion');
            var result = true;

            switch (deviceType) {
                // 디바이스 타입이 pc이면 모바일웹 아님
                case 'pc':
                    result = false;
                    break;
                // 태블릿일 경우
                case 'tablet':
                    // pcVersion 쿠키가 없으면 모바일웹 아님
                    if (!pcVersion) {
                        result = false;
                        // pcVersion 쿠키가 있고 값이 true 이면 모바일웹 아님
                    } else if (pcVersion && pcVersion === 'true') {
                        result = false;
                        // 그외에는 모바일웹 버전
                    }

                    break;
                // 모바일일 경우
                case 'mobile':
                    // pcVersion 쿠키가 있고 true이면 모바일웹 아님
                    if (pcVersion && pcVersion === 'true') {
                        result = false;
                        // 그외에는 모바일웹
                    }

                    break;
            }
            return result;
        }
    });