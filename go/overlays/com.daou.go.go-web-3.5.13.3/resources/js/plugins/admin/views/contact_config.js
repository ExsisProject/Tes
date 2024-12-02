(function() {
	define(function(require) {
		var $ = require("jquery");
		var Backbone = require("backbone");
		var App = require("app");
		var contactConfigTmpl = require("hgn!admin/templates/contact_config");
		var NameTagView = require("go-nametags");
		var commonLang = require("i18n!nls/commons");
		var adminLang = require("i18n!admin/nls/admin");
		var contactLang = require("i18n!contact/nls/contact");
		require("jquery.go-orgslide");

		var tmplVal = {
				label_ok: commonLang["저장"],
				label_cancel: commonLang["취소"],
				label_side: adminLang["Side 우선 설정"],
				COMPANY : adminLang["전사 주소록"],
				USER : adminLang["개인 주소록"],
				DEPARTMENT : contactLang["부서 주소록"],
				label_private_config: adminLang["개인 주소록 설정"],
				label_department_config: adminLang["부서 주소록 설정"],
				label_company_config: adminLang["전사 주소록 설정"],
				label_max_contact: adminLang["연락처 최대 등록 수"],
				label_max_group: adminLang["최대 그룹 수"],
				label_max_company_group: adminLang["최대 주소록 수"],
				label_desc_10000: App.i18n(adminLang["입력범위"], {"arg1":"10","arg2":"10,000"}),
				label_desc_1000: App.i18n(adminLang["입력범위"], {"arg1":"10","arg2":"1,000"}),
				"공용 주소록 관리자" : contactLang["공용 주소록 관리자"],
				"공용 주소록 관리자 설명" : contactLang["공용 주소록 관리자 설명"]
			};
		var ConfigModel = Backbone.Model.extend({

			CONTACT_MIN : 10,

			CONTACT_MAX : 10000,

			GROUP_MIN : 10,

			GROUP_MAX : 1000,

			url : "/ad/api/contactconfig",

			initialize : function(){

			},

			validate : function(){
				var errors = [];
				errors = this._validateContact();
				errors = errors.concat(this._validateGroup());

				if(errors.length > 0){
					throw new Error(JSON.stringify(errors));
				}
			},

			_validateContact : function(){
				var attrs = ["privateContactMax", "companyContactMax", "departmentContactMax"];
				return this._validateRange(attrs, this.CONTACT_MIN, this.CONTACT_MAX);
			},

			_validateGroup : function(){
				var attrs = ["privateContactGroupMax", "companyContactGroupMax", "departmentContactGroupMax"];
				return this._validateRange(attrs, this.GROUP_MIN, this.GROUP_MAX);
			},

			_validateRange : function(attrs, minValue, maxValue){
				var errors = [];

				_.each(attrs, function(attr){
					var value = this.get(attr);

					if(isNaN(value)){
						var message = {
							attr : attr,
							message : adminLang["숫자만 입력하세요."]
						};

						errors.push(message);
					}

					var numberValue = parseInt(value);

					if(numberValue < minValue || numberValue > maxValue){
						var message = {
							attr : attr,
							message : App.i18n(adminLang["입력범위알림"], {"arg1": minValue,"arg2": maxValue})
						};

						errors.push(message);
					}
				}, this);

				return errors;
			}
		})

		var ContactConfig = App.BaseView.extend({

			initialize : function() {
				this.unbindEvent();
				this.bindEvent();
				this.model = new ConfigModel();
				this.model.fetch({async : false});
			},
			unbindEvent : function() {
				this.$el.off("click", "span#btn_ok");
				this.$el.off("click", "span#btn_cancel");
				this.$el.off("focusout", "input#privateContactMax");
				this.$el.off("focusout", "input#privateContactGroupMax");
				this.$el.off("focusout", "input#companyContactMax");
				this.$el.off("focusout", "input#companyContactGroupMax");
				this.$el.off("click", "span.btn_box[data-btntype='changeform']");
				this.$el.off("click", "span#data");
				this.$el.off("submit", "form");
			},
			bindEvent : function() {
				this.$el.on("click", "span#btn_ok", $.proxy(this.contactConfigSave, this));
				this.$el.on("click", "span#btn_cancel", $.proxy(this.contactConfigCancel, this));
				this.$el.on("focusout", "input#privateContactMax", $.proxy(this.inputValidator, this));
				this.$el.on("focusout", "input#privateContactGroupMax", $.proxy(this.inputValidator, this));
				this.$el.on("focusout", "input#departmentContactMax", $.proxy(this.inputValidator, this));
				this.$el.on("focusout", "input#departmentContactGroupMax", $.proxy(this.inputValidator, this));
				this.$el.on("focusout", "input#companyContactMax", $.proxy(this.inputValidator, this));
				this.$el.on("focusout", "input#companyContactGroupMax", $.proxy(this.inputValidator, this));
				this.$el.on("click", "span.btn_box[data-btntype='changeform']", $.proxy(this.changeModifyForm, this));
				this.$el.on("click", "span#data", $.proxy(this.changeModifyForm, this));
				this.$el.on("submit", "form", $.proxy(this.formSubmit, this));
			},
			formSubmit : function(e) {
				e.preventDefault();
				return;
			},
			changeModifyForm : function(e) {
				var targetEl = $(e.currentTarget).parent();
				if(targetEl && targetEl.attr('data-formname')) {
					$(e.currentTarget).hide();
					targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '"id="', targetEl.attr('data-formname'), '" class="input t_num" value="', targetEl.attr('data-value'), '" />'].join(''))
						.find('input').focusin();
				}
			},
			render : function() {
				this.$el.empty();
				
				var tmpl = contactConfigTmpl({
					lang : tmplVal,
					model: this.model.toJSON(),
					priorityName : function(){
						return tmplVal[this];
					}
				});	
				
				this.$el.html(tmpl);
				
				this._renderNameTagView();
				this._renderAdmins();

				this.$el.find('ul.drag_option_wrap').sortable({
					opacity : '1',
					delay: 100,
					cursor : "move",
					items : "li",
					containment : '.container:first',
					hoverClass: "ui-state-hover",
					start : function (event, ui) {
						ui.placeholder.html(ui.helper.html());
						ui.placeholder.find('li').css('padding','5px 10px');
					}
				});
			},
			
			_renderAdmins : function() {
				_.each(this.model.get("administrators"), function(admin) {
					this.nameTagView.addTags({
						id : admin.userId,
						displayName : admin.name + (admin.position ? " " + admin.position : "")
					}, {removable : true, "attr" : admin});
				},this);
			},
			
			_renderNameTagView : function() {
				var self = this;
				this.nameTagView = NameTagView.create({}, {useAddButton : true});
				this.$("ul.name_tag").html(this.nameTagView.el);
				
				this.nameTagView.$el.on('nametag:clicked-add', function(e, nameTag) {
					$.goOrgSlide(self._getOrgOption(nameTag));
				});
			},
			
			_getOrgOption : function(nameTag) {
				var option = {
					contextRoot : GO.contextRoot,
                    isAdmin : true,
                    header : adminLang["관리자 추가"],
					callback : $.proxy(function(info) {
						nameTag.addTags(info, { removable : true, "attr": info });
					}, this)
				};
				
				return option;
			},
			
			inputValidator : function(e) {

				var targetValue = e.currentTarget.value;
				var targetId = e.currentTarget.id;
				var targetEl = $(e.currentTarget).parent();
				var validateEl = targetEl.parent().find('.go_alert');
				validateEl.html('');
				if(targetValue == 0 || targetValue == ''){
					validateEl.html(adminLang["제한 값을 입력하세요."]);
					e.currentTarget.focus();
					return false;
				}else if(isNaN(targetValue) == true){
					validateEl.html(adminLang["숫자만 입력하세요."]);
					e.currentTarget.focus();
					targetValue = '';
					return false;
				}
				else if(targetId == 'companyContactMax' || targetId == 'privateContactMax'){
					if(targetValue <10 || targetValue > 10000){
						validateEl.html(App.i18n(adminLang["입력범위알림"], {"arg1":"10","arg2":"10000"}));
						e.currentTarget.focus();
						return false;
					}
				}else if(targetId == 'companyContactGroupMax' || targetId == 'privateContactGroupMax'){
					if(targetValue <10 || targetValue > 1000){
						validateEl.html(App.i18n(adminLang["입력범위알림"], {"arg1":"10","arg2":"10000"}));
						e.currentTarget.focus();
						return false;
					}
				}
			},

			setModel : function(){
				var form = this.$el.find('form[name=formContactConfig]');
				_.each(form.serializeArray(), function(data,v) {
					this.model.set(data.name, data.value, {silent: true});
				}, this);

				var administrators = _.map($("ul.name_tag").find("li[data-id]"), function(el) {
					return {userId : $(el).data("id")};
				});
				this.model.set("administrators", administrators);

				var priority = _.map(this.$el.find("#priorityContainer li"), function(el){
					return $(el).data("value");
				});
				this.model.set("priority", {"priorityTypes" : priority});
			},

			contactConfigSave : function() {
				this.setModel();

				try{
					this.$el.find("span.go_alert").html("");
					this.model.validate();
				}catch(e){
					var errors = JSON.parse(e.message);

					_.each(errors, function(error){
						var message = error.message;
						var $message = $("#" + error.attr + 'Alert');
						var $input = $('input[name="' + error.attr + '"]').focus();
						$message.html(message);
						$input.focus();
					});
					return;
				}

				var self = this;
    			this.model.save({}, {
    				success : function(model, response) {
    					if(response.code == '200') {
    						$.goMessage(commonLang["저장되었습니다."]);
    						self.render();
    					}
    				},
    				error : function(model, response) {
    					var responseData = JSON.parse(response.responseText);
    					if(responseData.message != null){
    						$.goMessage(responseData.message);
    					}else{
    						$.goMessage(commonLang["실패했습니다."]);
    					}
    				}
    			});
			},
			contactConfigCancel : function() {
				var self = this;
				$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function() {
					self.render();
					$.goMessage(commonLang["취소되었습니다."]);
				}, commonLang["확인"]);
			}
		},{
			__instance__: null
		});
		
		return ContactConfig;
	});
}).call(this);