define("components/go-fileuploader/mobile", [
        "jquery",
        "underscore",
        "app",
        "i18n!nls/commons",
        "browser",
        "webfolder/views/mobile/m_home",
        "jquery.fileupload"
    ],
    function ($, _, GO, CommonLang, browser, WebFolderView) {

        function FileUploader($button, options) {
            options = options || {};

            var androidAttachOverlay = $('<div id="popAttachOverlay" class="overlay" style="z-index:101"/>');
            var androidAppTpl = $('<span class="btn_wrap"><a href="javascript:;" id="btnAttachLayer"><span class="btn btn_attach_photo"></span></a></span>');
            var mobileWebAppTpl = $('<span data-upload-btn class="btn_wrap" style="position:relative"><span><span class="btn btn_attach_file"></span><input type="file" multiple name="file" class="btn_image_upload" style="position:absolute;left:0;top:0;width:40px;height:40px;opacity:0"/></span></span>');
            var androidAppFileTpl = $('<span class="btn_wrap"><a href="javascript:;" data-bypass id="callFile"><span class="btn btn_attach_file"></span></a></span>');
            var contactMobileWebTpl = $('<input type="file" name="file" class="btn_image_upload" accept="image/*" style="position:absolute;left:0;top:0;width:68px;height:68px;opacity:0" />');
            var webFolderIconTpl = $('<div class="btn_wrap"><a href=""><span class="btn btn_attach_folder"></span></a></div>');
            var toDoTpl = $('<input class="btn_image_upload" type="file" multiple name="file" title="' + CommonLang['파일 첨부'] + '" alt="' + CommonLang['파일 첨부'] + '" style="cursor:pointer">');
            var toDoInputStyles = {
                "font-size": 0,
                "position": 'absolute',
                "left": '0px',
                "top": '0px',
                "width": '100%',
                "height": '100%',
                "opacity": 0
            };

            if (options.isContact) {
                if (GO.config("isMobileApp")) {
                    $('.photo a').addClass("btn_attach_photo");
                } else {
                    $button.html(contactMobileWebTpl);
                }
            } else if (options.isToDo) {
                // IE10 이하에서는 font-size 0px로 주면 더블클릭해야 한다.
                if (browser.msie && browser.version < 11) {
                    _.extend(toDoInputStyles, {"font-size": '999px'});
                }
                toDoTpl.css(toDoInputStyles);
                $button.css({"position": 'relative', "overflow": 'hidden'}).append(toDoTpl);
            } else {
                if (GO.util.isAndroidApp()) {
                    $button.html(androidAppFileTpl).append(androidAppTpl);
                } else {
                    $button.html(mobileWebAppTpl);
                }
                if (GO.config('isWebFolderAvailable')) {
                    $button.append(webFolderIconTpl);
                }
            }

            window.attachFileSuccess = options.success;
            window.attachFileFail = options.error;

            $('[data-upload-btn]').off("vclick");
            $('[data-upload-btn]').on('vclick', function (e) {
                e.stopImmediatePropagation();
                window.target = $(e.currentTarget);
                if (!validateBeforeUpload(window.target)) {
                    return false;
                }
                //댓글관련
                setAttachPlaceInComment();
                if (typeof (options.androidCallFile) === 'function') {
                    //게시판 , 업무, 커뮤니티
                    options.androidCallFile();
                } else {
                    //그 외 (전자결제, 게시판 , 업무, 커뮤니티 제외한 나머지 메뉴)
                    var attachSizeLimit = GO.config('allowedFileUploadSize') ? GO.config('allowedFileUploadSize') / 1024 / 1024 : -1;
                    GO.util.callFile(attachSizeLimit);
                }
            });

            $('input[type="file"].btn_image_upload').off("change");
            $('input[type="file"].btn_image_upload').on('change', function (e) {
                $("div.option_display").data("attachable", "true");
                e.stopImmediatePropagation();
                window.target = $(e.currentTarget);
                setAttachPlaceInComment();
                if (!validateBeforeUpload(window.target)) {
                    return false;
                }
                uploadFile(e);
            });

            $('.btn_attach_folder, #todoWebFolder, .todoitem-attach-webfolder').off("vclick");
            $('.btn_attach_folder, #todoWebFolder, .todoitem-attach-webfolder').on('vclick', function (e) {
                $("div.option_display").data("attachable", "true");
                e.preventDefault();
                e.stopPropagation();
                window.target = $(e.currentTarget);
                setAttachPlaceInComment();
                if (!validateBeforeUpload(window.target)) {
                    return false;
                }
                this.webFolderView = new WebFolderView({});
                $("#goBody").hide();
                this.webFolderView.render({
                        callback: function (param) {
                            uploadWebFolder(param);
                            return false;
                        }
                    }
                );
            });

            function validateBeforeUpload($targetBtn) {
                if ($targetBtn.parents('#comment_edit_control').siblings('[data-emoticon-edit-part]').find('img').length > 0) {
                    GO.util.delayAlert(CommonLang["선택한 이모티콘 삭제 후 파일을 첨부해주세요."]);
                    return false;
                }
                return true;
            }

            function uploadWebFolder(param) {
                $.ajax({
                    url: "/api/webfolder/mail/attach/write",
                    type: 'POST',
                    contentType: "application/json; charset=UTF-8",
                    processData: false,
                    data: JSON.stringify(param),
                    async: false,
                    error: function (e) {
                        window.attachFileFail(e);
                    }
                }).done(
                    function (result) {
                        setTimeout(function () {
                            GO.util.appLoading(false);
                            if (options.isToDo) {
                                uploadWebFolderToDo(result)
                            } else {
                                checkUploadFile(result);
                            }
                        }, 1000)
                    }
                )
            }

            function uploadWebFolderToDo(attaches) {
                _.each(attaches.data, function (attach) {
                    attachFileSizeValidate(attach.size);
                    var param = {
                        fileExt: attach.extension,
                        fileName: attach.name,
                        fileSize: attach.size,
                        filePath: attach.upkey,
                        thumbnail: ["/thumb/temp/", attach.hostId, "/small", attach.upkey].join(""),
                        hostId: attach.hostId
                    };
                    $.ajax({
                        url: options.webFolderUrl,
                        type: 'POST',
                        async: false,
                        data: param,
                        success: function (result) {
                            window.attachFileSuccess(result);
                        },
                        error: function (e) {
                            window.attachFileFail(e);
                        }
                    });
                });
            }

            function checkUploadFile(attaches) {
                _.each(attaches.data, function (attach) {
                    attachFileSizeValidate(attach.size);
                    var file = {};
                    file.data = {
                        "filePath": attach.upkey,
                        "fileSize": attach.size,
                        "fileName": attach.name,
                        "hostId": attach.hostId,
                        "preview": attach.preview,
                        "uid": (attach.uid) ? attach.uid : "",
                        "type": "normal",
                        "notChage": true,
                        "fileExt": attach.extension,
                        "thumbnail": ["/thumb/temp/", attach.hostId, "/small", attach.upkey].join("")
                    };
                    window.attachFileSuccess(file);
                });
            }

            function setAttachPlaceInComment() {
                var $buttonWrapId = window.target.closest('div[id*="_fileuploader"]').attr("id");
                var isCommentLayout = !_.isUndefined($buttonWrapId)
                    && ($buttonWrapId.indexOf("form") > -1 || $buttonWrapId.indexOf("item") > -1 || $buttonWrapId.indexOf("reply") > -1);
                if (isCommentLayout) {
                    //$buttonWrapId : item_fileuploader, form_fileuploader, reply_fileuploader
                    window.target.closest('div[id*="_fileuploader"]').data("attachable", "true");
                    GO.EventEmitter.trigger("m_comment", $buttonWrapId);
                }
            }

            function uploadFile(e) {
                var $eTarget = $(e.currentTarget),
                    files = $eTarget.get(0).files;

                _.each(files, function (file) {
                    var fd = new FormData();
                    var type = getFileExtension(file.name);

                    if (type == undefined) {
                        alert(CommonLang['첨부할 수 없는 파일 입니다.']);
                        return;
                    }

                    if (GO.config('excludeExtension')) {
                        var index = $.inArray(type.toLowerCase(), GO.config('excludeExtension').split(','));
                        if (index >= 0) {
                            alert(GO.i18n(CommonLang['확장자가 땡땡인 것들은 첨부 할 수 없습니다.'], "arg1", GO.config('excludeExtension')));
                            return false;
                        }
                    }

                    attachFileSizeValidate(file.size);
                    fd.append('file', file);
                    fd.append('GOSSOcookie', $.cookie('GOSSOcookie'));
                    $.ajax({
                        url: options.url || GO.contextRoot + "api/file",
                        type: 'POST',
                        async: false,
                        contentType: false,
                        processData: false,
                        data: fd,
                        success: function (resp) {
                            window.attachFileSuccess(resp);
                        },
                        error: function (e) {
                            window.attachFileFail(e);
                        }
                    });
                });
                $eTarget.val('');
            }

            function getFileExtension(fileName) {
                var nameAndTypeList = fileName.split(".");
                return nameAndTypeList[nameAndTypeList.length - 1];
            }

            function attachFileSizeValidate(fileSize) {
                var attachSizeLimit = GO.config('allowedFileUploadSize') ? GO.config('allowedFileUploadSize') : -1;
                try {
                    if (attachSizeLimit > -1) {
                        if (attachSizeLimit < fileSize) {
                            throw new Error("AttachSizeException");
                        }
                    }
                } catch (e) {
                    var message = e.message;
                    if (message == "AttachSizeException") {
                        GO.util.delayAlert(GO.i18n(CommonLang['첨부할 수 있는 최대 사이즈는 0MB 입니다.'], "arg1", attachSizeLimit / 1024 / 1024));
                    }
                    throw new Error("Attach Validation Error - AppConfig");
                }
            }

            if (GO.util.isAndroidApp() || (GO.config("isMobileApp") && options.isContact)) {

                if (options.isToDo) {
                    toDoTpl.off('click');
                    toDoTpl.on('click', function (e) {
                        e.preventDefault();
                        window.target = $(e.currentTarget);
                        if ($button.data('attachtype') === 'image') {
                            window.GOMobile.callAlbum('attachFileSuccess', 'attachFileFail');
                        } else {
                            var attachSizeLimit = GO.config('allowedFileUploadSize') ? GO.config('allowedFileUploadSize') / 1024 / 1024 : -1;
                            GO.util.callFile(attachSizeLimit);
                        }
                    });
                }

                $('.btn_attach_photo').off("click");
                $('#callAlbum').off("vclick");
                $('#callCamera').off("vclick");
                $('.btn_attach_file').off("vclick");

                $('.btn_attach_photo').on('click', function (e) {
                    $("div.option_display").data("attachable", "true");
                    e.stopImmediatePropagation();
                    window.target = $(e.currentTarget);
                    if (!validateBeforeUpload(window.target)) {
                        return false;
                    }
                    setAttachPlaceInComment();
                    toggleAttachEl();
                });

                $('#callAlbum').on('vclick', function (e) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                    callAlbumOrCamera(e, GO.util.callAlbum);
                });

                $('#callCamera').on('vclick', function (e) {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                    e.preventDefault();
                    callAlbumOrCamera(e, GO.util.callCamera)
                });

                $('.btn_attach_file').on('vclick', function (e) {
                    e.stopImmediatePropagation();
                    window.target = $(e.currentTarget);
                    if (!validateBeforeUpload(window.target)) {
                        return false;
                    }
                    //댓글관련
                    setAttachPlaceInComment();
                    if (typeof (options.androidCallFile) === 'function') {
                        //게시판 , 업무, 커뮤니티
                        options.androidCallFile();
                    } else {
                        //그 외 (전자결제, 게시판 , 업무, 커뮤니티 제외한 나머지 메뉴)
                        var attachSizeLimit = GO.config('allowedFileUploadSize') ? GO.config('allowedFileUploadSize') / 1024 / 1024 : -1;
                        GO.util.callFile(attachSizeLimit);
                    }
                });

                function toggleAttachEl() {
                    var attachEl = $('#attachLayer');
                    if (attachEl.css('display') == 'block') {
                        attachEl.hide();
                        $('#popAttachOverlay').remove();
                        $('#mobileContent').focus().show();
                    } else {
                        setAttachOverlay();
                        if ($(window).height() < $('.go_content').height()) {
                            //모바일 디바이스 높이보다 내용높이가 크면 첨부레이어위치를 약간 위로 조절
                            attachEl.css("top", "25%");
                        }
                        attachEl.show();
                        $('#mobileContent').hide();
                        $('input').blur().focusout();
                    }
                    return false;
                }

                function setAttachOverlay() {
                    var attachEl = $('#attachLayer');
                    attachEl.hide();
                    $('#popAttachOverlay').remove();
                    $('.go_wrap').after(androidAttachOverlay);

                    var overlayClose = function () {
                        $('#popAttachOverlay').click(function (e) {
                            toggleAttachEl(e);
                        });
                    };
                    setTimeout(overlayClose, 1000);
                }

                function callAlbumOrCamera(e, utilAlbumOrCamera) {
                    $('#popAttachOverlay').remove();
                    $('#attachLayer').hide();
                    $('#mobileContent').show();
                    if (options.isContact && utilAlbumOrCamera === GO.util.callAlbum) {
                        GO.util.callContactAlbum(1);
                    } else {
                        utilAlbumOrCamera();
                    }
                    if (e) {
                        e.stopPropagation();
                    }
                    return false;
                }
            }
        }

        return {
            bind: function (target, options) {
                options = options || {};

                $(target).each(function (i, el) {
                    new FileUploader($(el), options);
                });
            },

            getAttachInfo: function (wrapId) {
                var attaches = [];
                var attachPart = $(wrapId).find('li');
                var attachOpt;
                attachPart.each(function () {
                    attachOpt = {};
                    if ($(this).attr("data-path")) {
                        attachOpt.path = $(this).attr("data-path");
                    }
                    if ($(this).attr("data-name")) {
                        attachOpt.name = $(this).attr("data-name");
                    }
                    if ($(this).attr("data-id")) {
                        attachOpt.id = $(this).attr("data-id");
                    }
                    attaches.push(attachOpt);
                });
                return attaches;
            },

            attachFileValidateBySaaS: function (currentSize) {
                var totalSize = currentSize;
                var totalNumber = $("li[data-size]").length + 1;
                var maxSize = (GO.config('attachSizeLimit')) ?
                    parseInt(GO.config('maxAttachSize')) : parseInt(GO.config('commonAttachConfig').maxAttachSize);
                var maxNumber = (GO.config('attachNumberLimit')) ?
                    parseInt(GO.config('maxAttachNumber')) : parseInt(GO.config('commonAttachConfig').maxAttachNumber);
                _.each($("li[data-size]"), function (file) {
                    totalSize += $(file).data('size');
                });
                if (maxSize * 1024 * 1024 < totalSize) {
                    throw new Error("AttachSizeException");
                }
                if (maxNumber < totalNumber) {
                    throw new Error("AttachNumberExceptionBySaaS");
                }
            }
        };

    });