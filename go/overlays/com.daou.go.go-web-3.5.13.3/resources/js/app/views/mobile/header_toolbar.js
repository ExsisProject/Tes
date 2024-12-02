;(function () {
    define([
            "jquery",
            "underscore",
            "backbone",
            'app',
            "hgn!templates/mobile/header_toolbar",
            'views/layouts/m_action_bar_default',
            'i18n!nls/commons',
            "GO.util"
        ],
        function (
            $,
            _,
            Backbone,
            GO,
            HeaderToolbarTpl,
            actionBar,
            commonLang
        ) {
            var instance = null;
            var HeaderToolbar = Backbone.View.extend({
                el: '#headerToolbar',
                initialize: function (options) {
                    this.unbindEvent();
                    this.bindEvent();
                },
                unbindEvent: function () {
                    this.$el.off('vclick.side', '#btnSideMenu');
                    this.$el.off('vclick', '#btnMobileHome');
                    this.$el.off('vclick', '#btnHeaderCheckBox');
                    this.$el.off('vclick', '#btnHeaderCheckCancel');

                    this.$el.off('vclick', '#prevBtn');
                    this.$el.off('vclick', '#closeBtn');
                    this.$el.off('vclick', 'a[data-trigger]');

                    this.$el.off('vclick', '[name=document_action]');
                    this.$el.off('vclick', '#more_btn');
                    this.$el.off('vclick', '#commonWriteButton');
                },
                bindEvent: function () {
                    this.$el.on('vclick.side', '#btnSideMenu', $.proxy(this.showSideMenu, this));
                    this.$el.on('vclick', '#btnMobileHome', $.proxy(this.mobileHome, this));
                    this.$el.on('vclick', '#btnHeaderCheckBox', $.proxy(this.headerCheckBox, this));
                    this.$el.on('vclick', '#btnHeaderCheckCancel', $.proxy(this.closeHeaderCheckBox, this));

                    this.$el.on('vclick', '#prevBtn', $.proxy(this.prevAction, this));
                    this.$el.on('vclick', '#closeBtn', $.proxy(this.layerClosed, this));
                    this.$el.on('vclick', 'a[data-trigger]', $.proxy(this.triggerExecute, this));

                    this.$el.on('vclick', '[name=document_action]', $.proxy(this.actApprAction, this));
                    this.$el.on('vclick', '#more_btn', $.proxy(this.moreLayout, this));
                    this.$el.on('change', 'select[select-trigger]', $.proxy(this.selecttriggerExecute, this));
                    this.$el.on('vclick', '#commonWriteButton', $.proxy(this.moveWrite, this));

                    this.$el.on('vclick', '#leftBtn', $.proxy(this.seeLeft, this));
                    this.$el.on('vclick', '#rightBtn', $.proxy(this.seeRight, this));

                },
                render: function (options) {

                    this.options = options || {};
                    this.$sideEl = $('#side');
                    this.$contentEl = $('#headerToolbar');

                    this.isList = this.options.isList || false;
                    this.isSideMenu = this.options.isSideMenu || false;
                    this.isHome = this.options.isHome || false;
                    this.title = this.options.title || "";
                    this.isSearch = this.options.isSearch || false;
                    this.checkedActionMenu = this.options.checkedActionMenu || "";
                    this.checkedTargetEl = this.options.checkedTargetEl || "";
                    this.actionMenu = this.options.actionMenu || "";
                    this.isPrev = this.options.isPrev || false;
                    this.prevCallback = this.options.prevCallback || "";
                    this.isClose = this.options.isClose || false;
                    this.closeCallback = this.options.closeCallback || "";
                    this.isWriteBtn = this.options.isWriteBtn || false;
                    this.writeBtnCallback = this.options.writeBtnCallback || "";
                    this.isLeftBtn = this.options.isLeftBtn || false;
                    this.leftBtnCallback = this.options.leftBtnCallback || "";
                    this.isRightBtn = this.options.isRightBtn || false;
                    this.rightBtnCallback = this.options.rightBtnCallback || "";

                    this.$el = this.$el.empty();
                    this.$el.append(HeaderToolbarTpl(
                        {
                            isList: this.isList,
                            isSideMenu: this.isSideMenu,
                            isHome: this.isHome,
                            title: this.title,
                            isSearch: this.isSearch,
                            isPrev: this.isPrev,
                            isClose: this.isClose,
                            isWriteBtn: this.isWriteBtn,
                            isLeftBtn: this.isLeftBtn,
                            isRightBtn: this.isRightBtn,
                            isMobileApp: GO.config('isMobileApp')
                        }
                    ));
                    var actionMenu = this.actionMenu ? this.actionMenu : this.checkedActionMenu;
                    var menuAppendTarget = this.actionMenu ? "div.optional" : "#checkedActionMenu";
                    var hasTitle = this.actionMenu && (this.title != "");
                    this.actionBar = new actionBar({useMenuList: actionMenu, hasTitle: hasTitle});
                    this.$el.find(menuAppendTarget).append(this.actionBar.render().el);
                    if (this.isLeftBtn || this.isRightBtn) this.setLeftRightBtn();
                    this.$sideEl.css('visibility', 'hidden');
                    return this;
                },
                moveWrite: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (this.$sideEl.is(":visible")) {
                        GO.EventEmitter.trigger('common', 'layout:showSideMenu', this);
                    }
                    if (typeof this.writeBtnCallback == 'function') {
                        this.writeBtnCallback();
                    }
                },
                blurEl: function (e) {
                    $(e.currentTarget).blur().trigger('focusout');
                    return false;
                },
                moreLayout: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var moreLayout = $(e.currentTarget).parent().find("div.array_option");
                    this.toggleMoreLayout(moreLayout);
                },
                toggleMoreLayout: function (moreLayout) {
                    if (moreLayout.is(':visible')) {
                        moreLayout.hide();
                    } else {
                        moreLayout.show();
                    }
                },
                actApprAction: function (e) {
                    $(e.currentTarget).closest("div.array_option").hide();
                    GO.EventEmitter.trigger('approval', $(e.currentTarget).attr('id'), this);
                },

                showSideMenu: function (e) {
                    $(e.currentTarget).blur().trigger('focusout');
                    GO.EventEmitter.trigger('common', 'layout:showSideMenu', this);
                    e.stopPropagation();
                    if ($("div.ui-todocard-content").length > 0) {
                        $("div.ui-todocard-content a.btn-close").trigger("click");
                    }
                    return false;
                },
                layerClosed: function (e) {
                    this.prevAction(e);
                },
                triggerExecute: function (e) {
                    var $targetEl = $(e.currentTarget);
                    $targetEl.blur().trigger('focusout');
                    e.preventDefault();
                    e.stopPropagation();
                    GO.EventEmitter.trigger('trigger-action', $targetEl.attr('data-trigger'), this);
                },
                selecttriggerExecute: function (e) {
                    var $targetEl = $(e.currentTarget);
                    $targetEl.blur().trigger('focusout');
                    e.preventDefault();
                    e.stopPropagation();
                    GO.EventEmitter.trigger('trigger-action', $targetEl.attr('select-trigger'), this);
                },
                prevAction: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    var $targetEl = $(e.currentTarget);
                    $targetEl.blur().trigger('focusout');
                    this.routePrev(e);
                },
                existSearchResult: function () {
                    if ($("#searchResultWrap ul").length > 0 || $("#searchResultWrap dl").length > 0) {
                        return true;
                    }
                    return false;
                },
                routePrev: function (e) {

                    $(e.currentTarget).blur();
                    e.stopPropagation();

                    if (typeof this.closeCallback != 'function' && GO.util.disagreeContentLoss()) return;

                    if (this.existSearchResult()) {
                        $('#goSearch').show();
                        $('#searchResultWrap').show();
                    }

                    if ($("#startDate").length) {
                        $('#startDate').datepicker('hide');
                        $('#endDate').datepicker('hide');
                    }

                    if ($("#birthdayDate").length) {
                        $('#birthdayDate').blur();
                        $('#birthdayDate').datepicker('hide');
                    }

                    if ($("#anniversaryDate").length) {
                        $('#anniversaryDate').blur();
                        $('#anniversaryDate').datepicker('hide');
                    }

                    if (typeof this.prevCallback == 'function') {
                        this.prevCallback();
                    } else if (typeof this.closeCallback == 'function') {
                        this.closeCallback();
                    } else {
                        if (window.history.length == 1) {
                            GO.util.goHome();
                        } else {
                            if (GO.util.isAndroidApp()) {
                                window.GOMobile.pressBackKey();
                            } else {
                                window.history.back();
                            }
                        }
                    }
                    return false;
                },
                headerCheckBox: function (e) {
                    e.stopPropagation();
                    if ($('#headerMenu').is(":visible")) {
                        $('#checkedHeaderMenu').show();
                        $('#headerMenu').hide();
                        $('#headerToolbar').addClass('check_nav');
                        GO.util.changeStatusBarColor(true);
                    } else {
                        $('#checkedHeaderMenu').hide();
                        $('#headerMenu').show();
                        $('#headerToolbar').removeClass('check_nav');
                        GO.util.changeStatusBarColor(false);
                    }
                    return false;
                },
                closeHeaderCheckBox: function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    this.headerCheckBox(e);
                    $(this.options.checkedTargetEl).prop('checked', false);
                },
                mobileHome: function (e) {
                    e.stopPropagation();
                    if (GO.util.disagreeContentLoss()) return;
                    GO.router.navigate(GO.contextRoot + "home", true);
                    return false;
                },
                setTitle: function (title) {
                    this.$el.find('h2').html(title);
                },
                scrollToTop: function () {
                    e.stopPropagation();
                    GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
                    return false;
                },
                setLeftRightBtn: function() { // works, 업무 활동기록 왼쪽, 오른쪽 버튼
                    var $appTitle = this.$el.find("#appTitle");
                    $appTitle.wrap('<div class="wrap_num_header"></div>');
                    $appTitle.before('<a id="leftBtn"><span class="btn btn_prev_type2"></span></a>');
                    $appTitle.after('<a id="rightBtn"><span class="btn btn_next_type2"></span></a>');
                    if (!this.isLeftBtn) this.$el.find("#leftBtn span").addClass('btn_disable');
                    if (!this.isRightBtn)  this.$el.find("#rightBtn span").addClass('btn_disable');
                },
                seeLeft: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!this.isLeftBtn) return;
                    if (typeof this.leftBtnCallback == 'function') {
                        this.leftBtnCallback();
                    }
                },
                seeRight: function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!this.isRightBtn) return;
                    if (typeof this.rightBtnCallback == 'function') {
                        this.rightBtnCallback();
                    }
                }
            }, {
                render: function (opts) {
                    if (instance == null) instance = new HeaderToolbar(opts);
                    return instance.render(opts);
                },
                checkBoxHeader: function (e) {
                    instance.headerCheckBox(e);
                }
            });

            return HeaderToolbar;
        });

}).call(this);