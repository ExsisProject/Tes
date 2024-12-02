(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
	    "system/models/web_revision",
	    "hgn!system/templates/web_revision",
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
		WebRevisionModel,
		configTmpl, 
		commonLang,
		adminLang
	) {
		var tmplVal = {
			label_webrevision_title: adminLang['webRevision 관리'],
			label_webrevision: adminLang['Web Revision'],
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
				"click span#btn_ok" : "webRevisionSave",
				"click span#btn_cancel" : "webRevisionCancel",
				"click span.btn_box[data-btntype='changeform']" : "changeModifyForm",
				"click span#data" : "changeModifyForm",
				"submit form" : "formSubmit"
			},

			initialize : function() {
				this.model = WebRevisionModel.read();
			},
			formSubmit : function(e) {
				e.preventDefault();
				return;
			},
			changeModifyForm : function(e){
				var targetEl = $(e.currentTarget).parent();
				if(targetEl && targetEl.attr('data-formname')) {
					$(e.currentTarget).hide();
					targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '" class="input w_mini" value="', targetEl.attr('data-value'), '" />'].join(''))
						.find('input').focusin();
					
					var validateEl = targetEl.parent().find('#webRevisionValidate');
					targetEl.find('input').keyup(function(e) {
						if(!$.goValidation.validateNumericAlpha($(e.currentTarget).val())){
						validateEl.html(adminLang['입력할 수 없는 문자']);
						}else{
							validateEl.empty();
						}
					});
				}
			},
			render : function() {
				var self = this;
				
				this.$el.empty();
				var dataset = this.model.toJSON();
				
				var tmpl = configTmpl({
					lang : tmplVal,
					dataset : dataset
				});	
				this.$el.html(tmpl);
				$('.breadcrumb .path').html(adminLang["webRevision 관리"]);
				return this.$el;
			},
			webRevisionSave : function(){
				var self = this,
					webRevisionVal = $('input[name="webRevision"]').val(),					
					validate = true;

				if (webRevisionVal == undefined) return;

				if (webRevisionVal.length == 0){
					validate = false;
					$('#webTitle').focus();
					this.$el.find('#webRevisionValidate').html(commonLang['모든 항목을 입력하세요.']);
					return false;
				}	
					
				if (!$.goValidation.validateNumericAlpha(webRevisionVal)){
					validate = false;
					$('#webTitle').focus();
					this.$el.find('#webRevisionValidate').html(adminLang['입력할 수 없는 문자']);
					return false;
				}
				self.model.set('str', webRevisionVal);
				
				if (!validate){
					return false;
				}
				
				self.model.save({}, {
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(tmplVal['label_sucess']);
							self.render();
						}
					},
					error : function(model, response) {
						$.goAlert(tmplVal['label_fail'],tmplVal['label_failDesc']);
					}
				});
			},
			webRevisionCancel: function(){
				var self = this;
				$.goCaution(tmplVal['label_cancel'], commonLang["변경한 내용을 취소합니다."], function(){
					self.render();
					$.goMessage(commonLang["취소되었습니다."]);
				}, tmplVal['label_confirm']);
			},
		},{
			__instance__: null
		});
		return EtcConfig;
	});
	
}).call(this);