define("admin/views/menu_admin", function (require) {

    var $ = require("jquery");
    var Backbone = require("backbone");
    var App = require("app");
    var MenuAdmin = require("admin/models/menu_admin");
    var InstallInfo = require("admin/models/install_info");
    var Menu = require("admin/models/menu");
    var MenuDetail = require("admin/views/menu_detail");
    var MenuAllTmpl = require("hgn!admin/templates/menu_admin");
    var commonLang = require("i18n!nls/commons");
    var adminLang = require("i18n!admin/nls/admin");
    require("jquery.go-validation");
    require("jquery.go-popup");
    require("jquery.go-sdk");

    var DEFAULT_URL = "about:blank";

    var lang = {
        label_delete: commonLang["삭제"],
        label_initial: adminLang["초기메뉴 지정"],
        label_order: adminLang["순서 바꾸기"],
        menu_list: adminLang["메뉴목록"],
        select: commonLang["선택"],
        systemMenu: adminLang["기본메뉴"],
        etcMenu: adminLang["부가메뉴"],
        category: adminLang["카테고리"],
        link: adminLang["링크"],
        changeDepth: adminLang["들여쓰기"],
        label_selected: adminLang["선택한 메뉴"],
        top: adminLang['맨 위로'],
        up: adminLang['위로'],
        down: adminLang['아래로'],
        bottom: adminLang['맨 아래로'],
    };


    var menuEl = Hogan.compile(
        '<li class="ic" data-depth="parent" data-type="{{menuType}}">' +
        '<a data-id="{{id}}" rel="org">' +
        '<ins class="{{#systemMenu}}menu{{/systemMenu}}' +
        '{{^systemMenu}}' +
        '{{#subMenuType}}folder{{/subMenuType}}' +
        '{{^subMenuType}}link{{/subMenuType}}' +
        '{{/systemMenu}}">&nbsp;' +
        '</ins>' +
        '{{name}}' +
        '{{#initial}}' + adminLang["(초기메뉴)"] + '{{/initial}}' +
        '</a>' +
        '{{#hasSubmenu}}' +
        '<ul>' +
        '{{/hasSubmenu}}' +
        '{{#activeSubMenu}}' +
        '<li class="ic" data-depth="child">' +
        '<a data-id="{{id}}" rel="org">' +
        '<ins class="{{#systemMenu}}menu{{/systemMenu}}' +
        '{{^systemMenu}}' +
        '{{#subMenuType}}folder{{/subMenuType}}' +
        '{{^subMenuType}}link{{/subMenuType}}' +
        '{{/systemMenu}}">&nbsp;' +
        '</ins>{{name}}' +
        '{{#initial}}' + adminLang["(초기메뉴)"] + '{{/initial}}' +
        '</a>' +
        '</li>' +
        '{{/activeSubMenu}}' +
        '{{#hasSubmenu}}' +
        '</ul>' +
        '{{/hasSubmenu}}' +
        '</li>'
    );


    var MenuAdminView = App.BaseView.extend({

        initialize: function () {
            this.model = new MenuAdmin();
            this.installInfo = InstallInfo.init();
        },

        dataFetch: function () {
            var deferred = $.Deferred();

            var fetchModel = this.model.fetch();
            var fetchInfo = this.installInfo.fetch();

            $.when(fetchModel, fetchInfo).done(function () {
                deferred.resolve();
            });

            return deferred;
        },

        events: {
            "click ul a[data-id]": "showDetail",
            "click #order": "order",
            "click #activateMenu": "activateMenu",
            "click #setInitialMenu": "setInitialMenu",
            "click #deleteMenu": "deleteMenu",
            "click #top": "topAndBottom",
            "click #bottom": "topAndBottom",
            "click #up": "up",
            "click #down": "down",
            "click #changeDepth": "changeDepth"
        },

        render: function () {

            var self = this;

            this.dataFetch().done(function () {

                self.$el.html(MenuAllTmpl({
                    lang: lang,
                }));

                self.renderSystemMenus();
                self.renderActiveMenus();
                self.selectInitMenu();

            });
            _.forEach(this.$el.find('.simplebar-content-wrapper'), function(bar){
                new SimpleBar(bar);
            });
            return this;
        },


        renderSystemMenus: function () {
            var item = Hogan.compile(
                '<li class="ic">' +
                '<a data-id={{id}} rel="org" class="{{#isActive}}a_menu_disabled{{/isActive}}">' +
                '<ins class="menu">&nbsp;</ins>' +
                '{{name}}' +
                '</a>' +
                '</li>'
            );

            _.each(this.model.getSystemMenus(), function (menu) {
                var data = _.extend(menu, {
                    isActive: menu.status == "online"
                });
                this.$("#systemMenus").append(item.render(data));
            }, this);
        },


        renderActiveMenus: function () {
            this.$("#active").empty();
            _.each(this.model.getActiveMenusTree(), function (menu) {
                var menuModel = new Menu(menu);
                var menuType = menuModel.getMenuType();
                var hasSubmenu = menuModel.hasActiveSubmenu();
                this.$("#active").append(menuEl.render(_.extend(menu, {
                    menuType: menuType,
                    hasSubmenu: hasSubmenu
                })));
            }, this);
        },


        showDetail: function (e) {
            var self = this;
            var target = $(e.currentTarget);
            var menu = target.attr("data-id");

            if (menu == this.currentMenu) return;
            this.currentMenu = menu;

            this.unmarkMenu();
            this.markCurrentMenu();
            this.buttonToggle();

            var menuId = target.attr("data-id");
            var model = parseInt(menuId) ? this.model.getMenuModel(menuId) : this.initMenuModel(menuId);
            this.detailView = new MenuDetail({
                model: model,
                installInfo: this.installInfo
            });

            this.$("div.col2").replaceWith(this.detailView.el).show();
            this.detailView.$el.on("change:menu", function (event, model) {
                self.model.fetch().done(function () {
                    self.refreshTree(model);
                });
            });
            this.detailView.render();

            $('div.col1').height($("div.col2").height());
        },

        refreshTree: function (model) {
            this.renderActiveMenus();
            this.remarkCurrentMenu(model);
            this.buttonToggle();
        },

        initMenuModel: function (type) {
            var menuId = this.getSelectedMenuId();
            var locale = this.installInfo.get("language");
            var name = menuId == "category" ? adminLang["새 카테고리"] : adminLang["새 링크"];
            var subMenuType = menuId == "category" ? true : false;
            var model = new Menu({
                name: name,
                subMenuType: subMenuType
            });

            model.set(this.getLocaleCode(locale) + "Name", name);
            model.set("status", "stop");

            if (type == "link") model.set("url", DEFAULT_URL);

            return model;
        },


        getLocaleCode: function (locale) {
            var code = null;
            if (locale == 'ja') {
                code = 'jp';
            } else if (locale == 'zh_CN') {
                code = 'zhcn';
            } else if (locale == 'zh_TW') {
                code = 'zhtw';
            } else {
                code = locale;
            }
            return code;
        },


        changeDepth: function (e) {
            if (!this.isPossibleIndent()) return;

            var menu = this.getSelectedMenu();
            if (!menu.length) return;

            var menuId = menu.attr("data-id");
            if (!menuId) return;

            var menuModel = this.model.getMenuModel(menuId);
            var self = this;

            if (this.isPossibleIndent()) {
                var parentId = this.getParentMenu(menu).find("a").attr("data-id");
                menuModel.get("parentId") ? menuModel.set("parentId", "") : menuModel.set("parentId", parentId);
                GO.util.preloader(menuModel.save().done(function (resp) {
                    self.syncDetailView(new Menu(resp.data));
                    self.model.fetch().done(function () {
                        self.renderActiveMenus();
                        self.markCurrentMenu();
                        self.buttonToggle();
                    });
                }));
            }
        },

        // hidden function
        order: function (e) {
            var self = this;

            if (this.isOrdering) {
                this.$("span.btn_s").removeClass("btn_disable");
                this.buttonToggle();
                this.$("#order").text(adminLang["순서 바꾸기"]);

                var ids = _.map(this.$("#active").find("a"), function (menu) {
                    return $(menu).attr("data-id");
                });

                this.model.setOrder(ids).done(function () {
                    self.$("#active").sortable("destroy");
                    self.isOrdering = false;
                    self.renderActiveMenus();
                    self.markCurrentMenu();
                });
            } else {
                this.$("div.col1").find("span.btn_s").not("#order").addClass("btn_disable");
                this.$("#order").text(adminLang["순서바꾸기 완료"]);
                this.$("#active").removeClass().sortable({
                    scrollSensitivity: 1,
                    opacity: "1",
                    delay: 100,
                    items: "li",
                    containment: "#activeSortableArea",
                    hoverClass: "ui-state-hover",
                    forceHelperSize: "true",
                    helper: "clone",
                    placeholder: "ui-sortable-placeholder",
                    stop: function (event, target) {
                        var menu = target.item.children("a");
                        var isPossible = self.isPossibleDrop(menu);
                        self.isChangeDepth(menu);

                        return isPossible;
                    }
                });
                this.isOrdering = true;
            }
        },


        isChangeDepth: function (menu) {
            var menuId = menu.attr("data-id");
            var menuObject = this.model.getMenu(menuId);
            var parent = menu.parents("li")[1];
            var parentId = parent ? $(parent).children("a").attr("data-id") : "";
            var beforeParentId = menuObject.parentId || "";
            var isChangeDepth = beforeParentId != parentId;

            if (isChangeDepth) {
                var param = {parentId: parentId};
                menuObject.parentId = parentId;
                this.model.updateMenu(menuId, param);
            }
        },


        topAndBottom: function (e) {
            var menuId = this.getSelectedMenuId();
            if (!menuId) return;

            var target = $(e.currentTarget);
            var type = target.attr("data-type");

            if (type == "top" && !this.isPossibleTop()) return;
            if (type == "bottom" && !this.isPossibleBottom()) return;

            var ids = this.getUnselectedMenuIds();

            type == "top" ? ids.unshift(menuId) : ids.push(menuId);

            var self = this;

            this.model.setOrder(ids).done(function () {
                self.renderActiveMenus();
                self.markCurrentMenu();
                self.buttonToggle();
            });
        },


        up: function (e) {
            if (!this.isPossibleUp()) return;

            var menuId = this.getSelectedMenuId();
            if (!menuId) return;

            var ids = this.getMenuIds();
            var index = _.indexOf(ids, menuId);
            if (index == 0) return;

            var current = this.getSelectedMenuWrap();
            var before = current.prev();
            before.before(current);

            this.setOrder();
        },


        down: function (e) {
            if (!this.isPossibleDown()) return;

            var menuId = this.getSelectedMenuId();
            if (!menuId) return;

            var ids = this.getMenuIds();
            var index = _.indexOf(ids, menuId);

            if (isLast()) return;

            var current = this.getSelectedMenuWrap();
            var after = current.next();
            after.after(current);

            this.setOrder();

            function isLast() {
                return index == (ids.length - 1);
            }
        },


        setOrder: function () {
            var self = this;
            var orderedIds = this.getMenuIds();

            this.model.setOrder(orderedIds).done(function () {
                self.renderActiveMenus();
                self.markCurrentMenu();
                self.buttonToggle();
            });
        },


        activateMenu: function () {
            var menu = this.$("#system").find("a.jstree-clicked");
            var menuId = menu.attr("data-id");
            if (menuId == undefined) return;

            var isActive = this.model.isActive(menuId);
            if (isActive) return;

            var self = this;
            var param = {status: "online"};

            if (menuId == "category" || menuId == "link") {
                this.detailView.model.set("status", "online");
                this.detailView.submit();
                this.buttonToggle();
            } else {
                this.model.updateMenu(menuId, param).done(function (resp) {
                    self.syncDetailView(new Menu(resp.data));
                    self.model.fetch().done(function () {
                        self.renderActiveMenus();
                        self.markCurrentMenu();
                        self.buttonToggle();
                        menu.addClass("a_menu_disabled");
                    });
                });
            }
        },


        setInitialMenu: function (e) {
            if (!this.isPossibleInitial()) return;

            var menuId = this.getSelectedMenuId();
            if (!menuId) return;

            var self = this;

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            this.model.setInitialMenu(menuId)
                .done(function (model) {
                    $.goMessage(commonLang["저장되었습니다."]);
                    self.refreshTree(model);
                })
                .always(function(){
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                });
        },


        markCurrentMenu: function () {
            this.$("a[data-id= " + this.currentMenu + "]").addClass("jstree-clicked");
        },


        unmarkMenu: function () {
            this.$("a").removeClass("jstree-clicked");
        },

        remarkCurrentMenu: function (model) {
            if (this.currentMenu == "category" || this.currentMenu == "link") {
                this.unmarkMenu();
                this.currentMenu = model.id;
                this.markCurrentMenu();
            } else {
                this.markCurrentMenu();
            }
        },


        deleteMenu: function () {
            if (!this.isPossibleDelete()) return;

            var menuId = this.getSelectedMenuId();

            if (!menuId) return;

            var menu = this.model.getMenuModel(menuId);
            var isSystem = menu.isSystemMenu();

            if (isSystem) {
                this.deleteSystemMenu(menuId);
            } else {
                this.deleteEtcMenu(menu, menuId);
            }
        },


        deleteSystemMenu: function (menuId) {
            var param = {status: "stop"};
            var self = this;

            this.model.updateMenu(menuId, param).done(function (resp) {
                self.syncDetailView(new Menu(resp.data));
                self.model.fetch().done(function () {
                    self.renderActiveMenus();
                    self.$("#system").find("a[data-id='" + menuId + "']").removeClass("a_menu_disabled");
                    self.buttonToggle();
                    self.selectInitMenu();
                });
            });
        },

        deleteEtcMenu : function(menu, menuId) {
            var self = this;
            var subMenus = [];
            this.model.leaveParent(menuId).done(function(resp) {
                self.destroyMenu(menuId);
            });
        },


        destroyMenu: function (menuId) {
            var self = this;

            self.model.deleteMenu(menuId).done(function () {
                self.model.fetch().done(function () {
                    self.renderActiveMenus();
                    self.$("div.col2").empty();
                    self.buttonToggle();
                    self.selectInitMenu();
                });
            });
        },


        getSelectedSystemMenu: function () {
            return this.$("#system").find("a.jstree-clicked");
        },


        getSelectedMenu: function () {
            return this.$("#active").find("a.jstree-clicked").last();
        },


        getSelectedMenuWrap: function () {
            return this.getSelectedMenu().parent("li");
        },


        getSelectedMenuId: function () {
            return this.getSelectedMenu().attr("data-id") || this.getSelectedSystemMenu().attr("data-id");
        },


        getMenuIds: function () {
            return _.map(this.$("#active").find("a"), function (menu) {
                return $(menu).attr("data-id");
            });
        },


        getParentMenuIds: function () {
            return _.map(this.$("#active").find("li[data-depth=parent]"), function (menu) {
                return $(menu).children("a").attr("data-id");
            });
        },


        getSiblingIds: function (menu) {
            var siblings = $(menu).parents("ul").first().children("li");
            return _.map(siblings, function (item) {
                return $(item).find("a").attr("data-id");
            });
        },


        getUnselectedMenuIds: function () {
            return _.map(this.$("#active").find("a").not(".jstree-clicked"), function (menu) {
                return $(menu).attr("data-id");
            });
        },


        isChildMenu: function (menu) {
            return $(menu).parent("li").attr("data-depth") == "child";
        },


        getParentMenu: function (menu) {
            return $(menu).parent("li").prev();
        },


        isIndentPossible: function (menu) {
            if (this.isChildMenu(menu)) return true;

            var prevMenu = $(menu).parent("li").prev();
            var hasPrevMenu = prevMenu.length > 0;

            if (!hasPrevMenu) return false;

            var prevMenuId = prevMenu.find("a").attr("data-id");
            var isCategory = this.model.getMenuModel(prevMenuId).isCategory();

            return hasPrevMenu && isCategory;
        },


        isPossibleDrop: function (menu) {
            var menuId = menu.attr("data-id");
            var menuModel = this.model.getMenuModel(menuId);

            var isCategory = menuModel.isCategory();
            var isSubDepth = $(menu).parents("li").length > 1;

            return (isCategory && isSubDepth) ? false : true;
        },


        buttonToggle: function () {
            this.$("#changeDepth").toggleClass("btn_disable", !this.isPossibleIndent());
            this.$("#setInitialMenu").toggleClass("btn_disable", !this.isPossibleInitial());
            this.$("#top").toggleClass("btn_disable", !this.isPossibleTop());
            this.$("#bottom").toggleClass("btn_disable", !this.isPossibleBottom());
            this.$("#up").toggleClass("btn_disable", !this.isPossibleUp());
            this.$("#down").toggleClass("btn_disable", !this.isPossibleDown());
            this.$("#deleteMenu").toggleClass("btn_disable", !this.isPossibleDelete());
        },


        isPossibleIndent: function () {
            var menu = this.getSelectedMenu();
            var menuId = menu.attr("data-id");
            if (!menuId) return false;

            var menuModel = this.model.getMenuModel(menuId);
            var isPossibleView = this.isIndentPossible(menu);
            var isPossibleModel = menuModel.isPossibleIndent();
            var isPossibleIndent = isPossibleView && isPossibleModel;
            return isPossibleIndent;
        },


        isPossibleInitial: function () {
            var menuId = this.getSelectedMenuId();

            if (!menuId) return false;

            var menu = this.model.getMenuModel(menuId);
            var isPossibleInitial = !(menu.isCategory() || menu.isLink() || menu.isInitial()) && menu.isActive();
            return isPossibleInitial;
        },


        isPossibleTop: function () {
            var ids = this.getMenuIds();
            var menuId = this.getSelectedMenuId();
            var menu = this.getSelectedMenu();
            var index = _.indexOf(ids, menuId);
            var isPossibleTop = index > 0 && !this.isChildMenu(menu);
            return isPossibleTop;
        },


        isPossibleBottom: function () {
            var ids = this.getParentMenuIds();
            var menuId = this.getSelectedMenuId();
            var index = _.indexOf(ids, menuId);

            if (index == -1) return false;

            var menu = this.getSelectedMenu();
            var isPossibleBottom = (index + 1) != ids.length && !this.isChildMenu(menu);
            return isPossibleBottom;
        },


        isPossibleUp: function () {
            var menu = this.getSelectedMenu();
            var menuId = this.getSelectedMenuId();
            var ids = this.getSiblingIds(menu);
            var index = _.indexOf(ids, menuId);
            var isPossibleUp = index > 0;
            return isPossibleUp;
        },


        isPossibleDown: function () {
            var menu = this.getSelectedMenu();
            var menuId = this.getSelectedMenuId();
            var ids = this.getSiblingIds(menu);
            var index = _.indexOf(ids, menuId);
            var isPossibleDown = (index + 1) != ids.length;
            return isPossibleDown;
        },


        isPossibleDelete: function () {
            var menuId = this.getSelectedMenuId();
            var menu = parseInt(menuId) ? this.model.getMenuModel(menuId) : this.initMenuModel(menuId);
            var isPossibleDelete = menu.isActive() && !this.model.hasOneActive() && !menu.isInitial();
            return isPossibleDelete;
        },


        isActivatable: function () {
            var menuId = this.getSelectedMenuId();
            var menu = this.model.getMenuModel(menuId);
            var isActivatable = !menu.isActive();
            return isActivatable;
        },


        syncDetailView: function (model) {
            this.detailView.model = model;
            this.detailView.render();
        },


        selectInitMenu: function () {
            var initMenu = this.model.getInitMenu();
            this.$("a[data-id='" + initMenu.id + "']").trigger("click");
        }
    });

    return MenuAdminView;
});