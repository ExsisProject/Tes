(function() {
	define([
        "jquery", 
        "app", 
        "i18n!nls/commons", 
        "i18n!admin/nls/admin", 
        "admin/models/board_base_config", 
        "hgn!admin/templates/board_base_config", 
        "jquery.go-popup", 
        "jquery.go-sdk"
    ], 
    
    function(
		$, 
		App, 
		commonLang, 
		adminLang, 
		BoardBaseConfigModel, 
		configTmpl
	) {
		var tmplVal = {
				label_ok: commonLang["저장"],
				label_cancel: commonLang["취소"],
				label_title: adminLang["게시판 기본설정"],
				label_side: adminLang["Side 우선 설정"],
				label_dept: adminLang["부서 게시판"],
				label_company: adminLang["전사 게시판"],
				label_base: adminLang["기본 설정"],
				label_attach_limit: adminLang["첨부파일 용량제한"],
				label_attach_limit_desc: adminLang["파일1개"],
				label_non_limit: adminLang["제한없음"],
				label_limit_size: adminLang["용량제한"],
				label_limit_number: adminLang["개수제한"],
				label_mb: adminLang["MB"],
				label_attach_num_limit: adminLang["첨부파일 개수제한"],
				label_attach_num_limit_desc: adminLang["게시물당"],
				label_count: adminLang["개"],
				label_under: adminLang["이하"],
				label_exclude: adminLang["업로드 불가 파일"],
				label_desc: adminLang["업로드 제한"]
		};
		
		var BoardBaseConfig = App.BaseView.extend({
			el : '#layoutContent',
			unbindEvent: function() {
				this.$el.off("click", "form[name='formBoardConfig'] input:radio");
				this.$el.off("click", "span#btn_ok");
				this.$el.off("click", "span#btn_cancel");
				this.$el.off("focusout", "span#maxAttachSize input");
				this.$el.off("focusout", "span#maxAttachNumber input");
				this.$el.off("keyup", "input[name='excludeExtension']");
				this.$el.off("click", "span.btn_box[data-btntype='changeform']");
				this.$el.off("click", "span#data");
				this.$el.off("keyup", "span#maxAttachSize input");
				this.$el.off("keyup", "span#maxAttachNumber input");
				this.$el.off("click", "span#data");
				this.$el.off("submit", "form");
			}, 
			bindEvent: function() {
				this.$el.on("click", "form[name='formBoardConfig'] input:radio", $.proxy(this.toggleRadio, this));
				this.$el.on("click", "span#btn_ok", $.proxy(this.boardConfigSave, this));
				this.$el.on("click", "span#btn_cancel", $.proxy(this.boardConfigCancel, this));
				this.$el.on("focusout", "span#maxAttachSize input", $.proxy(this.inputValidator, this));
				this.$el.on("focusout", "span#maxAttachNumber input", $.proxy(this.inputValidator, this));
				this.$el.on("keyup", "input[name='excludeExtension']", $.proxy(this.keyUPValidator, this));
				this.$el.on("click", "span.btn_box[data-btntype='changeform']", $.proxy(this.changeModifyForm, this));
				this.$el.on("click", "span#data", $.proxy(this.changeModifyForm, this));
				this.$el.on("keyup", "span#maxAttachSize input", $.proxy(this.keyUPValidator, this));
				this.$el.on("keyup", "span#maxAttachNumber input", $.proxy(this.keyUPValidator, this));
				this.$el.on("click", "span#data", $.proxy(this.changeModifyForm, this));
				this.$el.on("submit", "form", $.proxy(this.formSubmit, this));
			}, 
			formSubmit : function(e) {
				e.preventDefault();
				return;
			},
			keyUPValidator : function(e){
				var targetValue = e.currentTarget.value;
				var targetId = e.currentTarget.id;
				var targetEl = $(e.currentTarget).parent();
				var validateEl = targetEl.parent().parent().find('.go_alert');
				validateEl.html('');
				
				if(targetId == "excludeExtension"){
					if(targetValue.match(new RegExp("^[a-zA-Z0-9,]*$"))){
					}else{
						validateEl.html(adminLang["영어, 쉼표, 숫자만 입력가능"]);
						e.currentTarget.focus();
						e.currentTarget.value = '';
						return false;
					}
				}else{
					if(targetValue == 0 || targetValue == ''){
						validateEl.html(adminLang["제한 값을 입력하세요."]);
						e.currentTarget.focus();
						e.currentTarget.value = '';
						return false;
					}
					if(e.keyCode >= 96 && e.keyCode <= 105 || e.keyCode >= 48 && e.keyCode <= 57 || e.keyCode == 46 || e.keyCode == 13 || e.keyCode == 8){
					}else{
						validateEl.html(adminLang["숫자만 입력하세요."]);
						e.currentTarget.value = '';
						return false;
					}
				}
			},
			changeModifyForm : function(e) {
				var targetEl = $(e.currentTarget).parent();
				if(targetEl && targetEl.attr('data-formname') == 'excludeExtension') {
					targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '"id="', targetEl.attr('data-formname'), '" class="input w_large" value="', targetEl.attr('data-value'), '" />'].join(''))
						.find('input').focusin();
				}else{
					$(e.currentTarget).hide();
					targetEl.html(['<input type="input" name="', targetEl.attr('data-formname'), '"id="', targetEl.attr('data-formname'), '" class="input t_num" value="', targetEl.attr('data-value'), '" />'].join(''))
						.find('input').focusin();
				}
			},
			inputValidator : function(e) {
				var targetValue = e.currentTarget.value;
				var targetId = e.currentTarget.id;
				var targetEl = $(e.currentTarget).parent();
				var validateEl = targetEl.parent().parent().find('.go_alert');
				var sizeFlag = $('input#size_false').is(":checked");
				var numberFlag = $('input#number_false').is(":checked");
				
				validateEl.html('');
				if(sizeFlag == false && targetId == 'maxAttachSize' && targetValue >999){
					validateEl.html(adminLang["1~999"]);
					e.currentTarget.focus();
					return false;
				}else if(numberFlag == false && targetId == 'maxAttachNumber' && targetValue >99){
					validateEl.html(adminLang["1~99"]);
					e.currentTarget.focus();
					return false;
				}
			},
			initialize : function(){
				this.model = BoardBaseConfigModel.read({admin:true});
				this.unbindEvent();
				this.bindEvent();
			},
			render : function() {
				this.$el.empty();
				var self = this;
				var data = this.model.toJSON();
				var tmpl = configTmpl({
					lang : tmplVal,
					model: data,
					hasExcludeExtension: function(){
						return (data.excludeExtension == null || data.excludeExtension == "") ? true : false;
					},
					isOrgServiceOn : GO.util.isUseOrgService(true)
				});
				
				this.$el.html(tmpl);
				if(!self.model.get('attachSizeLimit')){
					$('#maxAttachSize').hide();
				}
				if(!self.model.get('attachNumberLimit')){
					$('#maxAttachNumber').hide();
				}
			},
			toggleRadio : function(e) {
				if($(e.currentTarget).attr('value') == "true"){
					if($(e.currentTarget).is(':radio[name="attachSizeLimit"]')){
						$('#maxAttachSize').show();
						$('input[name="maxAttachSize"]').focus();
					}else if($(e.currentTarget).is(':radio[name="attachNumberLimit"]')){
						$('#maxAttachNumber').show();
						$('input[name="maxAttachNumber"]').focus();
					}
				}else if($(e.currentTarget).attr('value') == "false"){
					if($(e.currentTarget).is(':radio[name="attachSizeLimit"]')){
						$('#maxAttachSize').hide();
						$('#maxAttachSizeAlert').html('');
					}else if($(e.currentTarget).is(':radio[name="attachNumberLimit"]')){
						$('#maxAttachNumber').hide();
						$('#maxAttachNumberAlert').html('');
					}
				}
			},
			boardConfigSave: function() {
				var self = this,
					validate = true;
					form = this.$el.find('form[name=formBoardConfig]');
				
				$.each(form.serializeArray(), function(k,v) {
					var targetValue = v.value;
					var targetId = v.name;
					var validateEl = $('#'+v.name+'Alert');
					
					validateEl.html('');
					if(targetId == "excludeExtension"){
						
						if(targetValue.match(new RegExp("^[a-zA-Z0-9,]*$"))){
							v.value = v.value.toLowerCase();
						}else{
							validateEl.html(adminLang["영어, 쉼표, 숫자만 입력가능"]);
							$('input[name="'+targetId+'"]').focus();
							validate = false;
							return false;
						}
					}else{
						var sizeFlag = $('input#size_false').is(":checked");
						var numberFlag = $('input#number_false').is(":checked");
						
						if((targetValue == 0 || targetValue == '') && (sizeFlag == false  || numberFlag == false)){
								validateEl.html(adminLang["제한 값을 입력하세요."]);
								$('input[name="'+targetId+'"]').focus();
								validate = false;
								return false;
						}else if(sizeFlag == false &&targetId == 'maxAttachSize' && targetValue >999 ){
								validateEl.html(adminLang["1~999"]);
								$('input[name="'+targetId+'"]').focus();
								validate = false;
								return false;
						}else if(numberFlag == false && targetId == 'maxAttachNumber' && targetValue >99){
								validateEl.html(adminLang["1~99"]);
								$('input[name="'+targetId+'"]').focus();
								validate = false;
								return false;
						}
					}
					if(!validate){
						return false;
					}
					self.model.set(v.name, v.value, {silent: true});
				});
				if(!validate){
					return false;
				}
				self.model.save({}, {
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
			boardConfigCancel : function(){
				var self = this;
				$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function() {
					self.render();
					$.goMessage(commonLang["취소되었습니다."]);
				}, commonLang["확인"]);
			}
						
		}, {
			__instance__: null
		});
		
		return BoardBaseConfig;
	});
}).call(this);