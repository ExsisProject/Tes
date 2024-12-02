define('main', function (require) {
    // dependency
    var $ = require('jquery');
    var Backbone = require('backbone');
    require('boot');
    var GO = require('app');
    var Router;
    var browser = require('browser');
    require('go-notification');
    var Notifications = require('collections/notifications');
    var ImgUploadLayer = require('editor_inlineImg_upload');
    var CommonLang = require('i18n!nls/commons');

    // load modules
    require('GO.util');
    // GO.Editor가 간헐적으로 생성되지 않는 문제로 미리 로딩하여 초기화시킨다.
    require('go-webeditor/jquery.go-webeditor');
    // 구글 분석기
    var config = GO.config('googleAnalyticsOption');
    if (_.isObject(config) && config.trackerId) {
        require('../libs/go-google-analytics');
    }
    require('go-notice');

    $.datepicker.setDefaults($.datepicker.regional[GO.config('locale')]);

    GO.fetch('baseConfig').done(function () {
        Router = require('router');
        var router = Router.getInstance();
        router.on('change:package', function () {
            $.goNotice.fetch();
        });
    });

    /**
     * Application 클래스
     *
     * 기존의 함수기반 방식으로 작성시 Uglify 압축 후 호이스트 메커니즘에 의해 함수가 상단에 올라가고 변수선언이 나중에
     * 뒤따라와서 발생하는 문제를 해결하기 위해 클래스 선언형태로 변경함.
     */
    var Application = (function () {
        return {
            start: function () {
                copyUrl();
                bindAnchor();
                ajaxGlobalSetup();
                startNotification();
                setBrowserTitle();
                initGoogleAnalyze();
                startHistory();
                bindImgUploader();
            }
        };

        function isPCApp() {
            return GO.config('deviceType') === 'pc' && GO.config('instanceType') === 'app';
        }

        function isMobile() {
            return GO.config('deviceType') === 'mobile' && GO.config('instanceType') === 'app';
        }

        function isMobileApp() {
            return GO.util.isMobileApp();
        }

        function getGoAgent() {
            return GO.config('GO-Agent') || GO.util.getGoAgent() || '';
        }

        function startHistory() {
            // history API 시작
            Backbone.history.start({pushState: true, root: GO.config('root')});
        }

        function bindImgUploader() {
            //에디터 인라인 이미지 추가
            window.inlineImgUploadLayer = function (elPlaceHolder) {
                ImgUploadLayer.render({'elPlaceHolder': elPlaceHolder});
            };
        }

        function canUseNoti() {
            return isPCApp() && !window.opener && !isNote();
        }

        function isNote() {
            return (window.location.href.indexOf("app/note") > 0) || (window.location.href.indexOf("app/#note") > 0);
        }

        function copyUrl() {
            $(document).on("click", "[url-copy]", function (e) {
                if (!_.isUndefined(e) && e.cancelable) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                var $target = $(e.currentTarget);
                if ($target.attr('url-copy')) {
                    var url = $target.attr('url-copy');
                } else {
                    var url = (window.location.href).split("?")[0];
                }
                GO.util.setClipboard(url);
            });
        }

        function bindAnchor() {
            $(document).on("click", "a:not([data-bypass])", function (e) {
                var href = {prop: $(this).prop("href"), attr: $(this).attr("href")};
                e.preventDefault();
                if (href.prop && GO.router.isEqualToRootUrl(href.prop)) {
                    GO.router.navigate(GO.router.getUrl(href.prop), {trigger: true, pushState: true});
                } else if (href.attr) {
                    var selector = ["form.editor_view", "div.editor_view", "p.editor_view", "article.editor_view", "span.editor_view"];
                    var targetSelf = true;
                    $.each(selector, function (k, v) {
                        if ($(e.currentTarget).parents(v).first().length > 0) {
                            var isIos = window.open(href.attr, "_blank");
                            if (isIos === null) {
                                window.location.href = href.attr;
                            }
                            targetSelf = false;
                            return false;
                        }
                    });
                    if (targetSelf) {
                        window.location.href = href.attr;
                    }
                }
            });
        }

        function ajaxGlobalSetup() {
            var isConcurrent = false;
            var popup = null;
            var statusCallback = {};
            var resCode = GO.constant('response');
            var url;
            var returnUrl = GO.config('root') + GO.router.getUrl();

            var headers = {'GO-Agent': getGoAgent()};

            var beforeSendCallback = function (xhr) {
                if (isMobileApp()) {
                    try {
                        xhr.setRequestHeader('GO-Agent', getGoAgent());
                        if (GO.util.checkOS() == "android") {
                            window.GOMobile.isConnected();
                        } else {
                            window.location = "gomobile://isConnected";
                        }
					}catch(e){}
                }

                // CLIENT 타임존 offset 정보
                xhr.setRequestHeader('TimeZoneOffset', -(new Date().getTimezoneOffset()));
            };

            var isNote = function (returnUrl) {
                return GO.util.parseUrl(returnUrl).pathname.indexOf("note") >= 0;
            };

            var isSameURL = function (url) {
                if (popup) return popup.window.location.href.indexOf(url) >= 0;
                else return false;
            };

            var callbackFn = {
                "401": function (jqXHR) {
                    if (isMobileApp()) {
                        GO.util.callSessionTimeout();
                    } else {

                        // OTP || 공인인증서로그인 || 중복로그인 || 쪽지 => 기존 방식
                        if (GO.config('useOtp') || GO.config('useCert') || isConcurrent || isNote(returnUrl)) {
                            // 여러개의 api가 호출 되더라도 중복 로그인이라는 메세지는 한번만 내려온다.
                            if (isConcurrent) return false;

                            isConcurrent = $.parseJSON(jqXHR.responseText).name == "common.unauthenticated.concurrent";
                            $.goConfirm(CommonLang["자동로그아웃"], CommonLang["자동로그아웃설명"], function () {
                                url = GO.config("contextRoot") + "login?returnUrl=" + returnUrl;
                                if (isConcurrent) url += "&cause=concurrent";
                                window.location = url;
                                /**
                                 * 재현은 되지 않지만
                                 * common.unauthenticated.concurrent 보다
                                 * common.unauthenticated 가 먼저 내려오는 경우가 있는것으로 보인다.
                                 */
                                if (popup) popup.close();
                            });
                        } else {
                            if (GO.config("instanceType") === "admin") {
                                window.location = GO.config("contextRoot") + "login?returnUrl=" + returnUrl;
                            } else if (!(isSameURL(GO.config("contextRoot") + "simplelogin"))) {
                                url = GO.config("contextRoot") + "simplelogin?type=" + jqXHR.originalRequestOptions.type + "&returnUrl=" + returnUrl;
                                popup = window.open(url, "simpleLogin",
                                    "width=540,height=650 top=" + ((screen.height / 2) - 200) + " left=" + ((screen.width / 2) - 180));
                            } else {
                                // 뭐지뭐지...
                            }
                        }
                    }
                    return false;
                },
				"404": function() {},
				"403": function() {},
                "503": function (jqXHR) {
                    if (isMobile()) {
                        GO.util.callServerCheck($.parseJSON(jqXHR.responseText));
                    }
                }
            };

            for (var _key in resCode) {
                var stCode = resCode[_key];
                if (callbackFn[stCode]) statusCallback[stCode] = callbackFn[stCode];
            }

            $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                jqXHR.originalRequestOptions = originalOptions;
            });

            $.ajaxSetup({
                // 30초가 기본
                timeout: GO.constant("system", "AJAX_TIMEOUT"),
                statusCode: statusCallback,
                headers: headers,
                beforeSend: beforeSendCallback
            });
        }

        function startNotification() {
            if (canUseNoti()) {
                $.get(GO.config("contextRoot") + "api/bosh/user", function (resp) {
                    var resourceName = ["go_web", GO.session("repId"), Math.ceil(Math.random() * 100)].join("_");
                    var JID = [resp.data.jid, resourceName].join("/");
                    var protocol = location.protocol;
                    var boshPort = (protocol === 'https:' ? "443" : "80");
                    var boshPathname = "http-bind/";
                    var boshUrl = [location.protocol, "//", location.hostname, ":", boshPort, "/", boshPathname].join("");

                    if (window["GO_Notification"]) {
                        window["GO_Notification"].release();
                    }

                    var notification = new GONotification(boshUrl, {jid: JID, password: resp.data.subInfo}, {
                        onReceiveMessage: function (msg) {
                            Notifications.getNewCount(function (count) {
                                $('#noti-count-badge').text(count);
                                $('#noti-count-badge').css("display", count == 0 ? "none" : "inline-block");
                            });
                        }
                    });
                    notification.run();

                    window["GO_Notification"] = notification;
                });
            }
        }

        function setBrowserTitle() {
            var fn = GO.util.setBrowserTitle;

            fn();
            if (browser.msie && browser.version < 10) {
                $(window).off(".browsertitle").on("hashchange.browsertitle", function () {
                    setTimeout(fn, 500);
                });
            } else {
                GO.router.on("change:package", fn);
            }

            return;
        }

        function initGoogleAnalyze() {
            var config = GO.config('googleAnalyticsOption');

            if (_.isObject(config) && config.trackerId) {
                //GO.Analytics.init();
                config.userId = GO.session('loginId');
                GO.Analytics.excute(config);
            } else {
                // uid는 필수이므로 존재하지 않으면 적용하지 않는다.
                return;
            }
        }
    })();

    // bootstrap
    $.when(GO.fetch('baseConfig'), GO.fetch('session')).then(function () {
        Application.start();
    })
});
