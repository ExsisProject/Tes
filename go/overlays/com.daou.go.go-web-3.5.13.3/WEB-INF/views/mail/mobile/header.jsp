<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page isELIgnored="false" %>
<%@ taglib prefix="c" uri="/WEB-INF/tld/c.tld" %>
<%@ taglib prefix="fn" uri="/WEB-INF/tld/fn.tld" %>
<%@ taglib prefix="fmt" uri="/WEB-INF/tld/fmt.tld" %>
<%@ taglib prefix="tctl" uri="/WEB-INF/tld/message.tld" %>

<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<meta name="viewport" content="user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, width=device-width, target-densitydpi=medium-dpi" />
<meta name="device" content="${device}">
<meta name="mobileWeb" content="${mobileWeb}">
<meta name="mobileApp" content="${mobileApp}">
<meta name="goAgent" content="${goAgent}">
<title>${logoTitle}</title>
<c:if test="${locale ne 'ko'}">
    <link rel="stylesheet" href="${baseUrl}resources/css/go_m_${locale}.css?rev=${revision}" media="all"/>
</c:if>

<link rel="stylesheet" href="${baseUrl}resources/css/go_nation.css?rev=${revision}" media="all"/>
<link rel="stylesheet" href="${baseUrl}resources/css/go_m_customize.css?rev=${revision}" media="all"/>
<link rel="stylesheet" href="${baseUrl}resources/css/go_m_style.css?rev=${revision}" media="all"/>
<link rel="stylesheet" href="${baseUrl}resources/css/go_m_style_big.css?rev=${revision}" media="all" id="systemBigStyle"
      disabled/>
<link rel="stylesheet" href="${baseUrl}resources/css/go_m_style_bigger.css?rev=${revision}" media="all"
      id="systemBiggerStyle" disabled/>
<link rel="stylesheet" href="${baseUrl}resources/css/go_iscroll.css?rev=${revision}" media="all"/>
<link rel="stylesheet" href="${baseUrl}resources/css/mail.css?rev=${revision}" media="all"/>

<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery-1.7.2.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/plugins/jquery.cookie.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/moment/moment-2.4.0.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/lodash.js?rev=${revision}"></script>

<script>
    var mailMsg = {};
    jQuery.ajax({
        type: "GET",
        url: "/resources/js/lang/${fn:toLowerCase(fn:replace(locale, '_', '-'))}/mail.json",
        async: false,
        success: function (result) {
            mailMsg = result;
        },
        dataType: "json"
    });
</script>

<c:if test="${profile eq 'development'}">
    <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/common.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/validate.js?rev=${revision}"></script>

<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.mobile.custom.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.touchSwipe.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery-ui-1.8.21.custom.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/handlebars-1.0.rc.1.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/handlebars-helper.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.history_new.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/iscroll.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.mobile.autocomplete.js?rev=${revision}"></script>

    <script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mobile/common.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mobile/mail-common.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mobile/mail-action.js?rev=${revision}"></script>

<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/handlebars-mail-helper.js?rev=${revision}"></script>
</c:if>

<c:if test="${profile ne 'development'}">
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/mobile-common-header-all.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/mobile-ext-header-all.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mobile/mobile-common-all.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mobile-mail-all.min.js?rev=${revision}"></script>
</c:if>


<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/common-google-analytics.js?rev=${revision}"></script>
<script>
    if (!sessionStorage.getItem("GO-Agent-mail")) {
        sessionStorage.setItem("GO-Agent-mail", '${goAgent}');
    }
</script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/mobile/mail-func.js?rev=${revision}"></script>
<script type="text/javascript"> /* 목록이 길어질 경우 주소창 숨김 */

window.addEventListener('load', function () {
    setTimeout(scrollTo, 0, 0, 1);
}, false);

window.addEventListener('scroll', function (e) {
    if (this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(function () {
        var scrollY = window.scrollY;
        var scrollToTopBtn = jQuery("#scrollToTop");
        var writeBtn = jQuery("#mailWriteBtn");
        if (this.lastScrollTop == undefined) this.lastScrollTop = 0;
        if (scrollY < this.lastScrollTop && scrollY > 30) {
            if(!hasScrollBar()) return;
            scrollToTopBtn.show();
            this.moveScrollTopBtn(writeBtn.is(":visible") ? "up" : "down");
        } else {
            scrollToTopBtn.hide();
        }
        this.lastScrollTop = scrollY;
    }, 20);
}, false);

function hasScrollBar () {
    return jQuery("#go_content").height() > jQuery(window).height();
};

function moveScrollTopBtn(direction, callback) {
    var scrollTopBtn = jQuery("#scrollToTop");
    var translateY = "translateY(0px)";
    scrollTopBtn.off('transitionend webkitTransitionEnd');
    scrollTopBtn.on('transitionend webkitTransitionEnd', function () {
        if (typeof callback == "function") {
            callback();
        }
    });
    if (direction == "down") {
        translateY = "translateY(+70px)";
    }
    scrollTopBtn.css("-webkit-transform", translateY);
}

var BASEURL = "${baseUrl}";
var GO_LOCALE = '${locale}';
var LOCALE = getMailLocale(GO_LOCALE);
var USEREMAIL = "";
var USERID = "";
var TITLENAME = "${logoTitle}";
var MOBILE_WEB = ${mobileWeb};
var GO_AGENT = "${goAgent}";
var useOrg = false;
var useOrgAccess = false;
var USE_CONTACT = false;
var USE_WEBFOLDER = false;

var TABLET = ${device eq 'tablet'};
var MOBILE = ${device eq 'mobile'};

var SESSION_ID = 0;

var USERNAME = "";

var BASECONFIG;
var USERSESSION;
var MAILCONFIG;

var MAIL_APP_NAME;

var MAIL_EXPOSURE = true;

jQuery.ajaxSetup({
    beforeSend: beforeSendCallback
});

jQuery.ajax({
    type: "GET",
    url: "/api/userside/baseconfig",
    async: false,
    success: function (result) {
        BASECONFIG = result;
        var displayConfig = result.data.displayConfigModel;
        var menus = result.data.menuConfigModel;

        if (menus != null) {
            for (var i = 0; i < menus.length; i++) {
                if (menus[i].appName == "webfolder" && menus[i].status == "online") {
                    USE_WEBFOLDER = true;
                    /* break; */
                }
                if (menus[i].appName == "contact" && menus[i].status == "online") {
                    USE_CONTACT = true;
                    /* break; */
                }
                if (menus[i].appName == "mail" && menus[i].status == "online") {
                    if (menus[i].name != undefined) {
                        MAIL_APP_NAME = menus[i].name;
                    }
                }
            }

            var systemFontsize = result.data.mobileConfig.fontSize;
            if ("BIG" === systemFontsize) {
                jQuery("#systemBigStyle").prop("disabled", false);
                jQuery("#systemBiggerStyle").prop("disabled", true);
            } else if ("BIGGER" === systemFontsize) {
                jQuery("#systemBigStyle").prop("disabled", true);
                jQuery("#systemBiggerStyle").prop("disabled", false);
            } else {
                jQuery("#systemBigStyle").prop("disabled", true);
                jQuery("#systemBiggerStyle").prop("disabled", true);
            }
        }
        // GO-41077
        USE_WEBFOLDER = result.data.webFolderAvailable;
        TITLENAME = displayConfig.webTitle;
        setTitleBar(TITLENAME);

        MAIL_EXPOSURE = result.data.mailExposure === undefined ? true : result.data.mailExposure;
    }
});

//moment 로케일 초기화
moment.lang({"ko": 'ko', "jp": 'ja', "cn": 'zh-cn', "tw": 'zh-tw'}[LOCALE]);

jQuery.ajax({
    type: "GET",
    async: false,
    url: "/api/user/session",
    success: function (result) {
        if (result.code == "200") {
            USERSESSION = result.data;
            SESSION_ID = USERSESSION.id;
            USERID = USERSESSION.userLoginId;
            USEREMAIL = USERSESSION.email;
            USERNAME = USERSESSION.name;
            useOrg = USERSESSION.useOrg;
            useOrgAccess = USERSESSION.useOrgAccess;
        }
    },
    dataType: "json"
});

jQuery.ajax({
    type: "GET",
    url: "/api/mailconfig",
    async: false,
    success: function (result) {
        MAILCONFIG = result.data;
    }
});

var google = new GoogleAnalytics("${gaTrackerId}", USERID);
<c:if test="${!empty gaTrackerId}">
google.init();
</c:if>

function setTitleBar(title) {
    document.title = title;
}

function scrollToTop() {
    jQuery.mobile.silentScroll(0);
}

function beforeSendCallback(xhr) {
    try {
        xhr.setRequestHeader('GO-Agent', GO_AGENT);
    } catch (e) {
    }
}
</script>
