;(function() {
	define([
         "backbone",
         "app",
         "components/emailSend/views/send_mail_layer",
         "i18n!nls/commons"
	],
	function(
		Backbone, 
		App,
		SendMailLayer,
		commonLang
	) {
		var lang = {
			"alert_length" : commonLang['0자이상 0이하 입력해야합니다.'],
			"alert_input_email" : commonLang['이메일 주소를 입력하세요.'],
			"alert_invalid_email" : commonLang['잘못된 이메일 주소입니다.'],
			"send_email_title" : commonLang['메일 보내기'],
			"send" : commonLang['보내기'],
			"cancel" : commonLang['취소'],
			"success" : commonLang['메일을 발송했습니다.'],
			"fail" : commonLang['실패했습니다.'],
			"alert_subject" : commonLang['제목을 입력하세요.']
		};
		var SendLayer = Backbone.View.extend({

			initialize : function(options) {
				this.options = options || {};
				this.confirmButtonClicked = false;
			},
			getMail : function(){
				var addrArray = [];
				$("#toAddrWrap li span.name").each(function() {
	                addrArray.push(GO.util.get_email($(this).data("email")));
	            });
				return addrArray;
			},
			sendMail : function(popup){
			    var _this = this;
				var sendOption = {};
				var addrArray = [];
				var subject = $('div.go_popup #subject').val();
				var memo = $('#mail_content').val() == undefined ? $('#memo').val() : $('#mail_content').val();
					memo = GO.util.escapeHtml(memo);
				
				addrArray = this.getMail();  //메일주소(배열)
				var attachIds;  //첨부파일 아이디(배열)
				var url = this.options.url;
				var targetId = this.options.targetId;				
				
				if(addrArray.length < 1){
					$('#addrErrorWrap').text(lang['alert_input_email']).show();
					setTimeout(function(){
						$('#addrErrorWrap').hide();
					},3000);
					return;
				}
				
				if(!this.checkEmailInvalidAddress(addrArray)){
					$('#addrErrorWrap').text(lang['alert_invalid_email']).show();
					setTimeout(function(){
						$('#addrErrorWrap').hide();
					},3000);
					return;
				}
				
				if($.trim(subject) == ''){
					$('#subjectErrorWrap').text(lang['alert_subject']).show();
					setTimeout(function(){
						$('#subjectErrorWrap').hide();
					},3000);
					return;
				}
				
				if($.trim(memo) != '' && !$.goValidation.isCheckLength(-1,1000,memo)){
					$('#memoErrorWrap').text(App.i18n(lang['alert_length'], {"arg1":"0","arg2":"1000"})).show();
					setTimeout(function(){
						$('#memoErrorWrap').hide();
					},3000);
					return;
				}
				
				sendOption = {
						receivers : addrArray, 
						memo : memo, 
						subject : subject,
						id : targetId
				};
				
				if (this.confirmButtonClicked) {
				    console.log('prevented dbl click.');
				    return;
				}
				
				this.confirmButtonClicked = true;
				console.log('ajax starting..');
				
				$.ajax({
                    type: 'POST',
                    async: true,
                    data : JSON.stringify(sendOption),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'api/' + url
                }).
                done(function(response){
                	$.goSlideMessage(lang['success']);
                	popup.close();
                	
                }).
                fail(function(error){
                	$.goSlideMessage(lang['fail'],'caution');
                }).
                complete(function() {
                    console.log('ajax ended.');
                    _this.confirmButtonClicked = false;
                });
				
			},
			checkEmailInvalidAddress : function(emailArray){
				for(var i = 0; i < emailArray.length; i++) {
			        var address = emailArray[i];        
			        address = $.trim(address);
			        if(address == "" || GO.util.checkEmailFormat(address)) {
			            continue;
			        }       
			        else {
			            return false;
			        }
			    }
			    return true;
			},
			render : function() {
				var _this = this;
				var popup = null;

				var options = {
					'content' : this.options.content,
					'attachInfos' : this.options.attachInfos,
					'targetApp' : this.options.targetApp
				};

				popup = $.goPopup({
					width : '600px',
					pclass : 'layer_normal send_mail',
					header : lang['send_email_title'],
					contents : '',
					modal : false,
					forceClosePopup : false,
					closeCallback : function() {
						$(".layer_auto_complete").hide();
					},
					buttons : [ {
						btype : 'confirm',
						btext : lang['send'],
						autoclose : false,
						callback : function(popup) {
							// 메일 발송
						    if (!_this.confirmButtonClicked) {
	                            _this.sendMail(popup);
						    }
						}
					}, {
						btype : 'normal',
						btext : lang['cancel'],
						autoclose : false,
						callback : function(popup){
							$(".layer_auto_complete").hide();
							popup.close();
						}
					} ]
				});
				SendMailLayer.create(options);
				popup.reoffset();
				return this;
			}
		});
		return {
			render : function(opt) {
				return new SendLayer(opt).render();
			}
		};
	});
}).call(this);