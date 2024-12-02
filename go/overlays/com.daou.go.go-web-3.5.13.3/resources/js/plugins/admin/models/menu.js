define([
        "backbone"
    ],

    function (
        Backbone
    ) {
        var Menu = Backbone.Model.extend({
            initialize: function () {

            },


            defaults: {
                status: "online",
                location: "self",
                subMenu: [],
                koName: "",
                enName: "",
                jpName: "",
                zhcnName: "",
                zhtwName: "",
                url: ""
            },

            urlRoot: function () {
                return "/ad/api/menu";
            },

            isParent: function () {
                var submenu = this.get("subMenu");
                return submenu && submenu.length > 0;
            },

            isChild: function () {
                return _.has(this.toJSON(), "parentId");
            },

            isPossibleIndent: function () {
                return this.isChild() || (this.isSystemMenu() || this.isLink());
            },

            isSystemMenu: function () {
                return this.get("systemMenu");
            },

            isCategory: function () {
                return !this.isSystemMenu() && this.isSubMenuType();
            },

            isLink: function () {
                return !this.isSystemMenu() && !this.isSubMenuType();
            },

            getMenuType: function () {
                if (this.isCategory()) {
                    return "category";
                } else if (this.isLink()) {
                    return "link";
                } else {
                    return "system";
                }
            },

            hasSubmenu: function () {
                return this.get("subMenu").length > 0;
            },

            hasActiveSubmenu: function () {
                return this.get("activeSubMenu").length > 0;
            },

            isInitial: function () {
                return this.get("initial");
            },

            isActive: function () {
                return this.get("status") == "online";
            },

            isSubMenuType: function () {
                return this.get("subMenuType")
            },

            getAppName: function () {
                return this.get("appName");
            },

            isAppHome: function () {
                return this.getAppName() == "home";
            },

            // 모바일앱 개편으로 모바일에서 새 링크메뉴까지 제공
            isRequireMobileAccess: function () {
                return (this.isSystemMenu() && !this.isSubMenuType() && !this.isAppHome()) || this.isLink();
            },

            isAccessDeviceOptionAll: function () {
                return this.get("accessDeviceOption") == "ALL";
            }
        });

        return Menu;
    });