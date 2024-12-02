define("works/components/app_home/views/app_home_side_shortcuts", function (require) {
    var worksLang = require("i18n!works/nls/works");

    var lang = {
        "앱 목록": worksLang["앱 목록"],
        "새 앱 만들기": worksLang["새 앱 만들기"],
        "Works 홈": worksLang["Works 홈"],
        "즐겨찾는 앱": worksLang["즐겨찾는 앱"],
        "전체 앱": worksLang["전체 앱"],
        "앱명 검색": worksLang["앱명 검색"]
    };

    var AppletItemTmpl = Hogan.compile([
        '<li data-id="{{model.id}}" el-applet>',
        '<a>',
        '{{#model.isFavorite}}<span class="ic_board ic_star"></span>&nbsp;{{/model.isFavorite}}',
        '<span class="txt">{{model.name}}</span>',
        '</a>',
        '</li>'
    ].join(""));

    var Applets = require("works/collections/applet_simples");

    var BackdropView = require("components/backdrop/backdrop");

    var Template = require("hgn!works/components/app_home/templates/app_home_side_shortcuts");

    var View = BackdropView.extend({

        tagName: "section",
        className: "side_nav",

        initialize: function (options) {
            this.applets = options.applets;
            this.favorites = new Applets([], {
                url: GO.config("contextRoot") + "api/works/applets/favorites"
            });
            $.when(this.applets.fetch(), this.favorites.fetch()).done($.proxy(function () {
                this.originalFavorites = this.favorites.clone();
                this._onSyncApplets();
            }, this));
        },

        events: {
            "click [el-shortcuts]": "_onClickShortcuts",
            "click [el-works-home]": "_onClickWorksHome",
            "click [el-applet]": "_onClickApplet",
            'click #btn-search': '_searchAppName',
            'keyup #appName': '_onKeyupSearch',
            'focus #appName': '_focusInSearchWrap',
            'focusout #appName': '_focusOutSearchWrap'
        },

        render: function () {
            this.$el.html(Template({
                lang: lang
            }));

            return this;
        },

        _onClickShortcuts: function (event) {
            if (!this.shortcutsLayer) {
                this._initBackdrop(event);
            }
        },

        _onClickWorksHome: function () {
            GO.router.navigate("works", true);
            this.remove();
        },

        _initBackdrop: function (event) {
            this.shortcutsLayer = this.$("[el-backdrop]");
            this.backdropToggleEl = this.shortcutsLayer;
            this.bindBackdrop();
            this.linkBackdrop(this.$("[el-shortcuts]"));
        },

        _onSyncApplets: function () {
            this.favorites.mergeAppletToFavorite(this.applets);
            this._renderApplets();
        },

        _renderApplets: function () {
            this.favorites.each(function (model) {
                this.$("ul[el-applets]").append(AppletItemTmpl.render({
                    model: model.toJSON()
                }));
            });
        },

        _onClickApplet: function (event) {
            event.stopPropagation();
            var appletId = $(event.currentTarget).attr("data-id");
            GO.router.navigate("works/applet/" + appletId + "/home", true);
            this.remove();
        },

        _onKeyupSearch: function (e) {
            if (e.keyCode != 13 && !_.isEmpty($('#appName').val())) {
                return;
            }
            this._searchAppName(e);
        },

        _searchAppName: function (e) {
            var keyword = $('#appName').val().trim();
            if (_.isEmpty(keyword)) {
                this.applets.setType('base');
            } else {
                this.applets.setType('search');
            }
            this.applets.setKeyword(keyword);

            $.when(this.applets.fetch({reset: true})).done($.proxy(function () {
                this.$("ul[el-applets]").empty();
                if (_.isEmpty(keyword)) {
                    this.favorites = this.originalFavorites.clone();
                    this._onSyncApplets();
                } else {
                    this.applets.each(function (model) {
                        this.$("ul[el-applets]").append(AppletItemTmpl.render({
                            model: model.toJSON()
                        }));
                    });
                }
            }, this));
        },

        _focusInSearchWrap: function (e) {
            this.$('#appNameSearchWrap').addClass('search_focus');
        },
        _focusOutSearchWrap: function (e) {
            this.$('#appNameSearchWrap').removeClass('search_focus');
        }
    });

    return View;
});
