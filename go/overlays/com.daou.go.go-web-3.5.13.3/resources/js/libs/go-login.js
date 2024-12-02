/**
 * jquery cookie plugin. 추후 플러그인 관련 정리하는 곳에 추가
 */
(function ($, document, undefined) {

    var pluses = /\+/g;

    function raw(s) {
        return s;
    }

    function decoded(s) {
        return decodeURIComponent(s.replace(pluses, ' '));
    }

    var config = $.cookie = function (key, value, options) {
        // write
        if (value !== undefined) {
            options = $.extend({}, config.defaults, options);

            if (value === null) {
                options.expires = -1;
            }

            if (typeof options.expires === 'number') {
                var days = options.expires, t = options.expires = new Date();
                t.setDate(t.getDate() + days);
            }

            value = config.json ? JSON.stringify(value) : String(value);

            return (document.cookie = [
                encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
                options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                options.path ? '; path=' + options.path : '',
                options.domain ? '; domain=' + options.domain : '',
                options.secure ? '; secure' : ''
            ].join(''));
        }

        // read
        var decode = config.raw ? raw : decoded;
        var cookies = document.cookie.split('; ');
        for (var i = 0, l = cookies.length; i < l; i++) {
            var parts = cookies[i].split('=');
            if (decode(parts.shift()) === key) {
                var cookie = decode(parts.join('='));
                return config.json ? JSON.parse(cookie) : cookie;
            }
        }

        return null;
    };

    config.defaults = {};

    $.removeCookie = function (key, options) {
        if ($.cookie(key) !== null) {
            $.cookie(key, null, options);
            return true;
        }
        return false;
    };

})(jQuery, document);

var LoginStorage = {

    cookiePath: '/',
    cookieExpire: 30,
    cookieKey: {
        user: {id: 'userLoginId', company: 'userLoginCompany', isStoredInCookie: 'userLoginInfoSaved'},
        admin: {id: 'adminLoginId', company: 'adminLoginCompany', isStoredInCookie: 'adminLoginInfoSaved'},
        system: {id: 'systemLoginId', company: 'systemLoginCompany', isStoredInCookie: 'systemLoginInfoSaved'}
    },

    isLoginInfoSaved: function (category) {
        return ($.cookie(this.cookieKey[category]['isStoredInCookie']) == "true");
    },

    getSavedInfo: function (category, key) {
        if (this.isLoginInfoSaved(category)) {
            return $.cookie(this.cookieKey[category][key]);
        } else {
            return null;
        }
    },

    saveInfo: function (category, key, val) {
        if (_.contains(_.keys(this.cookieKey[category]), key)) {
            var option = {expires: this.cookieExpire, path: this.cookiePath};
            $.cookie(this.cookieKey[category][key], val, option);
            $.cookie(this.cookieKey[category]['isStoredInCookie'], true, option);
        }
    },

    reset: function (category) {
        _.each(this.cookieKey[category], function (val, key, list) {
            $.removeCookie(val, {path: this.cookiePath});
        }, this);
    }
};

$.urlParam = function (name) {
    var results = new RegExp('[\\?&amp;]' + name + '=([^&amp;#]*)').exec(window.location.href);
    if (results) {
        return results[1] || 0;
    } else {
        return 0;
    }
};


var LoginView = Backbone.View.extend({

    loginType: 'user', // user or admin
    concurrentLogoutAlarmCallback: null,
    findPasswordCallback: null,
    LOADING_IMAGE_ID: "popOverlay",

    events: {
        'focus #companySelect': 'onCompanyFocused',
        'blur #companySelect': 'onCompanyBlured',
        'click li.option': 'onCompanySelected',
        'click span.btn_dropdown': 'toggleCompanySelect',
        'click li': 'toggleCompanySelect',
        'click #login_submit': 'submitLogin',
        'click #login_id_save_label': 'toggleSaveLoginId',
        'click #findPwd': 'findPassword',
        'keypress #companySelect': 'submitLoginByEnter',
        'keypress input[type=text]': 'submitLoginByEnter',
        'keypress input[type=password]': 'submitLoginByEnter',
        'submit': 'prohibitFormSubmit'
    },

    getContextRoot: function () {
        try {
            return document.getElementsByTagName('base')[0].attributes[0].nodeValue;
        } catch (err) {
            return "/";
        }
    },

    initialize: function (options) {
        this.options = options;
        if (this.options.loginType) this.loginType = this.options.loginType;
        if (this.options.concurrentLogoutAlarmCallback) this.concurrentLogoutAlarmCallback = this.options.concurrentLogoutAlarmCallback;
        if (this.options.findPasswordCallback) this.findPasswordCallback = this.options.findPasswordCallback;
        this.useHttpsAlways = false;
        var self = this;
        var url = "api/login/config";
        if (this.loginType == 'admin') {
            url = "ad/api/login/config";
        }
        this.contextRoot = GO.contextRoot || this.getContextRoot();
        $.ajax({
            url: this.contextRoot + url,
            type: 'GET',
            success: function (response) {
                if (response.data.scope == "all") {
                    self.useHttpsAlways = true;
                }
            }
        });
    },

    render: function () {
        $('input, textarea').placeholder();
        $('.placeholder').css('color', '#698687');

        if (LoginStorage.isLoginInfoSaved(this.loginType)) {
            this._showSavedInfo();
        }

        if (this.options.oauthLogin) {
            this._setOauthLoginId();
        }

        this._focusCursorToInput();
        if ($.urlParam('cause') == 'concurrent' && this.concurrentLogoutAlarmCallback) {
            this.concurrentLogoutAlarmCallback();
        }
    },

    _showSavedInfo: function () {
        this.options.idInput.val(LoginStorage.getSavedInfo(this.loginType, 'id'));
        this.toggleSaveLoginId();
    },

    _setOauthLoginId: function () {
        var email = $('form[name="oauthForm"] > input[name="email"]').val();
        if ($.trim(email) != '') {
            this.options.idInput.val(email);
        }
    },

    // IE에서 focus 지원되지 않아서, timeout 추가.
    _focusCursorToInput: function () {
        var target;
        if (LoginStorage.isLoginInfoSaved(this.loginType)) {
            target = document.getElementsByName(this.options.pwInput.attr('name'))[0];
        } else {
            target = this.options.idInput;
        }
        setTimeout(function () {
            target.focus();
        }, 10);
    },

    toggleSaveLoginId: function () {
        var toggleTo = !this.options.saveIdCheckbox.attr('checked');
        this.options.saveIdCheckbox.attr('checked', toggleTo);
    },

    _preventDefaultEventHandling: function (e) {
        e = e || window.event;
        if (e.preventDefault) {
            e.preventDefault();
        } else {
            e.returnValue = false;   // older versions of IE (yuck)
        }
        return false;
    },

    _showLoadingImage: function (duration) {
        var loadingTmpl = Hogan.compile('<div class="overlay" id="' + this.LOADING_IMAGE_ID + '"><div class="processing"></div></div>');
        this.$el.append(loadingTmpl.render());
        if (_.isNumber(duration) && duration > 0) {
            setTimeout($.proxy(this._hideLoadingImage, this), duration);
        }
    },

    _hideLoadingImage: function () {
        $('#' + this.LOADING_IMAGE_ID).remove();
    },

    submitLoginByEnter: function (e) {
        if (e.keyCode != 13) return;
        $(e.currentTarget).focusout().blur();
        this.submitLogin();
    },

    prohibitFormSubmit: function () {
        // IE 호환을 위해 submitLoginByEnter에서 form submit을 처리하고 있음. form submit에 의한 처리가 있으면 중복 호출되므로 이는 불필요.
        return false;
    },

    submitLogin: function () {
        this._showLoadingImage();
        this.hideValidationMessage();
        if (this.options.saveIdCheckbox.is(':checked')) {
            LoginStorage.saveInfo(this.loginType, 'id', this.options.idInput.val());
        } else {
            LoginStorage.reset(this.loginType);
        }
        this.processLoginByApiCall();
        return false;
    },

    processLoginByApiCall: function () {
        var url = this.contextRoot;
        if (this.loginType == 'user') {
            url += 'api/login';
        } else if (this.loginType == 'admin') {
            url += 'ad/api/login';
        } else {
            url += 'ad/api/system';
        }

        var loginParams = {};

        loginParams["url"] = url;
        loginParams["type"] = 'POST';
        loginParams["dataType"] = 'json';
        loginParams["contentType"] = 'application/json';
        loginParams["data"] = this.generateSubmitData();
        loginParams["success"] = $.proxy(this.onSubmitSuccess, this);
        loginParams["error"] = this.onSubmitError;
        loginParams["context"] = this;

        var lang = this.getParameterByName('lang');
        if (!!lang) {
            loginParams["headers"] = {'Accept-Language': lang.replace("_", "-")};
        }
        $.ajax(loginParams);
    },

    generateSubmitData: function () {
        var data = {
            username: this.options.idInput.val(),
            password: this.options.pwInput.val(),
            captcha: $('input[name="captcha"]').val(),
            returnUrl: GO.util.XSSFilter(this.getParameterByName('returnUrl'))
        };

        if (this.getParameterByName('lang')) {
            data.locale = this.getParameterByName('lang');
        }

        return JSON.stringify(data);
    },

    getParameterByName: function (name, decode) {
        var dec = true;
        if (typeof decode === 'boolean' && !decode) {
            dec = false;
        }

        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.search);

        if (results) {
            if (dec) {
                return decodeURIComponent(results[1].replace(/\+/g, " "));
            } else {
                return results[1].replace(/\+/g, " ");
            }
        } else {
            return "";
        }
    },

    onSubmitSuccess: function (resp) {
        //세션이 끊기고 심플로그인 팝업창에서 로그인했을때
        if ($('form[data-pagetype]').length > 0) {
            if (this.getParameterByName('type') == "GET") {
                opener.location.reload();
            }
            try {
                var overLay = opener.document.getElementById("popOverlay");
                if (overLay) {
                    $(overLay).remove();
                }
            } catch (e) {

            } finally {
                window.close();
            }
        } else {
            var self = this,
                destProtocol = self.getProtocol(),
                redirectUrl = this.parseRedirectUrl(encodeURI(decodeURIComponent(resp.data.redirect))),
                host = self.getHost();

            if (resp.data.certType == "normal") {
                certModuleInit();
            } else if (resp.data.certType == "regist") {
                document.location = GO.util.XSSFilter(destProtocol + host + redirectUrl);
            } else {
                self._hideLoadingImage();
                if (this.options.oauthLogin) {
                    document.oauthForm.submit();
                } else {
                    document.location = GO.util.XSSFilter(destProtocol + host + redirectUrl);
                }
            }
        }

        return false;
    },

    parseRedirectUrl: function(redirectUrl) {
        if(_.startsWith(redirectUrl, "/")) {
            return redirectUrl;
        }

        return "/" + redirectUrl;
    },

    getHost: function () {
        var host = location.host;
        if (this.loginType == 'admin' && !this.useHttpsAlways) {
            var port = this.getAdminPort();
            host = location.host.split(':')[0] + ":" + port;
        }
        return host;
    },

    getAdminPort: function () {
        var port = 8000;
        $.ajax({
            async: false,
            url: this.contextRoot + "ad/api/port/admin",
            type: 'GET',
            success: function (response) {
                port = response.data.port;
            }
        });

        return port;
    },

    getProtocol: function () {
        var destProtocol = !this.useHttpsAlways ? "http://" : location.protocol + "//";
        return destProtocol;
    },

    onSubmitError: function (xhr, status, error) {
        var response = $.parseJSON(xhr.responseText);
        var message = response.message;
        // 캡차사용하는 경우
        this.showValidationMessage(message);
        if (xhr.status == 423) {
            this.showCaptcha();
        } else {
            if (xhr.status == 400) {
                this.options.pwInput.focus();
            }
        }

        if (response.name === "invalid.company.period") {
            this.showExtensionShortcut();
        }

        this._hideLoadingImage();
        return false;
    },

    showExtensionShortcut: function () {
        if (this.loginType != "user" || !this.isExpirationWithinOneMonth()) {
            return;
        }

        var paymentLoginParams = {};
        paymentLoginParams["url"] = "api/payment/login";
        paymentLoginParams["type"] = "POST";
        paymentLoginParams["dataType"] = 'json';
        paymentLoginParams["contentType"] = 'application/json';
        paymentLoginParams["data"] = this.generateSubmitData();
        paymentLoginParams["success"] = $.proxy(this.onPaymentSumitSuccess, this);

        $.ajax(paymentLoginParams);
    },

    isExpirationWithinOneMonth: function () {
        var restrictCompanyPeriod;
        var restrictCompanyPeriodStart;
        var restrictCompanyPeriodEnd;

        $.ajax({
            async: false,
            url: this.contextRoot + "api/login/company/expiration/config",
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            data: this.generateSubmitData(),
            success: function (response) {
                var data = response.data;
                restrictCompanyPeriod = data.restrictCompanyPeriod || false;
                if (!_.isUndefined(data.restrictCompanyPeriodStart)) {
                    restrictCompanyPeriodStart = data.restrictCompanyPeriodStart;
                }
                if (!_.isUndefined(data.restrictCompanyPeriodEnd)) {
                    restrictCompanyPeriodEnd = data.restrictCompanyPeriodEnd;
                }
            }
        });

        if (restrictCompanyPeriod && !_.isUndefined(restrictCompanyPeriodEnd)) {
            var oneMonthLater = GO.util.toMoment(restrictCompanyPeriodEnd).add('months', 1); // 한달 후
            if (GO.util.isAfterOrSameDate(GO.util.now(), oneMonthLater)) {
                return true;
            }
        }

        return false;
    },

    onPaymentSumitSuccess: function (xhr) {
        $("a.btn_extended").remove();
        var movePaymentBtn = $("<a class='btn_extended' style='color: #fff;background: #000;padding: 7px 14px;margin-left: 22px;font-size: 12px;border-radius: 30px;margin-top: 10px;display: inline-block;'>서비스 연장 바로가기</a>");
        $("div.login_msg").append(movePaymentBtn);
        movePaymentBtn.on("click", function () {
            var data = xhr.data;
            var $form = $("<form action='" + data.url + "/user/sso' target='payment' method='post'><input type='hidden' name='token' value='" + data.token + "'></form>");
            $("body").append($form);
            window.open("about:blank", "payment", "");
            $form.submit();
        });
    },

    showCaptcha: function () {
        var self = this;
        $('.captchaContents').show();
        $('#refreshBtn').unbind('click');
        $('#refreshBtn').bind('click', function () {
            self.refreshCaptcha();
        });
        this.refreshCaptcha();
    },
    refreshCaptcha: function () {
        $.ajax({
            url: GO.contextRoot + "api/captcha",
            type: 'GET',
            success: function (response) {
                $('#captchaImg').attr('src', response.data);
                $('#captcha').val('');
            }
        });
    },
    findPassword: function () {
        this.findPasswordCallback();
    },
    showValidationMessage: function (message) {
        $('span.txt', this.options.failMessageLabel).html(message);
        this.options.failMessageLabel.show();
    },

    hideValidationMessage: function () {
        this.options.failMessageLabel.hide();
    },

    makeCookie: function () {
        $.cookie("changePassword", true, {
            expires: 15,
            path: "/"
        });
    }
});
