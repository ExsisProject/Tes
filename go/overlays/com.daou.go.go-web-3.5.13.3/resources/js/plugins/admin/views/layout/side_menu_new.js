define('admin/views/layout/side_menu_new', function (require) {

    var $ = require('jquery');
    var Backbone = require('backbone');
    var App = require('app');

    var Tmpl = require('hgn!admin/templates/layout/side_menu_new');
    var SideMenuCollection = require("admin/collections/side_menu_collection");
    var SideMenuList = require('admin/views/layout/side_menu_list');

    var AdminLang = require("i18n!admin/nls/admin");
    var CommonLang = require("i18n!nls/commons");

    var FavoriteMenuCollection = require("admin/collections/favorite_menus");
    var RecentlyMenuCollection = require("admin/collections/recently_menus");

    require("jquery.go-grid");

    return Backbone.View.extend({

        events: {
            'click .logo': 'moveToCompanyPage',
            'click li': 'movePage',
            'keyup #filteringText': 'filtering',
            'click .gnb_tit': 'toggleFolded',
            'click .gnb_menu_manage .gnb_sub li .tit': 'toggleFolded',
            'click .btn_fold': 'openFolded',
            'click .btn_cancel_s_w': 'cancelSearch',
        },
        initialize: function () {
            var self = this;
            this.sideMenuCollection = new SideMenuCollection();
            this.favoriteMenus = new FavoriteMenuCollection();
            this.recentlyMenus = new RecentlyMenuCollection();

            this.models = this.sideMenuCollection.getMenus();
            this.recentlyMenuView = new SideMenuList("recently_", this.sideMenuCollection);
            this.favoritMenuView = new SideMenuList("favorite_", this.sideMenuCollection);

            this.favoriteMenus.fetch({async: false});
            this.recentlyMenus.fetch({async: false});

            this.recentlyMenuView.update(this.recentlyMenus);
            this.favoritMenuView.update(this.favoriteMenus);

            window.onhashchange = function () {
                self.refreshSelectedMenu();
            };
        },
        render: function () {

            var companyName = App.session().companyName;
            var self = this;
            this.$el.html(Tmpl({
                contextRoot: GO.contextRoot,
                AdminLang: AdminLang,
                CommonLang: CommonLang,
                companyName: companyName
            }));


            this.$el.ready(function () {
                $("#tree").jstree({});
            });
            this.refreshMenus();

            this.addEventListener();
            this.initbar();
            $(window).resize(function () {
                self.resize();
            });
            return this;
        },
        initbar: function () {
            new SimpleBar($('.simplebar-content-wrapper')[0]);
            this.resize();
        },
        resize: function () {
            this.windowHeight = window.innerHeight * 0.95;

            var headHeight = 0;
            _.forEach($('.head_sidebar'), function (head) {
                headHeight += $(head).height();
            });

            var contentHeight = this.windowHeight - headHeight;

            if (this.contentHeight === contentHeight) {
                return;
            }

            this.contentHeight = contentHeight;
            $('#sidebar_wrapper').height(contentHeight);
        },
        refreshMenus: function () {

            var manageMenu = this.$el.find('#management_menu');
            manageMenu.empty();

            var json = this._getCookie();
            var cookie = json ? JSON.parse(json) : {};
            this.selectedId = cookie.selectedId;
            this.notFoldeds = cookie.notFoldeds;
            this.searchKey = cookie.searchKey ? cookie.searchKey : '';
            $('#filteringText').val(this.searchKey);

            this.models = this.sideMenuCollection.getFilteringModels(this.searchKey);
            var isNotEmpty = false;

            var syncHistoryCheck = this.getActiveSyncHistory();
            for (var i = 0; i < this.models.length; i++) {
                isNotEmpty |= this.models[i].view;
                manageMenu.append(this.tpl(this.models[i]));
                for (var j = 0; j < this.models[i].childs.length; j++) {
                    if(this.models[i].childs[j].labelKey == '동기화 이력관리') {
                        if(!syncHistoryCheck) {
                            this.$el.find('#management_menu').find('#root_C-f').remove()
                        }
                    }
                }
            }
            if (!!isNotEmpty) {
                $('#null_data').hide();
                $('#menu-content').show();
            } else {
                $('#null_data').show();
                $('#menu-content').hide();
            }

            this.$el.find('#recentlyMenu').append(this.recentlyMenuView.$el);
            this.$el.find('#favoritedMenu').append(this.favoritMenuView.$el);

            this.favoritMenuView.render();
            this.recentlyMenuView.render();

            if (this.isNotFold('favoritedMenu')) {
                this.$el.find('#favoritedMenu').children('a').removeClass('folded');
                this.favoritMenuView.$el.css('display', 'block');
                if(syncHistoryCheck == false) {
                    this.favoritMenuView.$el.find('#favorite_C-f').remove();
                }
            }
            if (this.isNotFold('recentlyMenu')) {
                this.$el.find('#recentlyMenu').children('a').removeClass('folded');
                this.recentlyMenuView.$el.css('display', 'block');
            }

            this.refreshSelectedMenu();
        },
        getActiveSyncHistory: function () {
            var res = false;
            $.go(GO.contextRoot + 'ad/api/site/adminjob/check/', '', {
                qryType: "get",
                async: false,
                contentType: 'application/json',
                responseFn: function (response) {
                    res = response.data.data;
                },
                error: function (data) {
                    $.goMessage(data.responseJSON.message);
                }
            });
            return res;
        },
        refreshSelectedMenu: function () {
            if (!this.selectedId) {
                return;
            }
            var path = window.location.pathname.replace('/go', '').replace('/admin/', '');
            var uid = this.selectedId.substr(this.selectedId.indexOf('_') + 1);

            var hrefMenu = this.sideMenuCollection.findMenuFromHref(path);
            if (hrefMenu && uid !== hrefMenu.getMenuKey() && $('#' + 'recently_' + hrefMenu.getMenuKey()).length > 0 ) {
                this.selectedId = 'recently_' + hrefMenu.getMenuKey();
                $('#recentlyMenu').find('a').removeClass('folded');
                $('#recentlyMenu').find('ul').css('display', 'block');
                this.saveCookie(true);
            }

            $('.tit').removeClass('on');
            $('#' + this.selectedId).find('.tit').addClass('on');
        },
        filtering: function (e) {
            this.searchKey = $(e.currentTarget).val();
            this.saveCookie(false);
            this.refreshMenus();
        },
        cancelSearch: function () {
            if (!this.searchKey) {
                return;
            }
            this.searchKey = '';
            this.saveCookie(false);
            this.refreshMenus();
        },
        moveToCompanyPage: function () {
            GO.router.navigate('/company', true);
        },
        movePage: function (e) {
            var target = $(e.currentTarget);
            var name = target.attr('name');
            var id = target.attr('id');

            var menu = this.sideMenuCollection.findMenu(name);

            if (!menu) {
                return;
            }

            if (menu && menu.childs.length < 1) {
                if (menu.routingName === 'window') {
                    window.open(GO.contextRoot + menu.href);
                    return;
                }

                this.selectedId = id;
                $("a").removeClass('on');
                $("#" + id).find('a').addClass('on');
                if (menu.href) {
                    App.router.navigate(menu.href, {trigger: true, pushState: true});
                }
            }
            this.saveCookie(true);
        },
        toggleFolded: function (e) {
            var self = this;
            var target = $(e.currentTarget);

            e.preventDefault();
            target.toggleClass('folded');

            var agent = navigator.userAgent.toLowerCase();
            if ( (navigator.appName == 'Netscape' && navigator.userAgent.search('Trident') != -1) || (agent.indexOf("msie") != -1) ) {
                //IE
                if(target.hasClass('folded')){
                    $(target).parent().children('.gnb_sub').hide();
                }else{
                    $(target).parent().children('.gnb_sub').show();
                }
            } else{
                target.siblings(".gnb_sub").slideToggle("fast", function () {
                });
            }


            this.saveCookie(true);
        },
        openFolded: function (e) {
            $('.btn_fold').toggle();
            $(".admin_side_new").toggleClass('folded');
        },
        addEventListener: function () {
            self = this;
            $('body').on("favorite.menu.updated", $.proxy(this.refreshFavorite, this));
            $('body').on("recently.menu.updated", $.proxy(this.refreshRecently, this));
        },
        refreshFavorite: function () {
            this.favoriteMenus.fetch({async: false});
            this.favoritMenuView.update(this.favoriteMenus);
            this.refreshSelectedMenu();
        },
        refreshRecently: function () {
            this.recentlyMenus.fetch({async: false});
            this.recentlyMenuView.update(this.recentlyMenus);
            this.refreshSelectedMenu();
        },
        isNotFold: function (key) {
            if (!this.notFoldeds) {
                return false;
            }
            for (var i = 0; i < this.notFoldeds.length; i++) {
                if (this.notFoldeds[i] === key) {
                    return true;
                }
            }
            return false;
        },
        tpl: function (model) {

            if (!model.accessible || !model.view) {
                return '';
            }
            var menuId = 'root_' + model.getMenuKey();
            var isOpen = this.isNotFold(menuId);

            var tmpl = model.depth === 0 ? '<div class="gnb_memu gnb_menu_manage"' : '<li';
            if (model.depth === 0 && model.maxDepth < 2) {
                tmpl = '<div class="gnb_memu"';
            }

            tmpl += ' name="' + model.getMenuKey() + '" id="' + menuId + '"> ';

            tmpl += '<a class="' + (model.depth === 0 ? 'gnb_tit folded' : 'tit folded') + '"' + '>';
            tmpl = tmpl.replace(' folded', isOpen ? '' : ' folded');

            tmpl += this.accordionTp(model);
            tmpl += '<span class="txt">' + model.labelKey + '</span>';
            tmpl += '</a>';


            if (model.childs.length > 0) {
                tmpl += '<ul class="gnb_sub" style="display:none;">'.replace('none', isOpen ? 'block' : 'none');
                for (var i = 0; i < model.childs.length; i++) {
                    tmpl += this.tpl(model.childs[i]);
                }
                tmpl += '</ul>'
            }

            if (model.keyword && model.keyword.length > 0) {
                tmpl = tmpl.replace('folded', '');
                tmpl = tmpl.replace('style="display:none;"', '')
            }


            tmpl += model.depth === 0 ? '</div>' : '</li>';
            return tmpl;
        },
        accordionTp: function (model) {
            if (model.childs.length < 1) {
                return '';
            }
            return model.depth === 0 ? '<span class="ic_adm ic_accordion"></span>' : '<span class="ic_adm ic_accordion_s"></span>';
        },
        addNotFoldeds: function (tit) {
            if (!$(tit).hasClass('folded')) {
                var id = $(tit).parent().attr('id');

                var uid = $(tit).parent().attr('name');
                if (uid) {
                    var menu = this.sideMenuCollection.findMenu(uid);
                    if (menu.depth === menu.maxDepth) {
                        return;
                    }
                }
                this.notFoldeds[this.notFoldeds.length] = id;
            }
        }, saveCookie: function (foldedSave) {
            var self = this;
            if (foldedSave && (!this.searchKey || this.searchKey.length < 1)) {
                this.notFoldeds = [];
                _.forEach(this.$el.find('.gnb_tit'), function (tit) {
                    self.addNotFoldeds(tit);
                });
                _.forEach(this.$el.find('.tit'), function (tit) {
                    self.addNotFoldeds(tit);
                });
            }
            this._saveCookie();
        },
        _getCookie: function () {
            var companyId = App.session().companyId;
            return $.cookie('sideMenuCookie_' + companyId);
        },
        _saveCookie: function () {
            var val = {selectedId: this.selectedId, searchKey: this.searchKey, notFoldeds: this.notFoldeds};
            var jsonVal = JSON.stringify(val);
            var option = {path: '/'};
            var companyId = App.session().companyId;
            $.cookie('sideMenuCookie_' + companyId, jsonVal, option);
        }
    });
});