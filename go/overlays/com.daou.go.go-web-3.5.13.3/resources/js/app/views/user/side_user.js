(function () {
    define([
            "jquery",
            "backbone",
            "app",
            "hgn!templates/user/side_user",
            "models/mobile_config",
            "i18n!nls/user",
            "i18n!nls/commons"
        ],
        function (
            $,
            Backbone,
            GO,
            SideUserTmpl,
            MobileConfigModel,
            UserLang,
            CommonLang
        ) {

            var menuRoot = 'app/my',
                UserSideView = Backbone.View.extend({
                    type: {
                        info: UserLang["기본정보"],
                        config: UserLang["환경설정"],
                        noti: UserLang["알림설정"],
                        device: UserLang["보안설정"]
                    },

                    el: "#side",

                    event: {},

                    render: function (selectedButtonName) {
                        var mobileConfig = new MobileConfigModel();
                        mobileConfig.fetch().done($.proxy(function () {
                            this._renderButtons(selectedButtonName, mobileConfig.isMAMEnabled(), mobileConfig.isOTPEnabled());
                        }, this));
                    },

                    _renderButtons: function (selectedButtonName, useAppManagement, otpEnabled) {
                        var isActive = function () {
                            return (selectedButtonName == this.leftName);
                        };
                        var menus = [{
                            leftName: "userProfile",
                            href: menuRoot + '/profile',
                            name: this.type.info,
                            isActive: isActive,
                            klass: "info"
                        }, {
                            leftName: "userConfig",
                            href: menuRoot + '/config',
                            name: this.type.config,
                            isActive: isActive,
                            klass: "config"
                        }, {
                            leftName: "userNoti",
                            href: menuRoot + '/noti',
                            name: this.type.noti,
                            isActive: isActive,
                            klass: "noti"
                        }];

                        if (useAppManagement || otpEnabled) {
                            menus.push({
                                leftName: "userDevice",
                                href: menuRoot + '/device',
                                name: this.type.device,
                                isActive: isActive,
                                klass: "device"
                            });
                        }

                        this.$el.html(SideUserTmpl({
                            contextRoot: GO.contextRoot,
                            gnbTitle: CommonLang['설정'],
                            menus: menus
                        }));

                        if ((GO.util.checkOS() == "ipad") === true && GO.config('mobileService') == "on") {
                            this.$el.append('<a class="app_down" href="/iosapp/link"><span class="ic_ios_down"></span><span class="title">' + CommonLang["iOS 앱 다운로드"] + '</span></a>');
                        } else if ((GO.util.checkOS() == "ipad") === false && GO.config("usePcMessenger") === true) {
                            this.$el.append(
                                '<a class="messenger_down" href="' + GO.contextRoot + 'api/device/package/download">'
                                + '<span class="ic_messenger_down"></span><span class="title">'
                                + CommonLang["PC메신저 다운로드"] + '</span></a>'
                            );
                        }
                    }
                });

            return {
                render: function (option) {
                    var userSideView = new UserSideView();
                    return userSideView.render(option);
                }
            };

        });

}).call(this);
