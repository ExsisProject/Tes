(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
	    "system/models/color_style",
	    "hgn!system/templates/color_style",
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
		ColorStyleModel,
		ColorStyleTmpl, 
		commonLang,
		adminLang
	) {
		var tmplVal = {
			label_colorstyle_title: adminLang["color style"],
			label_colorstyle: adminLang["color style"],
			label_company_colorstyle_title: adminLang["company color style"],
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
		
		var ColorStyleView = Backbone.View.extend({

			events : {
				"click span#btn_color_ok" : "colorStyleSave",
				"click span#btn_color_cancel" : "colorStyleCancel",
				"click span.btn_box[data-btntype='changeform']" : "changeModifyForm",
				"click span.edit_data" : "changeModifyForm",
				"submit form" : "formSubmit"
			},

			initialize : function() {
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
				}
			},
			render : function() {
				this.model = ColorStyleModel.read();
				var self = this;
				
				this.$el.empty();
				var dataset = this.model.toJSON();
				
				var tmpl = ColorStyleTmpl({
					lang : tmplVal,
					dataset : dataset
				});
				this.$el.html(tmpl);
				
				this.$el.find('[name="formBaseConfig"] tr:last-child').addClass('last');
				$('.breadcrumb .path').html(adminLang["color style 관리"]);
				return this.$el;
			},
			colorStyleSave : function(){
				var self = this;
				
				var colorStyleVal = $('input[name="colorStyle"]').val();
				if(colorStyleVal == undefined){
					colorStyleVal = $("#systemColorStyle").attr('data-value');
				}
				
				var companyColorStyle = $('input[name="companyColorStyle"]');		
				var validate = true;
				var companyColorStyleList = [];
				
				console.log(colorStyleVal);
					
				if(colorStyleVal == undefined && companyColorStyle.length == 0){
					validate = false;
					$('#webTitle').focus();
					this.$el.find('#colorStyleValidate').html(commonLang['모든 항목을 입력하세요.']);
					return false;
				}	
				if(colorStyleVal == undefined){
					self.model.set('systemColorStyle', $('[data-formname="colorStyle"]').attr('data-value'));
				}else{
					self.model.set('systemColorStyle', colorStyleVal);
				}
				$.each($('[data-formname="companyColorStyle"]'), function(k,v) {
					var companyColorValue = $(v).find('[name="companyColorStyle"]').val();
					if(companyColorValue == undefined){
						companyColorValue = $(v).attr('data-value')
					}
					var companyColorStyle = {companyId: parseInt($(v).attr('data-id')), companyName: $(v).attr('data-name'), companyColor:companyColorValue};
					companyColorStyleList.push(companyColorStyle);
				});
				self.model.set('companyColorStyleList', companyColorStyleList);
				
				if(!validate){
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
			colorStyleCancel: function(){
				var self = this;
				$.goCaution(tmplVal['label_cancel'], commonLang["변경한 내용을 취소합니다."], function(){
					self.render();
					$.goMessage(commonLang["취소되었습니다."]);
				}, tmplVal['label_confirm']);
			},
		},{
			__instance__: null
		});
		return ColorStyleView;
	});
	
}).call(this);