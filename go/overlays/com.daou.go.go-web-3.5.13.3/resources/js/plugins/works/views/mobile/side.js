define('works/views/mobile/side', function (require) {

    var Backbone = require('backbone');
    var App = require('app');

    var SideItemView = require('works/views/mobile/side_item');
    var ViewItemView = require('works/views/mobile/side_view_item');

    var SimpleApplets = require('works/collections/applet_simples');

    var SideTmpl = require('hgn!works/templates/mobile/side');

    var commonLang = require('i18n!nls/commons');
    var worksLang = require("i18n!works/nls/works");
    var lang = {
        "favorite": commonLang["즐겨찾기"],
        "Works 뷰": worksLang["Works 뷰"],
        "즐겨찾는 앱": worksLang["즐겨찾는 앱"],
        "전체 앱": worksLang["전체 앱"],
        "검색키워드를입력하세요": commonLang['검색 키워드를 입력하세요.']
    };
    var viewLang = [{"리포트": worksLang["이 앱의 리포트"], keyword: 'reports'}];

    var WorksSideView = Backbone.View.extend({
        events: {
            "click span[name=sideItem]": "moveToApp",
            "click a[name=sideViewItem]": "moveToView",
            'click #appNameDelete': "_deleteSearchText",
            'keyup #appName': '_onKeyupSearch',
            'click #appNameSearchBtn': "_searchAppName"
        },

        initialize: function () {
            this.allApps = new SimpleApplets([], {type: 'search'});
            this.favoriteApps = new SimpleApplets([], {url: GO.config('contextRoot') + 'api/works/applets/favorites'});
        },

        render: function () {
            this.packageName = this.options.packageName;
            var self = this;
            var fetchAllApps = this.allApps.fetch();
            var fetchFavoriteApps = this.favoriteApps.fetch();
            var deferred = $.Deferred();

            $.when(fetchAllApps, fetchFavoriteApps).done(function () {
                self.$el.html(SideTmpl({
                    lang: lang
                }));
                self.renderViewItemsView(viewLang, self.$el.find("#worksViewList"));
                self.renderItemsView(self.allApps, self.$el.find("#allAppsList"), {className: 'ic_work'});
                self.renderItemsView(self.favoriteApps, self.$el.find("#favoriteAppsList"), {className: 'ic_favori'});

                deferred.resolveWith(self, [self]);
            });

            return deferred;
        },

        renderViewItemsView: function (collection, target, options) {
            target.empty();
            for (var idx = 0; idx < collection.length; idx++) {
                var viewItemView = new ViewItemView({
                    model: collection[idx],
                    className: ''
                });
                target.append(viewItemView.render().el);
            }
        },

        renderItemsView: function (collection, target, options) {
            target.empty();
            _.each(collection.models, function (model) {
                var sideItemView = new SideItemView({
                    model: model,
                    className: options['className']
                });
                target.append(sideItemView.render().el);
            }, this);
        },

        moveToApp: function (e) {
            var appletId = $(e.currentTarget).attr("data-id");
            App.router.navigate("works/applet/" + appletId + "/home", true);
        },

        moveToView: function (e) {
            if (this.appletId) {
                var keyword = $(e.currentTarget).attr("keyword");
                App.router.navigate("works/applet/" + this.appletId + "/" + keyword, true);
            }
        },

        _onKeyupSearch: function (e) {
            e.preventDefault();
            if (e.keyCode != 13 && !_.isEmpty($('#appName').val())) {
                return;
            }
            this._searchAppName();
        },

        _searchAppName: function () {
            var keyword = $('#appName').val().trim();
            this.allApps.setKeyword(keyword);

            this.$("#allAppsList").empty();
            this.$("#worksViewList").empty();

            $.when(this.allApps.fetch({reset: true})).done($.proxy(function () {
                if (_.isEmpty(keyword)) {
                    this.$("h3> .btn_wrap").show();
                    this.renderViewItemsView(viewLang, this.$el.find("#worksViewList"));
                    this.renderItemsView(this.allApps, this.$el.find("#allAppsList"), {className: 'ic_work'});
                    this.renderItemsView(this.favoriteApps, this.$el.find("#favoriteAppsList"), {className: 'ic_favori'});
                } else {
                    this.$("h3> .btn_wrap").hide();
                    this.$("#favoriteAppsList").empty();
                    this.renderItemsView(this.allApps, this.$el.find("#allAppsList"), {className: 'ic_work'});
                }
            }, this));
        },
        _deleteSearchText: function (e) {
            e.preventDefault();
            $('#appName').val('');
            this._searchAppName();
        }
    }, {
        __instance__: null,
        create: function (packageName) {
            this.__instance__ = new this.prototype.constructor({'packageName': packageName});//if(this.__instance__ === null)
            return this.__instance__;
        }
    });

    return WorksSideView;
});
