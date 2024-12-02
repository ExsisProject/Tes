(function (name, definition, $, undefined) {
    var theModule = definition();
    var hasDefine = typeof define === 'function' && define.amd;
    var hasExports = typeof module !== 'undefined' && module.exports;

    if (hasDefine) {
        define(theModule);
    } else if (hasExports) {
        module.exports = theModule;
    } else {
        var obj = null;
        var namespaces = name.split(".");
        var scope = this;

        for (var i = 0, len = namespaces.length; i < len; i++) {
            var packageName = namespaces[i];

            if (obj && i === len - 1) {
                obj[packageName] = theModule;
            } else if (typeof scope[packageName] === "undefined") {
                scope[packageName] = {};
            }

            obj = scope[packageName];
        }
    }

})('GO.Nav', function () {

    var LANG, Util, WindowResizer, MenuHelper, MenuView, AdvancedMenuView, GONavigation;
    // jQuery.noConflict 모드에서도 사용할 수 있도록 로컬 변수로 등록해준다.
    var $ = window.$ || jQuery;

    /**
     * 다국어 기본 처리
     */
    LANG = {
        "휴면": "휴면",
        "관리": "관리",
        "로그아웃": "로그아웃",
        "알림": "알림",
        "대시보드 편집": "대시보드 편집",
        "기본정보": "기본정보",
        "환경설정": "환경설정",
        "보안설정": "보안설정",
        "알림 설정": "알림 설정",
        "도움말": "도움말",
        "님": "님",
        "멀티컴퍼니 열기": "멀티컴퍼니 열기",
        "멀티컴퍼니 닫기": "멀티컴퍼니 닫기",
        "워크스페이스 확장": "워크스페이스 확장",
        "워크스페이스 기본": "워크스페이스 기본",
        "관리자 페이지": "관리자 페이지",
        "서비스 사용기간이 만료되었습니다.": "서비스 사용기간이 만료되었습니다.",
        "다우오피스 사용에 관한 모든 것!": "다우오피스 사용에 관한 모든 것!",
        "언제 어디서나 클릭해보세요.": "언제 어디서나 클릭해보세요.",
        "서비스 추가 / 연장": "서비스 추가 / 연장",
        '조직도': '조직도',
        "새로운 다우오피스를 만나보세요!": "새로운 다우오피스를 만나보세요!",
        "3가지 기능 둘러보기": "3가지 기능 둘러보기",
        "새로운 기능 (메뉴 열기/닫기)": "새로운 기능 (메뉴 열기/닫기)",
        "새로운 기능 설명": "새로운 기능 설명",
        "조직도 UX 변경": "조직도 UX 변경",
        "조직도 UX 변경 설명": "조직도 UX 변경 설명",
        "개인 메뉴 그룹핑": "개인 메뉴 그룹핑",
        "개인 메뉴 그룹핑 설명": "개인 메뉴 그룹핑 설명",
        "새로운 포탈 시작": "새로운 포탈 시작",
        "다음": "다음",
        "설정": "설정",
        "실험실": "실험실",
        "자세히 보기": "자세히 보기",
        "닫기": "닫기"
    };

    Util = (function () {
        return {
            fixedUrl: function (str) {
                return str.replace('//', '/');
            },

            fixLocaleCode: function (locale) {
                if (locale === 'jp') return 'ja';
                return locale;
            },

            navigate: function (url, options) {
                var opts = $.extend({}, {trigger: true, replace: false}, options || {});

                if (hasGORouter() && GO.router.getPackageName() == "home" && url === "home") {
                    location.reload();
                }

                if (hasGORouter()) {
                    GO.router.navigate(url, opts);
                } else {
                    if (opts.replace) {
                        location.replace(url);
                    } else {
                        location.assign(url);
                    }
                }
            },

            isMobile: function () {
                if (hasGORouter()) {
                    return GO.util.isMobile();
                } else {
                    return TABLET || MOBILE;
                }
            },

            isSupportHistoryAPI: function () {
                return !!(window.history && history.pushState);
            },

            parseUrl: function (path) {
                var location = window.location;
                var _ta = document.createElement('a');

                _ta.setAttribute('href', path);

                return {
                    protocol: /^(http|https)/.test(_ta.protocol) ? _ta.protocol : location.protocol,
                    host: _ta.host ? _ta.host : location.host,
                    hostname: _ta.hostname ? _ta.hostname : location.hostname,
                    port: _ta.port ? _ta.port : location.port,
                    pathname: _ta.pathname[0] === '/' ? _ta.pathname : '/' + _ta.pathname,
                    search: _ta.search ? _ta.search : '',
                    href: _ta.href,
                    hash: _ta.hash ? _ta.hash : location.hash
                };
            }
        };
    })();

    window.GoHome = function () {
        Util.navigate("home", null, "/");
    };

    WindowResizer = (function () {
        function Klass(delay) {
            this.ignoreWindowResize = 0;
            this.resizeUID = 0;
            this.delay = delay || 200;
        }

        Klass.prototype = {
            setDelay: function (delay) {
                this.delay = delay;
            },

            bind: function (e, callback) {
                var self = this;

                if (e.target === window || e.target === document) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (!this.ignoreWindowResize) {
                        var uid = ++this.resizeUID;
                        setTimeout(function () {
                            if (uid === self.resizeUID && !self.ignoreWindowResize) {
                                self.ignoreWindowResize++;
                                callback.apply(undefined, args);
                                self.ignoreWindowResize--;
                            }
                        }, this.delay);
                    }
                }
            }
        };

        return Klass;
    })();

    MenuHelper = (function (Util) {
        return {
            getMenuByAppName: function (context, appName) {
                return $.grep(context.collection, function (model) {
                    return model.systemMenu ? model.appName === appName : model.name === appName;
                })[0];
            },

            moveMenuAction: function (context, model) {
                var re = new RegExp("(app)", "gi");
                var url = model.url;
                var parsedUrl = Util.parseUrl(url);
                var referrer = Util.parseUrl(window.location.href);

                context.options.onMovePage().done(function () {
                    move();
                });

                function move() {
                    switch (model.location) {
                        case 'new':
                            var newWin = window.open('about:blank');
                            newWin.location.href = url;
                            break;
                        case 'iframe':
                            // 두개 이상의 iframe 타입 메뉴가 있을 때 상단메뉴까지 페이지가 바뀌는 현상이 있어서 우선 location.href로 페이지 갱신.
                            window.location.assign(url);
                            if (hasGORouter() && !Util.isSupportHistoryAPI()) {
                                // history API를 지원하지 않는 브라우저에서 search 쿼리만 변경될 경우 화면이 리프레시 되지 않고 분할되는 현상이 있다.
                                // 그래서 reload 시킨다.
                                window.location.reload();
                            }
                            break;
                        case 'self':
                            if (context.options.trustCertification === true && referrer.protocol === 'https:') {
                                window.location.assign(parsedUrl.href.replace('https:', 'http:'));
                            } else if (re.test(url)) {
                                var reqUrl = hasGORouter() ? url.split('app/')[1] : url;
                                Util.navigate(reqUrl, null, context.contextRoot);
                            } else {
                                window.location.assign(url);
                            }

                            break;
                        default:
                            Util.navigate('/', {trigger: true, replace: true}, context.contextRoot);
                            break;
                    }
                }
            },
            isMiniMenu: function () {
                return GO.util.store.get(GO.session('id') + '-' + '-is-mini');
            },
            setMiniMenu: function (isMini) {
                GO.util.store.set(GO.session('id') + '-' + '-is-mini', isMini);
            }
        };
    })(Util);

    var ORG_LEFT;
    AdvancedMenuView = (function (MenuHelper) {

        function Klass($container, options) {
            this.$container = $container;
            this.options = options || {};
            this.collection = this.options.baseConfig.menuConfigModel;
            this.activeMenu = this.options.activeMenu;
            this.width = 0;
            this.activeMenuId = 0;
            this.__submenuCache__ = {};
            this.beforeWidth = $(window).width();
            ORG_LEFT = parseInt($('#organogram').css('left'));
            this.useWelcomeScreen = this.options.baseConfig.displayConfigModel.welcomeScreen;
        }

        Klass.prototype = {

            render: function () {
                initMenuStatus();
                var menu = MenuHelper.getMenuByAppName(this, this.activeMenu);
                var html = makeTemplate(menu, this.options.lang, this.collection);
                this.$container.html(html);
                bindEvents.call(this);

                new SimpleBar($('#menu-container').find('ul[data-menu-list]').get(0));
                this.resize(null, this.$container);

                disableTextSelection(this.$container);

                todayBadgeCount();
                todayMailCount();
                if (this.useWelcomeScreen) {
                    advancedWelcomeLayer(this.options.lang);
                }
            },

            setWidth: function (width) {
                this.width = width;
            },

            setActiveMenu: function (newMenuName) {
                this.activeMenu = newMenuName;
            },

            activateMenu: function () {
                // 메뉴명 변경시 Rendering 처리 추가
                // this.render();
            },

            resize: function (context, $container) {
                var height = $('header.go_header').outerHeight() - $('.wrap_btn_list').outerHeight()
                    - $('.btn_oganization').outerHeight();
                if (MenuHelper.isMiniMenu()) {
                    height = height - 30;
                } else {
                    height = height - $('#advanced_logo').outerHeight(true);
                }
                $container.find('ul').height(height);

                var currentWidth = $(window).width();
                if (this.beforeWidth >= 1280 && currentWidth < 1280) {
                    $('body').addClass('mini');
                    MenuHelper.setMiniMenu(true);
                }
                this.beforeWidth = currentWidth;
            }
        };

        function initMenuStatus() {
            var isMini = MenuHelper.isMiniMenu();
            if (isMini) {
                var $advancedHeader = $('header.go_header_advanced');
                $advancedHeader.addClass("notransition");
                $('body').addClass('mini');
                setTimeout(function () {
                    $advancedHeader.removeClass("notransition");
                }, 300);
            }
        }

        function advancedWelcomeLayer(lang) {
            if ($.cookie("isAdvancedWelcomeCloseClick")) return;
            //웰컴스크린을 붙인다.
            $("body").append(makeTempleteAdvancedGuide(lang));
            //화면에 있는 다음 버튼
            $("div.layer_welcome .btn_major").on("click", function () {
                var stepNum = $(this).closest("div.step").attr("data-step");
                if (stepNum == "4") {
                    closeWelcomeScreenLayer();
                } else {
                    nextWelcomeScreenLayer(stepNum);
                }
            });
            //SKIP버튼
            $("div.welcome_nav a.welcome_skip").on("click", function () {
                closeWelcomeScreenLayer();
            });
            //다음버튼
            $("a.welcome_next").on("click", function () {
                var visibleDataStep = $("div.wrap_step div.step").filter(":visible").attr("data-step");
                if (visibleDataStep == "4") {
                    closeWelcomeScreenLayer();
                } else {
                    nextWelcomeScreenLayer(visibleDataStep);
                }
            });
        }

        function closeWelcomeScreenLayer() {
            $.cookie("isAdvancedWelcomeCloseClick", true, {expires: 3650, path: "/"});
            $("body #advancedGuideLayer").fadeOut().promise().done(function () {
                this.remove();
            });
        }

        function nextWelcomeScreenLayer(stepNum) {
            var stepNumplus = parseInt(stepNum) + 1;
            //반대로 해야 자연스럽다 IE11
            $('div.layer_welcome [data-step="' + stepNumplus + '"]').fadeIn();
            $('div.layer_welcome [data-step="' + stepNum + '"]').fadeOut().promise().done(function () {
                $('ul.welcome_list li').removeClass('on').eq(stepNumplus - 1).addClass("on");
            });
        }

        function makeTempleteAdvancedGuide(lang) {
            //TODO. 다국어 작업해야함.
            var htmls = [];
            var guide = [
                {
                    'step': '1',
                    'class': '_intro',
                    'info': false,
                    'lang_tit': lang['새로운 다우오피스를 만나보세요!'],
                    'lang_btn': lang['3가지 기능 둘러보기']
                },
                {
                    'step': '2',
                    'class': '1',
                    'info': true,
                    'lang_tit': lang['새로운 기능 (메뉴 열기/닫기)'],
                    'lang_info': lang['새로운 기능 설명'],
                    'lang_btn': lang['다음']
                },
                {
                    'step': '3',
                    'class': '2',
                    'info': true,
                    'lang_tit': lang['조직도 UX 변경'],
                    'lang_info': lang['조직도 UX 변경 설명'],
                    'lang_btn': lang['다음'],
                },
                {
                    'step': '4',
                    'class': '3',
                    'info': true,
                    'lang_tit': lang['개인 메뉴 그룹핑'],
                    'lang_info': lang['개인 메뉴 그룹핑 설명'],
                    'lang_btn': lang['새로운 포탈 시작']
                }
            ];
            var templates =
                '<div class="layer_welcome" id="advancedGuideLayer">' +
                '   <div class="wrap_step">' +
                '       {{#guide}}' +
                '       <div class="step step{{class}}" data-step="{{step}}">' +
                '           <div class="ment">' +
                '               <div class="tit">{{lang_tit}}</div>' +
                '               {{#info}}' +
                '               <div class="info">{{{lang_info}}}</div>' +
                '               {{/info}}' +
                '               <div class="btn_major">{{lang_btn}}</div>' +
                '           </div>' +
                '       </div>' +
                '       {{/guide}}' +
                '       <div class="welcome_nav">' +
                '           <a class="welcome_skip">SKIP</a>' +
                '           <ul class="welcome_list">' +
                '               <li class="on"></li><li></li><li></li><li></li>' +
                '           </ul>' +
                '           <a class="welcome_next">' +
                '               <span>{{next}}</span><span class="ic"></span>' +
                '           </a>' +
                '       </div>' +
                '   </div>' +
                '</div>';
            htmls.push(templates);
            var data = {
                guide: guide,
                next: lang["다음"]
            };
            return Hogan.compile(htmls.join('\n')).render(data);
        }

        function todayBadgeCount() {
            $.ajax('/api/today/badge').done(function (resp) {
                var boardCount = resp.data.summaries.boardCount || 0;
                var communityCount = resp.data.summaries.communityCount || 0;
                var approvalCount = resp.data.summaries.approvalCount || 0;
                var surveyCount = resp.data.summaries.surveyCount || 0;

                var $board = $('[data-menu="board"]');
                var $community = $('[data-menu="community"]');
                var $survey = $('[data-menu="survey"]');
                var $approval = $('[data-menu="approval"]');
                $board.find('span.badge').remove();
                $community.find('span.badge').remove();
                $survey.find('span.badge').remove();
                $approval.find('span.badge').remove();

                if (boardCount > 0) $board.prepend('<span class="badge">N</span>');
                if (communityCount > 0) $community.prepend('<span class="badge">N</span>');
                if (surveyCount > 0) {
                    $survey.prepend(
                        '<span class="badge">' + (surveyCount > 9999 ? '+9,999' : surveyCount) + '</span>'
                    );
                }
                if (approvalCount > 0) {
                    $approval.prepend(
                        '<span class="badge">' + (approvalCount > 9999 ? '+9,999' : approvalCount) + '</span>'
                    );
                }
            }).fail(function () {
            });
        }

        function todayMailCount() {
            var param = {};
            param.flag = 'U';
            param.folder = 'Inbox';

            $.ajax('/api/mail/message/count', {
                method: 'POST',
                data: param
            }).done(function (resp) {
                var unreadCount = resp.data;
                var dormant = hasGORouter() ? (GO.session().mailAccountStatus === 'dormant') : isDormant;
                var strDormant = LANG['휴면'];
                var $mail = $('[data-menu="mail"]');

                $mail.find('span.badge').remove();
                if (dormant) {
                    $mail.prepend('<span class="badge">' + strDormant + '</span>');
                } else {
                    if (unreadCount > 0) {
                        $mail.prepend(
                            '<span class="badge">' + (unreadCount > 9999 ? '+9,999' : unreadCount) + '</span>'
                        );
                    }
                }
            }).fail(function () {
            });
        }

        function disableTextSelection(el) {
            $(el).attr('unselectable', 'on')
                .css('MozUserSelect', 'none')
                .bind('selectstart.ui', function () {
                    return false;
                });
        }

        function makeTemplate(menu, lang, menus) {
            var htmls = [];
            menus = _.reject(menus, function (menuItem) {
                menuItem.isActive = menu && menu.id === menuItem.id;
                return menuItem.subMenuType;
            });
            var menuTemplates =
                '<ul data-menu-list style="overflow-x: hidden">' +
                '{{#menus}}' +
                '   <li data-menu="{{appName}}" data-url="{{url}}" data-location="{{location}}" class="{{#isActive}}on{{/isActive}}">' +
                '       <a href="{{url}}" data-bypass>' +
                '           <span class="wrap_ic_gnb_adv">' +
                '               <span class="ic_gnb_adv ic_home_{{appName}}"></span>' +
                '           </span>' +
                '           <span class="menu" title="{{name}}">{{name}}</span>' +
                '       </a>' +
                '   </li>' +
                '{{/menus}}' +
                '</ul>';
            htmls.push(menuTemplates);

            var data = {
                'labelWorkspaceExpansion': lang['워크스페이스 확장'],
                'labelMenu': lang['메뉴'],
                'workspaceExpansionButtonVisible': GO.config ? GO.config('workspace_expansion_button_visible') : true,
                'menuTitleVisible': menu && _.isString(menu['name']) && menu['name'].length > 0,
                'menuName': (menu) ? menu['name'] : '',
                'menuLink': (menu) ? menu['url'] : '',
                'isMenu': false,
                menus: menus
            };

            return Hogan.compile(htmls.join('\n')).render(data);
        }

        function bindEvents() {

            if (hasGORouter()) {
                // 메일, 자료실은 페이지 이동이 발생(not SPA)하므로 onRouterChanged 처리 불필요.
                GO.router.off("change:package", onRouterChanged);
                GO.router.on("change:package", onRouterChanged, this);
                GO.router.off("change:page", onRouterChanged);
                GO.router.on("change:page", onRouterChanged, this);
            }
        }

        function onRouterChanged() {
            // this.render();
        }

        return {
            create: function ($container, options) {
                var instance = new Klass($container, options);
                instance.render();
                return instance;
            }
        };
    })(MenuHelper);


    MenuView = (function (Util, MenuHelper) {

        function Klass(options) {
            this.$el = $('<ul id="main-menu"></ul>');
            this.options = options || {};

            this.collection = this.options.baseConfig.menuConfigModel;
            this.activeMenu = this.options.activeMenu;

            this.width = 0;
            this.activeMenuId = 0;

            this.__submenuCache__ = {};
        }

        Klass.prototype = {
            setWidth: function (width) {
                this.width = width;
            },

            render: function () {
                var itemsWidth = 0;

                for (var i = 0, len = this.collection.length; i < len; i++) {
                    var model = this.collection[i];
                    var menuGroupId = getMenuGroupId(model);
                    var $item;

                    if (model.depth > 0) continue;

                    $item = makeMenuItemElement(model);
                    $item.attr('data-groupid', menuGroupId);

                    // 우선 렌더링. 그래야 사이즈 정보를 가져올 수 있다.
                    this.$el.append($item);
                    itemsWidth += $item.outerWidth();

                    if (menuBarAllowWidthPolicy(this, itemsWidth)) {
                        $item.attr('data-more', 'Y');
                    }
                }

                if (this.$el.find('li[data-more]').length > 0) {
                    this.$el.append(makeMoreMenuTemplate());

                    // more 메뉴로 잡힌 것은 특별한 메뉴로 잡는다.(대신 리사이즈시마다 갱신시켜줘야 함)
                    this.__submenuCache__['__more__'] = [];
                    $.each(this.$el.find('li[data-more]'), $.proxy(function (i, li) {
                        var $moreLi = $(li);
                        var model = $moreLi.data('model');

                        this.__submenuCache__['__more__'].push(model);
                    }, this));
                }

                this.$el.find('li[data-more]').remove();
                this.activateMenu();

                setWorkspaceExpansion(this);

                delegateEvents(this);
            },

            setActiveMenu: function (newMenuName) {
                this.activeMenu = newMenuName;
            },

            activateMenu: function (appName) {
                appName = appName || this.activeMenu;
                var menuModel = MenuHelper.getMenuByAppName(this, appName);
                this.activeMenuId = menuModel ? getMenuGroupId(menuModel) : 0;
                activateMenu(this);
            },

            resize: function (context, $container) {
                var bodyWidth = $('body').width();
                // 로고가 left: 10px 떨어져 있음... 따라서, 양옆 10px 마진있는것과 동일함, max-width: 180px  => 180 + 20 으로 픽스
                var logoWidth = 200;
                var infoWidth = context.$el.find('.my_info').outerWidth();
                var newWidth = bodyWidth - logoWidth - infoWidth;

                $container.width(newWidth);

                this.setWidth(newWidth);
                this.$el.empty();
                this.render();
            }
        };

        function setWorkspaceExpansion(contenxt) {

            var workspaceExpansionButtonVisible = GO.config ? GO.config('workspace_expansion_button_visible') : true;
            if (!workspaceExpansionButtonVisible || $('#workspace_expansion').length > 0) {
                $('#workspace_expansion').remove();
                return;
            }
            $('#menu-container').prepend(workspaceExpansionTemplete(contenxt));

        }

        function workspaceExpansionTemplete(contenxt) {
            var tmpls = [];
            tmpls.push('<span id="workspace_expansion" class="ctrl_workspace">');
            tmpls.push('    <span class="ic_gnb_advanced wide" title="' + contenxt.options.lang['워크스페이스 확장'] + '"></span>');
            tmpls.push('</span>');
            return tmpls.join('');
        }

        function activateMenu(context) {
            context.$el.find('li[data-active]').removeClass('on').removeAttr('data-active');

            if (context.activeMenuId) {
                context.$el.find('li[data-groupid=' + context.activeMenuId + ']').addClass('on').attr('data-active', 'Y');
            }
        }

        function menuBarAllowWidthPolicy(context, curWidth) {
            var MORE_BTN_WIDTH = 35; // selector 를 사용하면 좋겠지만 구조를 바꿔야한다. 렌더링 시점에 엘리먼드가 없다.
            var WORKSPACE_EXPANSION_BTN_WIDTH = 84; //myinfo 부분이 absolute로 떠있기때문에 적당한 공간을 할당함.
            return (curWidth - context.width + MORE_BTN_WIDTH + WORKSPACE_EXPANSION_BTN_WIDTH > 0);
        }

        function makeMoreMenuTemplate() {
            var html = [];
            html.push('<li class="more">');
            html.push('<a href="#" class="btn-more-menus" data-bypass>');
            html.push('<span class="more" title="more"></span>');
            html.push('</a>');
            html.push('</li>');

            return html.join('');
        }

        function delegateEvents(context) {
            //모바일 기기에서 PC버전으로 보기시 mouseenter 이벤트를 줄수 없어서.
            var event = "mouseenter";
            if (Util.isMobile()) event = "click";

            delegateEvent(context, 'click', 'a:not(li.more > div > ul > li > a[href=#])', triggerClickMenu);
            delegateEvent(context, event, 'li.more > div > ul > li > a', triggerMouseoverMoreSubmenu);
        }

        function triggerClickMenu(e) {
            var $el = $(e.currentTarget);
            var $li = $el.closest('li');
            var model = $li.data('model');

            e.preventDefault();
            resetSubmenu(e);

            if ($el.hasClass('btn-more-menus')) {
                showMoreMenu(this, $el);
            } else if (model.subMenuType === true) {
                showMenuForVisible(this, $el, model.id);
            } else {
                clearAllSubMenu();
                MenuHelper.moveMenuAction(this, model);
            }

            e.stopImmediatePropagation();
            return false;
        }

        function clearAllSubMenu() {
            //모든 하위메뉴 레이어를 없앤다.
            $("div.nav-submenu").remove();
        }

        function getMenuGroupId(model) {
            return (model.depth === 0 ? model.id : model.parentId);
        }

        function triggerMouseoverMoreSubmenu(e) {
            var $el = $(e.currentTarget);
            var $li = $el.closest('li');
            var model = $li.data('model');

            //하위의 하위메뉴 그릴때 기존에 떠있던 서브메뉴는 초기화
            //GO-18187 상단메뉴의 하위 레이어 문제
            $el.closest('ul').find("div.nav-submenu").remove();

            if (model.subMenuType === true) renderSubmenu(this, $el, model.id);

            e.stopImmediatePropagation();
            return false;
        }

        function showMenuForVisible(context, $caller, modelId) {
            //서브메뉴 있는 메뉴 누를때만 동작( 브라우저 줄였을때 히든처리되는 메뉴에 대해서는 동작하지않아야함)
            if (!$caller.closest("div.nav-submenu").length) {
                renderSubmenu(context, $caller, modelId);
                $caller.closest('li').addClass('on');
            }
        }

        function showMoreMenu(context, $caller) {
            renderSubmenu(context, $caller, '__more__');
            $caller.closest('li').addClass('on_layer');
            $caller.closest('li').find('div.nav-submenu li span.ic_more').remove(); //서브메뉴에서는 더보기 아이콘 노출안되어야함.
        }

        function renderSubmenu(context, $caller, modelId) {
            var submenus = getSubmenusById(context, modelId);
            var $submenu = makeSubmenu(submenus);
            //하위의 하위메뉴 그릴때 기존에 떠있던 서브메뉴는 초기화
            $caller.closest('ul').find("div.nav-submenu").remove();
            $caller.after($submenu);
            if (submenus && submenus.length >= 4) {
                GO.util.ocxUploadVisible(false);
            }
        }

        function getSubmenusById(context, menuId) {
            var submenus = [];

            if (context.__submenuCache__[menuId]) {
                submenus = context.__submenuCache__[menuId];
            } else {
                submenus = $.grep(context.collection, function (menu) {
                    return menu.hasOwnProperty('parentId') && menu.parentId === menuId;
                });

                $.each(context.collection, function (menu) {
                    if (menu.depth === 0) return;
                    if (!menu.hasOwnProperty('parentId')) return;

                    if (menu.parentId === menuId) {
                        submenus.push(menu);
                    }
                });
                context.__submenuCache__[menuId] = submenus;
            }

            return submenus;
        }

        return {
            create: function ($container, options) {
                var instance = new Klass(options);
                $container.append(instance.$el);

                return instance;
            }
        };
    })(Util, MenuHelper);

    GONavigation = (function (MenuView, AdvancedMenuView, Util) {

        function Klass(phId, options) {
            this.tagName = 'div';
            this.className = 'gnb';
            this.$placeholder = $('#' + phId);
            this.$el = $('<' + this.tagName + ' />');
            this.options = {};
            this.contextRoot = '/';
            this.useMiniGnb = GO.useMiniGnb === "true";
            this.useLabFeedback = GO.useLabFeedback;

            initOptions(this, options);
            initElement(this);
            initMenuConfig(this);
            attachTemplate(this);

            if (this.useMiniGnb) {
                renderMiniGnbTemplate(this);
            } else {
                renderDoCareLounge(this);
            }

            if (this.useLabFeedback) {
                initLabData();
            }

            delegateEvents(this);

            var menuView = options.session.theme === 'THEME_ADVANCED' ? AdvancedMenuView : MenuView;
            this.menuView = menuView.create($('#menu-container'), this.options);
        }

        Klass.prototype = {
            render: function () {
                renderMenu.call(this, $('#menu-container'));
            },

            reload: function () {
                bindResizeForMenuContainer(this, $('#menu-container'));
            },

            setActiveMenu: function (name) {
                this.menuView.setActiveMenu(name);
            },

            activateMenu: function (name) {
                this.menuView.setActiveMenu(name);
                this.menuView.activateMenu();
            },

            renderLabPopUp: function () {
                renderLabIcon.call();
            }
        };

        Klass.create = function (placeHolderId, options) {
            var nav = new Klass(placeHolderId, options || {});
            nav.render();
            return nav;
        };

        function initMenuConfig(context) {
            var contextRoot = context.contextRoot,
                rootUrl = Util.fixedUrl(contextRoot + '/app');

            $.map(context.menus, function (menu) {
                // 메일 휴면 처리...
                if (menu.appName === 'mail') {
                    $.ajax({
                        url: "/api/mail/accountstatus",
                        dataType: "json",
                        async: false,
                        statusCode: {
                            "401": function () {/*무시한다.*/
                            }
                        }
                    }).done(function (result) {
                        var accountStatus = result.data || 'enabled';

                        if (accountStatus === 'dormant') {
                            menu.badge = {"classname": 'sleep_mode', "text": context.lang['휴면']};
                        }
                    });
                }

                if (menu.systemMenu === true) {
                    menu.url = rootUrl + '/' + menu.appName;
                } else if (menu.location === 'iframe') {
                    var prefix = Util.fixedUrl(contextRoot + '/app/');
                    // history API를 지원하지 않는 브라우저에서 window.location.href로 이동하면 ? 이후의 문자열이 search 쿼리 영역으로 전환된다.
                    // 따라서, 해시코드를 직접 생성해서 전달해주어야 한다.
                    if (hasGORouter() && !Util.isSupportHistoryAPI()) prefix += '#';

                    menu.url = prefix + 'sitelink?url=' + encodeURIComponent(menu.url);
                }
            });
            window.GoInitMenu = function () {
                Util.navigate(GO.util.getInitMenu().appName, null, "/");
            };
        }

        function initOptions(context, options) {
            $.extend(true, context.options, {
                "session": {},
                "companies": [],
                "baseConfig": {
                    "contextRoot": '/',
                    "locale": 'ko',
                    "displayConfigModel": {
                        "thumbSmall": '/'
                    },
                    "menuConfigModel": [],
                    "trustCertification": false
                },
                "lang": LANG,
                "onMovePage": function () {
                    var deferred = $.Deferred();
                    deferred.resolve(true);
                    return deferred;
                }
            }, options || {});

            context.session = context.options.session;
            context.companies = context.options.companies;
            context.contextRoot = context.options.baseConfig.contextRoot || '/';
            context.locale = Util.fixLocaleCode(context.session.locale || 'ko');
            context.menus = context.options.baseConfig.menuConfigModel || [];
            context.trustCertification = context.options.baseConfig.trustCertification || false;
            context.onMovePage = context.options.onMovePage;
            context.lang = context.options.lang;

            context.logoUrl = context.options.baseConfig.displayConfigModel.classicCiLogo || '';
            if (context.session.theme === 'THEME_ADVANCED') {
                context.logoUrl = context.options.baseConfig.displayConfigModel.advancedCiLogo || '';
            }

            if (!context.options.activeMenu) context.options.activeMenu = getDefaultAppName(context.menus);
        }

        function initElement(context) {
            context.$placeholder.replaceWith(context.$el);
            context.$el.addClass(context.className);
        }

        function renderMenu($container) {
            resizeMenuContainer(this, $container);
            bindResizeForMenuContainer(this, $container);
        }

        function resizeMenuContainer(context, $container) {
            context.menuView.resize(context, $container);
        }

        function bindResizeForMenuContainer(context, $container) {
            var resizer = new WindowResizer();
            $(window).off('.nav').on('resize.nav', function (e) {
                resizer.bind(e, function () {
                    resizeMenuContainer(context, $container);
                });
            });
        }

        function attachTemplate(context) {
            var contextRoot = context.contextRoot;
            context.$el.empty().append(makeTemplate({
                label: {
                    multiCompanyOpen: context.lang['멀티컴퍼니 열기'],
                    multiCompanyClose: context.lang['멀티컴퍼니 닫기'],
                    notiAppTitle: context.lang['알림'],
                    management: context.lang['관리'],
                    logout: context.lang['로그아웃'],
                    org: context.lang['조직도'],
                    setting: context.lang['설정'],
                    lab_label: context.lang['실험실'],
                    detail: context.lang['자세히 보기']
                },
                useMiniGnb: context.useMiniGnb,
                logoUrl: context.logoUrl,
                logoutUrl: Util.fixedUrl(contextRoot + '/logout'),
                initMenuUrl: GO.util.getInitMenu(context.menus).url,
                userThumbnailUrl: context.session.thumbnail || '',
                userName: [context.session.name || '', context.lang['님']].join(' '),
                advancedTheme: context.session.theme === 'THEME_ADVANCED',
                isMultiCompany: context.companies.length > 1,
                companies: _.map(context.companies, function (company) {
                    return {
                        id: company['id'],
                        siteUrl: company['siteUrl'],
                        name: company['companyName'],
                        dday: company['restrictCompanyPeriodEnd'] != null
                            ? GO.util.getDdayDiff(company['restrictCompanyPeriodEnd']) : '1',
                        selected: (hasGORouter() ? GO.session().companyId : session.companyId) === company['id']
                    }
                }),
                miniLogo: GO.config('mobileThumb'),
                useLabFeedback: context.useLabFeedback
            }));
        }

        function initLabData() {
            $.ajax({
                url: '/api/laboratory/feedback/config/to-show',
                type: 'GET',
                async: false,
                contentType: 'application/json'
            }).done(function (resp) {
                var data = resp.data;
                if (_.isUndefined(data.id) || _.isUndefined(data.useConfig) || !data.useConfig) {
                    GO.util.removeItem("lab-feedback-config"); // data clear;
                    GO.util.removeItem("lab-user-feedback-done-" + GO.session('id'));
                    GO.util.removeItem("lab-is-click-popup-btns-" + GO.session('id'));
                    return;
                }
                $('[data-lab-icon]').attr('data-config-id', data.id);
                GO.util.setLocalStorage("lab-feedback-config", data);

                renderLabIcon();
            }).fail(function () {
                console.info("laboratory data get error");
            });
        }

        function renderLabIcon() {
            var data = GO.util.getLocalStorage("lab-feedback-config");
            if (_.isNull(data) || _.isUndefined(data) || _.isUndefined(data.startDate) || !GO.util.isAfterOrSameDate(GO.util.toMoment(data.startDate), GO.util.now())) {
                $('[data-lab-data-wrapper]').hide();
                return true;
            }

            $('[data-lab-data-wrapper]').show();

            renderLabPopUp(data);

            // 스토리지 확인 후 팝업 노출 여부 판단
            if (!isClickLabPopupBtns(data.id)) {
                $('[data-lab-new-icon]').hide();
                $('[data-lab-popup-wrapper]').hide();
            } else {
                $('[data-lab-new-icon]').show();
                $('[data-lab-popup-wrapper]').show();
            }

            // 실험실 icon 노출
            $("body").addClass('lab');
        }

        function isClickLabPopupBtns(configId) {
            var data = GO.util.getLocalStorage("lab-is-click-popup-btns-" + GO.session().id);
            if (_.isNull(data)) {
                return true;
            }

            if (_.isUndefined(data.configId) || _.isUndefined(data.isShow) || data.configId != configId) {
                GO.util.removeItem("lab-is-click-popup-btns-" + GO.session().id);
                return true;
            }

            return data.isShow;
        }

        function renderLabPopUp(labConfig) {
            if (_.isEmpty(labConfig) || $('[data-lab-popup-wrapper]').length > 0) {
                return;
            }

            var html = '<div class="layer_normal layer_feedback" data-lab-popup-wrapper style="display: none">'
                + '<div class="layer_feedback_content">'
                + '<img data-id="lab_popup_img" src="' + labConfig.simpleImg.thumbOriginal + '" style="width:100%" alt="">'
                + '<p class="tit">' + labConfig.simpleTitle + '</p>'
                + '<p class="desc">' + labConfig.simpleDesc + '</p>'
                + '<a class="btn_minor" data-lab-close-btn data-config-id="' + labConfig.id + '" ><span class="txt">' + "닫기" + '</span></a> '
                + '<a class="btn_major" data-lab-detail-btn data-config-id="' + labConfig.id + '" ><span class="txt">' + "자세히 보기" + '</span></a> '
                + '</div>'
                + '</div>';
            $('[data-lab-data-wrapper]').append(html);
        }

        function onClickLabClose(e) {
            e.preventDefault();
            setStorageForLabClickPopupBtns($(e.currentTarget));
            $('[data-lab-new-icon]').hide();
            $('[data-lab-popup-wrapper]').hide();
        }

        function onClickLabIcon(e) {
            e.preventDefault();

            setStorageForLabClickPopupBtns($(e.currentTarget));

            var data = GO.util.getLocalStorage("lab-feedback-config") || {};
            renderLabPopUp(data);

            $('[data-lab-new-icon]').hide();
            $('[data-lab-popup-wrapper]').show();
        }

        function onClickLabDetail(e) {
            e.preventDefault();

            setStorageForLabClickPopupBtns($(e.currentTarget));
            return movePageAction(this, "lab/detail");
        }

        function setStorageForLabClickPopupBtns($target) {
            var dataId = $target.attr('data-config-id');
            GO.util.setLocalStorage("lab-is-click-popup-btns-" + GO.session().id, {
                isShow: false,
                configId: dataId
            });
        }

        function getDefaultAppName(menus) {
            return getInitialMenu(menus) || getDefaultMenu(menus);
        }

        function getInitialMenu(menus) {
            return $.grep(menus, function (menu) {
                return menu.initial;
            })[0];
        }

        function getDefaultMenu(menus) {
            return $.grep(menus, function (menu) {
                return !!menu.url;
            })[0];
        }

        function renderDoCareLounge() {
            var tmpls = [];
            tmpls.push('<div class="wrap_docare">');
            tmpls.push('<a href="" class="btn_docare">');
            tmpls.push('<span class="ic_gnb ic_docare"></span>');
            tmpls.push('<span class="txt">고객케어 라운지</span>');
            tmpls.push('<span class="gnb_bar"></span>');
            tmpls.push('</a>');
            tmpls.push('<div id="layer_docare_alarm" class="layer_docare_alarm" style="display:none">');
            tmpls.push('<i></i>');
            tmpls.push('<a data-bypass>');
            tmpls.push('<span class="ic_gnb ic_customer"></span>');
            tmpls.push('<div class="wrap_txt">');
            tmpls.push('<span class="tit">' + LANG["다우오피스 사용에 관한 모든 것!"] + '</span>');
            tmpls.push('<p class="txt"> ' + LANG["언제 어디서나 클릭해보세요."] + '</p>');
            tmpls.push('</div>');
            tmpls.push('<span class="ic_dashboard2 ic_d_delete"></span>');
            tmpls.push('</a>');
            tmpls.push('</div>');
            tmpls.push('</div>');

            $("#myInfo").prepend(tmpls.join(""));
        }

        function renderMiniGnbTemplate(self) {
            var serviceUrl = window.location.origin;
            if (serviceUrl == undefined) {
                serviceUrl = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port : '');

            }
            var data = {
                serviceUrl: serviceUrl,
                locale: GO.session().locale
            };

            if (typeof (renderMiniGnb) == "function") {
                renderMiniGnb("myInfo", data);
            }
            $("body").addClass('channel');
        }

        function delegateEvents(context) {
            delegateEvent(context, 'click', 'a[data-href]', triggerMovePage);
            delegateEvent(context, 'click', '.btn-config', toggleSettingMenu);
            delegateEvent(context, 'click', '.btn_setting', toggleSettingMenu);
            delegateEvent(context, 'mouseleave', '.nav-submenu', hideSettingsMenu);
            delegateEvent(context, 'click', '.btn-noti', triggerMoveNotiPage);
            delegateEvent(context, 'mouseenter', '.wrap_docare', onDOCareLoungeMouseover);
            delegateEvent(context, 'mouseenter', '#layer_docare_alarm', onDOCareLoungeDescMouseover);
            delegateEvent(context, 'mouseleave', '#layer_docare_alarm', onDOCareLoungeDescMouseout);
            delegateEvent(context, 'mouseleave', '.wrap_docare, #layer_docare_alarm', onDOCareLoungeMouseout);
            delegateEvent(context, 'click', '.btn_docare', openDOCareLounge);
            delegateEvent(context, 'click', '#layer_docare_alarm', openDOCareLounge);
            delegateEvent(context, 'click', '#layer_docare_alarm span.ic_d_delete', closeDOLoungeDesc);
            delegateEvent(context, 'click', '.anchor-profile', triggerMoveProfilePage);
            delegateEvent(context, 'click', '.anchor-config', triggerMoveConfigPage);
            delegateEvent(context, 'click', '.anchor-noti', triggerMoveMyNotiPage);
            delegateEvent(context, 'click', '.anchor-logout', triggerLogout);
            delegateEvent(context, 'click', '.anchor-device', triggerMoveDevicePage);
            delegateEvent(context, 'click', '.anchor-sitepage', triggerMoveSitePage);
            delegateEvent(context, 'click', '.anchor-payment', triggerMovePaymentPage);
            delegateEvent(context, 'click', '.multi_company_button', triggerChangeCompany);
            delegateEvent(context, 'click', '#open_multi_companies', triggerOpenCompanyList);
            delegateEvent(context, 'click', '#close_multi_companies', triggerCloseCompanyList);
            delegateEvent(context, 'click', '[data-menu]', onClickMenu);
            delegateEvent(context, 'click', '[data-org]', onClickOrg);
            delegateEvent(context, 'click', '[data-expend]', onClickExpend);
            delegateEvent(context, 'click', '#workspace_expansion', onClickWorkspaceExpansion);
            delegateEvent(context, 'click', '[data-lab-icon]', onClickLabIcon);
            delegateEvent(context, 'click', '[data-lab-close-btn]', onClickLabClose);
            delegateEvent(context, 'click', '[data-lab-detail-btn]', onClickLabDetail);
        }

        function onClickWorkspaceExpansion() {
            var currentAppName = GO.router.getPackageName();
            if (_.contains(["mail", "webfolder"], currentAppName)) {
                if (getExpansionButton().hasClass('normal')) {
                    document.getElementById(currentAppName + "-viewer").contentWindow.setNormalMode();
                } else {
                    document.getElementById(currentAppName + "-viewer").contentWindow.setWideMode();
                }
            }

            toggleWorkspaceExpansion(this.options);
            if (this.activeMenu === "mail") checkMailSplitter();
            if (GO.EventEmitter) {
                GO.EventEmitter.on('default', 'side:hide', $.proxy(function () {
                    setExpansionButtonAsWide(this.options);
                }, this));
                GO.EventEmitter.on('default', 'side:show', $.proxy(function () {
                    setExpansionButtonAsNormal(this.options);
                }, this));
            }
        }

        function checkMailSplitter() {
            var $ybar = $("#ybar");
            if ($ybar && $ybar.css("display") !== "none") $ybar.trigger("dragstop");
        }

        function toggleWorkspaceExpansion(options) {
            if (getExpansionButton().hasClass('normal')) {
                setExpansionButtonAsNormal(options);
                if (options.onWorkspaceNormal) options.onWorkspaceNormal();
            } else {
                setExpansionButtonAsWide(options);
                if (options.onWorkspaceWide) options.onWorkspaceWide();
            }
        }

        function setExpansionButtonAsNormal(options) {
            getExpansionButton().removeClass('normal').addClass('wide').attr('title', options.lang['워크스페이스 확장']);
        }

        function setExpansionButtonAsWide(options) {
            getExpansionButton().removeClass('wide').addClass('normal').attr('title', options.lang['워크스페이스 기본']);
        }

        function getExpansionButton() {
            return $('#workspace_expansion > .ic_gnb_advanced');
        }

        function onClickMenu(e) {
            e.preventDefault();
            var $target = $(e.currentTarget);
            $target.siblings('.on').removeClass('on');
            $target.addClass('on');
            MenuHelper.moveMenuAction(this, {
                url: $target.attr('data-url'),
                location: $target.attr('data-location')
            });
        }

        function onClickOrg(e) {
            e.stopPropagation();
            $.goOrg.toggleDisplayAndExtend();
        }

        function onClickExpend() {
            $('body').toggleClass('mini');
            var isMini = MenuHelper.isMiniMenu();
            MenuHelper.setMiniMenu(!isMini);
            this.menuView.resize(null, $('#menu-container'))
        }

        function triggerMoveProfilePage(e) {
            e.preventDefault();
            return movePageAction(this, 'my/profile');
        }

        function triggerMoveConfigPage(e) {
            e.preventDefault();
            return movePageAction(this, 'my/config');
        }

        function triggerMoveMyNotiPage(e) {
            e.preventDefault();
            return movePageAction(this, 'my/noti');
        }

        function triggerLogout(e) {
            e.preventDefault();
            location.href = '/logout';
        }

        function triggerMoveDevicePage(e) {
            e.preventDefault();
            return movePageAction(this, 'my/device');
        }

        function triggerMoveSitePage(e) {
            e.preventDefault();
            var token = getCookie('GOSSOcookie');
            var companyId = this.session.companyId; //GO-23222 GO.session()이 mail메뉴에서는 동작안함.
            this.contextRoot = this.options.baseConfig.contextRoot || '/';
            $.ajax(this.contextRoot + "api/system/connection/info").done(function (response) {
                var connectInfo = response.data;
                var protocol = connectInfo.protocol;
                var port = connectInfo.port;

                window.open(protocol + '://' + window.location.hostname + ':' + port + '/go/autologin?token=' + token + '&companyId=' + companyId, +
                    'sitepage', 'location=no,directories=no,resizable=yes,' +
                    'status=yes,toolbar=yes,menubar=yes,width=1280,height=768,scrollbars=yes');
            }).fail(function (response) {

            });
        }

        function triggerMovePaymentPage() {
            $("#paymentForm").remove();
            $.ajax({
                url: GO.contextRoot + "api/payment/meta",
                success: function (response) {
                    var data = response.data;
                    var $form = $(
                        "<form action='" + data.url + "/user/sso' target='payment' method='post' id='paymentForm'>" +
                        "   <input type='hidden' name='token' value='" + data.token + "'>" +
                        "</form>"
                    );
                    $("#main").append($form);
                    window.open("about:blank", "payment", "");
                    $form.submit();
                }
            });
        }

        function triggerChangeCompany(e) {
            var $el = $(e.currentTarget);
            var token = getCookie('GOSSOcookie');
            var siteUrl = $el.attr('data-siteurl');
            var siteId = $el.attr('data-id');
            var siteDday = $el.attr('data-dday');
            var message = LANG['서비스 사용기간이 만료되었습니다.'];
            var redirectUrl = document.location.protocol + '//' + siteUrl + ':' + document.location.port + '/tokenlogin?';

            if (siteDday < 0) {
                $.goAlert(message);
                return;
            }

            $(e.currentTarget).closest("ul").find("li").removeClass("on");
            $(e.currentTarget).closest("li").addClass("on");

            document.location.href = redirectUrl + $.param({
                companyId: siteId,
                token: token
            });
        }

        function getCookie(name) {
            var value = "; " + document.cookie;
            var parts = value.split("; " + name + "=");
            return (parts.length === 2) ? parts.pop().split(";").shift() : "";
        }

        function triggerOpenCompanyList(e) {
            e.preventDefault();
            $('#close_multi_companies').show();
            $('#open_multi_companies').hide();
        }

        function triggerCloseCompanyList(e) {
            e.preventDefault();
            $('#close_multi_companies').hide();
            $('#open_multi_companies').show();
        }

        function triggerMoveNotiPage(e) {
            // href="#" 이 있는 a태그에 이벤트를 바인딩 한 경우. a태그의 기본 이벤트(href)를 막아줘야 한다.
            // 이벤트를 막지 않으면 href가 동작함은 물론이고, hash 태그가 url에 추가되어 ie8 등에서 문제가 발생한다.
            e.preventDefault();
            var notiCount = +$('#noti-count-badge').text() || 0;
            var url = (notiCount <= 0) ? 'noti/all' : 'noti/unread';

            return movePageAction(this, url);
        }

        function triggerMovePage(e) {
            var $el = $(e.currentTarget);
            var url = $el.data('href');

            e.preventDefault();
            return movePageAction(this, url);
        }

        function movePageAction(context, path) {
            context.onMovePage().done(function () {
                var url = Util.fixedUrl(hasGORouter() ? path : context.contextRoot + '/app/' + path);

                Util.navigate(url, null, context.contextRoot);
                context.menuView.activateMenu(getDefaultAppName(context.menus));
            });
        }

        function onDOCareLoungeMouseover() {
            if ($.cookie("isDoCareLoungeCloseClick") || GO.session('locale') != "ko") return;

            var $helpLayer = $('#layer_docare_alarm');
            $helpLayer.show();
            $helpLayer.data("isShow", true);
        }

        function onDOCareLoungeDescMouseover() {
            $('#layer_docare_alarm').data("isShow", true);
        }

        function onDOCareLoungeDescMouseout() {
            $('#layer_docare_alarm').data("isShow", false);
        }

        function closeDOLoungeDesc() {
            $('#layer_docare_alarm').hide();
            $.cookie("isDoCareLoungeCloseClick", true, {expires: 365, path: "/"});
        }

        function onDOCareLoungeMouseout() {
            $('#layer_docare_alarm').data("isShow", false);
            setTimeout(function () {
                if ($("#layer_docare_alarm").data("isShow")) {
                    return;
                }
                $('#layer_docare_alarm').hide();
            }, 100);
        }

        // TODO : api/help/meta 데이터 수정
        function openDOCareLounge(e) {
            if ($(e.target).hasClass("ic_d_delete")) return;

            $.ajax({
                dataType: "json",
                url: GO.contextRoot + "api/docare/meta"
            }).done(_.bind(openHelpDesk, this));

            function openHelpDesk(response) {
                $("#docareForm").remove();
                var data = response.data;
                var $form = $(
                    "<form action='" + data.url + "/user/sso' target='docare' method='post' id='docareForm'>" +
                    "   <input type='hidden' name='token' value='" + data.token + "'>" +
                    "</form>"
                );
                $("#main").append($form);
                window.open("about:blank", "docare", "");
                $form.submit();
            }

            return false;
        }

        function toggleSettingMenu(e) {
            e.preventDefault();

            if (this.$el.find('#gnbTopSetting').length < 1) {
                this.$el.find('[data-setting]').after(buildSettingsMenu(this));

                showSettingsMenu.call(this, e);
            } else {
                if (this.$el.find('#gnbTopSetting').is(":visible")) {
                    hideSettingsMenu.call(this, e);
                } else {
                    showSettingsMenu.call(this, e);
                }
            }

            e.stopImmediatePropagation();

            function buildSettingsMenu(context) {
                var mobileConfig = context.options.baseConfig.mobileConfig;
                var session = context.session;
                var menuList = [];
                var elem;

                if (context.useMiniGnb) {
                    menuList.push({"url": '#', "name": context.lang["환경설정"], "classname": 'anchor-config'});
                    menuList.push({"url": '#', "name": context.lang["알림 설정"], "classname": 'anchor-noti'});
                } else {
                    menuList.push({"url": '#', "name": context.lang["기본정보"], "classname": 'anchor-profile'});
                    menuList.push({"url": '#', "name": context.lang["환경설정"], "classname": 'anchor-config'});
                    menuList.push({"url": '#', "name": context.lang["알림 설정"], "classname": 'anchor-noti'});
                }

                if (mobileConfig.useAppManagement || mobileConfig.otpEnabled) {
                    menuList.push({"url": '#', "name": context.lang["보안설정"], "classname": 'anchor-device'});
                }

                if (session.siteAdmin === true || session.siteAdmin === "true") {
                    menuList.push({"url": '#', "name": context.lang["관리자 페이지"], "classname": 'anchor-sitepage'});
                }

                if (!context.useMiniGnb) {
                    if ((session.siteAdmin === true || session.siteAdmin === "true")
                        && session.brandName === "DO_SAAS" && isNotReSeller()) {
                        menuList.push({"url": '#', "name": context.lang["서비스 추가 / 연장"], "classname": 'anchor-payment'});
                    }
                    menuList.push({
                        url: Util.fixedUrl(context.contextRoot + '/logout'),
                        name: context.lang['로그아웃'],
                        classname: 'anchor-logout'
                    });
                }

                elem = makeSubmenu(menuList);
                elem.attr('id', 'gnbTopSetting');
                elem.find('li:last').addClass('last');

                return elem;
            }

            return false;

            function isNotReSeller() {
                var isReSeller = false;

                $.ajax({
                    url: GO.contextRoot + "api/payment/partner",
                    async: false,
                    success: function (response) {
                        isReSeller = response.data.partnerType !== "RESELLER";
                    }
                });

                return isReSeller;
            }
        }

        function showSettingsMenu() {
            this.$el.find('#gnbTopSetting').addClass('on');

            $("body").trigger("nav:showSetting");
        }

        function hideSettingsMenu(e) {
            this.$el.find('#gnbTopSetting').removeClass('on');
            resetSubmenu(e);
            GO.util.ocxUploadVisible(true);
        }

        function makeTemplate(data) {
            var html = [];
            html.push(
                '<span class="wrap_btn_list">' +
                '   <a class="btn_list" data-expend>' +
                '       <span class="wrap_ic_gnb_adv">' +
                '           <span class="ic_gnb_adv menu"></span>' +
                '       </span>' +
                '   </a>' +
                '</span>'
            );
            html.push('<header class="go_header go_header_2row go_header_advanced">');
            html.push('<h1 class="logo" id="advanced_logo">');
            html.push('    <a href="{{initMenuUrl}}" data-bypass>');
            html.push('        <img class="logo" src="{{logoUrl}}" />');
            html.push('    </a>');
            html.push('    {{#isMultiCompany}}');
            html.push('    <div class="wrap_multiCompany" id="open_multi_companies">');
            html.push('        <a href="#" class="btn_multiCompany" title="{{label.multiCompanyOpen}}" data-bypass>');
            html.push('            <span class="ic ic_arrow_type1_down"></span>');
            html.push('        </a>');
            html.push('    </div>');
            html.push('    <div class="wrap_multiCompany" id="close_multi_companies" style="display:none">');
            html.push('        <a href="#" class="btn_multiCompany on" title="{{label.multiCompanyClose}}" data-bypass>');
            html.push('            <span class="ic ic_arrow_type1_up"></span>');
            html.push('        </a>');
            html.push('        <div class="gnb_top_menu" style="display:">');
            html.push('            <ul>');
            html.push('                {{#companies}}');
            html.push('                <li class="{{#selected}}on{{/selected}}">');
            html.push('                    <a class="multi_company_button" data-id="{{id}}" data-siteurl="{{siteUrl}}" data-dday="{{dday}}">');
            html.push('                        <span class="ic_arrow_wrap">');
            html.push('                            <span class="ic_gnb2 ic_arrow_d"></span>');
            html.push('                        </span>{{name}}');
            html.push('                    </a>');
            html.push('                </li>');
            html.push('                {{/companies}}');
            html.push('            </ul>');
            html.push('        </div>');
            html.push('    </div>');
            html.push('    {{/isMultiCompany}}');
            html.push('</h1>');
            html.push('<nav id="menu-container" style="height: auto"></nav>');
            html.push(
                '<a class="btn_oganization" data-org>' +
                '   <span class="wrap_ic_gnb_adv">' +
                '       <span class="ic_gnb_adv oganization"></span>' +
                '   </span>' +
                '   <span class="txt">{{label.org}}</span>' +
                '</a>'
            );
            html.push('</header>');

            html.push('<section class="my_info snb" id="myInfo">');
            html.push('    {{#useLabFeedback}}<span class="snb_laboratory" data-lab-data-wrapper style="display: none;">');
            html.push('         <a class="btn_ic24" data-lab-icon title="{{label.lab_label}}" data-bypass>');
            html.push('		        <span class="ic_snb ic_beaker" ></span>');
            html.push('             <span id="lab-badge" class="badge noti" data-lab-new-icon style="display: none;">N</span>');
            html.push('	        </a>');
            html.push('    {{/useLabFeedback}}</span>');
            html.push('    {{^useMiniGnb}}<div class="profile">');
            html.push('        <span class="photo" data-setting>');
            html.push('            <a href="#" class="btn-config" data-bypass>');
            html.push('                <img id="sessionThumbnail" src="{{userThumbnailUrl}}" title="{{userName}}" alt="{{userName}}">');
            html.push('            </a>');
            html.push('        </span>');
            html.push('    </div>{{/useMiniGnb}}');
            html.push('    <ul class="ctrl">');
            html.push('        <li id="top_notification">');
            html.push('            <a href="#" class="btn_noti btn-noti" title="{{label.notiAppTitle}}" data-bypass>');
            html.push('                <span id="noti-count-badge" class="badge noti" style="display: none;">0</span>');
            html.push('            </a>');
            html.push('        </li>');
            html.push('        {{#useMiniGnb}}<li>');
            html.push('             <a href="#" class="btn_setting" title="{{label.setting}}" data-setting></a>')
            html.push('        </li>{{/useMiniGnb}}');
            html.push('    </ul>');
            html.push('</section>');

            return Hogan.compile(html.join('\n')).render(data);
        }

        return Klass;
    })(MenuView, AdvancedMenuView, Util);

    function hasGORouter() {
        return !!window.Backbone && GO.hasOwnProperty('router');
    }

    function resetSubmenu(e) {
        $('#main-menu > li:not([data-active])').removeClass('on on_layer');
        var target = $(e.currentTarget);

        if (target[0].tagName === "DIV") target.remove(); //하위메뉴 레이어만 제거한다.
    }

    function makeSubmenu(menuList) {
        var buff = [];
        var $el = $('<div class="nav-submenu gnb_top_menu"><ul></ul></div>');

        if (menuList instanceof jQuery) {
            buff.push.apply(buff, menuList);
        } else {
            $.each(menuList || [], function (i, menu) {
                if (menu === '---') {
                    buff.push('<li class="bar"></li>');
                } else {
                    buff.push(makeMenuItemElement(menu));
                }
            });
        }

        $.fn.append.apply($el.find('ul'), buff);

        return $el;
    }

    function makeMenuItemTemplate(menu) {
        var html = [];
        html.push('<li class="' + (menu.classname || '') + '"><a href="' + menu.url + '" data-bypass>');
        html.push('<span' + (menu['idAttr'] ? ' id="' + menu.idAttr + '"' : '') + ' class="menu" title="' + menu.name + '">' + menu.name);

        if (menu['subMenuType']) {
            html.push('<span class="ic_gnb ic_more"></span>');
        }

        if (menu['badge']) {
            html.push('<span class="badge' + (menu.badge.classname ? ' ' + menu.badge.classname : '') + '">'
                + menu.badge.text + '</span>');
        }

        html.push('</span>');
        html.push('</a></li>');

        return html.join('');
    }

    function makeMenuItemElement(model) {
        var $el = $(makeMenuItemTemplate(model));
        $el.data('model', model);

        return $el;
    }

    function delegateEvent(context, eventName, selector, callback) {
        return context.$el.on(eventName, selector, $.proxy(callback, context));
    }

    // @deprecated
    // 과거 호환성 제공
    if (!window.GONavigation) window.GONavigation = GONavigation;

    return {
        create: function (placehoderId, options) {
            return GONavigation.create(placehoderId, options);
        }
    };
}, jQuery);
