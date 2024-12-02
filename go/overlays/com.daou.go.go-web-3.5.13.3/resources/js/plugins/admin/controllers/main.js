//사이트어드민
define("admin/controllers/main", function (require) {
    var Layout = require("views/layouts/admin_default");
    var BreadCrumbs = require("admin/views/bread_crumbs");
    var adminLang = require("i18n!admin/nls/admin");
    var SideMenuCollection = require("admin/collections/side_menu_collection");

    require("admin/components/layoutEventListener");

    // Public API
    var AdminController = (function () {
        var Controller = function () {
            var _self = this;
            this.sideMenuCollection = new SideMenuCollection();

            _.forEach(_self.sideMenuCollection.arrayModels, function (model) {
                if (model.childs.length > 1 || !model.getRoutingName()) {
                    return;
                }
                Controller.prototype[model.getRoutingName()] = function extendSideMenuRoute(opt1, opt2, opt3, opt4, opt5) {
                    var opt = model.getOption() ? model.getOption() : {};
                    opt.opt1 = opt1; opt.opt2 = opt2; opt.opt3 = opt3; opt.opt4 = opt4; opt.opt5 = opt5;
                    opt.menus = _self.sideMenuCollection;

                    _self.renderContent(model.getMenuKey(), model.getContentsPath(), adminLang[model.getTitle()], opt);
                };


                _.forEach(model.get('subMenu'), function (subMenu) {
                    Controller.prototype[subMenu.routingName] = function extendSubMenuRoute(id1, id2, id3, id4, id5) {
                        var paramArr = [id1, id2, id3, id4, id5];
                        if (subMenu.idParamName) {
                            var idParamNameArr = subMenu.idParamName.split(",");
                            if (!subMenu.option) {
                                subMenu.option = {}
                            }
                            for (var i in idParamNameArr) {
                                subMenu.option[idParamNameArr[i]] = paramArr[i];
                            }
                        }

                        var title = !subMenu.title ? adminLang[model.getTitle()] : adminLang[model.getTitle()] + '>' + adminLang[subMenu.title];
                        _self.renderContent(subMenu.uid, subMenu.contentsPath, title, subMenu.option);
                    }
                });
            });
        };

        var MenuGroup = {
            APPROVAL: "approval",
            TASK: "task",
            MOBILITY: "mobile",
        };

        Controller.prototype = {

            /**
             * MOBILITY(모빌리티)
             */
            mobileAccessCreate: function () {
                this.renderContent(MenuGroup.MOBILITY + "mobileAccessAll", "admin/views/mobile_access_create", adminLang["허용 모바일 기기 추가"]);
            },

            /**
             * SiteMap
             */
            renderSiteMap: function () {
                this.renderContent("adminSiteMap", "admin/views/layout/sitemap", 'SiteMap', {sideMenuCollection: this.sideMenuCollection});
            },

            /**
             * apns 관리 메뉴
             */
            renderApnsManagerSystem: function () {
                var tpl = '<header class="content_top"><h1><span class="title" id="layoutTitle">' + adminLang["APNS 인증서 관리"] + '</span></h1></header>';
                tpl += '<div id="layoutContent" />';
                $('body').css({'background': 'none', 'padding': '30px'}).html(tpl);
                require(["admin/views/apns_manager"], function (ContentsView) {
                    if ("__instance__" in ContentsView) {
                        (new ContentsView).render();
                    } else {
                        ContentsView.render();
                    }
                });
            },
            /**
             * 시스템관리자 메뉴
             */
            renderDeviceVersionSystem: function () {
                var tpl = '<header class="content_top"><h1><span class="title" id="layoutTitle">' + adminLang["디바이스 버전 관리"] + '</span></h1></header>';
                tpl += '<div id="layoutContent" />';
                $('body').css({'background': 'none', 'padding': '30px'}).html(tpl);
                require(["admin/views/device_version_list"], function (ContentsView) {
                    if ("__instance__" in ContentsView) {
                        (new ContentsView).render();
                    } else {
                        ContentsView.render();
                    }
                });
            },
            renderDeviceVersionCreateSystem: function () {
                var tpl = '<header class="content_top"><h1><span class="title" id="layoutTitle">' + adminLang["버전 추가"] + '</span></h1></header>';
                tpl += '<div id="layoutContent" />';
                $('body').css({'background': 'none', 'padding': '30px'}).html(tpl);
                require(["admin/views/device_version_create"], function (ContentsView) {
                    if ("__instance__" in ContentsView) {
                        (new ContentsView).render();
                    } else {
                        ContentsView.render();
                    }
                });
            },
            renderDeviceVersionModifySystem: function (deviceId) {
                var tpl = '<header class="content_top"><h1><span class="title" id="layoutTitle">' + adminLang["버전 상세"] + '</span></h1></header>';
                tpl += '<div id="layoutContent" />';
                $('body').css({'background': 'none', 'padding': '30px'}).html(tpl);
                require(["admin/views/device_version_create"], function (ContentsView) {
                    if ("__instance__" in ContentsView) {
                        (new ContentsView).render({deviceId: deviceId});
                    } else {
                        ContentsView.render({deviceId: deviceId});
                    }
                });
            },

            /**
             * ACCOUNT MANAGER(통합계정관리)
             */
            renderUploadManager: function () {
                $('#gpopupLayer').remove();
                $('.layer_mini').hide();
                $('body').css({'background': '#F1F1F1'});
                require(["admin/views/uploadManager/upload_manager_popup"], function (ContentsView) {
                    var contentsView = new ContentsView();
                    $('body').html(contentsView.$el);
                    contentsView.render();
                });
            },

            renderContent: function (id, contentsPath, title, option) {

                $('#gpopupLayer').remove();
                $('.layer_mini').hide();

                var self = this;
                var menu = this.sideMenuCollection.findMenu(id);


                if(!menu){
                    var subMenu = this.sideMenuCollection.findSubMenu(id);
                    var breadCrumbs = new BreadCrumbs(this.sideMenuCollection.findMenu(subMenu.parentUid), this.sideMenuCollection);
                    breadCrumbs.setSubMenu(adminLang[subMenu.title], subMenu.href);
                }else{
                    var breadCrumbs = new BreadCrumbs(menu, this.sideMenuCollection);

                }
                option = option ? option : {};
                option.bc = breadCrumbs;
                breadCrumbs.accessMenu();

                (function cleanPrevView() {
                    if (self.view) {
                        self.view.undelegateEvents();
                        self.view.$el.removeData().unbind();
                        self.view.$el.html("");
                    }
                })();

                require([contentsPath], function (ContentsView) {
                    Layout.render().done(function () {
                        self.view = new ContentsView(option);
                        Layout.getContentElement().html(self.view.el);
                        Layout.getTitleElement().html(breadCrumbs.el);

                        breadCrumbs.render();

                        self.view.render();
                        GO.EventEmitter.trigger("admin", "changed:page");
                        $(document).scrollTop(0);
                    });
                });
            },
        };

        return Controller;

    })();

    return new AdminController();

});