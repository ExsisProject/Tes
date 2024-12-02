define(function (require) {
    var $ = require("jquery");
    var _ = require("underscore");
    var Backbone = require("backbone");
    var GO = require("app");
    var LayoutTpl = require("hgn!templates/layouts/mobile_default");
    var FooterTpl = require("hgn!templates/layouts/mobile_default_footer");
    var CommonLang = require("i18n!nls/commons");
    require("iscroll");
    require("jquery.mobile");
    require("jquery.cookie");
    require("GO.util");
    require("GO.m.util");
    require('jquery.go-validation');

    /*
    * 모바일 환경 변수 추가
    */
    GO.config('isMobileApp', GO.util.isMobileApp());
    GO.config('GO-Agent', GO.util.getGoAgent());
    GO.config('mobileListOffset', 20);
    var SIDE_OVERLAY_ZINDEX = 97;

    var LAYOUT_TPL_ROOT = "hgn!templates/layouts/mobile_default";
    var aslice = Array.prototype.slice,
        tvars = {
            home_url: GO.config("root") + 'home',
            noti_count: 0,
            tpl: {
                overlay: '<div id="popOverlay" class="overlay" data-layer><div class="processing"></div></div>',
                searchOverlay: '<div id="popSearchOverlay" class="overlay" />',
                attachOverlay: '<div id="popAttachOverlay" class="overlay" style="z-index:101"/>',
                sideOverlay: '<div id="popSideOverlay" style="z-index:' + SIDE_OVERLAY_ZINDEX + ';background:transparent;position:fixed;" />'
            },
            apps: {
                'board': CommonLang['게시판'],
                'community': CommonLang['커뮤니티'],
                'calendar': CommonLang['캘린더'],
                'contact': CommonLang['주소록'],
                'asset': CommonLang['예약대여'],
                'survey': CommonLang['설문조사'],
                'report': CommonLang['보고서'],
                'task': CommonLang['업무'],
                'approval': CommonLang['전자결재'],
                'docfolder': CommonLang['전사 문서함'],
                'todo': CommonLang['ToDO+']
            },
            lang: {
                '업데이트하시려면 아래로 당기세요.': CommonLang['업데이트하시려면 아래로 당기세요.'],
                '업데이트하시려면 손을 놓으세요.': CommonLang['업데이트하시려면 손을 놓으세요.'],
                '더 보려면 위로 당기세요': CommonLang['더 보려면 위로 당기세요'],
                '더 보려면 위로 당겼다 놓으세요': CommonLang['더 보려면 위로 당겼다 놓으세요'],
                'camera': CommonLang['카메라 촬영'],
                'input_placeholder': CommonLang['검색 키워드를 입력하세요.'],
                'album': CommonLang['앨범 선택'],
                'search': CommonLang['검색'],
                'pc_version': CommonLang['PC버전'],
                'logout': CommonLang['로그아웃'],
                'app_download': CommonLang['앱 다운로드'],
                'scoll_top': CommonLang['맨 위로'],
                'write_check': CommonLang['작성글확인']
            }
        };

    return Backbone.View.extend({
        el: "#main",
        name: "mobile",
        contentSize: 0,
        lastScrollTop: 0,
        unbindEvent: function () {
            this.$el.off('vclick', '#btnHeaderSearch');

            this.$el.off('vclick', '#btnSearchReset');
            this.$el.off('vclick', '#btnSearchResult');
            this.$el.off('vclick', '#popSideOverlay');
            this.$el.off('vclick', 'h1#appTitle');
            this.$el.off('vclick', 'a[href="home"]');
            this.$el.off('vclick', 'a[href="logout"]');
            this.$el.off('vclick', 'a#btnScrollToTop');
            this.$el.off('keyup', '#searchInput');
            this.$el.off('swipeleft', '#popSideOverlay');

            this.$el.off('submit', 'searchForm');
            this.$el.off('vclick', 'a#go_to_pc_version');
            this.$el.off('vclick', 'a#scrollToTop');
            $(window).off('scroll');
        },
        bindEvent: function () {
            this.$el.on('vclick', '#btnHeaderSearch', $.proxy(this.toggleSearchWrap, this));

            this.$el.on('vclick', '#btnSearchReset', $.proxy(this.clearSearchValue, this));
            this.$el.on('vclick', '#btnSearchResult', $.proxy(this.goSearch, this));
            this.$el.on('vclick', '#popSideOverlay', $.proxy(this.showSideMenu, this));
            this.$el.on('vclick', 'h1#appTitle', $.proxy(this.goAppHome, this));
            this.$el.on('vclick', 'a[href="home"]', $.proxy(this.goHome, this));
            // orientation test 용 코드
            this.$el.on('vclick', '#orientation', $.proxy(this.orientation, this));
            this.$el.on('vclick', 'a[href="logout"]', $.proxy(this.goLogout, this));
            this.$el.on('vclick', 'a#btnScrollToTop', $.proxy(this.scrollToTop, this));
            this.$el.on('keyup', '#searchInput', $.proxy(this.goSearchSubmit, this));
            this.$el.on('swipeleft', '#popSideOverlay', $.proxy(this.showSideMenu, this));
            this.$el.on('submit', 'searchForm', $.proxy(this.goSearch, this));
            this.$el.on('vclick', 'a#go_to_pc_version', $.proxy(this.goToPcVersion, this));
            this.$el.on('vclick', 'a#scrollToTop', $.proxy(this.scrollToTop, this));
            $(window).on('scroll', $.proxy(this.detect_scroll, this));
        },
        initialize: function (options) {
            var _this = this;
            this.options = options || {};
            this.myScroll = null;
            this.sideScroll = null;
            this.resizeCount = 0;
            this.resizeFlag = false;
            this.variables = _.extend({
                root: GO.config('root'),
                isMobileApp: GO.config('isMobileApp'),
                homeUrl: "home",
                useSearch: (this.options.hasOwnProperty('useSearch') ? !!this.options.useSearch : true),
                lang: {
                    input_placeholder: CommonLang['검색어를 입력하세요.']
                }
            }, tvars);

            if (!this.variables.isMobileApp) {
                var homeUrl = GO.config("contextRoot") + "app/home";
                this.variables.isAndroid = GO.util.checkOS() == "android";
                this.variables.homeUrl = homeUrl;
                this.variables.useMobileAppService = GO.config("useMobileApp");
            }

            $(window).on('orientationchange', function () {
//		        	var delay = GO.util.isMobileApp() ? 500 : 500;
                //iPhone의 경우 렌더 시점에 따라 Body의 height의 값이 달라지기 때문에 딜레이를 1000으로 설정
                setTimeout(function () {
                    _this.orientationchange();
                    // 아래 커스텀 이벤트를 각각의 앱에서 받아 본문에 iScroll 이 들어간 경우 다시 랜더링 해줘야함.
                    $(window).trigger("orientation");
                }, 1000);
            });

            //GO-23609 영향 범위(모바일페이지 전체 폰트사이즈 변경시) 하단바 위치를 인터벌로 수정 하도록 함
            var biggerCssName = "link[href='/resources/css/go_m_style_bigger.css?rev=" + GO.revision + "']";
            var bigCssName = "link[href='/resources/css/go_m_style_big.css?rev=" + GO.revision + "']";
            if (($(biggerCssName).not(":disabled").length) || ($(bigCssName).not(":disabled").length)) {
                //핸들러로 구현하고자하였으나 영향 범위가 너무 많아서 인터벌로 처리함
                if (!this.resizeFlag && this.resizeCount < 10) {
                    var resizeInterval = setInterval(function () {
                        _this.setBodyHeight();

                        _this.resizeCount++;
                        if (_this.resizeCount === 10) {
                            _this.resizeFlag = true;
                            clearInterval(resizeInterval);
                        }
                    }, 500);
                }
            }

            this._initPageEvents();
        },

        detect_scroll: function (e) {
            if (_.isUndefined(e.currentTarget)) {
                return;
            }

            var scrollToTopBtn = $('#scrollToTop');
            var writeBtn = jQuery("#commonWriteButton");
            var tabWap = $(".tab_wrap");
            var scrollY = e.currentTarget.scrollY;
            if (scrollY < 30) {
                tabWap.show();
                scrollToTopBtn.hide();
            } else if (scrollY < this.lastScrollTop && scrollY > 30) {
                tabWap.show();
                if(!hasScrollBar()) return;
                scrollToTopBtn.show();
                this.moveScrollTopBtn(writeBtn.is(":visible") ? "up" : "down");
            } else {
                tabWap.hide();
                scrollToTopBtn.hide();
            }
            this.lastScrollTop = scrollY;

            function hasScrollBar() {
                return $(".go_content").height() > $(window).height();
            }
        },

        moveScrollTopBtn: function (direction, callback) {
            var scrollTopBtn = $('#scrollToTop');
            var translateY = "translateY(0px)";
            scrollTopBtn.off('transitionend webkitTransitionEnd');
            scrollTopBtn.on('transitionend webkitTransitionEnd', function () {
                if (typeof callback == "function") {
                    callback();
                }
            });
            if (direction == "down") {
                translateY = "translateY(+70px)";
            }
            scrollTopBtn.css("-webkit-transform", translateY);
        },

        render: function (packageName) {
            var deferred = $.Deferred();
            this.resetClassnames();

            if (!this.$el.find('div[data-role="layer"]').length) {

                this.packageName = packageName;
                this.unbindEvent();

                this.renderLayout();
                var _this = this;

                this.scrollToTop();
                this.bindEvent();

                this.setBodyHeight();
                this.clearSearchEl();

                window.goUrl = function (url, goAgent) { // DO 앱간 이동을 router 를 통해 이동시 페이지 중첩, 이벤트 중첩됨
                    console.log("mobile_default goUrl call!! url:" + url + ", agent: " + goAgent);
                    $.cookie('GO-Agent', goAgent);
                    window.location.href = url;
                };

                window.androidHistoryBack = function () {
                    if (_this.$el.find('#popAttachOverlay').length) {
                        _this.clearAttachEl();
                        $('#mobileContent').show();
                    } else if (_this.$el.find('#popSearchOverlay').length) {
                        _this.clearSearchEl();
                    } else if (_this.isSideShow()) {
                        _this.showSideMenu('hide');
                    } else if ($('#ui-datepicker-div').css('display') == 'block') {
                        try {
                            $('#startDate').blur().datepicker('hide');
                            $('#endDate').blur().datepicker('hide');
                            $('#birthdayDate').blur().datepicker('hide');
                            $('#anniversaryDate').blur().datepicker('hide');
                        } catch (e) {
                        }
                    } else if ($('#goSearch').css('display') == 'block') {
                        $("#goSearch").hide().empty();
                        $('body').toggleClass('scroll_fix');
                    } else if ($("#webfolder_content").css("display") == "block") {
                        if ($("#webSubFolderToolbarWrap").css("display") == "block") {
                            $("#moveParentWebFolder").trigger("click");
                        } else {
                            $("#goBody").show();
                            $("#webFolderView").remove();
                        }
                    } else if ($('div.go_body').next('div.overlay_scroll').is(':visible')) {
                        //전자결재 수신문서 담당자 지정레이어
                        $('div.overlay_scroll div.layer_type_bottom').animate({
                            bottom: -300
                        }, 150, function () {
                            $('.overlay_scroll').hide();
                        });
                    } else if ($(".ui-todocard-container").css("display") == "block") {
                        GO.EventEmitter.trigger("todo", "close:cardLayer", "");
                    } else {
                        window.GOMobile.pressBackKey();
                    }
                    return false;
                };

                //모바일 앱에서 하단 탭누를때 작성중인지 아닌지 체크
                window.moveTab = function () {
                    // 앱에 moveTab이 호출 되었다고 응답함
                    GO.util.moveTabReturn();

                    var $subject = _this.$el.find('#subject');
                    var $mobileContent = _this.$el.find('#mobileContent');
                    var $summary = _this.$el.find('#summary');
                    var $location = _this.$el.find('#location');
                    var $description = _this.$el.find('#description');
                    var textarea = _this.$el.find("textarea:visible");

                    if ($subject.length && $mobileContent.length) {  //게시판 쓰기페이지
                        if ($subject.val() != '' || $mobileContent.val() != '') {
                            _this.confirmWritePage();
                            return;
                        }
                    }

                    if ($summary.length && $location.length && $description.length) {  //캘린더 일정 등록 페이지
                        if ($summary.val() != '' || $location.val() != '' || $description.val() != '') {
                            _this.confirmWritePage();
                            return;
                        }
                    }

                    if (textarea.length) {
                        if (textarea.val() != "") {
                            _this.confirmWritePage();
                            return;
                        }
                    }

                    GO.util.moveTab();
                };

                window.changeSystemFontsize = function (systemFontsize) {
                    if ("BIG" === systemFontsize) {
                        $("#systemBigStyle").prop("disabled", false);
                        $("#systemBiggerStyle").prop("disabled", true);
                    } else if ("BIGGER" === systemFontsize) {
                        $("#systemBigStyle").prop("disabled", true);
                        $("#systemBiggerStyle").prop("disabled", false);
                    } else {
                        $("#systemBigStyle").prop("disabled", true);
                        $("#systemBiggerStyle").prop("disabled", true);
                    }
                };

            }
            GO.util.unBindToolbarFixed(); // 모바일 상세 화면의 상단 스크롤 고정 unbind
            GO.util.changeStatusBarColor(false);

            deferred.resolveWith(this, [this]);
            this.trigger("rendered:layout", [this]);
            return deferred;
        },

        initSideStyle: function () {
            this.setSideHeight();
            this.refreshSideScroll();
        },

        // orientation test 용 코드
        orientation: function () {
            $(window).trigger("orientationchange");
        },

        confirmWritePage: function () {
            if (confirm(tvars.lang.write_check)) {
                GO.util.moveTab();
            }
        },

        scrollToBottom: function () {
            this.$el.scrollTop(this.$el.scrollHeight);
        },
        scrollToTop: function () {
            if (this.myScroll != null && this.myScroll.hasOwnProperty('scrollTo')) {
                this.myScroll.scrollTo(0, 0, 0);
            } else {
                $.mobile.silentScroll(0);
            }
            return false;
        },
        scrollToEL: function () {
            if (this.myScroll == null) return false;

            var args = arguments.length > 0 ? aslice.call(arguments[0]) : [],
                el = args[0].el,
                y = 0;

            if (el.length) {
                y = el.offset().top - ($(window).height() / 2);
                if (y > 0) {
                    this.myScroll.scrollTo(0, '-' + y, 0);
                }

                el.fadeOut(100, function () {
                    el.fadeIn(500);
                });
            }
        },

        renderLayout: function (force) {
            force = force || false;
            // 이미 이 레이아웃을 사용하고 있으면 다시 그리지 않도록 한다.
            if (!force && this.isMe()) {
                this.clearContent();
                return;
            }

            if (!this.isMe()) requirejs.undef(LAYOUT_TPL_ROOT + this.getCurrentLayout());
            this.setCurrentLayout();
            this.$el.empty().append(LayoutTpl(this.variables));
            if (!this.variables.isMobileApp) {
                this._fetchMobileDownloadLink();
            } else {
                this._renderFooter();
            }
        },

        toggleSearchEl: function (e) {
            $(e.currentTarget).blur().trigger('focusout');
            var searchEl = this.$el.find('#mobileSearch');
            this.assetId = $(e.currentTarget).attr('data-assetid');
            if (searchEl.css('display') == 'block') {
                this.clearSearchEl();
            } else {
                if (!GO.config('isMobileApp')) {
                    var url = GO.router.getUrl();
                    var lastIndex = url.lastIndexOf('#search');
                    var parsedUrl = lastIndex > 0 ? url.substr(0, lastIndex) : url;

                    GO.router.navigate(parsedUrl + '#search', {trigger: false, pushState: true});
                }
                this.setSearchOverlay();
                searchEl.show();
                this.$el.find('#searchInput').focus();
            }
            e.stopPropagation();
            return false;
        },
        toggleSearchWrap: function (e) {
            e.preventDefault();
            $(document.activeElement).blur();
            this.$el.find('#goSearch').toggle();
            $('body').toggleClass('scroll_fix');
            this.loadSearchPage();
            return false;
        },
        loadSearchPage: function () {
            var searchPage = this.getSearchPage(this.packageName);
            searchPage.render({
                packageName: this.packageName
            });
        },
        getSearchPage: function (packageName) {
            //Todo 각각 페이지 별로 추후 수정
            switch (packageName) {
                case 'contact' :
                    return require("contact/views/mobile/m_search_layer");
                case 'works' :
                    return require("works/search/views/mobile/search_layer");
                case 'board' :
                    return require("board/views/mobile/m_search_layer");
                case 'calendar' :
                    return require("calendar/views/mobile/m_search_layer");
                case 'community' :
                    return require("board/views/mobile/m_search_layer");
                case 'approval' :
                    return require("approval/views/mobile/m_search_layer");
                case 'report' :
                    return require("report/views/mobile/m_search_layer");
                case 'todo' :
                    return require("todo/views/mobile/search_layer");
                case 'docs' :
                    return require("docs/search/views/mobile/search_layer");
                case 'task' :
                    return require("task/views/mobile/search_layer");
                case 'docfolder' :
                    return require("approval/views/mobile/m_search_layer");
                default :
                    return "";
            }
        },

        clearSearchEl: function () {
            var $searchInput = $('#searchInput');
            $searchInput.trigger('blur');
            $searchInput.val('');
            this.$el.find('#mobileSearch').hide();
            this.clearSearchOverlay();
        },
        clearSearchValue: function (e) {
            this.$el.find('#searchInput').val('').focus();
            e.preventDefault();
        },
        setSearchOverlay: function () {
            var _this = this;
            this.clearSearchOverlay();
            this.$el.find('.go_wrap').append(tvars.tpl.searchOverlay);
            this.$el.find('#popSearchOverlay').click(function (e) {
                _this.toggleSearchEl(e);
            });
        },
        clearSearchOverlay: function () {
            this.$el.find('#popSearchOverlay').remove();
        },

        getContentHeight: function () {
            var windowHeight = $(window).height();
            var contentHeight = this.getContentElement().height(); // contentHeader 를 제외한 contentBody
            var headerOuterHeight = this.getHeaderElement().outerHeight(); // header
            var footerOuterHeight = this.getFooterElement().outerHeight(); // footer
            //글자 크기 조정 시 사이즈 보정
            var biggerCssName = "link[href='/resources/css/go_m_style_bigger.css?rev=" + GO.revision + "']";
            var bigCssName = "link[href='/resources/css/go_m_style_big.css?rev=" + GO.revision + "']";
            if ($(biggerCssName).not(":disabled").length) {
                contentHeight = (contentHeight * 1.3) + 50;
            } else if ($(bigCssName).not(":disabled").length) {
                contentHeight = (contentHeight * 1.15) + 50;
            }
            return Math.max(windowHeight - headerOuterHeight - footerOuterHeight, contentHeight);
        },

        initSideScroll: function () {
            $("#side").parents().show();
            /*                this.sideScroll =  new iScroll('side', {
                                bounce : false,
                                vScrollbar : true
                            });*/
            this.sideScroll = {};
            this.sideScroll.refresh = function () {
            };
        },
        refreshSideScroll: function () {
            if (this.sideScroll == null) this.initSideScroll();
            this.sideScroll.refresh();
        },
        goHome: function (e) {
            if (e) e.preventDefault();
            GO.util.goHome(e);
            return false;
        },
        goLogout: function (e) {
            if (e) e.preventDefault();
            window.location.href = '/logout';
            return false;
        },
        goAppHome: function (e) {
            e.stopPropagation();

            if ($(e.currentTarget).hasClass("goAppHomeDisable") || GO.util.disagreeContentLoss()) {
                return;
            }

            if (this.packageName === "todo") {
                if($(".ui-todocard-container").length >= 1){
                    GO.EventEmitter.trigger("todo", "close:cardLayer", "");
                }
                if($(".ui-backdrop").length >= 1){
                    GO.EventEmitter.trigger("todo", "close:cardColumnMenu", "");
                }
            }

            GO.router.navigate(this.packageName, true);
            return false;
        },
        _serializeObj: function (obj) {
            var str = [];
            for (var p in obj) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
            return str.join("&");
        },
        goSearchSubmit: function (e) {
            if (e.keyCode == 13) this.goSearch(e);
            return false;
        },
        goSearch: function (e) {
            if (GO.util.disagreeContentLoss()) {
                return;
            }

            $(e.currentTarget).blur().trigger('focusout');

            var $inputEl = this.$el.find('#searchInput'),
                keyword = $inputEl.val();

            if ($.trim(keyword) == '' || keyword == $('#searchInput').attr('placeholder')) {
                GO.util.delayAlert(CommonLang['검색어를 입력하세요.']);
                $inputEl.focus();
                return;
            }

            if (!$.goValidation.isCheckLength(2, 64, keyword)) {
                GO.util.delayAlert(GO.i18n(CommonLang['0자이상 0이하 입력해야합니다.'], {"arg1": "2", "arg2": "64"}));
                $inputEl.focus();
                return;
            }

            if ($.goValidation.isInValidEmailChar(keyword)) {
                GO.util.delayAlert(CommonLang['메일 사용 불가 문자']);
                $inputEl.focus();
                return;
            }

            var packageName = this.packageName;
            var startAt = GO.util.toISO8601('1970/01/01');
            var endAt = GO.util.toISO8601(new Date());
            var param = {
                approval: {
                    stype: 'simple',
                    keyword: keyword,
                    fromDate: startAt,
                    toDate: endAt,
                    listType: 'approval'
                },
                docfolder: {
                    stype: 'simple',
                    keyword: keyword,
                    fromDate: startAt,
                    toDate: endAt,
                    listType: 'docfolder'
                },
                board: {
                    stype: 'simple',
                    keyword: keyword,
                    fromDate: startAt,
                    toDate: endAt,
                    isCommunity: false,
                    searchType: 'simple'
                },
                community: {
                    stype: 'simple',
                    keyword: keyword,
                    fromDate: startAt,
                    toDate: endAt,
                    isCommunity: true,
                    searchType: 'simple'
                },
                calendar: {
                    stype: 'simple',
                    keyword: keyword,
                    searchType: 'simple'
                },
                contact: {
                    keyword: keyword
                },
                asset: {
                    assetId: this.assetId,
                    nameKeyword: keyword
                },
                report: {
                    stype: 'simple',
                    keyword: keyword,
                    fromDate: startAt,
                    toDate: endAt,
                    properties: "submittedAt"
                },
                task: {
                    stype: 'simple',
                    keyword: keyword,
                    fromDate: startAt,
                    toDate: endAt
                },
                todo: {
                    stype: 'simple',
                    keyword: keyword
                },
                works: {
                    keyword: keyword
                },
                docs: {
                    stype: 'simple',
                    keyword: keyword,
                    fromDate: startAt,
                    toDate: endAt
                }
            }[packageName];

            this.clearSearchEl();

            if (!param) return;

            window.MsearchParam = this._serializeObj(param);
            GO.router.navigate(packageName + '/search?' + this._serializeObj(param), {trigger: true, pushState: true});
            e.stopPropagation();
            return false;
        },
        goToPcVersion: function () {
            $.cookie('pcVersion', 'true', {path: '/'});
            var isHomeUrl = location.href.indexOf("app/home") > -1;
            if (isHomeUrl) {
                //현재 페이지가 홈이면 initMenu확인후 그곳으로 리다이렉트
                $.ajax(GO.contextRoot + 'api/menu/init/mobile', {
                    method: 'GET',
                    dataType: 'json',
                    contentType: 'application/json'
                }).done(function (response) {
                    location.href = response.data.str;
                }).fail(function () {
                });
            } else {
                location.reload();
            }
            return false;
        },
        clearContent: function () {
            if (this.isMe()) {
                var $content = this.getContentElement();

                $content.empty();
                this.showSideMenu('hide');

                if (this.myScroll != null) {
                    this.myScroll.destroy();
                    this.myScroll = null;
                }
                this.clearOverlay();
            }
        },
        isSideShow: function () {
            return $("#side").css('display') === 'block';
        },
        showSideMenu: function (hideSide) {
            var $contentBody = this.getContentBodyElement(),
                $side = this.getSideElement(),
                $headerToolBar = this.getHeaderToolBarElement(),
                isSideShow = hideSide === 'hide' ? true : this.isSideShow();

            $(document).undelegate("#popSideOverlay, header.go_header", "scrollstart");

            this.getSideOverlayElement().remove();
            if (!isSideShow) {
                var contentBodyOffset = $contentBody.offset();
                this.getBodyElement().after(tvars['tpl']['sideOverlay']);
                this.getSideOverlayElement().css({
                    left: contentBodyOffset.left + 'px',
                    top: 0,
                    width: $contentBody.width() + 'px',
                    height: $(window).height() + 'px',
                    position: 'fixed'
                });

                $(document).scrollTop(0).delegate("#popSideOverlay, header.go_header", "scrollstart", false);

                $side.css({
                    'top': $headerToolBar.outerHeight(true),
                    'visibility': 'visible',
                    'display': 'block'
                }).after('<div id="sideOverlay" style="background:red;width:' + $side.width() + 'px;height:100px;z-index:' + ($side.css('z-index') + 1) + ';background:transparent;position:absolute;left:0;top:0;"/>');
                //#sideOverlay - 사이드 레이어가 열리면서 사이드메뉴에 터치이벤트가 발생하는 현상 대응.
                /**
                 * 2016-04-06 현재 side 메뉴에 겹치는 부분이 없어서 제거해도 무방할 것으로 판단됨.
                 */
                //setTimeout(function() {
                $side.siblings('#sideOverlay').remove();
                //}, 700);
                this.setBodyHeightByIsSideShow(true);
                this.initSideStyle();
                this.getWindowBodyElement().css('overflow', 'hidden');
                $(".dim").show();
            } else {
                $side.css({
                    'visibility': 'hidden',
                    'display': 'none'
                });
                this.setBodyHeightByIsSideShow(false);
                this.getWindowBodyElement().css('overflow', 'initial');
                $(".dim").hide();
            }
            return false;
        },

        // layout = header + body + footer
        getHeaderElement: function () {
            return this.$('header.go_header');
        },
        getBodyElement: function () {
            return this.$('.go_body');
        },
        getFooterElement: function () {
            return this.$('footer');
        },
        getWindowBodyElement: function () {
            return $('body');
        },

        // body = side + contentBody
        // side > sideContent
        getSideElement: function () {
            return this.$('#side');
        },
        getSideContentElement: function () {
            return this.$('#sideContent');
        },
        getSearchWrapElement: function () {
            return this.$('#goSearch');
        },
        getContentBodyElement: function () {
            return this.$('.go_content');
        },
        getContentElement: function () {
            return this.$('#content');
        },

        getHeaderToolBarElement: function () {
            return this.$('#headerToolbar');
        },

        // etc
        getSideOverlayElement: function () {
            return this.$('#popSideOverlay');
        },


        /*
         * setSideHeight.
         * orientation 및 기타 side initialize 시, sideHeight 를 동적으로 조정해 주기 위한 method.
         * side 영역은 sideContent 와 관계없이 고정된 값을 가지며 iscroll 로 동작.
         * side가 열려있는동안 content 영역은 스크롤이 되지 않음.
         * documentBodyHeight 가 windowHeight 보다 큰 경우 스크롤이 있다고 간주.
         * 스크롤이 있는 경우 sideHeight는 windowHieght 에서 headerHeight 를 제외한 값.
         * 스크롤이 없는 경우 sideHeight는 bodyHeight와 동일.
         */
        setSideHeight: function () {
            var sideEl = this.getSideElement();
            var headerEl = this.getHeaderElement();
            var headerToolBarEl = this.getHeaderToolBarElement();
            var bodyEl = this.getBodyElement();
            var footerEl = this.getFooterElement();
            var totalHeight = headerEl.height() + bodyEl.height() + footerEl.outerHeight(); // $("body").height();
            var windowHeight = $(window).height();
            var hasScroll = totalHeight > windowHeight;
            var height = hasScroll ? windowHeight - headerEl.height() : bodyEl.height();

            sideEl.css({
                height: height - headerToolBarEl.outerHeight(true)
            });
        },

        setBodyHeight: function () {
            var bodyHeight = this.getContentHeight();
            this.getBodyElement().css({
                'height': 'auto',
                'min-height': bodyHeight
            });
        },

        setBodyHeightByIsSideShow: function (isSideShow) {
            if (isSideShow) {
                var bodyHeight = $(window).height() - this.getHeaderElement().height();
                this.getBodyElement().css({
                    'height': bodyHeight,
                    'min-height': bodyHeight
                });
            } else {
                this.setBodyHeight();
            }
        },

        clearSide: function () {
            if (this.isMe()) {
                var $side = this.getSideElement();
                $side.off();
                $side.empty();
            }
        },

        clearAll: function () {
            this.clearContent();
            this.clearSide();
        },
        setOverlay: function () {
            this.clearOverlay();
            this.$el.append(tvars.tpl.overlay);
        },
        clearOverlay: function () {
            this.$el.find('#popOverlay').fadeOut(1000, function () {
                $(this).remove();
            });
        },
        targetSetOverlay: function (target) {
            this.clearOverlay();
            target.append(tvars.tpl.overlay);
            $('#popOverlay').css({'position': 'relative', 'top': '250px'});
        },

        getPopupElement: function () {
            return this.$el.find('div.layer_organogram, div.go_popup, div#popOverlay');
        },
        getCurrentLayout: function () {
            return $('body').data('layout');
        },

        setCurrentLayout: function () {
            $('body').data('layout', this.name);
        },

        isMe: function () {
            return this.getCurrentLayout() === this.name;
        },

        reset: function () {
            this.setLayout(true);
        },

        resetClassnames: function () {
            this.$el.attr("class", "");
            if (this.className) {
                this.$el.addClass(this.className);
            }
            $("#goBody").removeClass('address_detail');
        },

        _initPageEvents: function () {
            GO.EventEmitter.on('common', 'layout:scrollToBottom', this.scrollToBottom, this);
            GO.EventEmitter.on('common', 'layout:scrollToTop', this.scrollToTop, this);
            GO.EventEmitter.on('common', 'layout:scrollToEL', this.scrollToEL, this);
            GO.EventEmitter.on('common', 'layout:showSideMenu', this.showSideMenu, this);
            GO.EventEmitter.on('common', 'layout:callProgressBar', this.callProgressBar, this);
            GO.EventEmitter.on('common', 'layout:clearAttachOverlay', this.clearAttachEl, this);
            GO.EventEmitter.on('common', 'layout:initSideScroll', this.initSideScroll, this);
            GO.EventEmitter.on('common', 'layout:refreshSideScroll', this.refreshSideScroll, this);

            GO.EventEmitter.on('common', 'goHome', this.goHome, this);

            GO.EventEmitter.on('common', 'layout:setOverlay', this.setOverlay, this);
            GO.EventEmitter.on('common', 'layout:clearOverlay', this.clearOverlay, this);
            GO.EventEmitter.on('common', 'layout:targetSetOverlay', this.targetSetOverlay, this);
        },

        showSideElement: function () {
            this.getSideElement().css("visibility", "visible").show();
        },


        orientationchange: function () {
            this.scrollToTop();
            var isSideShow = this.getSideElement().css('visibility') === 'visible' ? true : false;
            this.setBodyHeightByIsSideShow(isSideShow);
            this.initSideStyle();
        },

        _fetchMobileDownloadLink: function () {
            $.ajax({
                url: GO.contextRoot + 'api/mobile-download-link',
                success: $.proxy(function (resp) {
                    this._renderFooter(resp.data);
                }, this)
            });
        },

        _renderFooter: function (data) {
            this.$('#goBody').after(FooterTpl(_.extend(this.variables, {
                android: _.isUndefined(data) ? false : data.android,
                iphone: _.isUndefined(data) ? false : data.iphone
            })));
            this.setBodyHeight();
        }
    }, {
        __instance__: null,
        create: function () {
            if (this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
            return this.__instance__;
        }
    });
});