define('admin/models/layout/side_menu', function (require) {

    var Backbone = require('backbone');
    var _ = require('underscore');
    var SubMenu = require('admin/models/layout/side_sub_menu');
    var AdminLang = require("i18n!admin/nls/admin");


    var SideNewModel = Backbone.Model.extend({

        initialize: function (options, inAccessableKey, inAccessableApps, depth, serviceAdminMode) {

            this.depth = depth ? depth : 0;
            this.maxDepth = this.depth;
            this.attributes = options;
            this.inAccessableKey = inAccessableKey;
            this.inAccessableApps = inAccessableApps;
            this.serviceAdminMode = serviceAdminMode;
            this.uid = this.get('uid');
            this.adminMenuKey = this.get('adminMenuKey');
            this.labelKey = AdminLang[this.get('labelKey')] ? AdminLang[this.get('labelKey')] : this.get('labelKey');
            this.labelKeyOrigin = this.get('labelKey');
            this.href = this.get('href');
            this.contentsPath = this.get('contentsPath');
            this.routingName = this.get('routingName');
            this.level = this.get('level');
            this.order = this.get('order');
            this.option = this.get('option');
            this.appService = this.get('appService');
            this.favorite = false;
            this.view = true;
            this.childs = [];
            // DO_SAAS 모드에만 지원할 메뉴를 filterMenuUid 배열에 UID를 추가 한다.
            this.filterMenuUid = ['A-h', 'D-n-3'];

            var matchedLevel = this.serviceAdminMode ? 'service' : 'site';
            this.isAccessibleApp = !(this.appService && _.contains(this.inAccessableApps, this.appService));
            var isAccessibleMenuKey = !(this.inAccessableKey && _.contains(this.inAccessableKey, this.uid));
            this.isAccessibleLevel = (GO.session().systemAdmin && !_.contains(this.filterMenuUid, this.uid)) ? true : _.contains(this.level, matchedLevel);

            this.accessible = isAccessibleMenuKey && this.isAccessibleApp && this.isAccessibleLevel;

            var cs = this.get('childs') || [];

            for (var i = 0, child; child = cs[i]; i++) {
                var c = new SideNewModel(child, inAccessableKey, inAccessableApps, this.depth + 1, serviceAdminMode);
                if (c.maxDepth > this.maxDepth) {
                    this.maxDepth = c.maxDepth;
                }
                this.childs[i] = c;
                this.childs[i].parentUid = this.uid;
            }

            this.childs = _.sortBy(this.childs, function (model) {
                return model.order;
            });

            var subMenus = this.get('subMenu');
            this.subMenu = [];

            if (subMenus && subMenus.length > 0) {
                for (var i = 0, sm; sm = subMenus[i]; i++) {
                    this.subMenu[i] = new SubMenu(sm);
                    this.subMenu[i].parentUid = this.uid;
                }
            }

        },
        initViewFlag: function () {
            this.view = true;
            this.keyword = undefined;
            for (var i = 0; i < this.childs.length; i++) {
                this.childs[i].initViewFlag();
            }
        },
        filtering: function (keyword, parentView) {

            if (!this.accessible) {
                return false;
            }

            this.keyword = keyword;
            if (!this.keyword || this.keyword.length < 1) {
                this.initViewFlag();
                return;
            }

            var view = parentView;
            var childView = false;

            if (!view && this.labelKey) {
                var initialStr = this.getInitialityStr(this.labelKey).trim();
                view = this.labelKey.toLowerCase().indexOf(keyword.toLowerCase()) >= 0 || initialStr.indexOf(keyword) >= 0;
            }

            for (var i = 0; i < this.childs.length; i++) {
                childView |= this.childs[i].filtering(keyword, view);
            }

            this.view = view || childView;
            return this.view;
        },
        url: function () {
            return GO.contextRoot + "ad/api/menu/access?" + $.param({'adminMenuKey': this.uid});
        },
        parse: function (res) {
            this.favorite = res.favorite;
        },
        getInitialityStr: function (str) {
            var initialStr = '';
            var sampling = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
            for (var i = 0; i < str.length; i++) {
                if (str[i] === ' ') {
                    initialStr += ' ';
                    continue;
                }
                var index = (str.charCodeAt(i) - 44032) / (21 * 28);

                if (index > 0) {
                    initialStr += sampling.charAt(index);
                }
            }
            return initialStr;
        },
        getMenuKey: function () {
            return this.uid ? this.uid : this.adminMenuKey;
        },
        getMenuGroup: function () {
            return this.parent ? this.parent.id : '';
        },
        getRoutingPath: function () {
            return 'admin.main.' + this.routingName;
        },
        getContentsPath: function () {
            return this.contentsPath;
        },
        getTitle: function () {
            return this.labelKey;
        },
        getRoutingName: function () {
            return this.routingName;
        },
        getOption: function () {
            return this.get('option');
        },
        getFavorite: function () {
            return this.favorite;
        },
        updateFavorite: function (favorite) {
            this.favorite = favorite;
            var self = this;
            $.ajax({
                url: GO.contextRoot + "ad/api/menu/favorite",
                data: JSON.stringify({
                    adminMenuKey: self.getMenuKey(),
                    favorite: self.favorite
                }),
                type: 'PUT',
                async: false,
                contentType: 'application/json',
                success: function (res) {
                    self.favorite = res.favorite;
                    $('body').trigger('favorite.menu.updated');
                }, error: function () {
                    self.favorite = !self.favorite;
                }
            })
        }
    });
    return SideNewModel;
});
