;(function () {
    define([], function (require) {
        require('jquery.ui');
        require('jquery.iframe-transport');
        require('jquery.progressbar');
        require('GO.util');
        require('jquery.fileupload');
        var $ = require('jquery');
        var FileItemView = require('components/fileupload/views/file_item');
        var commonLang = require('i18n!nls/commons');
        var App = require('app');
        var defaults = {
            locale: $('meta[name="locale"]').attr('content'),
            lang: {
                'ko': {
                    '삭제': '삭제',
                    '파일 첨부': '파일 첨부'
                },
                'ja': {
                    '삭제': '削除',
                    '파일 첨부': 'ファイル添付'
                },
                'en': {
                    '삭제': 'Delete',
                    '파일 첨부': 'Attach'
                },
                'zh_CN': {
                    '삭제': '删除',
                    '파일 첨부': '添加文件'
                },
                'zh_TW': {
                    '삭제': '刪除',
                    '파일 첨부': '添加文件'
                },
                'vi': {
                    '삭제': 'Xóa',
                    '파일 첨부': 'Tập tin đính kèm'
                }
            },
            button_class: "button_text",
            mode: "TEXT",
            button_style: "border: 1px solid #D1D1D1;background-color:#efefef;display:inline-block;cursor:pointer;color:#666;border-radius:2px;width: 100%; padding: 2px 0 0;font-size:12px;font-weight:bold; text-align: center;vertical-align: middle;font-family:돋움,dotum,AppleGothic,arial,Helvetica,sans-serif;",
            progressBarUse: true,
            textTmpl: [
                "<span class='wrap_btn wrap_file_upload'>",
                "<span class='btn_file_form fileinput-button' style='text-align: center;'>",
                "<span class='button text'>{text}</span>",
                "<input type='file' name='file' title='{title}' multiple='' accept={accept} />",
                "</span>",
                "<div class='progress' style='display:none;margin-top:5px'></span>",
                "</span>"].join(""),
            imgTmpl: [
                "<span class='wrap_btn wrap_file_upload'>",
                "<span class='fileinput-button'>",
                "<span class='ic_con ic_file_up'></span>",
                "<input type='file' name='file' title='{title}' style='height:inherit;' multiple=''/>",
                "</span>",
                "<div class='progress' style='display:none;margin-top:5px'></span>",
                "</span>"].join(""),
            // profile, ci 등 투명버튼
            commentTmpl: [
                "<span class='wrap_btn wrap_file_upload'>",
                "<span>",
                "<span class='ic24 ic_file_upload'></span>",
                "<input type='file' name='file' title='{title}' style='height:inherit;' multiple=''/>",
                "</span>",
                "<div class='progress' style='display:none;'></div>",
                "</span>"].join("")
        };

        defaults.button_text = defaults.lang[defaults.locale] == undefined ?
            defaults.lang['ko']["파일 첨부"] : defaults.lang[defaults.locale]['파일 첨부'];
        defaults.button_title = defaults.button_text;
        /*
         * options = {
         *      (require)
         *      el : replace element
         *      context_root : context root
         *      url : api url
         *      
         *      (options)
         *      button_text : button text
         *      button_class : add class type
         *      button_style : add class style
         *      button_height : button_height
         *      button_width : button_width
         *      progressEl : target process element
         *      locale : locale
         *      progressBarUse : proccess bar use / unuse
         *      mode : "TEXT" : "IMAGE"
         *      multiple : true (default : undefined) : false, Over IE10
         * }
         */
        function JqueryFileUpload(options) {
            console.info("call jquery-fileupload");

            validate(options);

            var opts = $.extend({}, defaults, options);

            this.lang = opts.lang.hasOwnProperty(opts.locale) ? opts.lang[opts.locale] : opts.lang["ko"];

            // init button el
            var fileEl = "";
            if (opts.mode == "TEXT") {
                fileEl = template(opts.textTmpl, {
                    text: opts.button_text,
                    title: opts.button_title,
                    accept: opts.accept
                });
            } else if (options.mode == "IMAGE") {
                fileEl = template(opts.imgTmpl, {title: opts.button_title});
            } else if (options.mode == "COMMENT") {
                fileEl = template(opts.commentTmpl, {title: opts.button_title});
            }

            this.el = $(fileEl);
            if (opts.multiple == false) {
                this.el.find("input[name='file']").removeAttr('multiple');
            }
            initButtonCss(this.el.find("span.upload_button"), opts);

            $(opts.el).replaceWith(this.el);

            this.isMail = options.isMail || false;

            // init progressBar
            this.progressBarUse = opts.progressBarUse;
            if (this.progressBarUse) {
                var self = this;
                this.progressEl = (opts.progressEl == undefined) ? this.el.find("div.progress") : $(opts.progressEl);
                this.progressBarOpt = {
                    boxImage: opts.context_root + 'resources/images/progressbar.gif',
                    barImage: opts.context_root + 'resources/images/progressbg_green_100.gif',
                    width: 200,
                    max: 100
                };

                this.progressEl.hide();
                this.progressEl.progressBar(0, this.progressBarOpt);
                this.progressEl.find("span:first").css("vertical-align", "top");
                this.progressEl.append("<a><span class='ic_classic ic_del' title='" + this.lang["삭제"] + "'></span><a>");
                this.progressEl.find("span.ic_del").on("click", function () {
                    $(self.el).trigger("cancel:upload");
                });
            }

            var fileUploadOption = {
                autoUpload: true,
                pasteZone: null,
                url: getUploadUrl(opts),
                timeout: 0,
                dropZone: $(opts.dropZone)
            };

            if (opts.file_post_name) {
                fileUploadOption["paramName"] = opts.file_post_name;
            }

            if (opts.post_params) {
                fileUploadOption["formData"] = opts.post_params;
            }

            //init jquery file upload
            this.fileuploadObject = this.el.fileupload(fileUploadOption);

            //cancel event
            var self = this;
            $(this.el).on("cancel:upload", function () {
                self.XHR.abort();
            });
        }

        function setCssProperties(cssProperties) {
            var css = {};

            $.each(cssProperties.split(";"), function () {
                var cssData = this.split(":"),
                    key = cssData[0],
                    value = $.trim(cssData[1]);

                css[key] = value;
            });
            return css;
        }

        /*
         * return {
         *      name : 파일 이름
         *      size : 파일 사이즈
         *      type : 파일 확장자
         * }
         */

        JqueryFileUpload.prototype.queue = function (callback) {
            var self = this;
            this.fileuploadObject.bind("fileuploadadd", function (e, result) {
                self.XHR = result;

                var file = result.files[0],
                    data = {
                        name: file.name,
                        size: file.size,
                        type: "." + file.name.split("\.")[1]
                    };

                callback(e, data);
            });
            return this;
        };

        /*
         * callback method의 값이 false면 fileupload 정지
         * 
         * return {
         *      name : 파일 이름
         *      size : 파일 사이즈
         *      type : 파일 확장자
         * }
         */

        JqueryFileUpload.prototype.start = function (callback) {
            this.fileuploadObject.bind("fileuploadsend", function (e, result) {

                var file = result.files[0];
                var fileName = file.name;
                var fileSize = file.size;
                var fileType = "";

                var allowedFileUploadSize = App.config('allowedFileUploadSize');
                if (allowedFileUploadSize < fileSize) {
                    var size = App.i18n(commonLang["첨부할 수 있는 최대 사이즈는 0MB 입니다."], "arg1", App.util.getHumanizedFileSize(allowedFileUploadSize)).replace('MB', '');
                    $.goSlideMessage(size, 'caution');
                    return false;
                }

                if (fileName.lastIndexOf(".") < 0) {
                    fileType = "none";
                } else {
                    fileType = fileName.substr(fileName.lastIndexOf(".") + 1);
                }

                var data = {
                    name: fileName,
                    size: fileSize,
                    type: "." + fileType
                };

                return callback(e, data);
            });
            return this;
        };

        /*
         * return {
         *      name : 파일 이름
         *      type : 파일 확장자
         *      loadedSize : 로딩된 file size
         *      totalSize : 전체 file size
         * }
         */

        JqueryFileUpload.prototype.progress = function (callback) {
            var self = this;

            this.fileuploadObject.bind("fileuploadprogress", function (e, result) {

                var file = result.files[0],
                    data = {
                        name: file.name,
                        type: "." + file.name.split("\.")[1],
                        loadedSize: result.loaded,
                        totalSize: result.total
                    };

                if (self.progressBarUse) {
                    self.progressEl.show();

                    var fileUploadPercent = Math.ceil(data.loadedSize / data.totalSize * 100);

                    if (fileUploadPercent > 99) {
                        fileUploadPercent = 100;
                    }

                    self.progressEl.progressBar(fileUploadPercent, self.progressBarOpt);
                }

                callback(e, data);
            });
            return this;
        };

        /*
         * return {
         *      e : event
         *      data : server data
         *      $fileTmpl : file item (jquery selector)
         * }
         */

        JqueryFileUpload.prototype.success = function (callback) {
            var self = this;

            this.fileuploadObject.bind("fileuploaddone", function (e, serverData) {
                console.info("uploadSuccess Call");
                var resultData = {};
                var options = {};
                var fileItem = null;

                if (self.isMail) {
                    var parsedData = JSON.parse(serverData.result);
                    var split = parsedData.fileName.split(".");
                    var ext = split[split.length - 1];

                    resultData["data"] = parsedData;
                    resultData["data"].fileExt = ext;
                    options.uid = parsedData.uid;
                } else {
                    if ($.browser.msie && Number($.browser.version) < 10) {
                        resultData = $.parseJSON($('pre', serverData.result).text());
                    } else {
                        resultData = serverData.result;
                    }
                }

                var data = resultData.data;

                options = {
                    fileName: data.fileName,
                    filePath: data.filePath,
                    hostId: data.hostId,
                    fileSize: GO.util.getHumanizedFileSize(data.fileSize),
                    fileClass: GO.util.getFileIconStyle({extention: data.fileExt}),
                    removeText: self.lang["삭제"],
                    thumbnail: data.thumbnail
                };

                if (GO.util.isImage(data.fileExt)) {
                    fileItem = FileItemView.createImageFile(options);
                } else {
                    fileItem = FileItemView.createFile(options);
                }

                callback(e, resultData, fileItem.$el);
            });
            return this;
        };

        JqueryFileUpload.prototype.complete = function (callback) {
            var self = this;
            this.fileuploadObject.bind('fileuploadalways', function (e, data) {
                if (self.progressBarUse) {
                    self.progressEl.hide();
                    self.progressEl.progressBar(0, self.progressBarOpt);
                }
                callback(e, data);
            });
            return this;
        };

        JqueryFileUpload.prototype.error = function (callback) {
            this.fileuploadObject.bind('fileuploadfail', function (e, data) {
                console.info("jquery file upload error !!");
                callback(e, data);
            });
            return this;
        };

        function template(tpl, data) {
            return tpl.replace(/{(\w*)}/g, function (m, key) {
                return data.hasOwnProperty(key) ? data[key] : "";
            });
        }

        function initButtonCss(buttonEl, opt) {
            var bCss = setCssProperties(opt.button_style);

            buttonEl.css(bCss);
            buttonEl.css("height", opt.button_height);
            buttonEl.css("width", opt.button_width);
            buttonEl.addClass(opt.button_class);
        }

        function getUploadUrl(opts) {
            var url = "";
            if ($.browser.msie && Number($.browser.version) < 10) {
                var urlArr = opts.url.split("?");
                url = opts.context_root + urlArr[0] + "/submit?" + urlArr[1];
            } else {
                url = opts.context_root + opts.url;
            }
            return url;
        }

        function validate(opts) {
            if (opts.context_root == undefined || opts.el == undefined || opts.url == undefined) {
                throw new Exception('require parameter[context_root, el, url]');
            }
        }

        return JqueryFileUpload;
    });
})();
