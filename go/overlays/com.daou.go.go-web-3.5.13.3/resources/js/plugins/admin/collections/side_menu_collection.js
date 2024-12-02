define('admin/collections/side_menu_collection', function (require) {

    var Backbone = require('backbone');
    var GO = require('app');
    var _ = require('underscore');

    var sideMenu = require("json!admin/side_menu_new.json");
    var sideMenuCustom = require("json!admin/side_menu_new.custom.json");
    var SideMenuModel = require("admin/models/layout/side_menu");
    var FavoriteMenuCollection = require("admin/collections/favorite_menus");

    var SideMenuCollection = Backbone.Collection.extend({

        initialize: function () {
            this.getInaccessibleMenus();
            this.initInAccessApp();
            this.initServiceAdminMode();
            this.initSideMenus();
        },
        initFavorite: function () {
            for (var i = 0; i < this.arrayModels.length; i++) {
                this.arrayModels[i].favorite = false;
            }
            this.favoriteMenus = new FavoriteMenuCollection();
            this.favoriteMenus.fetch({async: false});

            for (var i = 0; i < this.favoriteMenus.length; i++) {
                var menu = this.findMenu(this.favoriteMenus.models[i].getMenuKey());
                if (menu) {
                    menu.favorite = true;
                }
            }
        },
        addToArrayModels: function (model) {
            this.arrayModels[this.modelIdx++] = model;
            var _self = this;
            if (model.childs) {
                _.forEach(model.childs, function (cm) {
                    if (!model.accessible) {
                        cm.accessible = false;
                    }
                    _self.addToArrayModels(cm);
                })
            }
        },
        addToSubMenuModel: function (model) {
            var _self = this;
            if (model.subMenu) {
                _.forEach(model.subMenu, function (sm) {
                    _self.arraySubMenus[_self.subModelIdx++] = sm;
                });
            }
        },
        initArrayMenus: function () {
            this.arrayModels = [];
            this.arraySubMenus = [];
            this.modelIdx = 0;
            this.subModelIdx = 0;
            var _self = this;
            _.forEach(this.models, function (model) {
                _self.addToArrayModels(model);
            });
            _.forEach(this.arrayModels, function (model) {
                _self.addToSubMenuModel(model);
            });
        },
        initSideMenus: function () {
            this.models = [];
            for (var i = 0; i < sideMenu.length; i++) {
                this.models.push(new SideMenuModel(sideMenu[i], this.inaccssibleMenus, this.inAccessibleApps, 0, this.serviceAdminMode));
            }

            for (var i = 0; i < sideMenuCustom.length; i++) {
                var customMenu = sideMenuCustom[i];
                var parent = this.findParentModel(customMenu.pUid);
                if (parent) {
                    parent.childs.push(new SideMenuModel(customMenu, this.inaccssibleMenus, this.inAccessibleApps, parent.depth + 1, this.serviceAdminMode));
                    continue;
                }
                this.models.push(new SideMenuModel(customMenu, this.inaccssibleMenus, this.inAccessibleApps, 0, this.serviceAdminMode));
            }

            this.models = _.sortBy(this.models, function (model) {
                return model.order;
            });
            this.initArrayMenus();
        },
        findParentModel: function (parentUid, models) {
            models = models || this.models;
            if (!parentUid) {
                return null;
            }

            for (var i = 0; i < models.length; i++) {
                if (models[i].uid == parentUid) {
                    return models[i];
                }

                var childs = models[i].childs;
                if (childs && childs.length > 0) {
                    var result = this.findParentModel(parentUid, childs);
                    if (result) {
                        return result;
                    }
                }
            }
            return null;
        },
        findMenuFromHref: function (href) {
            if (href.length < 1) {
                return undefined;
            }

            var hrefStr = href.indexOf('/') !== 0 ? href : href.substr(1);
            for (var i = 0; i < this.arrayModels.length; i++) {
                if (this.arrayModels[i].href === hrefStr) {
                    return this.arrayModels[i];
                }
            }

            var links = href.split('/');
            var newLink = '';
            if (links.length < 2) {
                return undefined;
            }
            for (var i = 0; i < links.length - 1; i++) {
                if (i > 0) {
                    newLink += '/';
                }
                newLink += links[i];
            }
            return this.findMenuFromHref(newLink);
        },
        findMenu: function (uid) {
            for (var i = 0; i < this.arrayModels.length; i++) {
                if (this.arrayModels[i].getMenuKey() === uid) {
                    return this.arrayModels[i];
                }
            }
            return undefined;
        },
        findSubMenu: function (uid) {
            for (var i = 0; i < this.arraySubMenus.length; i++) {
                if (this.arraySubMenus[i].attributes.uid === uid) {
                    return this.arraySubMenus[i];
                }
            }
            return undefined;
        },
        getFilteringModels: function (keyword) {
            for (var i = 0; i < this.models.length; i++) {
                this.models[i].filtering(keyword, false);
            }
            return this.models;
        },
        getMenus: function () {
            return this.models;
        },
        isAuthorizedRoutingPath: function (routePath) {
            var isAccessbile = _.every(this.arrayModels, function (menu) {
                var unaccessible = menu.getRoutingPath() === routePath && !menu.accessible;
                return !unaccessible;
            });
            return isAccessbile;
        },
        getInaccessibleMenus: function () {
            var self = this;
            $.ajax({
                type: "GET",
                url: GO.contextRoot + "ad/api/domainadmin/auth/menus",
                async: false,
            })
                .done(function (resp) {
                    self.inaccssibleMenus = resp.data;
                })
            return this.inaccssibleMenus;
        },
        initInAccessApp: function () {
            var data = this._getCompanyConfig();
            var license = this._getLicenseConfig();
            this.inAccessibleApps = [];
            if (data && data.config) {
                for (key in data.config) {
                    if (data.config[key] === 'off' || data.config[key] === 'false' || !this._hasLicense(key, license)) {
                        this.inAccessibleApps[this.inAccessibleApps.length] = key;
                    }
                }
            }
        },
        _hasLicense: function (serviceName, license) {
            var licenseServiceMapping = {
                'boardService': 'socialServicePack',
                'communityService': 'socialServicePack',
                'assetService': 'socialServicePack',
                'surveyService': 'socialServicePack',
                'chatService': 'mobileServicePack',
                'pcappService': 'mobileServicePack',
                'mobileService': 'mobileServicePack',
                'mobileAppService': 'mobileServicePack',
                'worksService': 'collaborationServicePack',
                'reportService': 'collaborationServicePack',
                'todoService': 'collaborationServicePack',
                'approvalService': 'approvalServicePack',
                'docfolderService': 'approvalServicePack',
                'ehrService': 'ehrServicePack',
                'smsService': 'smsServicePack',
                'taskService': 'useTaskService',
                'storeService': 'storeServicePack',
                'allianceSystemService': 'allianceSystemServicePack',
                'openApiService': 'openApiService'
            };

            if (licenseServiceMapping[serviceName] == undefined) { //servicePack 없을떄는 true 반환
                return true;
            }

            if (license[licenseServiceMapping[serviceName]]) {
                return true;
            }
            return false;
        },
        _getLicenseConfig: function () { //license
            var self = this;
            $.ajax({
                type: "GET",
                url: GO.contextRoot + "ad/api/license",
                async: false,
                success: function (resp) {
                    self.licnese = resp.data;
                }
            });
            return self.licnese;
        },
        _getCompanyConfig: function () { //company
            var self = this;
            $.ajax({
                type: "GET",
                url: GO.contextRoot + "ad/api/system-company",
                async: false,
                success: function (resp) {
                    self.appData = resp.data;
                }
            });
            return self.appData;
        },
        initServiceAdminMode: function () {
            var self = this;
            $.ajax({
                type: "GET",
                url: GO.contextRoot + "ad/api/servicemode",
                async: false
            })
                .done(function (response) {
                    self.serviceAdminMode = response.data;
                });
        }

    });
    return SideMenuCollection
});
