(function (_) {

    var global = this,
        GO = global.GO = (global.GO || {}),
        _slice = Array.prototype.slice;

    GO.util = _.extend(GO.util || {}, {

        defaultLocale: 'ko',


        appLoading: function (boolean, message) {
            if (message) {
                if (GO.util.isAndroidApp()) {
                    window.GOMobile.callProgressBar(message, boolean);
                } else {
                    window.location = "gomobile://callProgressBar?" + message + "&" + boolean;
                }
            } else {
                if (GO.util.isAndroidApp()) {
                    window.GOMobile.callProgressBar(boolean);
                } else if (GO.util.isIosApp()) {
                    window.location = "gomobile://callProgressBar?" + boolean;
                }
            }
        },
        changeStatusBarColor: function (isDark) {
            if (GO.util.isAndroidApp()) {
                try {
                    window.GOMobile.changeStatusBarColor(isDark);
                } catch (e) {
                    console.log(e);
                    return;
                }
            } else if (GO.util.isIosApp()) {
                try {
                    window.location = "gomobile://changeStatusBarColor?" + isDark;
                } catch (e) {
                    console.log(e);
                    return;
                }
            }
        },
        pageDone: function (param) {
            if (GO.util.isAndroidApp()) {
                window.GOMobile.pageDone();
            } else if (GO.util.isIosApp()) {
                window.location = "gomobile://pageDone";
            }
        },
        //게시판 첨부파일
        attachFiles: function (saveUrl, fileName, fileSize) {
            if (GO.util.isAndroidApp()) {
                window.GOMobile.attachSave(saveUrl, fileName, fileSize);
            } else if (GO.util.isIosApp()) {
                window.location = "gomobile://attachSave?" + saveUrl + "&fileName=" + fileName;
            } else {
                window.open(saveUrl);
            }
            return;
        },
        //게시판 이미지 미리보기
        attachImages: function (images, selectedKey) {
            if (!images) return false;

            if (GO.util.isAndroidApp()) {
                window.GOMobile.attachImageView(JSON.stringify(images), selectedKey);
            } else if (GO.util.isIosApp()) {
                window.location = "gomobile://attachImageView?" + JSON.stringify(images) + "&" + selectedKey;
            } else {
                if (GO.util.checkOS() == "android") {
                    var w = window.open();
                    var windowHTML =
                        "<!DOCTYPE html>\n" +
                        "<html>\n" +
                        "<head></head>\n" +
                        "<body><img src='" + images[selectedKey]['url'] + "' /></body>\n" +
                        "</html>";
                    w.document.write(windowHTML);
                    w.document.close();
                } else {
                    window.open(images[selectedKey]['url']);
                }
            }
            return;
        },
        //캘린더 참석자 추가 - 조직도 호출
        callOrg: function (attendees) {
            try {
                if (GO.util.isAndroidApp()) {
                    window.GOMobile.callOrg(JSON.stringify(attendees), 'addSuccess', 'addFail');
                } else if (GO.util.isIosApp()) {
                    window.location = "gomobile://callOrg?" + JSON.stringify(attendees) + "&addSuccess&addFail";
                }
            } catch (e) {
            }
        },
        callFile: function (maxAttachSize, maxAttachNumber, excludeExtension) {
            try {
                var attachSize = (maxAttachSize == undefined) ? -1 : maxAttachSize,
                    attachNumber = (maxAttachNumber == undefined) ? -1 : maxAttachNumber,
                    extension = (excludeExtension == undefined) ? "" : excludeExtension;

                if (GO.util.isAndroidApp()) {
                    window.GOMobile.callFile('attachFileSuccess', 'attachFileFail', attachNumber, attachSize, extension);
                } else {

                }
            } catch (e) {

            }
        },
        callAlbum: function () {
            try {
                if (GO.util.isAndroidApp()) {
                    window.GOMobile.callAlbum('attachFileSuccess', 'attachFileFail');
                } else if (GO.util.isIosApp()) {
                    window.location = "gomobile://callAlbum?attachFileSuccess&attachFileFail";
                }
            } catch (e) {
            }
        },

        callContactAlbum: function (maxAttachNumber) {
            var attachNumber = (maxAttachNumber == undefined) ? -1 : maxAttachNumber;
            try {
                if (GO.util.isAndroidApp()) {
                    window.GOMobile.callContactAlbum('attachFileSuccess', 'attachFileFail', attachNumber);
                } else if (GO.util.isIosApp()) {
                    window.location = "gomobile://callContactAlbum?attachFileSuccess&attachFileFail";
                }
            } catch (e) {
            }
        },

        callCamera: function () {
            try {
                if (GO.util.isAndroidApp()) {
                    window.GOMobile.callCamera('attachFileSuccess', 'attachFileFail');
                } else if (GO.util.isIosApp()) {
                    window.location = "gomobile://callCamera?attachFileSuccess&attachFileFail";
                }
            } catch (e) {
            }
        },
        removeItem: function (key) {
            localStorage.removeItem(key);
        },
        setLocalStorage: function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },
        getLocalStorage: function (key) {
            return JSON.parse(localStorage.getItem(key));
        },
        /**
         입력받은 콜렉션의 페이징을 계산하여 모바일 페이징 템플릿을 반환

         @method mPaging
         @param {Object} collection 백본 콜렉션
         @return {String} 페이징 템플릿
         */
        mPagingLang: {
            'ko': {
                "다음": "다음",
                "이전": "이전"
            },
            'en': {
                "다음": "Newer",
                "이전": "Older"
            },
            'ja': {
                "다음": "次へ",
                "이전": "前へ"
            },
            'zh_CN': {
                "다음": "下一页",
                "이전": "前一页"
            },
            'zh_TW': {
                "다음": "下一頁",
                "이전": "前一頁"
            },
            'en': {
                "다음": "Tiếp theo",
                "이전": "Trang trước"
            }
        },
        mPaging: function (collection) {

            if (!collection || !collection.page) return false;

            var getUrl = GO.router.getUrl(),
                searchParams = GO.router.getSearch(),
                searchParamArr = [],
                locale = GO.locale || this.defaultLocale,
                cPage = collection.page,
                cLength = collection.length,
                tpl = [],
                iEnd = (cPage.page + 1) * cPage.offset - cPage.offset + cLength,
                iStart = iEnd - cLength + 1;

            if (searchParams.page != cPage.page) {
                searchParams.page = cPage.page;
                for (var p in searchParams) {
                    searchParamArr.push(encodeURIComponent(p) + "=" + encodeURIComponent(searchParams[p]));
                }
                GO.router.navigate(getUrl.split('?')[0] + (getUrl.split('?')[0].charAt(getUrl.split('?')[0].length - 1) == '/' ? '' : '/') + '?' + searchParamArr.join('&'), {replace: cPage.page == 0 ? true : false});
            }

            if (cPage.page != 0 || cLength > 0) {
                tpl.push('<div class="paging">');
                if (cPage.page > 0) tpl.push('<a class="btn_type4" data-btn="paging" data-direction="prev"><span class="ic ic_arrow3_l"></span><span class="txt">', this.mPagingLang[locale]['이전'], '</span></a>');
                tpl.push('<span class="page"><span class="current_page">', iStart, '</span><span class="txt_bar">-</span><span class="total_page">', iEnd, '</span><span class="total_page"> / ', cPage.total, '</span></span>');
                if (!cPage.lastPage) tpl.push('<a class="btn_type4" data-btn="paging" data-direction="next"><span class="txt">', this.mPagingLang[locale]['다음'], '</span><span class="ic ic_arrow3_r"></span></a>');
                tpl.push('</div>');
            }

            return tpl.join('');
        },
        /**
         에디터로 작성된 상세보기의 iscroll 세팅
         pinch to zoom 기능

         @method initDetailiScroll
         @param {String} wrapIScrollId iscroll을 적용할 영역(제일 바깥)
         @param {String} 본문의 가로넓이를 세팅할 영역, wrapIScrollId영역 자식노드 div 임
         @param {String} zoomPartId 실제 본문 영역
         @param {boolean} zoom 사용 여부. default 값은 true
         @param {Number} 스크롤 영역 width 보정값. 기본은 20.
         @param {boolean} 전자결재 관련문서 미리보기 같이 새로운 창을 띄워 문서를 보여주는 경우
         footer와 header가 틀리므로 높이값 조절 수정을 위해 if문으로 분기함. 기본값은 false

         */
        initDetailiScroll: function (wrapIScrollId, childWrapIScrollId, zoomPartId, useZoom, fixWidth, isPreview) {
            var self = this;
            var zoom = _.isUndefined(useZoom) ? true : useZoom;
            var webFooterH = (GO.util.isMobileApp()) ? 0 : 52;
            var headerHeight = $('#headerToolbar').outerHeight(true);
            var isPreview = _.isUndefined(isPreview) ? false : isPreview;
            var $zoomPart = jQuery("#" + zoomPartId);
            var windowHeight = $(window).height();
            var scrollTopEl = $('#scrollToTop');

            if ($("link[href*='/resources/css/go_m_style_big']").length) {
                $("div.content").addClass('content_detail');
            }

            //전자결재 , 보고, Works, 업무
            var $docHeader = $('#doc_header');
            var docHeaderHeight = ($docHeader.length) ? $docHeader.outerHeight(true) : 0;
            //게시판
            /*var $detailTinyList = $('#detailTinyList');
            if($detailTinyList.length > 0){
                fixHeight = $detailTinyList.outerHeight(true) + $('div.wrap_feedPlus').outerHeight(true);
            }*/

            //문서관리
            /*var $attachVersionModuleList = $('#attachVersionModuleList');
            if($attachVersionModuleList.length > 0){
                fixHeight = ($attachVersionModuleList.length) ? $attachVersionModuleList.outerHeight(true) : 0;
            }*/
            $("#" + wrapIScrollId)
                .css("position", "relative")
                .css('overflow-x', 'scroll')
                .css('overflow-y', 'hidden');
            $zoomPart.css('display', 'inline-table');
            var contentWidth = $zoomPart.outerWidth(true);
            var deviceWidth = jQuery(window).width();

            if (contentWidth < deviceWidth) {
                contentWidth = deviceWidth;
            }
            var renderedFactor = 1 / (contentWidth / deviceWidth);
            $("#" + childWrapIScrollId).width(contentWidth);
            if (isPreview) {
                $("#" + wrapIScrollId).height(windowHeight - webFooterH);
            } else {
                $("#" + wrapIScrollId).height(windowHeight - headerHeight - docHeaderHeight);
            }
            /* if (contentWidth > deviceWidth) {
                 $("#"+childWrapIScrollId).width($zoomPart.width()+fWidth);
             }else{
                 $("#"+childWrapIScrollId).width(deviceWidth+fWidth);
                 $zoomPart.width(deviceWidth+fWidth);
             }*/
            if (this.iscroll) this.iscroll.destroy();
            // ios 모바일 웹일경우만 예외 처리.
            var isIOSMobileWeb = !GO.util.isMobileApp() && (GO.util.checkOS() == 'iphone' || GO.util.checkOS() == 'ipad');
            this.iscroll = new IScroll('#' + wrapIScrollId, {
                bounce: false,
                zoom: true,
                zoomMin: renderedFactor,
                disablePointer: true, // important to disable the pointer events that causes the issues
                disableMouse: false, // false if you want the slider to be usable with a mouse (desktop)
                disableTouch: isIOSMobileWeb, // false if you want the slider to be usable with touch devices
                preventDefault: isIOSMobileWeb,

                onBeforeScrollStart: function (e) {
                    //textarea안에서 focus를 줄수 있도록 변경(전자결재에서 댓글을 달수 있도록 하기 위함)
                    var target = e.target;
                    if (target.tagName == 'TEXTAREA' || target.tagName == 'INPUT' || target.tagName == 'SELECT') {
                        return;//e.preventDefault();
                    } else {
                        e.preventDefault();
                    }
                },
                /**
                 * GO-35043 [클라우드3/영진]전자결재문서를 전사게시판에 등록 후 모바일앱에서 확인시 문서가 잘려서 나타나는 현상
                 * 해당 값이 제대로 적용되었으나 UI상으로 정상적으로 보이지 않아 재정의 해주는 로직 추가.
                 */
                onBeforeScrollEnd: function (e) {
                    setTimeout(function () {
                        $("#" + childWrapIScrollId).css("transform", $("#" + childWrapIScrollId).css("transform"));
                    }, 300);
                }
            });

            if (!isIOSMobileWeb) {
                this.iscroll.on('zoomStart', function (e) {
                    $("#" + wrapIScrollId)
                        .css('overflow-x', '')
                        .css('overflow-y', '');
                });
                this.iscroll.on('zoomEnd', function (e) {
                    $("#" + wrapIScrollId)
                        .css('overflow-x', 'scroll')
                        .css('overflow-y', 'hidden');
                });
            }

            setTimeout(function () {
                if (deviceWidth < contentWidth) {
                    self.iscrollZoom(renderedFactor);
                }
                GO.util.appLoading(false);
                if (GO.router.getPackageName() === "approval" || GO.router.getPackageName() === "docfolder") {
                    $zoomPart.css('visibility', 'visible');
                } else {
                    $("#content").css('visibility', 'visible');
                }
                self.iscrollRefresh();
                scrollTopEl.hide();

                var $innerIframes = $("#" + wrapIScrollId).find("iframe");
                if ($innerIframes.length > 0) {
                    $.each($innerIframes, function (i, innerIframe) {
                        var $innerIframe = $(innerIframe);
                        $innerIframe.css("pointer-events", "none");
                        //iframe이 포함된 영역에도 iscroll의 스크롤이 동작할 수 있도록 가상의 div를 덮는다.
                        var wrap = $('<div class="transparentDiv" style="z-index: 999999; opacity: 0; position:absolute; width:100%;"></div>');
                        $innerIframe.before(wrap);
                        wrap.css('height', $innerIframe.height() + 'px');
                        var iframe = $innerIframe.get(0);

                        //전자결재에서 에디터 내 iframe src 와 a href 처리
                        if (GO.router.getPackageName() === "approval") {
                            var iframeDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
                            var $iframesInEditor = $(iframeDoc).find("iframe");
                            $.each($iframesInEditor, function (i, iframeInEditor) {
                                appendLinkShortcut($(iframeInEditor));
                            });

                            wrap.on('click', function (event) {
                                //가상의 div 때문에 링크를 클릭하지 못함.
                                //클릭한 좌표의 dom을 찾아 href 속성이 있으면 페이지 이동
                                var link = iframeDoc.elementFromPoint(event.offsetX, event.offsetY);
                                if ($(link).parent().attr('href')) {
                                    location.href = $(link).parent().attr('href');
                                }
                            });
                        } else {
                            appendLinkShortcut($(iframe));
                        }
                    });
                }

            }, 400);

            function appendLinkShortcut($iframe) {
                var src = $iframe.attr('src');
                if (src) {
                    var prev = $iframe.prev();
                    if (prev.hasClass("shortcut")) {
                        return;
                    } else {
                        var $target = prev.hasClass("transparentDiv") ? prev : $iframe;
                        $target.before("<a class='shortcut' target='_blank' href='" + src + "'><span style='font-size: 15px;'>LINK CLICK ☞<br /></span></a>");
                    }
                }
            }

            return this.iscroll;
        },
        contentsParsingForFontSizeResizing: function (targetEl) {
            targetEl.wrapInner("<div></div>").find('*').contents().filter(function () {
                return this.nodeType == 3 && $.trim(this.nodeValue) && this.parentNode.tagName.toLowerCase() != 'style' && this.parentNode.tagName.toLowerCase() != 'script';
            }).each(function (x, y) {
                var targetStyle = getComputedStyle(this.parentNode);
                var fontSize = targetStyle.fontSize.replace('px', '');
                var lineHeight = targetStyle.lineHeight.replace('px', '');

                $(this).wrap('<span data-font-resize ' +
                    'data-origin-fontsize="' + fontSize + '" ' +
                    'data-origin-lineheight="' + lineHeight + '" ' +
                    'style="font-size:' + fontSize + 'px;line-height:' + lineHeight + 'px" />')
            });
        },
        rollbackFontSizeResizing: function(targetEl) {
            targetEl.find('span[data-font-resize]').contents().unwrap();
        },
        imageLoadCheck: function (targetId) {
            var deferred = $.Deferred(),
                $image = $("#" + targetId).find('img'),
                imageCnt = $image.length,
                loadImageCnt = 0;
            if (!imageCnt) {
                deferred.resolve();
            }
            $image.load(function () {
                loadImageCnt++;
                if (imageCnt == loadImageCnt) {
                    deferred.resolve();
                }
            });
            return deferred;
        },
        /**
         * iscroll 리플래쉬
         */
        iscrollRefresh: function () {
            if (this.iscroll) {
                this.iscroll.refresh();
            }
        },
        iscrollZoom: function (renderedFactor) {
            if (this.iscroll) {
                $(this.iscroll.wrapper).hide();
                this.iscroll.zoom(0, 0, renderedFactor);
                this.iscroll.scrollTo(0, 0);
            }
            $(this.iscroll.wrapper).show();
        },
        initToolbar: function () {
            $('.go_header').css({'position': 'initial', 'top': '0px'});
            $("#titleToolbar").css({
                'position': 'relative',
                'top': '0px',
                'z-index': 'initial',
                'width': 'initial',
            });
            $("#tool_bar").css({
                'position': 'relative',
                'top': '0px',
                'z-index': 'initial',
                'width': 'initial',
            });
            $(".go_content ").css('padding-top', '0px');
        },
        fixedToolbar: function (goHeaderH, titleToolBarH, contentMarginH) {
            $('.go_header').css('position', 'fixed').animate({'top': '-' + goHeaderH + 'px'}, 200);
            $("#titleToolbar").css({
                'position': 'fixed',
                'width': '100%',
                'z-index': '999',
            });
            $("#tool_bar").css({
                'position': 'fixed',
                'width': '100%',
                'z-index': '999',
                'top': titleToolBarH + 1 + 'px'
            });
            $(".go_content ").css('padding-top', contentMarginH + 5 + 'px');
        },
        toolBarFixed: function () {
            var _this = this;
            var goHeaderH = $('.go_header').height();
            var titleToolBarH = $('#titleToolbar').height();
            var toolBarH = $('#tool_bar').height();
            var contentMarginH = goHeaderH + titleToolBarH + toolBarH;
            $(document).on('scroll.fixedTop', function () {
                if ($(this).scrollTop() < goHeaderH) {
                    _this.initToolbar();
                }
            });

            $(document).on('touchmove.fixedTop', function () {
                if ($(this).scrollTop() > goHeaderH) {
                    _this.fixedToolbar(goHeaderH, titleToolBarH, contentMarginH);
                }

                if ($(this).scrollTop() < goHeaderH) {
                    //    _this.initToolbar();
                }
            });
        },
        unBindToolbarFixed: function () {
            $(document).off('scroll.fixedTop');
            $(document).off('touchmove.fixedTop');
            this.initToolbar();
        },

        imagesLoaded: function (el, callback) {
            var imagesEl = $(el).find("img");
            imagesCount = imagesEl.length,
                self = this;

            if (imagesCount == 0) {
                callback();
            } else {
                var num = 1;
                imagesEl.load(function () {
                    if (imagesCount == num) {
                        callback();
                    } else {
                        num = num + 1;
                    }
                });
            }
        },

        disagreeContentLoss: function () {
            var commonLang = require("i18n!nls/commons");
            if ($("textarea").attr("disabled") != "disabled" &&
                ($("textarea:visible").val() || (GO.util.hasActiveEditor() && GO.util.isEditorWriting()))) {
                return !confirm(GO.util.br2nl(commonLang["내용 작성 중 이동 경고 메시지"]));
            }
            return false;
        },

        /**
         * 지연된 alert 사용
         * - 관련이슈: GO-19926 [iOS웹/앱] 게시판/커뮤니티> alert창이 두번씩 나타나는 현상
         *
         * [설명]
         * iOS 사파리 계열 브라우저에서 alert 호출이 이벤트 흐름을 중단시켜서 alert이 완료된 후 중단된 이벤트가 종료되기 전
         * 다시 같은 액션(터치)를 하게 되면 이벤트가 한번 더 호출되는 현상이 있음. 이를 방지하기 위해 delay를 주어서 async로
         * alert 이벤트가 실행되도록 함
         *
         * @param msg 출력 메시지
         * @param delay 지연 시간, 기본값 10ms
         */
        delayAlert: function (msg, delay) {
            setTimeout(function () {
                alert(msg);
            }, delay || 10);
        },
        navigateToBackList: function () {
            var baseUrl = sessionStorage.getItem('list-history-baseUrl');
            if (baseUrl) {
                var search = $.param(GO.router.getSearch());
                var url = search ? "?" + search : "";
                GO.router.navigate(baseUrl + url, {trigger: true});
            } else {
                GO.router.navigate('approval', {trigger: true});
            }
        },
        toastMessage: function (msg, delay) {
            $(document.activeElement).filter(':focus').blur();
            window.scrollTo(0, 0);

            if (!delay) {
                delay = 2000;
            }
            var messageHeight = $(window).height() / 2;

            if ($('#toastMsg')) {
                $('#toastMsg').remove();
            }
            $('#main').append('<div id="toastMsg" class="toastMsg" style="width: 80%;' +
                'height:auto; position: absolute; margin:0 auto;' +
                'z-index: 9999; background-color: #383838; color: #F0F0F0; ' +
                'font-size: 15px; padding: 10px; text-align:center; border-radius: 2px; ' +
                '-webkit-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1); ' +
                '-moz-box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1); ' +
                'box-shadow: 0px 0px 24px -1px rgba(56, 56, 56, 1); display:none">' + msg + '</div>');

            var messageLeft = ($(window).width() - $("#toastMsg").outerWidth(true)) / 2;

            $("#toastMsg").css({
                "top": messageHeight + "px",
                "left": messageLeft + "px"
            }).fadeIn(400).delay(delay).fadeOut(400);

        },

        copyUrl: function (e) {
            if (!_.isUndefined(e) && e.cancelable) {
                e.preventDefault();
                e.stopPropagation();
            }
            var tempElement = document.createElement('textarea');
            document.body.appendChild(tempElement);
            tempElement.value = getUrl();
            tempElement.select();
            document.execCommand('copy');
            document.body.removeChild(tempElement);

            function getUrl() {
                var url = GO.router.getRootUrl() + GO.router.getUrl();
                return url;
            }

            try {
                if (GO.util.isAndroidApp()) {
                    window.GOMobile.copyUrl(tempElement.value);
                } else if (GO.util.isIosApp()) {
                    window.location = "gomobile://copyUrl?" + tempElement.value;
                } else {
                    var boardLang = require("i18n!board/nls/board");
                    alert(boardLang["모바일 URL 복사 문구"]);
                }
            } catch (e) {
                console.log(e)
            }
        },

        linkToErrorPage: function (error) {
            var _error = JSON.parse(error.responseText);
            if (_.isUndefined(_error.message)) {
                var commonLang = require("i18n!nls/commons");
                _error.message = _.isUndefined(commonLang[_error.code + " 오류페이지 타이틀"]) ? commonLang["500 오류페이지 타이틀"] : commonLang[_error.code + " 오류페이지 타이틀"];
            }
            if (GO.util.isAndroidApp()) {
                window.GOMobile.onError(_error.code, _error.message);
            } else if (GO.util.isIosApp()) {
                window.location = "gomobile://onError?" + _error.code + "&" + encodeURIComponent(_error.message.replace(/<br\/\>/gi, "\n"));
            } else {
                alert(_error.message);
                GO.router.navigate(GO.router.getPackageName(), {"trigger": true});
            }
        },

        linkToCustomError: function (error) {
            var code = error.code;
            var message = error.message;
            alert(message.replace(/<br\/\>/gi, "\n"));
            GO.router.navigate(GO.router.getPackageName(), {"trigger": true});
        },

        showTempAttach: function (param) {
            GO.util.appLoading(true);
            $.ajax({
                type: "POST",
                contentType: "application/x-www-form-urlencoded; charset=UTF-8",
                url: "/api/preview/tempFile",
                data: param,
                success: function (url) {
                    var previewPath = url.data.str.split("&originName")[0];
                    var host = location.protocol + "//" + window.location.host;
                    if (GO.util.isAndroidApp()) {
                        window.GOMobile.attachView(host + previewPath);
                    } else if (GO.util.isIosApp()) {
                        window.location.href = "gomobile://attachView?" + host + previewPath;
                    } else {
                        window.location.href = previewPath;
                    }
                    if (GO.util.isAndroidApp()) {
                        GO.util.appLoading(false);
                    }
                },
                error: function (e) {
                    console.log(e.responseJSON.message);
                    if (GO.util.isAndroidApp()) {
                        GO.util.appLoading(false);
                    }
                }
            });
        },

        isValidSearchText: function (data) {
            var commonLang = require("i18n!nls/commons");
            if (data === "") {
                alert(commonLang['검색 키워드를 입력하세요.']);
                return false;
            }

            if (!$.goValidation.isCheckLength(2, 64, data)) {
                alert(GO.i18n(commonLang['검색어 길이 확인 문구'], {"arg1": "2", "arg2": "64"}));
                return false;
            }
            if ($.goValidation.isInValidEmailChar(data)) {
                alert(commonLang['메일 사용 불가 문자']);
                return false;
            }
            return true;
        },

        /**
         *
         * @param inputData = {data: input value, id: elementId}
         * @returns {boolean}
         */
        isValidSearchTextForDetail: function (inputData) {
            var commonLang = require("i18n!nls/commons");
            var invalidAction = function (msg, focusEl) {
                alert(msg);
                if (focusEl) focusEl.focus();
            };

            var dataSize = inputData.length;
            for (var i = 0; i < dataSize; i++) {
                if (_.isUndefined(inputData[i].data) || _.isUndefined(inputData[i].id)) {
                    alert(commonLang['오류 발생'])
                    return false;
                }

                if (inputData[i].data == '') {
                    continue;
                }

                if (!$.goValidation.isCheckLength(2, 64, inputData[i].data)) {
                    invalidAction(GO.i18n(commonLang['검색어 길이 확인 문구'], {
                        "arg1": "2",
                        "arg2": "64"
                    }), $('#' + inputData[i].id));
                    return false;
                }

                if ($.goValidation.isInValidEmailChar(inputData[i].data)) {
                    invalidAction(commonLang['메일 사용 불가 문자'], $('#' + inputData[i].id));
                    return false;
                }
            }
            return true;
        },

        isValidForSearchTextWithCheckbox: function (textId) {
            var commonLang = require("i18n!nls/commons");
            var $textEl = $('#' + textId);
            if ($textEl.val() != "" && ($textEl.parent().find("input[type=checkbox]:checked").length < 1)) {
                alert(commonLang['검색어 구분을 선택해주세요.']);
                return false;
            }

            if ($textEl.val() == "" && ($textEl.parent().find("input[type=checkbox]:checked").length >= 1)) {
                alert(commonLang['검색 키워드를 입력하세요.']);
                return false;
            }
            return true;
        },

        isAllEmptySearchText: function (inputDatas) {
            var allSearchTextLength = 0;
            _.each(inputDatas, function (inputData) {
                allSearchTextLength += inputData.data.length;
            });
            return allSearchTextLength === 0;
        },

        getFileNameAndTypeData: function (file) {
            var data = {};
            if (_.isUndefined(file.name)) {
                var nameAndTypeList = file.fileName.split(".");
                data.size = file.fileSize;
            } else {
                var nameAndTypeList = file.name.split(".");
                data.size = file.size;
            }
            data.type = nameAndTypeList[nameAndTypeList.length - 1];
            return data;
        }

    });
}).call(this, _);
