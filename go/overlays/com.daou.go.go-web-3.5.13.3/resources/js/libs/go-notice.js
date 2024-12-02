/**
 * @version 0.0.1
 * @require     jQuery, jQuery-ui, jQuery.cookie, go-popup.js,  go-style.css
 * @author  sopark@daou.co.kr
  */
(function($) {

    var NoticeApp = $.goNotice = {};

    NoticeApp.isFetched = false;
    NoticeApp.notice = [];
    NoticeApp.options = {
        ContextRoot : "/",
        lang : {
            'ko' : {
                '닫기' : '닫기',
                'day' : "하루동안 이 창을 열지 않음",
                'week' : "1주일 동안 이창을 열지 않음",
                'none' : "더이상 보지 않기",
                "다운로드" : "다운로드"
            },
            'ja' : {
                "닫기" : "閉じる",
                'day' : "一日間このウインドウを表示しない",
                'week' : "一週間このウインドウを表示しない",
                'none' : "これ以上表示しない",
                "다운로드" : "ダウンロード"
            },
            'en' : {
                "닫기" : "Close",
                'day' : "Do not open this for a day",
                'week' : "Do not open this for a week",
                'none' : "Do not open for good",
                "다운로드" : "Download"
            },
            'zh_CN' : {
                "닫기" : "关闭",
                'day' : "一天不打开此窗口",
                'week' : "一星期不打开此窗口",
                'none' : "不再显示更多",
                "다운로드" : "下載"
            },
            'zh_TW' : {
                "닫기" : "關閉",
                'day' : "一天不打開此窗口",
                'week' : "一星期不打開此窗口",
                'none' : "不再顯示更多",
                "다운로드" : "下载"
            },
            'vi' : {
                "닫기" : "Đóng",
                'day' : "Không hiển thị trang này cả ngày hôm nay",
                'week' : "Không mở trang này trong vòng 1 tuần",
                'none' : "Không xem",
                "다운로드" : "Tải về"
            }
        },
        sizeType : {
            "400|600" : "notice_type1",
            "520|600" : "notice_type2",
            "800|600" : "notice_type3"
        },
        locale : $('meta[name="locale"]').attr('content') || "ko",
        COOKIE_PREFIX : "NoticeCookie_"
    };

    NoticeApp.render = function(options){
        if(options.contextRoot){
            NoticeApp.options.ContextRoot = options.contextRoot;
        }
        if (!this.isFetched) {
            this.fetch().done($.proxy(function() {
                makeNotices(this.notice);
            }, this));
        } else {
            makeNotices(this.notice);
        }
    };

    NoticeApp.fetch = function() {
        var url = NoticeApp.options.ContextRoot + "api/notice/normal";
        return $.ajax({
            type: 'GET',
            dataType: 'json',
            url: url,
            success: $.proxy(function(resp) {
                this.isFetched = true;
                this.notice = resp.data;
            }, this)
        });
    };

    NoticeApp.makeItem = function(options){
        return (new NoticeItem(options)).create();
    };

    NoticeApp.makePreviewItem = function(options){
        return (new NoticeItem(options)).preview();
    };

    var NoticeItemFooterTmpl = [
        "<footer class='notice_action'>",
            "<div class='layer_action'>",
                "<span class='wrap_option' id='notice_option'>",
                    "<input type='checkbox' id='notice_option_checkbox_{id}'><label for='notice_option_checkbox_{id}'>{label_close_option}</label>",
                "</span>",
                "<span class='wrap_btn'><span class='btn_fn6'>{label_close}</span></span>",
            "</div>",
        "</footer>"
    ].join("");

    var NoticeItemAttachsTmpl = [
        "<div class='feed origin'>",
            "<ul class='file_wrap'>",
            "</ul>",
        "</div>"
    ].join("");

    var NoticeItemAttachTmpl = [
        "<li data-name='' data-id='12' style='left: 10px;'>",
            "<span class='item_file'>",
                "<span class='ic_file {file_icon}'></span>",
                "<span class='name'><a href='{downloadUrl}' data-bypass=''>{fileName}</a></span>",
                "<span class='size'>({byteSize})</span>",
                "<span class='optional'>",
                    "<a href='{downloadUrl}' class='btn_fn4' data-bypass=''><span class='txt'>{label_download}</span></a>",
                "</span>",
            "</span>",
        "</li>"
    ].join("");

    var NoticeItem = function(options){
        var defaults = {
            title : "",
            content : "",
            modal : false,
            header : "",
            size : "400|600",
            option : "none",
            showWeb : true,
            showMobile : true,
            allowPrevPopup : false
        };

        options.size = options.width + "|" + options.height;

        var opts = $.extend({},defaults, options);

        opts.content = (opts.content).replace(/<a /gi, "\<a target\=\'_blank\' data\-bypass ");

        function close(e){
            var targetEl = $(e.currentTarget),
                popupEl = targetEl.parents("div.layer_notice");

            popupEl.remove();
            $("#popOverlay").remove();

			$(document).trigger("hideLayer.goLayer");
        }

        function optionCheck(e){
            var expire = {
                "none" : diffDay(new Date(), dateFromISO(opts.endTime)),
                "day" : 1,
                "week" : 7
            };

            if(opts.option != "always"){
                $.cookie(NoticeApp.options.COOKIE_PREFIX + opts.id, "done" , {expires: expire[opts.option], path: "/"});
            }

            close(e);
        }

        function diffDay(targetDate1, targetDate2){
            return Math.abs(parseInt((targetDate1 - targetDate2) /1000/60/60/24)) + 1;
        }

        function dateFromISO(s){
            var s = s.split(/\D/);
            return new Date(Date.UTC(s[0], --s[1]||'', s[2]||'', s[3]||'', s[4]||'', s[5]||'', s[6]||''));
        }

        function makeNotice(){

        	var wrappedContent = '<div class="wrap_notice"><div class="editor_view">' + opts.content + '</div></div>';

            var popupEl = $.goPopup({
                header : opts.title,
                title : "",
                pclass : "layer_notice " + NoticeApp.options.sizeType[opts.size],
                modal : opts.modal,
                contents : wrappedContent,
                allowPrevPopup : opts.allowPrevPopup
            });

            if($.trim(opts.title).length == 0){
                popupEl.find("header:first").remove();
            }

            setTimeout(function() {
                $(window).off("resize.gopop");
            },100);

            renderAttachItem(popupEl, opts.attaches, options.id);
            renderFooter(popupEl, opts);

            popupEl.css({"width": "", "left" : "", "top" : "", "margin-top" : "", "margin-left" : "", "z-index" : ""});
            popupEl.find("header").css({cursor : "move"});

            if(opts.option == "always"){
                popupEl.find("#notice_option").remove();
            }

            return popupEl;
        }

        return {
            create : function(){
                var popupEl = makeNotice();
                popupEl.find("a.btn_layer_x").addClass("btn_layer_bigx").removeClass("btn_layer_x");
                popupEl.find("span.btn_fn6").on("click", close);
                popupEl.find("#notice_option").on("click", optionCheck);
                return popupEl;
            },

            preview : function(){
                var popupEl = makeNotice();
                popupEl.find("a.btn_layer_x").addClass("btn_layer_bigx").removeClass("btn_layer_x");
                popupEl.find("span.btn_fn6").on("click", close);
                popupEl.find("#notice_option").on("click", close);
                return popupEl;
            }
        }
    };

    function renderFooter(popupEl, opts){
        var lang = NoticeApp.options.lang[NoticeApp.options.locale];

        popupEl.append(template(NoticeItemFooterTmpl, {
            label_close : lang["닫기"],
            label_close_option : lang[opts.option],
            close_option : opts.option,
            id : opts.id
        }));
    }

    function renderAttachItem(popupEl, attaches, noticeId){
        var lang = NoticeApp.options.lang[NoticeApp.options.locale];

        if(_.isUndefined(attaches) || attaches.length == 0) {
            return;
        }

        popupEl.append(NoticeItemAttachsTmpl);
        var attachesEl = popupEl.find("ul.file_wrap");
        $.each(attaches, function(){
            var downloadUrl = (this.downloadUrl == undefined) ? NoticeApp.options.ContextRoot + "api/notice/"+ noticeId +"/download/" + this.id : this.downloadUrl;

            attachesEl.append(template(NoticeItemAttachTmpl,{
                "downloadUrl" : downloadUrl,
                "fileName" : this.name,
                "byteSize" : getHumanizedFileSize(this.size),
                "label_download" : lang["다운로드"],
                "file_icon" : getFileIconStyle({extention : this.extention})
            }));
        });
    }

    function getHumanizedFileSize(byteSize) {
        var orgSize = parseInt(byteSize) || 0,
            UNIT = {
            'B': 1,
            'K': 1024,
            'M': 1048576,
            'G': 1.0737e+9,
            'T': 1.0995e+12
        }, baseByte = 0, postfix = 'B';

        if (orgSize > UNIT.T) {
            baseByte = UNIT.T;
            postfix = 'T' + postfix;
        } else if (orgSize > UNIT.G) {
            baseByte = UNIT.G;
            postfix = 'G' + postfix;
        } else if (orgSize > UNIT.M) {
            baseByte = UNIT.M;
            postfix = 'M' + postfix;
        } else if (orgSize > UNIT.K) {
            baseByte = UNIT.K;
            postfix = 'K' + postfix;
        } else {
            baseByte = UNIT.B;
            postfix = 'Byte';
        }

        return (orgSize / baseByte).toFixed(1) + postfix;
    }

    function getFileIconStyle(attachData) {
        var extension = attachData.extention.toLowerCase(),
            reExt = new RegExp("(zip|doc|docx|ppt|pptx|xls|xlsx|hwp|pdf|txt|html|htm|jpg|jpeg|png|gif|tif|tiff|bmp|exe|avi|mp3|mp4|mov|mpg|mpeg|lzh|xml|log|csv|eml)","gi");

        return 'ic_' + (reExt.test(extension) ? extension: 'def');
    }

    function template(tpl,data){
        return tpl.replace(/{(\w*)}/g,function(m,key){return data.hasOwnProperty(key)?data[key]:"";});
    }

    function makeNotices(notices){
        if($.cookie("IsCookieActived")){
            return;
        }

        var items = [],
            widthSum = 0;

        $.each(notices, function(index, notice) {
            if (notice.showWeb == false) {
                return;
            }
            if ($.cookie(NoticeApp.options.COOKIE_PREFIX + notice.id)) {
                return;
            }

            var opts = {
                id : notice.id,
                content : GO.util.escapeEditorContent(notice.content),
                modal : false,
                title : notice.title,
                width : notice.width,
                height : notice.height,
                showWeb : notice.showWeb,
                showMobile : notice.showMobile,
                option : notice.option,
                endTime : notice.endTime,
                allowPrevPopup : true,
                attaches : notice.attaches
            },
            item = NoticeApp.makeItem(opts).hide();

            item.on("click", showTop);

            items.push(item);
            widthSum += (notice.width + 100);
        });

        sort(items, widthSum);

        $.cookie("IsCookieActived", true, {path: "/"});
    }

    function sort(items, widthSum){
        var preTarget = null;

        $.each(items, function(index, el){
            if(index == 0){
                preTarget = $(items[0]);
                preTarget.show();
                return;
            }

            if($(window).width() < widthSum){
                preTarget = $(el).css({
                    left : parseInt(preTarget.css("left")) + 50,
                    top : parseInt(preTarget.css("top")) + 50
                })
                .show();
            }else{
                preTarget = $(el).css({
                    left : parseInt(preTarget.css("left")) + parseInt(preTarget.css("width")) + 100
                })
                .show();
            }
        });
    }

    function showTop(){
        var max_z_index = 0;

        $.each($("div.go_popup "), function(){
            var z_index = parseInt($(this).css("z-index"));

            if(z_index > max_z_index){ max_z_index = z_index;}
        });

        max_z_index += 1;

        $(this).css({"z-index" : max_z_index});
    }

    return NoticeApp;
})(jQuery);