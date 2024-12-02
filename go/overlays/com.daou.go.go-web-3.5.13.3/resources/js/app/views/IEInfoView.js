(function($) {
	var GP = $.goIEInfoView = function () {
		return GP.render(arguments[0]);
	};
	
	$.extend(GP,{
		defaultLocale : 'ko',
		locale : '',
		i18n : {
			'ko' : {
				"확인" : "확인",
				"최신 브라우저를 설치하시면, 보안 및 기능이 향상된 서비스 이용이 가능합니다." : "최신 브라우저를 설치하시면, <br>보안 및 기능이 향상된 서비스 이용이 <br>가능합니다.",
				"정식 지원 브라우저" : "정식 지원 브라우저",
				"Internet Explorer 8 이상" : "Internet Explorer 8 이상",
				"사용중이신 IE6, IE7 은 이용하실 수 없습니다." : "사용중이신 IE6, IE7 은 이용하실 수 없습니다.",
				"IE6, IE7은 해킹 위험 및 악성코드 감염을 비롯하여 기업 보안에 문제가 발생할 수 있어요" : "IE6, IE7은 해킹 위험 및 악성코드 감염을 비롯하여 기업 보안에 문제가 발생할 수 있으며, 웹 표준기술이 반영되지 않아 속도 저하 및 다양한 기능들을 이용하실 수 없습니다. 보안이 가장 중요한 기업 솔루션의 특성상, IE8 부터 정식으로 지원하고 있습니다. 보다 안전한 서비스 이용을 위하여, 반드시 최신 브라우저로 업그레이드 하세요. ",
				"지금 바로 업그레이드하세요!" : "지금 바로 업그레이드하세요!"
			},
			'ja' : {
				"확인" : "確認",
				"최신 브라우저를 설치하시면, 보안 및 기능이 향상된 서비스 이용이 가능합니다." : "最新ブラウザにアップデートすると、<br >セキュリティ及び機能が向上されたサービスのご利用が可能です。",
				"정식 지원 브라우저" : "サポートラウザ",
				"Internet Explorer 8 이상" : " Internet Explorer 8以上 ",
				"사용중이신 IE6, IE7 은 이용하실 수 없습니다." : "ご使用中のIE6または、IE7ではご利用できません。",
				"IE6, IE7은 해킹 위험 및 악성코드 감염을 비롯하여 기업 보안에 문제가 발생할 수 있어요" : "IE6、IE7は、ハッキング及びマルウエアなどの感染をはじめ、セキュリティ問題が発生する恐れがあります。また、Web標準が反映されてなく、速度低下及び多様な機能がご利用できません。 より安全なサービスの利用のため、最新ブラウザにアップグレードしてください。",
				"지금 바로 업그레이드하세요!" : "今すぐアップデートしてください。"
			},
			'en' : {
				"확인" : "OK",
				"최신 브라우저를 설치하시면, 보안 및 기능이 향상된 서비스 이용이 가능합니다." : "You will be able to use advanced services <br>in terms of security and various features<br> once you install an up-to-date browser. ",
				"정식 지원 브라우저" : "Supported Browsers",
				"Internet Explorer 8 이상" : "Internet Explorer 8 or above",
				"사용중이신 IE6, IE7 은 이용하실 수 없습니다." : "You are now connecting the service via Internet Explorer 6 or Internet Explorer 7 which we do not support. ",
				"IE6, IE7은 해킹 위험 및 악성코드 감염을 비롯하여 기업 보안에 문제가 발생할 수 있어요" : "Internet Explorer versions 6 and 7 are less stable, and much more vulnerable to viruses, spyware, malware, and other security issues. In addition, since web standard technologies are not applied to those browsers, Internet Explorer 6 and 7 are very slow and more likely to crash. We officialy support Internet Explorer version 8 and above because we priortize security over other things. Above all things, for your security we highly recommend upgrading your browser to the latest version.",
				"지금 바로 업그레이드하세요!" : "Please upgrade it now!"
			},
			'zh_CN': {
				"확인" : "OK",
				"최신 브라우저를 설치하시면, 보안 및 기능이 향상된 서비스 이용이 가능합니다." : "最新版本的浏览器的功能方面或安全方面都有很大的改进，所以建议您把浏览器刷新到最新版本。 ",
				"정식 지원 브라우저" : "支持",
				"Internet Explorer 8 이상" : "Internet Explorer 8 以上",
				"사용중이신 IE6, IE7 은 이용하실 수 없습니다." : "使用中的IE6或IE7的环境下，不能正常运行。",
				"IE6, IE7은 해킹 위험 및 악성코드 감염을 비롯하여 기업 보안에 문제가 발생할 수 있어요" : "IE6或IE7的浏览器存在有恶性软件的感染和黑客的攻击，所以可能会导致安全问题。 此外，Web的标准技术尚未反映，所以无法使用其他功能。 为了更安全的服务，请刷新到最新版本。",
				"지금 바로 업그레이드하세요!" : "请立即更新。"
			},
			'zh_TW': {
				"확인" : "OK",
				"최신 브라우저를 설치하시면, 보안 및 기능이 향상된 서비스 이용이 가능합니다." : "最新版本的瀏覽器的功能方面或安全方面都有很大的改進，所以建議您把瀏覽器刷新到最新版本。 ",
				"정식 지원 브라우저" : "支持",
				"Internet Explorer 8 이상" : "Internet Explorer 8 以上",
				"사용중이신 IE6, IE7 은 이용하실 수 없습니다." : "使用中的IE6或IE7的環境下，不能正常運行。",
				"IE6, IE7은 해킹 위험 및 악성코드 감염을 비롯하여 기업 보안에 문제가 발생할 수 있어요" : "IE6或IE7的瀏覽器存在有惡性軟件的感染和黑客的攻擊，所以可能會導致安全問題。此外，Web的標準技術尚未反映，所以無法使用其他功能。 為了更安全的服務，請刷新到最新版本。",
				"지금 바로 업그레이드하세요!" : "請立即更新。"
			},
			'vi' : {
				"확인" : "OK",
				"최신 브라우저를 설치하시면, 보안 및 기능이 향상된 서비스 이용이 가능합니다." : "Nếu cài đặt trình duyệt mới nhất, bạncó thể sử dụng dịch vụ bảo mật và chức năng được nâng cấp.",
				"정식 지원 브라우저" : "Trình duyệt hỗ trợ chính thức",
				"Internet Explorer 8 이상" : "Từ Internet Explorer 8",
				"사용중이신 IE6, IE7 은 이용하실 수 없습니다." : "Không thể sử dụng IE6, IE7.",
				"IE6, IE7은 해킹 위험 및 악성코드 감염을 비롯하여 기업 보안에 문제가 발생할 수 있어요" : "IE6, IE7 có thể phát tán Code nguy hiểm và tiềm ẩn nguy cơ hacking, ảnh hưởng tới vấn đề bảo mật của doanh nghiệp, không phản ánh được kỹ thuật tiêu chuẩn của trang Web nên làm giảm tốc độ và hạn chế nhiều chức năng sử dụng. Công ty cung cấp trình duyệt từ IE8 trở lên nhằm đảm bảo vấn đề bảo mật. Vui lòng nâng cấp trình duyệt mới để đảm bảo sử dụng dịch vụ an toàn.",
				"지금 바로 업그레이드하세요!" : "Vui lòng cập nhật ngay bây giờ."
			}
		},
		downloadUrl : {
			"ko" : "http://windows.microsoft.com/ko-KR/internet-explorer/products/ie/home",
			"en" : "http://windows.microsoft.com/en-us/internet-explorer/download-ie",
			"ja" : "http://windows.microsoft.com/ja-jp/internet-explorer/download-ie",
			"zh_CN" : "http://windows.microsoft.com/zh-tw/internet-explorer/download-ie",
			"zh_TW" : "http://windows.microsoft.com/zh-tw/internet-explorer/download-ie",
			"vi" : "http://windows.microsoft.com/ko-KR/internet-explorer/products/ie/home"
		}
	});
	
	$.extend(GP,{
		defaults : {
			tpl : {
				'wrap' : [
						'<div class="ie" style="text-align:center; margin-top:20px">',
						'<div class="ie_warp">',
							'<div class="header">',
							$("meta[name='brandName']").attr("content") == "TMS" ? '<h1 class="bi_tms" title="TERRACE Mail Suite" alt="TERRACE Mail Suite">TMS</h1>' : '<h1 class="bi_do" title="Daou Office" alt="Daou Office">Daou Office</h1>',
							'</div>',
							'<div class="ie_content" style="margin-top:85px; padding:0 30px; text-align:left">',
								'<div>',
								'<p style="font-weight:bold; font-size:16px;line-height:20px; color:#828fa9; text-align:left; letter-spacing:-1px">{title}</p>',
								'<h1 style="font-weight:bold; font-size:38px;line-height:50px; color:#545454; text-align:left; letter-spacing:-4px">{message}</h1></div>',
								'<div>',
									'<p class="desc"  style="text-align:right; margin:0; font-weight:bold; line-height:1.8">{supporterBrowsers}</p>',
									'<div class="browser_box" style="background:#fff; border:1px solid #d9d9d9">',
										'<table>',
										
											'<tr>',
												'<th><span class="ie" title="{i18n.ie8above}" alt="{ie8above}"></span></th>',
												'<th><span class="chorme" title="Chorme" alt="Chorme"></span></th>',
												'<th><span class="firefox" title="Firefox" alt="Firefox"></span></th>',
												'<th><span class="safari" title="Safari" alt="Safari"></span></th>',
											'</tr>',
											'<tr>',
												'<td>{ie8above}</td>',
												'<td>Chorme</td>',
												'<td>Firefox</td>',
												'<td>Safari</td>',
											'</tr>',
										'</table>',							
									'</div>',
									'<p class="article" style="padding:10px;line-height:1.6">{upgradeDesc}</p>',
									GP.locale == 'ko' ? '<a class="btn_fn4_b"  style="margin:5px 10px" href="http://www.microsoft.com/korea/goodbye-ie6/pop01.html " target="_blank">자세히보기</a>' : '',
								'</div>',
								'<div style="margin-bottom:20px; text-align:center">',
									'<img src="{GOROOT}resources/images/etc/ie_2.gif" title="ie6,ie7" alt="ie6,ie7"/>',
									'<p class="desc2" style="color:#f97c50; font-weight:bold; padding:10px">{upgradeMessage}</p>',
									'<a href="{downloadUrl}" class="btn_ie8_up" target="_blank"><img src="{GOROOT}resources/images/etc/ie_btn.jpg" title="ie8 UPGRADE" alt="{upgradeMessage}"/></a>',
								'</div>',
							'</div>',
							'<!--div style="padding:10px"><span style="font-size:11px; color:#888">Copyright DAOU TECHNOLOGY INC.</span></div-->',
						'</div>',
					'</div>'
				 ]				
			}
		},
		template : function(tpl,data){ 
			return tpl.replace(/{(\w*)}/g,function(m,key){
				return data.hasOwnProperty(key)?data[key]:"";}
			); 
		},
		renderPopup : function(options) {
			
			var deferred = $.Deferred();
			
			if(!options.locale || !GP.i18n.hasOwnProperty(options.locale)) GP.locale = GP.defaultLocale;
			else GP.locale = options.locale;
			
			var popupEl = null,
				wrapTpl = GP.defaults.tpl.wrap;
			
			popupEl = $(GP.template(wrapTpl.join(''), {
				'GOROOT' : options.root,
				'title' : GP.i18n[GP.locale]['사용중이신 IE6, IE7 은 이용하실 수 없습니다.'],
				'message' : GP.i18n[GP.locale]['최신 브라우저를 설치하시면, 보안 및 기능이 향상된 서비스 이용이 가능합니다.'],
				'supporterBrowsers' :  GP.i18n[GP.locale]['정식 지원 브라우저'],
				'ie8above' :GP.i18n[GP.locale]['Internet Explorer 8 이상'],
				'upgradeDesc' : GP.i18n[GP.locale]['IE6, IE7은 해킹 위험 및 악성코드 감염을 비롯하여 기업 보안에 문제가 발생할 수 있어요'],
				'upgradeMessage' : GP.i18n[GP.locale]['지금 바로 업그레이드하세요!'],
				'downloadUrl' : GP.downloadUrl[GP.locale]
				
			}));
			$('body').html(popupEl);
			deferred.resolveWith(this, [popupEl]);
			
			return deferred;
		},
		render : function(options) {
			
			var returnEl = null;
			GP.renderPopup(options).done(function(popupEl) {
				returnEl = popupEl;				
			});
			return returnEl;
        }
	});
})(jQuery);