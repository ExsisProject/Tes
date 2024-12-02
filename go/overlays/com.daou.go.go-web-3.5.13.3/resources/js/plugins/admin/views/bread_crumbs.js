define("admin/views/bread_crumbs", function (require) {

    var Backbone = require("backbone");
    var Tpl = require("hgn!admin/templates/bread_crumbs");
    var _ = require('underscore');
    var App = require('app');
    var adminLang = require('i18n!admin/nls/admin');

    var BreadCrumbs = Backbone.View.extend({
        events: {
            'click #favorite': 'onClickFavorite',
            'click a.path': 'movePage'
        },

        initialize: function (adminMenu, sideMenuCollection) {
            this.sideMenuCollection = sideMenuCollection;
            this.currentMenu = adminMenu;
            this.adminMenuKey = adminMenu ? adminMenu.getMenuKey() : '';
            this.menus = [];
            this.pushMenuArrays(this.currentMenu);
        },
        pushMenuArrays: function (menu) {
            if (!menu) {
                return;
            }
            if (menu.parentUid) {
                this.pushMenuArrays(this.sideMenuCollection.findMenu(menu.parentUid));
                this.menus[this.menus.length] = this.sideMenuCollection.findMenu(menu.parentUid);
            }
        },
        render: function () {
            var isOrgSyncable = GO.config('orgSyncWaitMin') > -1;
            this.$el.html(Tpl({
                title: this.getTitleFromMenu(),
                breadCrumbs: this.breadCrumbs,
                favorite: this.favorite,
                isSubMenu: !!this.subMenu,
                hasSubLabel: !!this.attributes.subLabel && isOrgSyncable,
                lang: {
                    syncDescription: isOrgSyncable ? GO.i18n(adminLang[this.attributes.subLabel] || '', {
                        'term': GO.config('orgSyncWaitMin')
                    }) : ''
                }
            }));
            this.renderBreadCrumbs();
            return this;
        },
        renderBreadCrumbs: function () {
            var target = this.$el.find('.content_nav');
            target.empty();
            var tpl = '';
            var tmpMenus = this.subMenu ? this.menus.concat([this.currentMenu]) : this.menus;

            _.forEach(tmpMenus, function (m) {
                if (!m) {
                    return;
                }
                if (tpl) {
                    tpl += '<span class="separator">/</span>';
                }
                if (m.href) {
                    tpl += '<a class="path" data-link="' + m.href + '">' + m.labelKey + '</a>';
                } else {
                    tpl += '<a class="path" data-link="" style="cursor: default">' + m.labelKey + '</a>';
                }
            });

            target.append(tpl);
        },
        getTitleFromMenu: function () {
            var title = this.currentMenu ? this.currentMenu.labelKey : '';
            if (this.subMenu && this.subMenu.labelKey) {
                title += ' > ' + this.subMenu.labelKey;
            }
            return title;
        },
        movePage: function (e) {
            var target = $(e.currentTarget);
            var link = target.attr('data-link');
            if (!link) {
                return;
            }
            if (link.indexOf('/') !== 0) {
                link = '/' + link;
            }
            App.router.navigate(link, {trigger: true, pushState: true});
        },
        setSubMenu: function (name, href) {
            this.subMenu = {labelKey: name, href: href};
        },
        accessMenu: function () {
            self = this;
            this.currentMenu.fetch({
                async: false,
                success: function (model) {
                    self.favorite = model.getFavorite();
                    $('body').trigger('recently.menu.updated');
                }
            });
        },
        onClickFavorite: function (e) {
            this.currentMenu.updateFavorite(!this.currentMenu.favorite);
            var target = $(e.currentTarget).find(".ic_adm");
            target.removeClass('ic_favor_off ic_favor_on');
            target.addClass(this.currentMenu.favorite ? 'ic_favor_on' : 'ic_favor_off');
        }
    });

    return BreadCrumbs;

});
