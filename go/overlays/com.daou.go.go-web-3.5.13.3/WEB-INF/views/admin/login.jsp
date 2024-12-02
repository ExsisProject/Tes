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
    <base href="${baseUrl}">
    <link rel="stylesheet" href="${baseUrl}resources/css/ta_style.css?rev=${revision}" media="screen" />
    <link rel="stylesheet" href="${baseUrl}resources/css/adm_style.css?rev=${revision}" media="screen" />

    <%
  	String currentLocale =  (String)request.getAttribute("currentLocale");
  	if(!"ko".equals(currentLocale)){
  	%>  
    <link rel="stylesheet" href="${baseUrl}resources/css/ta_${currentLocale}.css?rev=${revision}" media="screen, print" />
  	<%
  	}
  	%>
    
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/jquery/jquery-ui/js/jquery-ui-1.10.0.custom.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/hogan.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/lodash.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/backbone/backbone.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/vendors/moment/moment.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-util.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-popup.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-login.js?rev=${revision}"></script>
    <script type="text/javascript" src="${baseUrl}resources/js/libs/go-placeholder.js?rev=${revision}"></script>
    <!--[if IE]>
    <script src="${baseUrl}resources/js/vendors/html5.js"></script>
    <![endif]-->
</head>
<body class="tLoginWrap">
    <div class="tWrap">
	    <div class="tTop">
			 <div id="language_select" class="language">
				<select>
					<option value="language">${lang.loginLanguage}</option>
                    <c:forEach items="${availableLanguages}" var="l">
                        <option value="${l.key}" ${selectedLocale == l.key ? 'selected' : ''}>${l.value}</option>
                    </c:forEach>
                </select>
			</div>
		</div>
        
        <div class="go_intro">
            <form id="loginForm" method="post">
                <section class="login_box">
                	<div class="custom_visual">
		                <img src="${middleImage}" title="${lang.logoTitle} Admin">
		            </div>
                    <div class="login_msg" style="display:none; top:215px; ">
                        <span class="ic_error">!</span>
                        <span class="txt"></span>
                    </div>
                    <input type="submit" style="visibility:hidden" />
                    <fieldset>
                        <legend>login</legend>
                        <div class="login_id">
                            <label class="title">${lang.account}</label>
                            <input type="text" id="username" name="username" class="ipt_login ipt_wide" placeholder="${lang.account}" onkeyup="javascript:clearAlert(event)"  style="ime-mode:inactive;"/>
                            <%-- <div class="select_list" style="visibility: hidden">
                                <input type="hidden" path="company" id="selected_company"/>
                                <span class="ic_gnb btn_dropdown" title="${lang.showCompanies}"></span>
                                <ul>
                                    <li class="on"><a>${lang.selectCompany}</a></li>
                                    <c:forEach items="${companies}" var="company">
                                        <li class="option" style="display: none;" data-id="${company.id}" data-loginIdLabel="${company.loginIdLabel}" data-loginIdSaveLabel="${company.loginIdSaveLabel}"><a>${company.name}</a></li>
                                    </c:forEach>
                                </ul>
                            </div> --%>
                        </div>
                        
                        <div class="login_pw">          
                            <label class="title">${lang.password}</label>
                            <input type="password" name="password" id="password" autocomplete="off" class="ipt_login ipt_wide" placeholder="${lang.password}" onkeyup="javascript:clearAlert(event)"/>
                        </div>
                        
                        <a id="login_submit" class="btn_bk">Login</a>
                    </fieldset>
                    <div class="login_check">
                        <!-- <span class="option_wrap">
                            <input type="checkbox"><label>보안접속</label>
                        </span> -->
                        <span class="option_wrap">
                            <input type="checkbox" name="saveLoginId" id="saveLoginId">
                            <label id="login_id_save_label">${lang.saveLoginId}</label>
                        </span>
                    </div>
                </section>
            </form>

            <div id="concurrent_login_confirm_box" class="layer_confim_front layer_multi_login center" style="display:none">
                <div class="content">
                    <p class="q">${lang.concurrentLoginMessage}</p>
                    <p class="info"></p>
                </div>
                <footer class="btn_layer_wrap">
                    <a id="submit_concurrent_login" class="btn_bk">${lang.confirm}</a>
                    <a id="cancel_concurrent_login" class="btn_bk">${lang.cancel}</a>
                </footer>
            </div>
    
            <div id="login_lock_alarm_box" class="layer_confim_front layer_access_error center" style="display:none">
                <div class="content">
                    <p class="q">${lang.loginLockMessage}</p>
                    <p class="info"></p>
                </div>
                <footer class="btn_layer_wrap">
                    <a class="btn_bk">${lang.confirm}</a>
                </footer>
            </div>
        </div>
    </div>
    
    <script type="text/javascript">
	    function clearAlert(event){
	    	if(event.keyCode != 13){
		    	var isDisplayAlert = $('.login_msg').css('display');
		    	if(isDisplayAlert != 'none'){
		    		$('.login_msg').css('display', 'none');
		    	}
	    	}
	    }
    
		$(window).load(function(){ 
			$('.placeholder').css('color', '#7c838a');
			$('.language span').text($('.language select option:selected').text()); 
			$('.language select').change(function() { 
		    	$('.language span').text($('.language select option:selected').text());
			}); 
		});
		
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
                    alarmLoginLock,
                    concurrentLogoutAlarmCallback;
                var adviceChangePassword = "${lang.adviceChangePassword}",
                	passwordConfirm = "${lang.passwordConfirm}";
                
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
                
                alarmLoginLock = function(message) {
                	$.goPopup({
            			width: '400',
            			modal : true,
                    	pid: 'login_lock_alarm_box',
            			pclass : 'layer_confim_front layer_access_error',
            			contents: "<p class='q'>${lang.loginLockMessage}</p><p class='info'>" + message + "</p>",
            			buttons : [{
            				btext : "${lang.confirm}",
            				btype : "confirm",
            				autoclose : true
            			}]
            		});
                };
                
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
                }
    
                new LanguageSelectView();
                loginView = new LoginView({
                    loginType: 'admin',
                    el: $('form#loginForm'),
                    idLabel: $('label#login_id_label'),
                    idSaveLabel: $('label#login_id_save_label'),
                    idInput: $('#username'),
                    pwInput: $('#password'),
                    saveIdCheckbox: $('#saveLoginId'),
                    companyOptions: $('.select_list li.option'),
                    selectedCompanyOption: $('.select_list li.on > a'),
                    failMessageLabel: $('.login_msg'),
                    loginOptions: $('.login_check'),
                });
                loginView.render();
                
            }(window, this));
		}
    </script>
</body>
</html>