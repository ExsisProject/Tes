(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
	    "system/models/log_config",
	    "hgn!system/templates/log_config",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "jquery.go-validation",
	    "jquery.go-popup",
	    "jquery.go-sdk"
	], 
	
	function(
		$, 
		Backbone,
		App,
		logConfigModel,
		configTmpl, 
		commonLang,
		adminLang
	) {
		var tmplVal = {
			label_logConfig_title: adminLang['로그 레벨 설정'],
			label_logConfig_host: adminLang['호스트 선택'],
			label_logConfig_service: adminLang['서비스 선택'],
			label_logConfig_log: adminLang['로그 레벨 설정'],
			label_confirm: commonLang["확인"],
			label_sucess: commonLang["저장되었습니다."],
			label_fail: commonLang["실패"],
			label_failDesc: commonLang["실패했습니다."],
			label_edit: commonLang["수정"],
			label_ok: commonLang["저장"],
			label_cancel: commonLang["취소"],
			label_validate: adminLang['0자이상 0이하 입력해야합니다.'],
			label_close: commonLang["닫기"]
		};
		
		var EtcConfig = App.BaseView.extend({

			events : {
				"click span#btn_ok" : "logConfigSave",
				"submit form" : "formSubmit",
				"change select#hostName" : "changeHostName",
				"change select#serviceType" : "changeServiceType"
			},

			initialize : function() {
				this.model = logConfigModel.create();
			},
			formSubmit : function(e) {
				e.preventDefault();
				return;
			},
			render : function() {
				var self = this;
				
				this.$el.empty();
				//var dataset = this.model.toJSON();
				
				var tmpl = configTmpl({
					lang : tmplVal/*,
					dataset : dataset*/
				});	
				this.getHostName();
				this.$el.html(tmpl);
				$('.breadcrumb .path').html(adminLang['로그 레벨 설정']);
				return this.$el;
			},
			logConfigSave : function(){
				var self = this,
					form = $('form[name=formLogConfig]');
				
				$.each(form.serializeArray(), function(k,v){
	        		self.model.set(v.name, v.value, {silent: true});
	        	});
				
				this.model.save({}, {
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(tmplVal['label_sucess']);
							self.render();
						}else {
							$.goMessage(tmplVal['label_failDesc']);
							self.render();
						}
							
					},
					error : function(model, response) {
						$.goAlert(tmplVal['label_fail'],tmplVal['label_failDesc']);
					}
				});
			},
			getHostName : function(){
				url = GO.contextRoot + "ad/api/system/host";
				$.go(url,'' , {
					qryType : 'GET',				
					responseFn : function(response) {
						if(response.code == 200){
							for(var i = 0 ; i < response.data.length; i++){
								$('#hostName').append('<OPTION value="'+response.data[i].hostName+'">'+response.data[i].hostName+'</OPTION>');
							}
						}
					},
					error: function(response){
						$.goAlert(tmplVal['label_fail'],tmplVal['label_failDesc']);
					}
				});
			},
			getLogLevel : function() {
				var	url = GO.contextRoot + "ad/api/log/service",
				options = {
						hostName: $("#hostName").val(),
						serviceType: $("#serviceType").val(),
						logLevel: ""
				};
				$.go(url,JSON.stringify(options) , {
					qryType : 'POST',		
					contentType : 'application/json',
					responseFn : function(response) {
						if(response.code == 200){
							$('#logLevel option:contains(' + response.data +')').prop({selected: true});
						}
					},
					error: function(response){
						$.goAlert(tmplVal['label_fail'],tmplVal['label_failDesc']);
					}
				});
			},
			
			changeHostName : function() {
				$('#serviceType').removeAttr('disabled');
			},
			changeServiceType : function() {
				this.getLogLevel();
				$('#logLevel').removeAttr('disabled');
			}
		},{
			__instance__: null
		});

		return EtcConfig;
	});
	
}).call(this);