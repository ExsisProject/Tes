define([
        "backbone",
        "app",
        "collections/notifications",
        "hgn!templates/layouts/default",
        "views/profile_card",
        "views/dept_profile_card",
        "i18n!nls/commons",
        "i18n!nls/notification",
        "i18n!calendar/nls/calendar",
        "libraries/go-redirect-policy",
        "libraries/go-nav",
        "jquery.go-org",
        "jquery.go-popup",
        "go-notice",
        "views/layouts/layoutEventListener"
    ],

    function (
        Backbone,
        GO,
        Notifications,
        LayoutTpl,
        ProfileCardView,
        DeptProfileCardView,
        CommonLang,
        NotiLang,
        CalLang,
        RedirectPolicy,
        GONavigation
    ) {

        var LAYOUT_TPL_ROOT = "hgn!templates/layouts/default";
        var aslice = Array.prototype.slice,
            tvars = {
                label: {
                    noti_app_title: CommonLang["알림"],
                    management: CommonLang["개인정보 수정"],
                    logout: CommonLang["로그아웃"],
                    confirm: CommonLang['확인'],
                    cancel: CommonLang['취소'],
                    view_mobile: CommonLang["모바일 버전으로 보기"]
                },
                tpl: {
                    overlay: '<div id="popOverlay" class="overlay" data-layer><div class="processing"></div></div>'
                }
            };

        return Backbone.View.extend({
            el: "#main",
            name: "default",
            className: "go_skin_default",
            contentSize: 0,
            contentTopMargin: 0,
            useRedirectPolicy: true,

            events: {
                "click #changeToMobileWeb": 'changeToMobileWeb'
            },

            initialize: function (options) {
                this.options = options || {};
                this.contentSize = 0;
                this.contentTopMargin = 0;
                this.navigationView = null;
                this.redirectPolicy = null;

                var useMobileButton = false;
                var deviceType = GO.config('deviceType');
                if (GO.config('hasMobilePack')) {
                    useMobileButton = deviceType === 'tablet' || deviceType === 'mobile';
                }

                this.variables = _.extend({}, tvars, {
                    "use_side": true,
                    "use_content_wrapper": true,
                    "use_organogram": true,
                    "use_mobile_button": useMobileButton
                });

                this.baseConfig = GO.config('__source__');

                if (this.useRedirectPolicy) {
                    initRedirectPolicy.call(this);
                }

                bindNotiClickEvent(this);
            },

            render: function () {
                var self = this,
                    deferred = $.Deferred();

                self._init();
                self._setAppName();
                self.resetClassnames();
                self.resetSideIndent();
                self.renderLayout();

                var isMini = GO.session()['theme'] == 'THEME_ADVANCED' && GO.util.store.get(GO.session('id') + '-' + '-is-mini');
                if (typeof isMini === "undefined") isMini = false;
                $('body').toggleClass('mini', isMini);

                //self._bindWindowResize();
                deferred.resolveWith(self, [self]);

                // setTimeout(this.showWebkitNotiConfirm, 2000);

                // 레이아웃 렌더링 끝났음을 알리고 레이아웃 객체를 전달한다.
                self.trigger("rendered:layout", [self]);

                $.goNotice.render({
                    "contextRoot": GO.contextRoot
                });

                window.contactGoSlideMessage = function (msg, type) {
                    $.goSlideMessage(msg, type || 'caution');
                };

                self._decideSideVisible();
                self._preventDropFile();
                return deferred;
            },

            _decideSideVisible: function () {
                if (this._getAppName() == 'none') {
                    return;
                }

                var workspaceExpanded = GO.config('sideVisible') == ('false-' + this._getAppName());
                if (workspaceExpanded) {
                    // navigationView 관리 방식의 한계로 인해 이벤트 전달 방식 사용
                    GO.EventEmitter.trigger('default', 'side:hide');
                    this.hideSide();
                } else {
                    GO.EventEmitter.trigger('default', 'side:show');
                    this.showSide();
                }
            },

            _setAppName: function () {
                this.$el.attr('data-app-name', this.appName || 'none');
            },

            _getAppName: function () {
                return this.$el.attr('data-app-name');
            },

            // 레이아웃이 변경될때마다 새로 초기화 해야할 코드들을 여기 넣는다.
            _init: function () {
                this.setUseSide(true);
                this.setUseContentWrapper(true);
                this.setUseOrganogram(true);
                GO.config('workspace_expansion_button_visible', true);
            },

            resetClassnames: function () {
                this.$el.attr("class", "");
                this.$el.addClass(this.className);
                if (GO.session()['theme'] == 'THEME_ADVANCED') {
                    this.$el.addClass('go_skin_advanced');

                    if (GO.useMiniGnb === "true") {
                        this.$el.addClass('channel')
                    }

                    if (GO.useLabFeedback && GO.hasLabFeedbackConfig) {
                        this.$el.addClass('lab');
                    }
                }
            },

            resetSideIndent: function () {
                var $side = this.getSideElement();
                if (this.appName == 'calendar') {
                    $side.addClass("go_side_calendar");
                } else {
                    $side.removeClass("go_side_calendar");
                }
            },

            renderLayout: function (force) {
                force = force || false;
                // 이미 이 레이아웃을 사용하고 있으면 다시 그리지 않도록 한다.
                if (!force && this.isMe()) {
                    if (GO.useLabFeedback && GO.hasLabFeedbackConfig && this.navigationView) {
                        this.navigationView.renderLabPopUp();
                    }
                    return;
                }

                if (!this.isMe()) requirejs.undef(LAYOUT_TPL_ROOT + this.getCurrentLayout());
                this.setCurrentLayout();
                this.setSessionInfo();
                this.$el.empty().append(LayoutTpl(this.variables));
                this.setNavigator();
                this.updateNotiCount();

                // 조직도 UI & 이벤트 바인딩
                this._initOrganogram();

                // 라우터 이벤트 바인딩
                this._initRouteEvents();
                this._initLayoutEvents();
            },

            setContent: function (instance) {
                var contentWrap = this.getContentContainerElement();

                this.removeContentView();
                contentWrap.data('go-view-instance', instance);
                contentWrap.append(instance.el);
            },

            setUseSide: function (bool) {
                this.variables.use_side = bool;
            },

            setUseContentWrapper: function (bool) {
                this.variables.use_content_wrapper = bool;
            },

            isUsedContentWrapper: function () {
                return this.variables.use_content_wrapper;
            },

            setUseOrganogram: function (bool) {
                this.variables.use_organogram = bool;
            },

            setSessionInfo: function () {
                this.variables['profile?'] = GO.session();
            },

            updateNotiCount: function () {
                Notifications.getNewCount(function (count) {
                    var $notiCountBadge = $('#noti-count-badge');
                    $notiCountBadge.text(count);
                    $notiCountBadge.css("display", count == 0 ? "none" : "inline-block");
                });
            },

            changeToMobileWeb: function () {
                $.cookie('pcVersion', 'false', {path: '/'});
                location.reload();
            },

            setNavigator: function () {
                var baseConfig = this.baseConfig;

                if (!baseConfig.contextRoot) baseConfig.contextRoot = GO.config('contextRoot');
                if (!baseConfig.locale) baseConfig.locale = GO.config('locale');

                this.navigationView = GONavigation.create('nav-placeholder', {
                    "session": GO.session(),
                    "companies": GO.session('integratedCompanies'),
                    "baseConfig": baseConfig,
                    "activeMenu": getCurrentAppName(),
                    "lang": {
                        "휴면": CommonLang["휴면"],
                        "관리": CommonLang["관리"],
                        "로그아웃": CommonLang["로그아웃"],
                        "알림": CommonLang["알림"],
                        "대시보드 편집": CommonLang["대시보드 편집"],
                        "기본정보": CommonLang["기본정보"],
                        "환경설정": CommonLang["환경설정"],
                        "보안설정": CommonLang["보안설정"],
                        "도움말": CommonLang["도움말"],
                        "업데이트 확인하기": CommonLang["업데이트 확인하기"],
                        "님": CommonLang["님"],
                        "멀티컴퍼니 열기": CommonLang["멀티컴퍼니 열기"],
                        "멀티컴퍼니 닫기": CommonLang["멀티컴퍼니 닫기"],
                        "워크스페이스 확장": CommonLang["워크스페이스 확장"],
                        "워크스페이스 기본": CommonLang["워크스페이스 기본"],
                        "메뉴": CommonLang["메뉴"],
                        "관리자 페이지": CommonLang["관리자 페이지"],
                        "서비스 사용기간이 만료되었습니다.": CommonLang["서비스 사용기간이 만료되었습니다."],
                        "알림 설정": CommonLang["알림 설정"],
                        "다우오피스 사용에 관한 모든 것!": CommonLang["다우오피스 사용에 관한 모든 것!"],
                        "언제 어디서나 클릭해보세요.": CommonLang["언제 어디서나 클릭해보세요."],
                        "새로운 다우오피스를 만나보세요!": CommonLang["새로운 다우오피스를 만나보세요!"],
                        "3가지 기능 둘러보기": CommonLang["3가지 기능 둘러보기"],
                        "새로운 기능 (메뉴 열기/닫기)": CommonLang["새로운 기능 (메뉴 열기/닫기)"],
                        "새로운 기능 설명": CommonLang["새로운 기능 설명"],
                        "조직도 UX 변경": CommonLang["조직도 UX 변경"],
                        "조직도 UX 변경 설명": CommonLang["조직도 UX 변경 설명"],
                        "개인 메뉴 그룹핑": CommonLang["개인 메뉴 그룹핑"],
                        "개인 메뉴 그룹핑 설명": CommonLang["개인 메뉴 그룹핑 설명"],
                        "새로운 포탈 시작": CommonLang["새로운 포탈 시작"],
                        "다음": CommonLang["다음"],
                        "조직도": CommonLang["조직도"],
                        "설정": CommonLang["설정"],
                        "실험실": CommonLang["실험실"],
                        "자세히 보기": CommonLang["자세히 보기"]
                    },
                    "onMovePage": $.proxy(this.onMovePage, this),
                    "brandName": GO.util.getBrandName(),
                    "onWorkspaceWide": $.proxy(this.hideSide, this),
                    "onWorkspaceNormal": $.proxy(this.showSide, this)
                });

            },

            onMovePage: function () {
                var deferred = $.Deferred();
                if (!this.useRedirectPolicy) {
                    return deferred.resolve(true);
                }
                if (this.redirectPolicy.allow()) {
                    return deferred.resolve(true);
                }

                GO.util.editorWritingPopup(deferred);

                return deferred;
            },


            activateMenu: function () {
                this.navigationView.activateMenu(GO.router.getPackageName());
            },

            removeContentView: function () {
                var contentWrap = this.getContentContainerElement();
                if (contentWrap.data('go-view-instance')) {
                    var savedInstance = contentWrap.data('go-view-instance'),
                        releaseFn = _.isFunction(savedInstance['release']) ? savedInstance['release'] : savedInstance['remove'];

                    releaseFn.call(savedInstance);
                }
            },

            clearContent: function () {
                if (this.isMe()) {
                    var $content = this.getContentElement(),
                        $popup = this.getPopupElement();

                    $content.attr("class", "").addClass("go_content");
                    $content.empty();
                    $popup.remove();
                    this.clearOverlay();
                }

                // 일부 페이지에서 이전 컨텐츠뷰를 삭제하지 못하는 현상에 대한 대응
                this.removeContentView();

                //윈도우 scroll, resize 관련 이벤트 모두 해제
                $(window).off('scroll');
                $(window).off('resize');

                // GO-11562 이슈 대응
                // clearPage 때 window 객체에 걸린 resize 이벤트를 모두 클리어시켜서 나는 문제
                // 많은 곳에서 resize 이벤트를 사용하고 있으므로 영향의 범위를 정확히 파악할 수 없어서 우선 reload 함수를 추가하여 해결
                if (this.navigationView) {
                    this.navigationView.setActiveMenu(getCurrentAppName());
                    this.navigationView.reload();
                }

                // activeX + 조직도 겹침 이슈로 인하여 조직도에 resize와 scroll 이벤트가 추가되었다.
                // 위의 GO-11562 이슈와 같은 문제 발생.
                if (this.organogram) {
                    this.organogram.setPosition();
                    this.organogram.bindPositionEvent();
                }

                // [GO-16355] 캘린더 > 화면 사이즈 축소 시 캘린더 월별 뷰에서 화면 깨짐
                // 스크롤이 아래로 되어 있는 상태에서 페이지가 바뀌면 스크롤이 그대로 위치하고 있어서 캘린더 같이 화면에 꽉찬 앱에서 오류가 발생함.
                if (window.scrollTo) {
                    window.scrollTo(0, 0);
                }
            },

            clearPopup: function () {
                $("div.layer_normal").remove();
            },

            clearSide: function () {
                if (this.isMe()) {
                    var $side = this.getSideElement();
                    // 모든 이벤트 삭제
                    $side.off();
                    $side.empty();
                }
            },

            getContentHeight: function () {
                var wH = $(window).height(),
                    cOH = this.getContentElement().height(),
                    hOH = this.getHeaderElement().outerHeight(),
                    fOH = 0;

                return Math.max(wH - hOH - fOH, cOH);
            },

            resizeSide: function () {
                this.getSideElement().height(this.getContentHeight());
            },

            clearAll: function () {
                this.clearContent();
                this.clearPopup();
                this.clearSide();
                this.activateMenu();
            },

            setOverlay: function () {
                this.clearOverlay();
                this.$el.append(tvars.tpl.overlay);
                $(document).trigger("showLayer.goLayer");
            },

            clearOverlay: function () {
                this.$el.find('.overlay').remove();
                $(document).trigger("hideLayer.goLayer");
            },

            targetSetOverlay: function (target) {
                this.clearOverlay();
                target.append(tvars.tpl.overlay);
                $('#popOverlay').css({'position': 'relative', 'top': '250px'});
            },

            showSide: function () {
                GO.config('sideVisible', 'true-' + this._getAppName());
                $('body').removeClass('go_workspace_wide');
                var displayConfig = this.baseConfig.displayConfigModel;
                if (displayConfig.orgPullUp && GO.session('useOrgAccess') && GO.session('theme') !== 'THEME_ADVANCED') {
                    $('#organogram').show();
                }
            },

            hideSide: function () {
                GO.config('sideVisible', 'false-' + this._getAppName());
                $('body').addClass('go_workspace_wide');
                $('#organogram').hide();
            },

            getHeaderElement: function () {
                return this.$el.find('header.go_header');
            },

            getBodyElement: function () {
                return this.$el.find('.go_body');
            },

            getFooterElement: function () {
                return this.$el.find('footer.go_footer');
            },

            getNavigatorElement: function () {
                return this.$el.find("#navigator");
            },

            getSideElement: function () {
                return this.$el.find('#side');
            },

            getContentElement: function () {
                return this.$el.find('#content');
            },

            getPopupElement: function () {
                return this.$el.find('div.go_popup, div#popOverlay, div[class*=layer]:not(.notremoval)');
            },

            getCurrentLayout: function () {
                return $('body').data('layout');
            },

            getContentContainerElement: function () {
                return this.isUsedContentWrapper() ? this.getContentElement() : this.getBodyElement();
            },

            setCurrentLayout: function () {
                $('body').data('layout', this.name);
            },

            isMe: function () {
                return this.getCurrentLayout() === this.name;
            },

            // 강제 리셋
            reset: function () {
                this.setLayout(true);
            },

            /*
             * Privates..
             */
            _preventDropFile: function () {
                var $body = $("#main");
                $body.unbind('dragover');
                $body.unbind('drop');
                $body.bind('dragover', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.originalEvent.dataTransfer.dropEffect = 'none';
                });
                $body.bind('drop', function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                });
            },

            _initRouteEvents: function () {
                GO.router.off("change:page", this.clearContent);
                GO.router.off("change:package", this.clearAll);
                GO.router.on("change:page", this.clearContent, this);
                GO.router.on("change:package", this.clearAll, this);
            },

            _initLayoutEvents: function () {
                GO.EventEmitter.on('common', 'layout:setOverlay', this.setOverlay, this);
                GO.EventEmitter.on('common', 'layout:clearOverlay', this.clearOverlay, this);
                GO.EventEmitter.on('common', 'layout:targetSetOverlay', this.targetSetOverlay, this);
            },

            _initOrganogram: function () {
                var displayConfig = this.baseConfig.displayConfigModel;
                var orgSelector = '.go_organogram';
                var orgOpts = {
                    el: orgSelector,
                    contextRoot: GO.config("contextRoot"),
                    lang: GO.lang
                };
                var $org = $(orgSelector);
                if ($org.length < 1) {
                    return;
                }

                if (!displayConfig.orgPullUp) {
                    $org.hide();
                    return;
                }

                createDisplayFormatOption(orgOpts, 'orgTreeMasterFormat');
                createDisplayFormatOption(orgOpts, 'orgTreeModeratorFormat');
                createDisplayFormatOption(orgOpts, 'orgTreeMemberFormat');

                var organogram = $.goOrg(orgOpts);
                this.organogram = organogram;

                //조직도가 사이드 메뉴 하단을 가림. 조직도 높이만큼 사이드 패딩추가
                var paddingBottom = 0;
                if (!GO.isAdvancedTheme()) {
                    paddingBottom = this.$el.find(orgSelector).height() + 25;
                }

                this.getSideElement().css('padding-bottom', parseInt(paddingBottom, 10));

                var bottom = "";

                organogram.on("show:profile", function (e, data) {
                    ProfileCardView.render(data.id, '', {left: 220, bottom: bottom, position: 'fixed'});
                });
                organogram.on("show:dept_profile", function (e, data) {
                    DeptProfileCardView.render(data.id, '', {left: 220, bottom: bottom, position: 'fixed'});
                });
            }
        }, {
            __instance__: null,

            create: function () {
                if (this.__instance__ === null) this.__instance__ = new this.prototype.constructor();
                return this.__instance__;
            },

            // 기존 싱글톤 버전 호환성 제공
            render: function () {
                var instance = this.create(),
                    args = arguments.length > 0 ? aslice.call(arguments) : [];

                return this.prototype.render.apply(instance, args);
            }
        });

        function createDisplayFormatOption(orgOptions, key) {
            if (!orgOptions.hasOwnProperty('displayFormats')) {
                orgOptions['displayFormats'] = {};
            }

            var value = GO.config(key);
            if (_.isString(value) && value.length > 0) {
                orgOptions.displayFormats[key] = convertDisplayFormat(value);
            }
        }

        /**
         * go-org는 내부적으로 자체 템플릿 파서를 사용하고 {, }렇게 구분됨
         * 이것은 다른 템플릿들과 혼돈의 여지가 있으므로 설정페이지에서 등록할 때는 기본 Mustache 문법을 따르도록 하고,
         * 주입시 변환해주는 방식을 사용.
         *
         * 추후에는 go-org 내부의 템플릿 언어를 바꾸는 것이 좋을듯 하고, 변경 후 이 함수는 그냥 통과시키는 것으로
         * 만들면 될듯.
         * (강봉수)
         *
         * @param displayFormat
         */
        function convertDisplayFormat(displayFormat) {
            var result = (displayFormat || '');

            result = result.replace(/\{\{/g, '{');
            result = result.replace(/\}\}/g, '}');

            return result;
        }

        function bindNotiClickEvent(context) {
            $(document)
                .off('web-noti:confirm.layout')
                .on('web-noti:confirm.layout', _.bind(function (e, notiObj) {
                    this.onMovePage().done(function () {
                        var openNewWindow = window.open("about:blank");
                        openNewWindow.location.href = goTargetLinkUrl(notiObj.model);
                        notiObj.close();
                    });
                }, context));
        }

        function goTargetLinkUrl(model) {
            var companies = GO.session().companies,
                targetUrl = null;

            for (var i = 0; i < companies.length; i++) {
                var siteUrl = companies[i].siteUrl;
                if (model.companyId === companies[i].id) {
                    targetUrl = location.protocol + '//' + siteUrl;
                    if (location.port) {
                        targetUrl += ':' + location.port;
                    }

                    targetUrl += GO.contextRoot + 'tokenlogin?';
                    targetUrl += $.param({
                        'token': getCookie('GOSSOcookie'),
                        'companyId': (parseInt(GO.session('companyId')) == parseInt(model.companyId)) ? null : model.companyId, // 불필요한 세션 생성 방지
                        'returnUrl': model.linkUrl
                    });
                }
            }

            return targetUrl || model.linkUrl;
        }

        function getCookie(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            return (parts.length == 2) ? parts.pop().split(";").shift() : "";
        }

        function getCurrentAppName() {
            var curPkgName = GO.router.getPackageName();

            if (curPkgName === 'sitelink') {
                var result = _.filter(GO.config('menuList'), function (menu) {
                    return (menu.url === decodeURIComponent(GO.router.getSearch('url')));
                });
                if (result.length > 0) curPkgName = result[0].name;
            }

            return curPkgName;
        }

        function initRedirectPolicy() {
            var context = this;

            context.redirectPolicy = new RedirectPolicy();

            context.redirectPolicy.addPolicy('smartEditorPolicy', function smartEditorPageMovePolicy() {
                if (!GO.util.hasActiveEditor()) return true;

                var result = true;
                if (GO.util.isEditorWriting()) {
                    result = false;
                }
                return result;

            });

            context.redirectPolicy.addPolicy('mailEditorPolicy', function mailEditorPageMovePolicy() {

                //메일이 iframe내에서 호출되는 구조로 변경되어 따로 체크를 해야함.
                if ($("#mail-viewer").length > 0) {

                    var $mailFrame = $("#mail-viewer")[0].contentWindow;
                    //메일쓰기 에디터 체크
                    if ($mailFrame.checkEscapeWriteModeForTopmenu()) {
                        return true;  //페이지 이동
                    } else {
                        return false; //에디터작성 중 경고문구 팝업
                    }
                } else {
                    return true;
                }

            });

            context.redirectPolicy.addPolicy('boardFeedPolicy', function boardFeedPageMovePolicy() {
                var $feedField = $('#feedContent'),
                    feedText;

                if (!($feedField.length > 0)) return true;

                feedText = $feedField.val().replace($feedField.attr('placeholder'), '');
                return !(feedText.length > 0);
            });
        }
    });
