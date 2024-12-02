<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ page isELIgnored="false"%>
<%@ taglib prefix="c"  uri="/WEB-INF/tld/c.tld"%>
<%@ taglib prefix="fn"  uri="/WEB-INF/tld/fn.tld"%>
<%@ taglib prefix="fmt"  uri="/WEB-INF/tld/fmt.tld"%>
<%@ taglib prefix="tctl"  uri="/WEB-INF/tld/message.tld"%>
<%
String agent = request.getHeader("user-agent");
agent = (agent == null) ? "" : agent.toUpperCase();
boolean isMsie = (agent.indexOf("MSIE") < 0 && agent.indexOf("TRIDENT") < 0) || agent.indexOf("MAC") > 0 || agent.indexOf("OPERA") > 0 ? false : true;
%>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">

<title>${logoTitle}</title>
<link rel="preload" href="${baseUrl}resources/fonts/notosans/noto-sans-kr-v25-latin_korean-regular.woff2" as="font" type="font/woff2"/>
<link rel="stylesheet" href="${baseUrl}resources/css/fonts/notosans.css?rev=${revision}" media="all" />
<link rel="stylesheet" href='${baseUrl}resources/css/jquery-ui-1.8.21.custom.css?rev=${revision}' media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/master_style.css?rev=${revision}" media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/go_style.css?rev=${revision}" media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/go_app_style2.css?rev=${revision}" media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/go_app_style3.css?rev=${revision}" media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/go_nation.css?rev=${revision}" media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/go_print.css?rev=${revision}" media="print" />

<link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
<c:if test="${locale ne 'ko'}">
<link rel="stylesheet" href="${baseUrl}resources/css/go_${locale}.css?rev=${revision}" media="all" />
</c:if>

<!--[if lte IE 8]>
<script src="${baseUrl}resources/js/vendors/html5.js"></script>
<script src="${baseUrl}resources/js/vendors/css3-mediaqueries.js"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/plugins/flot/excanvas.js"></script>
<![endif]-->

<link rel="stylesheet" href="${baseUrl}resources/css/jquery.fancybox.css?rev=${revision}" media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/jquery.fileupload.css?rev=${revision}" media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/tooltipster.bundle.min.css?rev=${revision}" media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/go_customize.css?rev=${revision}" media="all" />
<link rel="stylesheet" href="${baseUrl}resources/css/go_color_${colorstyle}.css?rev=${revision}" media="all" />

<style type="text/css">
.ui-datepicker { width: 17em; padding: 0; display: none;border:2px solid #666; border-radius:6px; background:#fff;z-index: 99 !important;}
span.layer_tail_top {right:39px;}
div.column div.column_second {margin-bottom:8px;}
.TM_attFile {background: none repeat scroll 0 0 #FFFFFF;border: 1px solid #666666;font-size: 12px;height: 20px;width: 100%;}
#nested_file_wrap{list-style-type:none;}
.overlay{z-index:50;}
div.editor_wrap div.optional{right:20px;}
#textContentFrame{border: 1px solid #C9C9C9;padding:0;margin:0;}
dl.preview{width:350px;min-width:350px;}
table#mailWriteAreaTable{margin-bottom:20px}
div.layer_inside span.txt{padding: 0 !important;}
.list_mail001 .mailPadding{padding-left:7px;}
</style>

<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery-1.7.2.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/plugins/jquery.cookie.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/plugins/jstree/jquery.jstree.js?rev=${revision}"></script>

<script type="text/javascript" src="${baseUrl}resources/js/vendors/lodash.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/moment/moment-2.4.0.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/hogan.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/strophe/strophe.js?rev=${revision}"></script>

<script type="text/javascript" src="${baseUrl}resources/js/components/go-webeditor/go-webeditor.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/components/go-webeditor/editors/smarteditor.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/components/go-webeditor/editors/activedesigner.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/vendors/dext5editor/js/dext5editor.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/components/go-webeditor/editors/dext5editor.js?rev=${revision}"></script>

<script>
var mailMsg = {};
jQuery.ajax({
	type:"GET",
	url : "/resources/js/lang/${fn:toLowerCase(fn:replace(locale, '_', '-'))}/mail.json",
	async : false,
	success : function(result) {
		mailMsg = result;
	},
	dataType:"json"
});
</script>

<c:if test="${profile eq 'development'}">
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/common-base64.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/common.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/validate.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/common-form.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/common-editor.js?rev=${revision}"></script>

<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery-ui-1.8.21.custom.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.placeholder.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.history_new.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.fancybox.pack.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.jqplugin.1.0.2.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.ui.widget.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.fileupload.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.fileDownload.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/jquery.iframe-transport.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/handlebars-1.0.rc.1.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/handlebars-helper.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/tooltipster.bundle.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/go-popup.js?rev=${revision}"></script>
</c:if>

<c:if test="${profile ne 'development'}">
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/common-header-all.min.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/libs/ext-header-all.min.js?rev=${revision}"></script>
</c:if>

<script type="text/javascript" src="${baseUrl}resources/js/plugins/mail/common/common-google-analytics.js?rev=${revision}"></script>

<script type="text/javascript" src="${baseUrl}resources/js/libs/go-notification.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/libs/go-util.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/libs/go-nav.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/libs/go-calendar.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/libs/go-notice.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/libs/node/go-nodetree.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/libs/node/go-nodelist.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/libs/node/go-org.js?rev=${revision}"></script>
<script type="text/javascript" src="${baseUrl}resources/js/libs/node/go-orgslide.js?rev=${revision}"></script>

<script type="text/javascript">
var BASEURL = "${baseUrl}";
var goHostInfo = this.location.protocol + "//" + this.location.host;
var hostInfo = goHostInfo;
var USEREMAIL = "";
var USERLOGINEMAIL = "";
var USERID = "";
var GO_LOCALE = '${locale}';
var LOCALE = getMailLocale(GO_LOCALE);
var CURRENT_PAGE_NAME = "NORMAL";
var TITLENAME = "${logoTitle}";
var activeXMake = ${activeXMake};
var activeXUse = false;
var useGroupForwarding = ${empty useForwardingAddress ? false : useForwardingAddress};
var useAutoreply = ${empty useAutoreply ? false : useAutoreply};
var useExternal = ${empty useExternalMail ? false : useExternalMail};
var useSharedfolder = ${empty useSharedfolder ? false : useSharedfolder};
var useOrg = false;
var useOrgAccess = false;
var CURRENTMENU = "mail";
var USE_WEBFOLDER = false;
var USE_CONTACT = false;
var USE_CALENDAR = false;
var USE_MAIL = false;
var IS_ERROR=false;
var isDormant = false;
var EDITOR_TYPE = "SmartEditor";
var USERNAME = "";
var USER_EMAIL = "";
var USERPOSITION = "";
var SESSION_ID = 0;
var SERVER_TIMEZONE = "";
var BRANDNAME = "${brandName}";

var BASECONFIG;
var USERSESSION;

var POPUPWRITE = false;
var POPUPREAD = false;
var currentAppName = "";
var POPUPTITLENAME = TITLENAME;
var TABLET = ${device eq 'tablet'};
var MOBILE = ${device eq 'mobile'};

var WEBREVISION = "${revision}";

var MAIL_EXPOSURE = true;

var USE_OAUTH_LOGIN = ${useOauthLogin eq 'true'};
var USE_MINI_GNB = ${useMiniGnb eq 'true'};

var USE_LAB_FEEDBACK = ${useLabFeedback eq 'true'};
var HAS_LAB_FEEDBACK_CONFIG = ${hasLabFeedbackConfig eq 'true'};

//moment 로케일 초기화
moment.lang({"ko": 'ko', "jp": 'ja', "cn": 'zh-cn', "tw": 'zh-tw'}[LOCALE]);
jQuery.datepicker.setDefaults(jQuery.datepicker.regional[LOCALE]);

jQuery.ajax({
	type:"GET",
	url : "/api/userside/baseconfig",
	async : false,
	success : function(data) {
		BASECONFIG = data;
	},
	error: function(resp) {
		var respObj = JSON.parse(resp.responseText);
		if (respObj.name == 'common.unauthenticated.concurrent') {
			location.href = '/login?causereturnUrl=/app/mail&cause=concurrent';
		}
	}
});

jQuery.ajax({
	type: "GET",
	async : false,
	url: "/api/user/session",
	success: function(result){
		if (result.code == "200") {
			USERSESSION = result.data;
			SESSION_ID = USERSESSION.id;
			USERID = USERSESSION.userLoginId;
			USERNAME = USERSESSION.name;
			USEREMAIL = USERSESSION.email;
			USER_EMAIL = USERSESSION.email;
			USERLOGINEMAIL = USERSESSION.email;
			USERPOSITION = USERSESSION.position;
			SERVER_TIMEZONE = USERSESSION.timeZone.serverTZOffset;
			useOrg = USERSESSION.useOrg;
			useOrgAccess = USERSESSION.useOrgAccess;

			useSharedfolder = (useOrg) ? useSharedfolder : false;
		}
	},
	dataType: "json"
});

var google = new GoogleAnalytics("${gaTrackerId}", USERID);
<c:if test="${!empty gaTrackerId}">
google.init();
</c:if>

function getGoUserConfig() {
	var themeClass = "go_skin_default go_mail";
	if (USERSESSION.theme == "THEME_ADVANCED") {
		themeClass += " go_skin_advanced";
	}
	jQuery("body").removeClass().addClass(themeClass);

	var menus = BASECONFIG.data.menuConfigModel;
	var displayConfig = BASECONFIG.data.displayConfigModel;
	var logoImg = jQuery("<img class='logo'/>").attr("src",displayConfig.thumbSmall).attr("title",TITLENAME).attr("alt",TITLENAME);
	jQuery("#mail_title_logo").html(logoImg);
	POPUPTITLENAME = displayConfig.webTitle;

	if (menus != null) {
		for (var i=0; i<menus.length; i++) {
			if (menus[i].appName == "webfolder" && menus[i].status == "online") {
				USE_WEBFOLDER = true;
			}
			if (menus[i].appName == "contact" && menus[i].status == "online") {
				USE_CONTACT = true;
			}
			if (menus[i].appName == "calendar" && menus[i].status == "online") {
				USE_CALENDAR = true;
			}
			if (menus[i].appName == "mail" && menus[i].status == "online") {
				if(CURRENTMENU == "file") {
					jQuery("#sendMailButton").show();
				}
				USE_MAIL = true;
			}
			if(menus[i].appName == CURRENTMENU) {
				setTopMenuPosition(CURRENTMENU);

				if(menus[i].name != undefined) {
					currentAppName = menus[i].name;
				} else if(LOCALE == "ko") {
					currentAppName = menus[i].koName;
				} else if (LOCALE == "jp") {
					currentAppName = menus[i].jpName;
				} else if(LOCALE =="en") {
					currentAppName = menus[i].enName;
				} else if(LOCALE == "cn") {
					currentAppName = menus[i].zhcnName;
				} else if(LOCALE == "tw") {
					currentAppName = menus[i].zhtwName;
				}
				if(currentAppName == "") {
					currentAppName = menus[i].koName;
				}
				TITLENAME = currentAppName + " - " + displayConfig.webTitle ;
				setTitleBar(TITLENAME);
			}
		}
	}
    // GO-41077
    USE_WEBFOLDER = BASECONFIG.data.webFolderAvailable;
	jQuery("#myInfoArea").show();
}

function getGoUserConfigForPopup() {

	getMailExposure();

	var menus = BASECONFIG.data.menuConfigModel;
	if (menus != null) {
		for (var i=0; i<menus.length; i++) {
			if (menus[i].appName == "webfolder" && menus[i].status == "online") {
				USE_WEBFOLDER = true;
			}
			if (menus[i].appName == "contact" && menus[i].status == "online") {
				USE_CONTACT = true;
			}
			if (menus[i].appName == "calendar" && menus[i].status == "online") {
				USE_CALENDAR = true;
			}
		}
	}
    // GO-41077
    USE_WEBFOLDER = BASECONFIG.data.webFolderAvailable;
}

function getUseWebfolder() {
	return USE_WEBFOLDER;
}

function getUseContact() {
	return USE_CONTACT;
}

function getUseCalendar() {
	return USE_CALENDAR;
}

function getGoNotiCount() {
	jQuery.get("/api/home/noti/new", function(data) {
		var count = 0;
		if (data.code == "200") {
			count = data.data;
		}
		if(count==0){
			jQuery("#go_noti_count").parent().data("location","/app/noti");
		}else{
			jQuery("#go_noti_count").parent().data("location","/app/noti/unread");
		}
		jQuery("#go_noti_count").text(count);
		jQuery("#noti-count-badge").text(count);
        jQuery('#noti-count-badge').css("display", count == 0 ? "none" : "inline-block");
	});
}

function setTitleBar(title){
	if(POPUPWRITE) {
		document.title=mailMsg.mail_write + " - " + POPUPTITLENAME;
		POPUPWRITE = false;
	} else {
		document.title= title;
	}
}

function makeHeaderEvent() {
	jQuery("#mail_topmenu_header").off();
	jQuery("#mail_topmenu_header").on("click","a",function(event) {
		var type = jQuery(this).attr("evt-rol");
		if (!type) return;

		event.preventDefault();
		if (type == "execute-url") {
			var type = jQuery(this).data("type");
			var url = jQuery(this).data("location");
			if (jQuery("#topmenu_mail").hasClass("on") && !IS_ERROR) {
				checkEscapeWriteMode(function () {
					redirectMenuUrl(type, url);
				});
			} else {
				redirectMenuUrl(type, url);
			}
		}else if(type=="toggle-top-menu"){
			jQuery("#mail_topmenu_header #gnbTopMenu").toggle();
		}else if(type=="toggle-sub-menu"){
			var subName= jQuery(this).data("app-name");
			jQuery(this).parent().toggleClass("on");
			jQuery("#mail_topmenu_header #submenu_"+subName).toggle();
		}
	});

	jQuery("#mail_topmenu_header").on("mouseleave",".gnb_top_menu",function(event) {
		jQuery(this).parent().removeClass("on");
		jQuery(this).hide();
	});
}

function redirectMenuUrl(type, url) {
	if (type == "iframe") {
		window.location = "http://"+this.location.host+"/app/sitelink?url="+url;
	}else if (type =="new"){
		window.open(url);
	} else {
		if (url.indexOf("/") == 0) {
			window.location = url;
		} else if (url.indexOf("http://") >-1){
			window.location = url;
		}else {
			window.location = "/"+url;
		}
	}
}

function executeGoNoti() {
	jQuery.get("/api/bosh/user", function(resp) {
	    var resourceName = ["go_web", "${goUserId}", Math.ceil(Math.random() * 100)].join("_"),
	        JID = [resp.data.jid, resourceName].join("/"),
	        protocol = location.protocol,
            boshPort = (protocol === 'https:' ? "443" : "80"),
	        // BOSH 서버의 pathname(기본은 http-bind)
	        boshPathname = "http-bind/",
	        boshUrl = [location.protocol, "//", location.hostname, ":", boshPort, "/", boshPathname ].join("");

	    // 기존에 객체가 생성되어 있다면 자원을 먼저 해제해서 불필요한 자원이 사용되는 것을 방지한다.
	    if(window["GO_Notification"]) {
	        window["GO_Notification"].release();
	    }

	    // GONotification 객체 생성
	    var notification = new GONotification( boshUrl, { jid: JID, password: resp.data.subInfo } );
	    // 실행
	    notification.run();

	    // 전역객체로 등록
	    window["GO_Notification"] = notification;
	    jQuery(document).on( 'web-noti:confirm', function(e,notiObj) {
	    	if(CURRENTMENU=="mail"){
	    	checkEscapeWriteMode(function() {
	    		 moveNotiLink (notiObj);
	    	    });
	    	}else{
	    		 moveNotiLink (notiObj);
	    	}
	    });
	});
}
function moveNotiLink (notiObj){
	var openNewWindow = window.open("about:blank");
	openNewWindow.location.href = notiObj.model.linkUrl;
    notiObj.close();
}
function viewHelp(){
	window.open( "/help/"+ GO_LOCALE +"/service/tms_book.html", "help", "width=1050,height=700,status=yes,scrollbars=no,resizable=no");
}
function makeTopmenu(){
	var useHelp = (LOCALE == "ko" || LOCALE == "jp");
	var menuLocale = {"useHelp":useHelp};
	jQuery("#gnbTopMenu").html(getHandlebarsTemplate("mail_topmenu_list_tmpl",menuLocale));
}

function setWideMode(){
    jQuery('body').addClass('go_workspace_wide');
    jQuery('#organogram').hide();
}

function setNormalMode(){
    jQuery('body').removeClass('go_workspace_wide');
    jQuery('#organogram').show();
}


function setNavigator() {
	var self = this,
		baseConfig = BASECONFIG.data;

	if(!baseConfig.contextRoot) baseConfig.contextRoot = "/";
	if(!baseConfig.locale) baseConfig.locale = LOCALE;

	var integratedCompanies = [];
	var companies = USERSESSION.companies;
	companies = (!companies) ? [] : companies;
	for (var i=0; i < companies.length; i++) {
        if (companies[i].userId) {
            integratedCompanies.push(companies[i]);
        }
    }

	session = USERSESSION;

	GONavigation.create('nav-placeholder', {
		"session": session,
		"companies": integratedCompanies,
		"baseConfig": baseConfig,
		"activeMenu": CURRENTMENU,
		"lang": {
			"휴면": mailMsg.mail_nav_dormant,
			"관리": mailMsg.mail_nav_management,
			"로그아웃": mailMsg.mail_nav_logout,
			"알림": mailMsg.mail_nav_noti,
			"대시보드 편집": mailMsg.mail_nav_dashboardadm,
			"기본정보": mailMsg.mail_nav_basicinfo,
			"환경설정": mailMsg.mail_nav_setting,
			"보안설정": mailMsg.mail_nav_device,
			"도움말": mailMsg.mail_nav_help,
			"업데이트 확인하기": mailMsg.mail_nav_help_click,
			"님": mailMsg.mail_nav_sir,
			"멀티컴퍼니 열기" : mailMsg.mail_multi_company_open,
			"멀티컴퍼니 닫기" : mailMsg.mail_multi_company_close,
			"워크스페이스 확장" : mailMsg.mail_workspace_wide,
			"워크스페이스 기본" : mailMsg.mail_workspace,
			"메뉴" : mailMsg.mail_menu,
			"관리자 페이지" : mailMsg.mail_nav_admin_page
		},
		"onMovePage": function() {
			var deferred = jQuery.Deferred();

			if(CURRENTMENU == "file") {
				return deferred.resolve(true);
			}
		   	if(checkEscapeWriteModeForTopmenu()) {
				return deferred.resolve(true);
		   	}
		   	jQuery.goConfirm("",mailMsg.confirm_escapewrite, //GO-15230
                function() {
            	 	deleteAllHugeFile();
	                destroyBasicUploadControl();
	                destroyMassUploadControl();
	                destoryEditorControl();
	                hideAutoComplate();

	                deferred.resolve(true);
                },
                function () {
                	deferred.reject();
                }
            );

		    return deferred;
		},
		"brandName" : BRANDNAME,
        "useOauthLogin" : USE_OAUTH_LOGIN,
        "useMiniGnb" : USE_MINI_GNB,
		"onWorkspaceWide" : function() {
			jQuery('body').addClass('go_workspace_wide');
			jQuery('#organogram').hide();
		},
		"onWorkspaceNormal" : function() {
			jQuery('body').removeClass('go_workspace_wide');
			jQuery('#organogram').show();
		}
	});

    if (isDormant) {
		jQuery('body').addClass('go_workspace_wide');
		jQuery('#organogram').hide();
    }
}

function checkEscapeWriteModeForTopmenu(){
	if(isDormant) {
		return true;
	}
    if(currentMenu == "write"){
        if(isWriteModify()){
            return false;
        } else {
        	destroyBasicUploadControl();
        	destroyMassUploadControl();
        	destoryEditorControl();
            hideAutoComplate();
            return true;
        }
    } else {
        return true;
    }
}

function initNotice() {
	var baseConfig = BASECONFIG.data;

	if(!baseConfig.contextRoot) baseConfig.contextRoot = "/";

	jQuery.goNotice.render({
        "contextRoot" : baseConfig.contextRoot
    });
}

function getMailExposure() {
	MAIL_EXPOSURE = BASECONFIG.data.mailExposure===undefined?true:BASECONFIG.data.mailExposure;
	return MAIL_EXPOSURE;
}

jQuery.ajaxPrefilter(function(options, originalOptions, jqXHR) {
	jqXHR.originalRequestOptions = originalOptions;
});

jQuery(document).ajaxError(function(e, xhr, settings, exception) {
    if (!xhr.ignoreProcessLoader) {
        removeProcessLoader();
    }
	if (xhr.status == 401) {
		//otp나 공인인증서로그인 사용시에는 기존 로그인페이지
    	if(BASECONFIG.data.useOtp || BASECONFIG.data.useCert){
    		jQuery.goConfirm(mailMsg.auto_logout, mailMsg.auto_logout_info, function() {
				var url = xhr.getResponseHeader('Location');
				if(url == null){
					window.parent.location = window.parent.location.href;
				}else{
					window.parent.location = url;
				}
    		});
    	}else{
    		var type = xhr.originalRequestOptions.type;
    		var contextRoot = BASECONFIG.data.contextRoot ? BASECONFIG.data.contextRoot : "/";
            url = contextRoot + "simplelogin?type="+type;
            window.open(url,"simpleLogin","width=540,height=650 top="+((screen.height/2)-200)+" left="+((screen.width/2)-180));
    	}
	}
});
</script>
