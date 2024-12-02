<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="virwport" content="width=device-width,initial-scale=1">
    <title>${lang.head_title}</title>
    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/fonts/notosans.css?rev=${revision}" media="all">
    <link rel="stylesheet" href="${baseUrl}resources/css/go_style.css?rev=${revision}" media="screen"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/go_color_mint.css?rev=${revision}" media="screen"/>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
    <script type="text/javascript"
            src="${baseUrl}resources/js/vendors/jquery/plugins/jquery.cookie.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/lodash.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/backbone/backbone.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-placeholder.js?rev=${revision}"></script>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <![endif]-->
    <script>
        GO = {};
        GO["contextRoot"] = "${baseUrl}";
    </script>
</head>
<body class="user_front">
<div class="go_wrap go_skin_default go_intro_wrap mint_theme">
    <div class="go_intro wrap_pw_sync">
        <div class="glad_msg">
            <p class="title">${lang.title}</p>
            <p class="desc">${lang.passwordChangeDesc1}<br>${lang.passwordChangeDesc2}</p>
        </div>
        <div class="glad_box">
            <form id="passwordChange" data-forced="${passwordForcedChange}" method="post">
                <div id="fail_message" class="login_msg" style="display:none" data-tag="errorLabel">
                    <span class="ic_error">!</span>
                    <span class="txt not_matching">${lang.password_not_matching}</span>
                    <span class="txt no_password" style="display:none">${lang.no_password}</span>
                </div>
                <div id="invalidCurrent" class="login_msg" style="display:none" data-tag="errorLabel">
                    <span class="ic_error">!</span>
                    <span class="txt">${lang.invalid_current_password}</span>
                </div>
                <div class="change_pw">
                    <label class="title">${lang.current_password}</label>
                    <input type="password" autocomplete="off" class="ipt_login" id="current" name="currentPassword"
                           placeholder="${lang.current_password}">
                </div>
                <div class="change_pw pw_space">
                    <input type="password" autocomplete="off" name="newPassword" id="password" class="ipt_login"
                           placeholder="${lang.new_password}">
                </div>
                <div class="change_pw">
                    <input type="password" autocomplete="off" name="newPasswordConfirm" id="confirm" class="ipt_login"
                           placeholder="${lang.confirm_password}">
                </div>
                <p class="desc">
                    <span class="passwordRule1" data-msg="${lang.passwordRule1}">※ ${lang.passwordRule1}<br></span>
                    ※ ${lang.passwordRule2}
                </p>
                <div class="glad_option" id="useSyncPw" style="display: none;" data-syncPwUsable=${syncPwUsable}>
                    <p class="tit">${lang.checkUseSyncPw}</p>
                    <div class="com_switch">
                        <input id="useSyncPwConfirm" class="" type="checkbox" name="" placeholder="">
                        <label for="useSyncPwConfirm"><div class="checkbox1"></div></label>
                    </div>
                    <p class="desc">${lang.checkUseSyncPwDesc}</p>
                    <div class="wrap_opt_display" style="display: none;">
                        <p class="tit">${lang.multiSiteNamesLabel}</p>
                        <div class="wrap_name_tag">
                            <ul class="name_tag" id="multiSiteNames"></ul>
                        </div>
                        <span class="desc">${lang.adminContactDesc}</span>
                    </div>
                </div>
                <div class="btn_wrap">
                    <a id="submit" class="btn_major_s"><span class="txt">${lang.submit}</span></a>
                    <a id="changeLater" class="btn_minor_s"><span class="txt">${lang.later}</span></a>
                </div>
                <input type="submit" style="visibility:hidden"/>
            </form>
        </div>
    </div>
</div>

<script type="text/javascript">

    $(function () {
        var PasswordChange = Backbone.View.extend({

            el: '#passwordChange',
            failMessage: $('#fail_message'),
            notMatchingMessage: $('#fail_message').find('span.not_matching').text(),
            noPasswordMessage: $('#fail_message').find('span.no_password').text(),
            isForced: function () {
                return this.$el.attr("data-forced") == "true" ? true : false;
            },

            events: {
                "focusout #current": "checkCurrentPassword",
                'click #submit': 'submitPassword',
                'submit': 'submitPassword',
                "click #changeLater": "changeLater",
                'input #useSyncPwConfirm': 'showMultiSiteNames'
            },

            initialize: function () {
                this.$el.find('input[placeholder]').placeholder();
                //IE8,9 placeholder 비밀번호로 인식되는 것 처리
                this.currentPlaceHolder = $('#current').val();
                this.passwordPlaceHolder = $('#password').val();
                this.confirmPlaceHolder = $('#confirm').val();
                this.$el.find("#current").focus();
                this.$("#changeLater").toggle(!this.isForced());
                this.useSyncPw = false;
                this.useHttpsAlways = false;
                var self = this;
                $.ajax({
                    url: GO.contextRoot + "api/login/config",
                    type: 'GET',
                    success: function (response) {
                        if (response.data.scope == "all") {
                            self.useHttpsAlways = true;
                        }
                    }
                });
                if ($("span.passwordRule1").attr("data-msg") == "") {
                    $("span.passwordRule1").hide();
                }
                this.isSyncPwUsable = $("#useSyncPw").attr("data-syncPwUsable") == 'true';
                if (this.isSyncPwUsable) {
                    this.renderIntegratedUserSyncPw();
                }
            },

            renderIntegratedUserSyncPw: function () {
                $("#useSyncPw").show();

                var self = this;
                $.ajax({
                    url : GO.contextRoot + "api/password/sync/config",
                    type: 'GET',
                    success: function(response) {
                        if (response != null) {
                            self.useSyncPw = response.useSyncPw;
                            self.multiSiteNames = response.multiSiteNames;

                            $("#useSyncPwConfirm").prop("checked", self.useSyncPw);
                            self._appendMultiSiteNames(self.multiSiteNames);
                            if (self.useSyncPw) {
                                $(".wrap_opt_display").show();
                            }
                        }
                    }, error: function (response) {
                        var responseData = JSON.parse(response.responseText);
                        if (responseData != null){
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
                $("#multiSiteNames").html(lis);
            },

            showMultiSiteNames: function (e) {
                var $showTarget = $(".wrap_opt_display");
                if ($(e.currentTarget).is(":checked")) {
                    $showTarget.show();
                } else {
                    $showTarget.hide();
                }
            },

            submitPassword: function () {
                //IE8,9 placeholder 비밀번호로 인식되는 것 처리
                if (this.currentPlaceHolder == $('#current').val() &&
                    this.passwordPlaceHolder == $('#password').val() &&
                    this.confirmPlaceHolder == $('#confirm').val()) {
                    this.showFailMessage(this.noPasswordMessage);
                    return false;
                }

                if (!this.verifyPasswordMatching()) {
                    this.showFailMessage(this.notMatchingMessage);
                    return false;
                }

                this.failMessage.hide();

                $.ajax({
                    url: GO.contextRoot + "api/user/password",
                    type: 'PUT',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: this.generateSubmitData(),
                    success: this.redirect,
                    error: this.onSubmitError,
                    context: this
                });

                return false;
            },

            verifyPasswordMatching: function () {
                return $('#password').val() == $('#confirm').val();
            },

            showFailMessage: function (message) {
                this.failMessage.show().find('span.txt').text(message);
            },

            generateSubmitData: function () {
                return JSON.stringify({
                    currentPassword: $("#current").val(),
                    newPassword: $('#password').val(),
                    newPasswordConfirm: $('#confirm').val(),
                    useSyncPw : $("#useSyncPwConfirm").prop("checked")
                });
            },

            getURLParameter: function (key) {
                var pageUrl = location.search.substring(1);
                var variables = pageUrl.split("&");
                for (var i = 0; i < variables.length; i++) {
                    var paramKey = variables[i].split("=");
                    if (key == paramKey[0]) {
                        return paramKey[1];
                    }
                }
            },

            getReturnURL: function () {
                var url = decodeURIComponent(this.getURLParameter("returnUrl"));
                if (url == "undefined") url = GO.contextRoot + "app/home";

                return url;
            },


            redirect: function () {
                var protocol = this.useHttpsAlways ? "https://" : "http://";
                var url = decodeURIComponent(this.getURLParameter("returnUrl"));
                if (url == "undefined") {
                    $.ajax(GO.contextRoot + 'api/menu/init/pc', {
                        method: 'GET',
                        dataType: 'json',
                        contentType: 'application/json',
                        async: false
                    }).done(function (response) {
                        document.location = protocol + location.host + decodeURIComponent(response.data.str);
                    }).fail(function () {
                        document.location = protocol + location.host + GO.contextRoot + "app/home";
                    });
                } else {
                    document.location = protocol + location.host + decodeURIComponent(this.getURLParameter("returnUrl"));
                }
            },


            onSubmitError: function (xhr, status, error) {
                this.showFailMessage($.parseJSON(xhr.responseText).message);
            },


            clearAlert: function (event) {
                /* if(event.keyCode != 13) */
                $("div[data-tag=errorLabel]").hide();
            },


            checkCurrentPassword: function (e) {
                var target = $(e.target);

                if (!target.val()) return;

                var self = this;
                var url = GO.contextRoot + "api/user/passwordcheck";
                var param = {
                    password: target.val()
                };

                $.ajax({
                    url: url,
                    type: 'GET',
                    dataType: 'json',
                    contentType: 'application/json',
                    data: param,
                    success: function () {
                        self.$("#invalidCurrent").hide();
                    },
                    error: function (error) {
                        var response = JSON.parse(error.responseText);
                        self.$("#invalidCurrent").show().find("span.txt").text(response.message);
                    }
                });
            },

            changeLater: function () {
                this.delayedPwChange();
            },

            delayedPwChange: function () {
                var self = this;
                $.ajax({
                    url: GO.contextRoot + "api/user/password/change/delay",
                    type: 'PUT',
                    dataType: 'json',
                    contentType: 'application/json',
                    success: function () {
                        self.redirect();
                    },
                    error: function (error) {
                        self.$("#invalidCurrent").show().find("span.txt").text("${lang.server.fail.error.msg}");
                    }
                });
            }
        });

        new PasswordChange();
    });
</script>
</body>
</html>