<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions"  prefix="fn"%>
<%@ taglib prefix="form" uri="http://www.springframework.org/tags/form" %>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="virwport" content="width=device-width,initial-scale=1">
    <meta name="version" content="${ver}">
    <meta name="brandName" content="${brandName}">
    <title>${lang.title}</title>
    <link href="${faviconPath}?rev=${revision}" rel="shortcut icon"/>
    <link rel="stylesheet" href="${baseUrl}resources/css/go_style.css?rev=${revision}" media="screen" />
	<link rel="stylesheet" href="${baseUrl}resources/css/go_login.css?rev=${revision}" media="screen" />
<%-- <link rel="stylesheet" href="${baseUrl}resources/css/go_color_${systemcolorstyle}.css?rev=${revision}" media="screen, print" /> --%>
  	<link rel="stylesheet" href="${baseUrl}resources/css/go_color_mint.css?rev=${revision}" media="screen, print" />
    <%
  	String currentLocale =  (String)request.getAttribute("currentLocale");
  	if(!"ko".equals(currentLocale)){
  	%>
    <link rel="stylesheet" href="${baseUrl}resources/css/go_${currentLocale}.css?rev=${revision}" media="screen, print" />
  	<%
  	}
  	%>

    <link rel="stylesheet" href="${baseUrl}resources/css/go_customize.css?rev=${revision}" media="screen" />
    <%@include file="webapp/custom_index_header.jsp"%>

    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery-ui/js/jquery-ui-1.10.0.custom.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/hogan.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/lodash.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/backbone/backbone.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/moment/moment.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-util.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-popup.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-login.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/app/views/IEInfoView.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-placeholder.js?rev=${revision}"></script>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <![endif]-->
   <style type="text/css">
	div.ie_warp {position: relative;padding:20px 20px;margin:80px auto;width:670px; margin-bottom: 30px;background: #fff;border: 1px solid #babbbb;}
	h1.bi_do {position: absolute; left: 50px; top: 30px; width: 158px; height: 33px;background: url(${baseUrl}resources/images/etc/ie_do.gif) no-repeat 0 0;font-size:0; line-height:0}
	h1.bi_tms {position: absolute; left: 5px; top: -3px; width: 150px; height: 150px;background: url(${baseUrl}resources/images/etc/ie_tms.gif) no-repeat 0 0;font-size:0; line-height:0}
	h2.ci {position: absolute;right:20px;top:15px;width: 110px;height:30px;background: url(${baseUrl}resources/images/etc/ie_logo_daou.png) no-repeat 0 0;font-size:0; line-height:0}
	.btn_ie8_up:hover {opacity:0.9; filter: Alpha(Opacity=90);}
	.browser_box span {display:inline-block; width:67px; height:67px; background: url(${baseUrl}resources/images/etc/ie_3.gif) no-repeat 0 0;}
	.browser_box span.ie8{background-position:0 0}
	.browser_box span.chorme{background-position:-95px 0}
	.browser_box span.firefox{background-position:-194px 0}
	.browser_box span.safari{background-position:-300px 0}
	table {background-color:transparents!importnat}
	table td,table th {text-align:center; padding:10px 0}
	table th {width:25%;}
	table td {padding-top:0px; text-align:center; font-size:11px; color:#989aa0; font-weight:bold; letter-spacing:-1px;}
	</style>
	<script>
		// image preload
		var img = new Image();
		img.src = "/resources/images/img_loader_w.gif";
	</script>
</head>
<body class="user_front" id="bodyPart">
    <p name="description" style="display:none;">${lang.description}</p>
    <div id="noticeBanner" style="display:none;">${frontNoticeContent}</div>
    <div class="go_wrap go_skin_default go_intro_wrap mint_theme">
        <header class="go_header">
            <h1>
            </h1>
            <div id="language_select" class="language">
                <select>
                	<option value="language">${lang.loginLanguage}</option>
                    <c:forEach items="${availableLanguages}" var="l">
                        <option value="${l.key}" ${selectedLocale == l.key ? 'selected' : ''}>${l.value}</option>
                    </c:forEach>
                </select>
            </div>
        </header>

        <div class="go_intro">
            <c:if test="${oauthLogin}">
            <form action="${baseUrl}oauth-authorize" name="oauthForm" method="post">
                <input type="hidden" name="client_id" value="${param.client_id}"/>
                <input type="hidden" name="scope" value="${param.scope}"/>
                <input type="hidden" name="response_type" value="${param.response_type}"/>
                <input type="hidden" name="redirect_uri" value="${param.redirect_uri}"/>
                <input type="hidden" name="state" value="${param.state}"/>
                <input type="hidden" name="email" value="${param.email}"/>
                <input type="hidden" name="device_id" value="${param.device_id}"/>
            </form>
            </c:if>
            <form id="loginForm" method="post">
                <section class="login_box">
	                <div class="sticker">
						<span class="go" title="groupoffice"></span>
						<span style="display:none" title="alpha" class="beta"></span>
						<!-- <span style="display:none" title="TMS 8.1" class="TMS8_1"></span> -->
					</div>

					<div class="custom_visual">
                        <c:if test="${oauthLogin}">
                            <div class="wrap_channel_login">
                                <img src="${baseUrl}resources/images/mint_theme/logo_channel_login.png">
                                <span class="channel_name">${clientName}</span>
                            </div>
                        </c:if>
                        <c:if test="${!oauthLogin}">
                            <img src="${middleImage}">
                        </c:if>
		            </div>

					<div class="login_msg" style="display: none;">
						<span class="ic_error">!</span>
						<span class="txt"></span>
					</div>
                    <fieldset>
                        <legend>login</legend>
						<div class="login_id">
                            <input type="text" id="username" name="username" class="ipt_login login_wide" tabindex="1" placeholder="${lang.account}" onkeyup="javascript:clearAlert(event)" autocapitalize="off" style="ime-mode:inactive;" onpaste="javascript:trimSpace(event)"/>
                        </div>
                        <div class="login_pw">
                            <input type="password" name="password" id="password" autocomplete="off" class="ipt_login" tabindex="3" placeholder="${lang.password}" onkeyup="javascript:clearAlert(event)" onpaste="javascript:trimSpace(event)">
						</div>
						<div class="captchaContents" style="display:none">
							<span class="txt">${lang.descriptionCaptcha}</span>
							<img id="captchaImg" src="" data-pin-nopin="true">
							<input name="captcha" id="captcha" type="text" placeholder="${lang.inputCaptcha}">
							<a title="${lang.imageRefresh}" class="ic ic_refresh_tyep2" id="refreshBtn"></a>
						</div>
                        <a id="login_submit" class="btn_login" tabindex="4" href="#">${lang.loginBoxMsg}</a>
                    </fieldset>

                    <div class="login_check">
                        <span class="option_wrap">
                            <input type="checkbox" name="saveEmail" id="saveLoginId" tabindex="5">
                            <label id="login_id_save_label">${lang.saveLoginId}</label>
                        </span>
                        <c:if test="${passwordSearch eq true}">
                        <span class="option_wrap">|</span>
                        <a class="option_wrap" id="findPwd">${lang.passwordFind}</a>
                        </c:if>
                    </div>
                </section>

                <input type="submit" style="visibility:hidden" />
            </form>

            <section id="wakeup" class="login_box msg_box" style="display:none">
                <div class="sleeping_msg">
                    <p class="title">${lang.sleepingUserTitle}</p>
                    <p class="desc">${lang.sleepingUserDesc}</p>
                </div>
                <div class="btn_box">
                    <a id="submit" class="btn_bk">${lang.wakeup}</a>
                </div>
            </section>
        </div>
    </div>
    <div id="iframeWrap"></div>

	<script type="text/javascript">
		GO = GO || {};
		GO["contextRoot"] = "${baseUrl}";
	</script>

    <script type="text/javascript">
    	$.removeCookie("IsCookieActived", {path : "/"});

		function clearAlert(event){
	    	if(event.keyCode != 13){
		    	var isDisplayAlert = $('.login_msg').css('display');
		    	if(isDisplayAlert != 'none'){
		    		$('.login_msg').css('display', 'none');
                    $('.login_msg').html('<span class="ic_error">!</span><span class="txt"></span>')
		    	}
	    	}
	    }
		function trimSpace(event, target) {
			var target = $(event.currentTarget);
			 setTimeout(function () {
				 target.val(target.val().trim());
		    }, 100);
		}
 		function checkIEUa(agent){
	 		if(agent.indexOf("msie") > -1){
	 			if(agent.indexOf("trident")>-1){
	 				return false;
	 			}else if(agent.indexOf("msie 8.0")>-1){
	 				return false;
	 			}
	 			return true;
	 		}else {
	 			return false;
	 		}
	 	}

 		var ua = window.navigator.userAgent.toLowerCase();
 		//if(ua.indexOf('msie') >= 0 && (ua.indexOf('msie 6.0') >= 0 && ua.indexOf('msie 8.0') < 0  ||  ua.indexOf('msie 7.0') >= 0 ) ){
 		if(checkIEUa(ua)){
			jQuery.goIEInfoView({root : '${baseUrl}', locale : '${currentLocale}' });
 		}else{
	        var Login = $(function (window, global) {

	            var loginView,
	                LanguageSelectView,
	                concurrentLogoutAlarmCallback,
	                findPasswordCallback,
	                findPasswordByAccountCollback;
	            var adviceChangePassword = "${lang.adviceChangePassword}",
	            	passwordConfirm = "${lang.passwordConfirm}";
	           	var changeNow = "${lang.changeNow}";
	           	var changeLater = "${lang.changeLater}";
	           	var oauthLogin = ${oauthLogin ? true : false};

	            LanguageSelectView = Backbone.View.extend({
	                el: '#language_select',
	                events: {
	                    'change': 'changePageLanguage'
	                },

	                changePageLanguage: function() {
	                	var selected = $('option:selected').val();
	                	if (selected == 'language') {
	                		document.location = 'login';
	                	} else {

							document.location = 'login?lang=' + selected;
	                	}
	                }
	            });

	            concurrentLogoutAlarmCallback = function() {
	                $.goPopup({
	        			modal : true,
	        			width: '250',
	                	pid: 'wakeup_confirm',
	        			pclass : 'layer_confim_front layer_multi_login',
	        			message: "${lang.concurrent_logout_message}",
	        			buttons : [{
	        				btext : "${lang.confirm}",
	        				btype : "confirm",
	        				autoclose : true
	        			}]
	        		});
	            };

	            findPasswordCallback = function() {
	            	var tmpl = "<p class='desc'>" + "${lang.passwordFindDesc1}" + "</p>" +
	    								"<table class='form_type'> <tbody><tr><th>" +
	    								"<span class='title'>" + "${lang.account}" + "</span></th>" +
	    								"<td style='text-align:left;'><input id='account_id' class='txt_mini w_max' type='text'></td></tr></tbody></table>";

	            	$.goPopup({
	                    header : "${lang.passwordFind}",
	                    width : 400,
	                    title : "",
	                    pclass : "layer_normal layer_password",
	                    contents : tmpl,
	        			buttons : [{
	        				btext : "${lang.next}",
	        				btype : "confirm",
	        				autoclose : false,
	        				callback : function(popup){
								if(popup.find('#account_id').val().length <= 0){
									popup.find('.txt_error').remove();
									popup.find('#account_id').after("<span class='txt_error'>" + "${lang.inputAccount}"+"</span>");
									return;
								}
	        					findPasswordByAccountCollback(popup);
	        				}
	        			}, {
                            btype: "close",
                            btext : "${lang.close}"
                        }]
	                });
	            };

	            findPasswordByAccountCollback = function(popup) {
	            	var accountInfo = popup.find('#account_id').val();
	            	$.ajax({
	            		url: GO.contextRoot + 'api/email/hint',
                        data: "userAccount=" + accountInfo,
                        type: 'GET',
                        async: false,
                        dataType : 'text',
                        success: function(resp) {
                            if(resp){
    							//외부메일있음
                            	var tmpl = "<p class='desc' data-id='" + accountInfo + "'>" + "${lang.passwordFindDesc2}" + "("+ resp + ")" +"</p>" +
								"<table class='form_type'> <tbody><tr><th>" +
								"<span class='title'>" +"${lang.externalEmail}"+ "</span></th>" +
								"<td style='text-align:left;'><input id='external_email' class='txt_mini w_max' type='text'></td></tr></tbody></table>";

                            	$.goPopup({
                                    header : "${lang.passwordFind}",
                                    width : 400,
                                    title : "",
                                    pclass : "layer_normal layer_password_outside",
                                    contents : tmpl,
                        			buttons : [{
                        				btext : "${lang.next}",
                        				btype : "confirm",
                        				autoclose : false,
                        				callback : function(popup){
                        					if(popup.find('#external_email').val().length <= 0){
                        						popup.find(".txt_error").remove();
            									popup.find('#external_email').after("<span class='txt_error'>" + "${lang.inputExternalEamil}"+"</span>");
            									return;
            								}
                        					sendTempPassword(popup);
                        				}
                        			}]
                                });
                            }else{
                            	$.goPopup({
            	                    header : "${lang.passwordFind}",
            	                    width : 400,
            	                    title : "",
            	                    modal : true,
            	                    contents : "<p class='desc'>" + "${lang.externalEmailEmpty}" + "</p>",
            	        			buttons : [{
            	        				btext : "${lang.close}",
            	        				btype : "normal",
            	        				autoclose : true
            	        			}]
            	                });
                            }
                        }
            		});
            	};

            	sendTempPassword = function(popup) {
            		var externalEmail = popup.find('#external_email').val(),
            			accountInfo = popup.find(".desc").attr('data-id');

            		$.ajax({
	            		url: GO.contextRoot + 'api/email/password',
                        data: "userAccount=" + accountInfo + "&externalEmail=" + externalEmail,
                        type: 'GET',
                        async: false,
                        dataType : 'text',
                        success: function(resp) {
                        	$.goPopup({
        	                    header : "${lang.tmpPasswordTitle}",
        	                    width : 400,
        	                    title : "",
        	                    contents : "<p class='desc'>" + "${lang.tmpPasswordDesc}" + "</p>",
        	        			buttons : [{
        	        				btext : "${lang.confirm}",
        	        				btype : "confirm",
        	        				autoclose : true
        	        			}]
        	                });
                        },
                        error: function(resp){
                        	popup.find(".txt_error").remove();;
                        	popup.find('#external_email').after("<span class='txt_error'>" + JSON.parse(resp.responseText).message +"</span>");
                        	return;
                        }
            		});
            	}

	          	new LanguageSelectView();

				loginView = new LoginView({
					loginType: 'user',
					concurrentLogoutAlarmCallback: concurrentLogoutAlarmCallback,
					findPasswordCallback : findPasswordCallback,
					el: $('form#loginForm'),
					idLabel: $('label#login_id_label'),
					idSaveLabel: $('label#login_id_save_label'),
					idInput: $('input[name="username"]'),
					pwInput: $(':password'),
					saveIdCheckbox: $('#saveLoginId'),
					companyOptions: $('.select_list li.option'),
					selectedCompanyOption: $('.select_list li.on > a'),
					failMessageLabel: $('.login_msg'),
					loginOptions: $('.login_check'),
					adviceChangePassword : adviceChangePassword,
					passwordConfirm : passwordConfirm,
					changeNow : changeNow,
					changeLater : changeLater,
                    oauthLogin : oauthLogin
				});
				loginView.render();

	        }(window, this));
 		}
    </script>

	<script type="text/javascript">
	function certModuleInit() {
		$("#iframeWrap").append('<iframe id="cert_login_iframe" width="0px" height="0px" name="cert_login_iframe" src="${baseUrl}certInstall?onload=true" style="border:0;"></iframe>');
	}

	function certSubmit(data) {
		var search = searchToObject();
		data.currentPage = location.href;
		$.ajax({
			type : "POST",
			url : GO.contextRoot + "api/certLogin",
			data : JSON.stringify(data),
			dataType : "json",
			contentType: "application/json",
			success : function(resp) {
				console.log("success : " + decodeURIComponent(resp.data.redirect));

				var url = search.returnUrl ? GO.util.XSSFilter(decodeURIComponent(search.returnUrl)) : decodeURIComponent(resp.data.redirect);
				location.href = url;
			},
			error : function(error) {
				console.log(error);
			}
		});
	}

	function searchToObject() {
		var pairs = window.location.search.substring(1).split("&");
	    var obj = {};
	    var pair;
	    var i;

	  	for ( i in pairs ) {
	    	if ( pairs[i] === "" ) continue;

	    	pair = pairs[i].split("=");
	    	obj[ decodeURIComponent( pair[0] ) ] = decodeURIComponent( pair[1] );
	  	}

	  return obj;
	}
	</script>

    <script>
    	if($.cookie("bannerCookie"+"${frontNoticeId}")) {
    		$("#noticeBanner").remove();
    	} else {
    		$("#noticeBanner").show();
    	}

        $("#bannerClose").click(function(){
        	$("div.banner").slideUp();
			$.cookie("bannerCookie"+"${frontNoticeId}", true, {path: "/"});
        });
    </script>
</body>
</html>
