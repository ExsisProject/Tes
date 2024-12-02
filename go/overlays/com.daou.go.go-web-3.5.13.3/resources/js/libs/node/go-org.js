/**
 * @version 0.0.1
 * @require     jQuery, jstree , go-style.css, go-popup.js
 * @author  hyungmin@daou.co.kr
 * TODO - 이벤트 리팩토링 , 실시간 검색 , 가나다순 스크롤 더보기, 멤버 contextMenu 연결
 */
(function ($) {
    var aslice = Array.prototype.slice;
    var GG = $.goOrg = function () {
        var args = aslice.call(arguments);
        return GG.initialize.apply(GG, args);
    };

    $.fn.imitateKeyEvent = function () {
        return this.each(function () {
            var Observe = function (oEl) {
                this._o = oEl;
                this._value = oEl.value;
                this._bindEvents();
            };

            Observe.prototype._bindEvents = function () {
                var self = this;
                var bind = function (oEl, sEvent, pHandler) {
                    if (oEl.attachEvent) oEl.attachEvent('on' + sEvent, pHandler);
                    else oEl.addEventListener(sEvent, pHandler, false);
                };
                bind(this._o, 'focus', function () {
                    if (self._timer) clearInterval(self._timer);
                    self._timer = setInterval(function () {

                        if (self._value !== self._o.value) {
                            self._value = self._o.value;
                            self._fireEvent();
                        }
                    }, 50);
                });
                bind(this._o, 'blur', function () {
                    if (self._timer) clearInterval(self._timer);
                    self._timer = null;
                });
            };

            Observe.prototype._fireEvent = function () {
                var e;
                if (document.createEvent) {
                    if (window.KeyEvent) {
                        e = document.createEvent('KeyEvents');
                        e.initKeyEvent('keyup', true, true, window, false, false, false, false, 65, 0);
                    } else {
                        e = document.createEvent('UIEvents');
                        e.initUIEvent('keyup', true, true, window, 1);
                        e.keyCode = 65;
                    }
                    this._o.dispatchEvent(e);
                } else {
                    e = document.createEventObject();
                    e.keyCode = 65;
                    this._o.fireEvent('onkeyup', e);
                }
            };
            new Observe(this);
        });
    };

    var isClassic = GO.session('theme') === 'THEME_CLASSIC';
    var maxSize = {width: 300, height: 430};
    var minSize = {width: 300, height: 30};
    if (isClassic) {
        maxSize = {height: 430};
        minSize = {height: 38};
    }

    $.extend(GG, {
        el: '#organogram',
        contextRoot: null,
        orgEl: null,
        treeEl: null,
        zindex: null,
        searchKeyword: null,
        treeLoaded: false,
        version: '0.0.1',
        options: {},
        maxSize: maxSize,
        minSize: minSize,
        defaultLocale: 'ko',
        lang: {
            'ko': {
                "조직도": "조직도",
                "크게보기": "크게보기",
                "이름": "이름",
                "부서": "부서",
                "아이디": "아이디",
                "전화번호": "전화",
                "직위": "직위",
                "직책": "직책",
                "검색": "검색",
                "잠시만 기다려주세요": "잠시만 기다려주세요",
                "조직순": "조직순",
                "가나다순": "가나다순",
                "검색결과가 없습니다.": "검색결과가 없습니다.",
                "멤버가 없습니다": "멤버가 없습니다",
                "더보기": "더보기",
                "프로필": "프로필",
                "부서 프로필": "부서 프로필",
                "메일 보내기": "메일 보내기",
                "일정 보기": "일정 보기",
                "열기": "열기",
                "닫기": "닫기",
                "결과값이 많습니다. 검색을 이용해 주세요.": "결과값이 많습니다. 검색을 이용해 주세요."
            },
            'ja': {
                "조직도": "組織図",
                "크게보기": "拡大表示",
                "이름": "名前",
                "부서": "部署",
                "아이디": "ID",
                "전화번호": "電話",
                "직위": "職位",
                "직책": "役職",
                "검색": "検索",
                "잠시만 기다려주세요": "しばらくお待ちください。",
                "조직순": "組織順",
                "가나다순": "abc順",
                "검색결과가 없습니다.": "検索結果がありません。",
                "멤버가 없습니다": "メンバーがありません。",
                "더보기": "もっと見る",
                "프로필": "プロフィール",
                "부서 프로필": "部署プロフィール",
                "메일 보내기": "メール送信",
                "일정 보기": "予定確認",
                "열기": "開く",
                "닫기": "閉じる",
                "결과값이 많습니다. 검색을 이용해 주세요.": "結果値が多いです。検索を利用してください。"
            },
            'en': {
                "조직도": "Organization Tree",
                "크게보기": "Enlarge",
                "이름": "Name",
                "부서": "Department",
                "아이디": "ID",
                "전화번호": "Phone",
                "직위": "Position",
                "직책": "Title",
                "검색": "Search",
                "잠시만 기다려주세요": "Please wait..",
                "조직순": "By Organization",
                "가나다순": "By Alphabet",
                "검색결과가 없습니다.": "No Result",
                "멤버가 없습니다": "No Member",
                "더보기": "View More",
                "프로필": "Profile",
                "부서 프로필": "Description",
                "메일 보내기": "Email",
                "일정 보기": "View Event",
                "열기": "Open",
                "닫기": "Close",
                "결과값이 많습니다. 검색을 이용해 주세요.": "There are too many results. Please use the search function."
            },
            'zh_CN': {
                "조직도": "组织机构图",
                "크게보기": "查看大图",
                "이름": "名字",
                "부서": "部门",
                "아이디": "ID",
                "전화번호": "电话",
                "직위": "职称",
                "직책": "职位",
                "검색": "搜索",
                "잠시만 기다려주세요": "请稍候。",
                "조직순": "组织顺序",
                "가나다순": "abc顺序",
                "검색결과가 없습니다.": "没有搜索结果。",
                "멤버가 없습니다": "没有会员。",
                "더보기": "查看更多",
                "프로필": "简介",
                "부서 프로필": "部门简介",
                "메일 보내기": "发送邮件",
                "일정 보기": "查看日程",
                "열기": "打开",
                "닫기": "关闭",
                "결과값이 많습니다. 검색을 이용해 주세요.": "结果太多。请使用搜索功能。"
            },
            'zh_TW': {
                "조직도": "組織機構圖",
                "크게보기": "查看大圖",
                "이름": "名字",
                "부서": "部門",
                "아이디": "ID",
                "전화번호": "電話",
                "직위": "職稱",
                "직책": "職位",
                "검색": "搜索",
                "잠시만 기다려주세요": "請稍候。",
                "조직순": "組織順序",
                "가나다순": "abc順序",
                "검색결과가 없습니다.": "沒有搜索結果。",
                "멤버가 없습니다": "沒有會員。",
                "더보기": "查看更多",
                "프로필": "簡介",
                "부서 프로필": "部門簡介",
                "메일 보내기": "發送郵件",
                "일정 보기": "查看日程",
                "열기": "打開",
                "닫기": "關閉",
                "결과값이 많습니다. 검색을 이용해 주세요.": "結果太多。請使用搜索功能。"
            },
            'vi': {
                "조직도": "Sơ đồ tổ chức",
                "크게보기": "Xem kích thước",
                "이름": "Họ tên",
                "부서": "Phòng ban",
                "아이디": "Họ tên",
                "전화번호": "thoại nhà",
                "직위": "Chức vụ",
                "직책": "Chức trách",
                "검색": "Tìm kiếm",
                "잠시만 기다려주세요": "Vui lòng chờ trong giây lát",
                "조직순": "Theo tổ chức",
                "가나다순": "Theo Alphabet",
                "검색결과가 없습니다.": "Không có kết quả tìm kiếm",
                "멤버가 없습니다": "Không có thành viên",
                "더보기": "Xem thêm",
                "프로필": "Thông tin cá nhân",
                "부서 프로필": "Thông tin cá nhân phòng ban",
                "메일 보내기": "Gửi thư",
                "일정 보기": "Xem lịch trình",
                "열기": "Mở",
                "닫기": "Đóng",
                "결과값이 많습니다. 검색을 이용해 주세요.": "Có nhiều giá trị kết quả. Vui lòng sử dụng tìm kiếm."
            }
        },
        i18n: {},
        defaults: {
            offset: 30,
            treeId: 'orgSideTree',
            tpl: {
                'defaults': [
                    '<h1>',
                    '<ins class="ic"></ins><span class="txt">{lb_organogram}</span>',
                    '<span class="btn_wrap" id="orgToggleWrap"><span id="orgToggle" class="ic_gnb ic_hide_up2" data-slide="true" title="{lb_expend}"></span></span>',
                    '</h1>',
                    '<div class="search_wrap">',
                    '<form name="orgSearch" onSubmit="return false;">',
                    '<input class="search" type="text" placeholder="{lb_name}/{lb_id}/{lb_department}/{lb_position}/{lb_title}/{lb_phone}" title="{lb_name}/{lb_id}/{lb_department}/{lb_position}/{lb_title}/{lb_phone}" style="width: 100%;">',
                    '<input class="btn_search" type="submit" value="{lb_search}" title="{lb_search}">',
                    '</form>',
                    '</div>',
                    '<div class="tab_wrap"></div>'
                ].join(''),
                'contents': '<div id="tabOrgTree" class="content_tab_wrap" style="height:400px"><div id="orgSideTree"></div></div><div id="tabOrgMembers" class="content_tab_wrap" style="display:none;height:400px"></div>'
            }
        },

        initialize: function (options) {
            var useOrg = true;
            this.options = $.extend(true, {}, this.defaults, options);
            if (this.options.el) this.el = this.options.el;
            if (this.options.lang && this.lang.hasOwnProperty(this.options.lang)) {
                this.i18n = this.lang[this.options.lang];
            } else {
                var locale = $('meta[name="locale"]').attr('content');
                if (locale && this.lang.hasOwnProperty(locale)) {
                    this.i18n = this.lang[locale];
                } else {
                    this.i18n = this.lang[this.defaultLocale];
                }
            }

            this.treeLoaded = false;

            if (this.options.isOrgServiceOn !== undefined) {
                useOrg = this.options.isOrgServiceOn; //메일 쪽에서 사용할때 options로 받아서 사용
            } else {
                useOrg = GO.session("useOrgAccess");
            }

            // DOCUSTOM-5000 [대한제당] 조직도 표기방식 개선
            // 외부에서 표기법을 정의할 수 있도록 개선
            if (this.options.hasOwnProperty('displayFormats')) {
                this.displayFormats = this.options.displayFormats;
            } else {
                this.displayFormats = null;
            }

            this.isOrgServiceOn = useOrg;
            this.orgEl = $(this.el);
            this.render();

            this.setPosition();
            this.bindPositionEvent();

            if (GO.session('theme') === 'THEME_ADVANCED') this.hide();

            return this;
        },

        template: function (tpl, data) {
            return tpl.replace(/{(\w*)}/g, function (m, key) {
                return data.hasOwnProperty(key) ? data[key] : "";
            });
        },

        render: function () {
            var setSearchTime = null;
            var options = this.options;
            var $goWrap = $('.go_wrap');

            this.contextRoot = options.contextRoot || '';
            if (!this.orgEl.length && $goWrap.length) {
                $goWrap.after('<aside class="go_organogram" id="' + this.el.substr(1) + '"></aside>');
                this.orgEl = $(this.el);
                if (!this.orgEl.length) {
                    return false;
                }
            }

            this.orgEl.html(this.template(GG.defaults.tpl.defaults, {
                'lb_expend': this.i18n["열기"],
                'lb_organogram': this.i18n["조직도"],
                'lb_name': this.i18n["이름"],
                'lb_department': this.i18n['부서'],
                'lb_id': this.i18n['아이디'],
                'lb_position': this.i18n["직위"],
                'lb_search': this.i18n["검색"],
                'lb_phone': this.i18n["전화번호"],
                'lb_title': this.i18n["직책"]
            })).css('height', this.minSize.height);

            this.orgEl.find('input[placeholder]').placeholder();
            this.orgEl.find('#orgToggleWrap').on("click", function () {
                if ($('#orgToggle').hasClass('ic_show_down2')) {
                    GG._orgClose();
                } else {
                    GG._orgOpen();
                }
            });

            var input = this.orgEl.find('.search_wrap input.search');
            // FireFox와 Opera 는 한글입력시 keyup 이벤트가 발생하지 않아, 인위적으로 keyup 이벤트 발생시킴
            if ($.browser.mozilla || $.browser.opera) {
                input.imitateKeyEvent();
            }
            input.bind('keyup', function (e) {
                if (e) {
                    if (e.keyCode === 13) {
                        $(e.currentTarget).focus();
                        return false;
                    }
                    clearTimeout(setSearchTime);
                    setSearchTime = setTimeout(GG._search, 500);
                }
                return false;
            });
            input.on('click', function (e) {
                // 조직도 검색창 클릭시 펼침되도록 수정 (접힘 시 클레식모드에서만 검색창 노출 됨)
                if ($('#orgToggle').hasClass('ic_hide_up2')) {
                    GG._orgOpen();
                }
            });
            // 접힘 상태 사이즈로 초기화 되도록 조치
            this.orgEl.css(this.minSize).find('.tab_wrap').show();

            // 접혀 있을 경우 class에 'hide' 속성 추가 요구 반영
            if (GO.session('theme') === 'THEME_CLASSIC') {
                this.orgEl.addClass("hide");
            }

            return this;
        },

        on: function () {
            return $.fn.on.apply(this.orgEl, aslice.call(arguments));
        },

        off: function () {
            return $.fn.off.apply(this.orgEl, aslice.call(arguments));
        },

        setPosition: function () {
            // pc web 이 아니면 조직도 position 을 기존방식(fixed)으로 적용한다.
            if ($('meta[name="device"]').attr("content") !== "pc") {
                $("#organogram").css("position", "fixed");
            } else {
                //GO-29803 - 사파리에서 스크롤 내릴때 무한으로 스크롤 생성됨. 임시로 메일만 스크롤계산 제거함.
                if (document.location.pathname.indexOf("/app/mail") < 0 && GO.session('theme') !== 'THEME_ADVANCED') {
                    this.orgEl.css("top", $(document).scrollTop() + $(window).height() - this.orgEl.outerHeight() - 26);
                }
            }
        },

        bindPositionEvent: function () {
            var self = this;
            $(window).on("scroll.org", function () {
                self.setPosition();
            });
            $(window).resize(function () {
                self.setPosition();
            });
        },

        _renderSearchList: function () {
            var keywordEl = GG.orgEl.find('input.search'),
                searchKeyword = keywordEl.val() === keywordEl.attr('placeholder') ? '' : $.trim(GG.orgEl.find('input.search').val());

            if (!searchKeyword) {
                GG._searchReset();
                return false;
            }

            GG.orgEl.find('#tabOrgTree').hide();
            var nodeList = $.goNodeList({
                selectQuery: '#tabOrgMembers',
                keyword: searchKeyword,
                i18n: this.i18n,
                type: 'org',
                isOrgServiceOn: this.isOrgServiceOn,
                contextRoot: this.contextRoot,
                // 실제로는 쓰지 않으나, 훗날을 대비해서 전달한다.
                displayFormats: this.displayFormats,
                callback: $.proxy(this._eventCallback, this)
            });
            nodeList.$el.show();

            nodeList.deferred.then($.proxy(function (node) {
                var data = node.getData();

                if (data.length === 1) {
                    var item = data[0],
                        option = {};

                    if (item.nodeType === "department") option.type = "org";

                    option.id = item.id;
                    option.email = item.email;
                    option.name = item.name;

                    this._eventCallback(option, {type: "select_node"});
                }
            }, this));
        },

        _renderTreeNode: function () {
            this.treeLoaded = true;
            var tree = $.goNodeTree({
                el: '#orgSideTree',
                type: 'node',
                i18n: this.i18n,
                isMyDeptOpened: true,
                multiCompanyVisible: true,
                contextRoot: this.contextRoot,
                displayFormats: this.displayFormats,
                url: [this.contextRoot, 'api/organization/'],
                callback: $.proxy(function (data, e) {
                    this._eventCallback(data, e);
                    GG._removeContextMenu();
                }, this)
            });
            this.treeEl = tree.$el;
        },

        _eventCallback: function (data, e) {
            if ('org' === data.type || 'company' === data.type) {
                this.orgEl.trigger('show:dept_profile', {
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    rel: 'org'
                });
            } else if (e.type === 'click' || e.type === 'select_node' || e.type === 'contextmenu') {
                // MEMBER, MASTER, MODERATOR
                this.orgEl.trigger('show:profile', {
                    id: data.id,
                    email: data.email,
                    name: data.name,
                    rel: 'member'
                });
            }
        },

        toggleDisplayAndExtend: function () {
            if (!this._isShown()) {
                this.show();
                this._orgOpen();
                this.orgEl.find('input.search').focus();
            } else {
                this.hide();
                this._orgClose()
            }
        },

        _orgOpen: function () {
            GG.orgEl.find('#orgToggle').removeClass('ic_hide_up2').addClass('ic_show_down2').attr('title', GG.i18n['닫기']);
            GG.orgEl.css(GG.maxSize).find('.tab_wrap').show();

            if (!GG.orgEl.find('#' + GG.defaults.treeId).length) {
                GG.orgEl.find('.tab_wrap').html(GG.defaults.tpl.contents);
                if (!GG.isOrgServiceOn) {
                    GG._renderSearchList();
                } else if (!GG.treeLoaded) {
                    GG._renderTreeNode();
                }
                GG.orgEl.find('.content_tab_wrap').on('scroll', function () {
                    $('body > .org_context_menu').remove();
                });
            }

            $(window).on('click.go-org', function (e) {
                var $target = $(e.target);
                if (!$target.parents(GG.el).length && !$target.parents('.go_popup').length && !$target.attr('data-action')) {
                    GG._orgClose();
                }
            });

            this.setPosition();
            if (GO.session('theme') === 'THEME_CLASSIC') {
                this.orgEl.removeClass("hide") // 펼칠 때 class의 hide 속성 제거
            }
        },

        _orgClose: function () {
            $(window).off('.go-org');
            this.orgEl.find('#orgToggle').removeClass('ic_show_down2').addClass('ic_hide_up2').attr('title', this.i18n['열기']);
            this.orgEl.css(GG.minSize).find('.tab_wrap').hide();
            this._removeContextMenu();

            this.setPosition();

            if (GO.session('theme') === 'THEME_ADVANCED') {
                this.hide();
            }
            else {
                this.orgEl.addClass("hide"); // 접을 때 class의 hide 속성 추가
            }
            return false;
        },

        _search: function () {
            GG._orgOpen();
            GG._renderSearchList();
        },

        _searchReset: function () {
            GG.orgEl.find('input.search').val('');
            GG.orgEl.find('#tabOrgMembers').hide();
            GG.orgEl.find('#tabOrgTree').show();
        },

        _removeContextMenu: function () {
            $('body > .org_context_menu').remove();
            GG.orgEl.unbind('click.contextRemove');
        },

        show: function () {
            this.orgEl.show();
        },

        hide: function () {
            this.orgEl.hide();
        },

        _isShown: function () {
            return this.orgEl.is(':visible');
        }
    });

})(jQuery);
