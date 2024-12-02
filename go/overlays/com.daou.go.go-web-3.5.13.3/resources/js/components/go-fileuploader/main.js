define("components/go-fileuploader/main", [
        "jquery",
        "underscore",
        "app",
        "i18n!nls/commons",
        "browser",
        "jquery.progressbar",
        "jquery.fileupload"
    ],
    function ($, _, GO, CommonLang, browser) {
        function FileUploader($button, options) {
            options = options || {};
            // cursor 스타일은 css() 함수에 지정하면 적용이 되지 않아 인라인 스타일로 처리.
            var $file = $('<input class="go-fileupload" type="file" name="file" title="' + CommonLang['파일선택'] + '" alt="' + CommonLang['파일선택'] + '" style="cursor:pointer">');
            var inputStyles = {
                "font-size": 0,
                "position": 'absolute',
                "left": '0px',
                "top": '0px',
                "width": '100%',
                "height": '100%',
                "opacity": 0
            };
            var topts = {};

            // _.defaults 는 options 내용 자체를 바꾸므로 쓰지 말 것.
            topts = _.extend({}, {
                url: $button.data('url') || GO.config('contextRoot') + "api/file",
                // 안드로이드 앱만 해당됨
                attachType: '' + $button.data('attachtype') || 'file',
                success: function () {
                },
                error: function () {
                },
            }, options || {});

            // IE10 이하에서는 font-size 0px로 주면 더블클릭해야 한다.
            if (browser.msie && browser.version < 11) {
                _.extend(inputStyles, {"font-size": '999px'});
            }

            $file.css(inputStyles);
            if (topts.isWorks) {
                $button.css({"overflow": 'hidden'}).append($file);
            } else {
                $button.css({"position": 'relative', "overflow": 'hidden'}).append($file);
            }

            var totalAttachSize = 0;
            var totalAttachCount = 0;

            var self = this;
            this.progressEl = topts.progressEl ? $(topts.progressEl) : $("div.progress");
            this.progressBarOpt = {
                boxImage: GO.config('contextRoot') + 'resources/images/progressbar.gif',
                barImage: GO.config('contextRoot') + 'resources/images/progressbg_green_100.gif',
                width: 200,
                max: 100
            };
            this.progressEl.hide();
            this.progressEl.progressBar(0, this.progressBarOpt);
            this.progressEl.find("span:first").css("vertical-align", "top");
            this.progressEl.append("<a><span class='ic_classic ic_del' title='" + CommonLang['삭제'] + "'></span><a>");
            this.progressEl.find("span.ic_del").on("click", function () {
                self.XHR.abort();
            });

            $file.fileupload({
                url: topts.url + "?GOSSOcookie=" + $.cookie('GOSSOcookie'),
                autoUpload: true,
                dropZone: topts.dropZone,
                progressEl: this.progressEl,
                pasteZone: null,
                add: function (e, data) {
                    if (topts.validateFileType) {
                        var reExt = new RegExp("(" + topts.validateFileType + ")", "gi"),
                            fileName = data.files[0].name,
                            fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();

                        if (!reExt.test(fileExt)) {
                            $.goSlideMessage(topts.validateFileTypeMessage);
                            return false;
                        }
                    }
                    if (!GO.config('attachFileUpload')) {
                        $.goAlert(CommonLang['파일첨부용량초과']);
                        $("#dropZone").removeClass('drag_file');
                        return false;
                    }
                    self.XHR = data;

                    if (GO.session().brandName == "DO_SAAS") {
                        var maxAttachSize = parseInt(GO.config('commonAttachConfig').maxAttachSize);
                        var maxAttachByteSize = maxAttachSize * 1024 * 1024;

                        if (maxAttachByteSize < data.files[0].size) {
                            $.goMessage(GO.i18n(CommonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", maxAttachSize));
                            $("#dropZone").removeClass('drag_file');
                            return false;
                        } else {
                            totalAttachSize += data.files[0].size;
                        }

                        var currentTotalAttachCount = topts.totalAttachCount + totalAttachCount + 1;
                        var maxAttachNumber = parseInt(GO.config('commonAttachConfig').maxAttachNumber);

                        if (maxAttachNumber < currentTotalAttachCount) {
                            $.goMessage(GO.i18n(CommonLang['최대 첨부 갯수는 0개 입니다.'], "arg1", maxAttachNumber));
                            $("#dropZone").removeClass('drag_file');
                            return false;
                        } else {
                            totalAttachCount++;
                        }
                    }

                    data.submit();
                },
                progress: function (e, result) {
                    self.progressEl.show();

                    var file = result.files[0];
                    var data = {
                        name: file.name,
                        type: "." + file.name.split("\.")[1],
                        loadedSize: result.loaded,
                        totalSize: result.total
                    };

                    var fileUploadPercent = Math.ceil(data.loadedSize / data.totalSize * 100);
                    if (fileUploadPercent > 99) {
                        fileUploadPercent = 100;
                    }

                    self.progressEl.progressBar(fileUploadPercent, self.progressBarOpt);
                    if (topts.isWorks) {
                        topts.progress();
                    }
                },
                fail: function (e, data) {
                    if (data.jqXHR && data.jqXHR.statusText == "abort") {
                        topts.error(CommonLang['취소되었습니다.']);
                    } else {
                        topts.error(CommonLang['업로드에 실패하였습니다.']);
                    }
                },
                success: function (e, data) {
                    var result;
                    if ($.browser.msie && Number($.browser.version) < 10) {
                        result = $.parseJSON($('pre', e).text());
                    } else {
                        result = $.parseJSON(e);
                    }
                    if (topts.isWorks) {
                        topts.success(result);
                    } else {
                        topts.success(result.data);
                    }
                },
                always: function () {
                    self.progressEl.hide();
                    self.progressEl.progressBar(0, self.progressBarOpt);
                    totalAttachSize = 0;
                    totalAttachCount = 0;
                }
            });
        }

        return {
            bind: function (target, options) {
                options = options || {};

                $(target).each(function (i, el) {
                    new FileUploader($(el), options);
                });
            }
        };

    });
