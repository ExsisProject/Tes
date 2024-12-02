define(function (require) {
    var $ = require("jquery");
    var Backbone = require("backbone");
    var PasswordConfigModel = require("models/password_config_info");

    var PasswordTmpl = require("hgn!templates/user/user_password");

    var adminLang = require("i18n!admin/nls/admin");
    var commonLang = require("i18n!nls/commons");
    var userLang = require("i18n!nls/user");

    require("jquery.go-popup");
    require("jquery.go-sdk");

    var UserPassword = Backbone.View.extend({
        el: "#content",

        lang: {
            title: userLang["비밀번호 변경 타이틀"],
            passwordChangeDesc1: userLang["비밀번호 변경 설명1"],
            passwordChangeDesc2: userLang["비밀번호 변경 설명2"],
            currentPassword: userLang["현재 비밀번호"],
            newPassword: userLang["새 비밀번호"],
            newPasswordConfirm: userLang["비밀번호 확인"],
            passwordRule1: userLang["비밀번호 변경 추천규칙1"],
            passwordRule2: userLang["비밀번호 변경 추천규칙2"],
            checkUseSyncPw: userLang["겸직자 비밀번호 동기화"],
            checkUseSyncPwDesc: GO.i18n(userLang["겸직자 비밀번호 동기화 설명"], {"arg1": GO.session('name')}),
            multiSiteNamesLabel: userLang["비밀번호 동기화 사이트명"],
            adminContactDesc: userLang["겸직자 비밀번호 동기화 문의"],
            complete: userLang["변경하기"]
        },

        initialize: function () {
            if (GO.config("trustCertification") === true) setSecurePage();
            this.PasswordConfigModel = new PasswordConfigModel();
            this.setSyncPwUsable();
            this.useSyncPw = false;
        },

        render: function () {
            $('#main').css('min-width', "400px");
            $('#main').css('background-image', "none");
            $('#main').attr('class', 'go_skin_default');
            this.$el.html(PasswordTmpl({lang: this.lang}));
            this.$newPassword = this.$el.find("#newPassword");
            this.$newPasswordConfirm = this.$el.find("#newPasswordConfirm");
            this.$failMessage = this.$el.find("#fail_message");

            this.PasswordConfigModel.fetch().done($.proxy(function () {
                var passwordMsg = this._generatePasswordMsg();
                if (passwordMsg == "") {
                    this.$el.find(".passwordRule1").hide();
                }
                this.$el.find("#ruleFromPwConfig").text(passwordMsg);
                if (this.isSyncPwUsable) {
                    this.renderIntegratedUserSyncPw();
                }
            }, this));
        },

        setSyncPwUsable: function () {
            this.isSyncPwUsable = GO.session().integratedCompanies.length > 1;
        },

        renderIntegratedUserSyncPw: function () {
            this.$el.find("#useSyncPw").show();

            var self = this;
            $.ajax({
                url: GO.contextRoot + "api/password/sync/config",
                type: 'GET',
                success: function (response) {
                    if (response != null) {
                        self.useSyncPw = response.useSyncPw;
                        self.multiSiteNames = response.multiSiteNames;

                        self.$el.find("#useSyncPwConfirm").prop("checked", self.useSyncPw);
                        self._appendMultiSiteNames(self.multiSiteNames);
                        if (self.useSyncPw) {
                            self.$el.find(".wrap_opt_display").show();
                        }
                    }
                }, error: function (response) {
                    var responseData = JSON.parse(response.responseText);
                    if (responseData != null) {
                        $.goAlert(responseData.message);
                    }
                }
            });
        },

        _appendMultiSiteNames: function (multiSiteNames) {
            var lis = "";
            _.each(multiSiteNames, function (multiSiteName) {
                lis += "<li class='default_option'><span class='name'>" + multiSiteName + "</span></li>";
            });
            this.$el.find("#multiSiteNames").html(lis);
        },

        showMultiSiteNames: function (e) {
            var $showTarget = this.$el.find(".wrap_opt_display");
            if ($(e.currentTarget).is(":checked")) {
                $showTarget.show();
            } else {
                $showTarget.hide();
            }
        },

        delegateEvents: function (events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("focusout.userconfig", "[name=currentPassword]", $.proxy(this.checkCurrentPassword, this));
            this.$el.on("focusout.userconfig", "[name=newPasswordConfirm]", $.proxy(this.checkNewPasswordConfirm, this));
            this.$el.on("input.userconfig", "#useSyncPwConfirm", $.proxy(this.showMultiSiteNames, this));
            this.$el.on("click.userconfig", "#save", $.proxy(this.saveAction, this));
            this.$el.on("click.userconfig", "#close", $.proxy(this.close, this));
            return this;
        },

        checkNewPasswordConfirm: function () {
            if (this.$newPassword.val() != this.$newPasswordConfirm.val()) {
                this.$failMessage.show().find('span.txt').text(userLang["새비밀번호가 일치하지 않습니다."]);
            } else {
                this.$failMessage.hide();
            }
        },

        checkCurrentPassword: function (e) {
            var El = $(e.target);

            if (!El.val()) return;

            var self = this;
            var url = GO.contextRoot + "api/user/passwordcheck";
            var param = {
                password: El.val()
            };

            $.go(url, param, {
                qryType: 'GET',
                contentType: 'application/json',
                responseFn: function () {
                    self.$el.find("#invalidCurrent").hide();
                },
                error: function (error) {
                    var response = JSON.parse(error.responseText);
                    self.$el.find("#invalidCurrent").show().find("span.txt").text(response.message);
                }
            });
        },

        undelegateEvents: function () {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off(".userconfig");
            return this;
        },

        _save: function () {
            var self = this;
            var url = GO.contextRoot + "api/user/password";
            var params = {
                currentPassword: this.$el.find("#currentPassword").val(),
                newPassword: this.$newPassword.val(),
                newPasswordConfirm: this.$newPasswordConfirm.val(),
                useSyncPw: this.$el.find("#useSyncPwConfirm").prop("checked")
            };

            $.go(url, JSON.stringify(params), {
                qryType: 'PUT',
                contentType: 'application/json',
                responseFn: function (response) {
                    self.complete();
                },
                error: function (error) {
                    var errorObj = JSON.parse(error.responseText);
                    self.$failMessage.show().find('span.txt').text(errorObj.message);
                }
            });
        },

        close: function () {
            window.close();
        },

        reload: function () {
            this.render();
        },


        complete: function () {
            var contentTemplate = [
                '<p class="title" style="margin-top: 56px; font-size: 20px;">',
                commonLang["변경되었습니다."],
                '</p>'
            ];
            var buttonTemplate = [
                '<div class="btn_wrap"><a id="close" class="btn_major_s"><span class="txt">',
                commonLang["닫기"],
                '</span></a></div>'
            ];

            this.$el.find("div.glad_msg").html(contentTemplate.join(""));
            this.$el.find("div.glad_box").html(buttonTemplate.join(""));
        },

        saveAction: function () {
            console.log("password saveAction call !!");

            try {
                this._checkValidation();
                this._save();
            } catch (e) {
                console.log("validation Error :: " + e.message);
            }

            return false;
        },

        _checkValidation: function () {
            this.$el.find("div.login_msg").hide();
            this._checkEmpty();
            this._checkEqual();
        },

        _checkEmpty: function () {
            var self = this;
            _.each(this.$el.find("#passwordForm input"), function (el, key) {
                if ($(el).val() == "") {
                    self.$failMessage.show().find('span.txt').text(commonLang["비밀번호를 입력해주세요"]);
                    el.focus();
                    throw new Error("", "비밀번호를 입력해주세요.");
                }
            });
        },

        _checkEqual: function () {
            if (this.$newPassword.val() != this.$newPasswordConfirm.val()) {
                this.$failMessage.show().find('span.txt').text(userLang["새비밀번호가 일치하지 않습니다."]);
                this.$newPassword.focus();
                throw new Error("", userLang["새비밀번호가 일치하지 않습니다."]);
            }
        },

        _generatePasswordMsg: function () {
            var passwordConfig = this.PasswordConfigModel.attributes;
            var passwordLength = "";
            var pwCheckStr = "";
            var alertMessage = "";

            if (passwordConfig.usePasswordConfig) {
                passwordLength = passwordConfig.minPasswordLength + '~' + passwordConfig.maxPasswordLength;

                if (passwordConfig.mandatoryCharAlphabet) {
                    pwCheckStr += adminLang["EN"];
                }
                if (passwordConfig.mandatoryCharNumber) {
                    pwCheckStr += (pwCheckStr.length > 0) ? ', ' : '';
                    pwCheckStr += adminLang["숫자"];
                }
                if (passwordConfig.mandatoryCharBlank) {
                    pwCheckStr += (pwCheckStr.length > 0) ? ', ' : '';
                    pwCheckStr += adminLang["공백"];
                }
                if (passwordConfig.mandatoryCharSymbol) {
                    pwCheckStr += (pwCheckStr.length > 0) ? ', ' : '';
                    pwCheckStr += adminLang["특수문자"];
                }

                alertMessage = GO.i18n(this.lang.passwordRule1, {"arg1": passwordLength, "arg2": pwCheckStr});
            }
            return alertMessage;
        }
    });

    function setSecurePage() {
        if (location.protocol === 'http:') {
            window.location.replace(location.href.replace('http:', 'https:'));
        }
    }

    return {
        render: function () {
            var userPassword = new UserPassword();
            return userPassword.render();
        }
    };
});