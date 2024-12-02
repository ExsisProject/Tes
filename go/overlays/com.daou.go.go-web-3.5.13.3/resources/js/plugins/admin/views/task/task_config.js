(function() {
	define([
        "jquery", 
        "app", 
        "views/circle",
        "i18n!nls/commons", 
        "i18n!admin/nls/admin", 
        "admin/models/task_config", 
        "hgn!admin/templates/task_config", 
        "jquery.go-popup", 
        "jquery.go-sdk",
        "jquery.go-orgslide"
    ], 
    function(
		$, 
		App,
		CircleView,
		commonLang, 
		adminLang, 
		TaskConfigModel, 
		configTmpl
	) {
		var tmplVal = {
			label_ok: commonLang["저장"],
			label_cancel: commonLang["취소"],
			label_base: adminLang["업무 기본설정"],
			label_side: adminLang["Side 우선 설정"],
			label_dept: adminLang["부서 업무 폴더"],
			label_company: adminLang["전사 업무 폴더"],
			label_attach_limit: adminLang["첨부파일 용량제한"],
			label_attach_limit_desc: adminLang["파일1개"],
			label_non_limit: adminLang["제한없음"],
			label_limit_size: adminLang["용량제한"],
			label_limit_number: adminLang["개수제한"],
			label_mb: adminLang["MB"],
			label_attach_num_limit: adminLang["첨부파일 개수제한"],
			label_attach_num_limit_desc: adminLang["업무당"],
			label_count: adminLang["개"],
			label_under: adminLang["이하"],
			label_exclude: adminLang["업로드 불가 파일"],
			label_desc: adminLang["업로드 제한"],
			label_org_view: adminLang["조직도별 업무 현황 보기"],
			label_view_desc: adminLang["조직도별업무현황 설명"],
			label_cal_view: adminLang["캘린더 뷰 사용자"],
			label_detail_view: adminLang["업무 상세 보기 허용"]
		};
		
		var TaskConfig = App.BaseView.extend({
			
			events: {
				"click form[name='formTaskConfig'] input:radio" : "toggleRadio",
				"click span#btn_ok" : "taskConfigSave",
				"click span#btn_cancel" : "taskConfigCancel",
				"click span.btn_box[data-btntype='changeform']" : "changeModifyForm",
				"click span#data" : "changeModifyForm",
				"click span#data" : "changeModifyForm",
				"keyup input[name='excludeExtension']" : "keyUPValidator",
				"keyup span#maxAttachSize input" : "keyUPValidator",
				"keyup span#maxAttachNumber input" : "keyUPValidator",
				"focusout span#maxAttachSize input" : "inputValidator",
				"focusout span#maxAttachNumber input" : "inputValidator",
				"submit form" : "formSubmit"
			}, 
			
			initialize : function(){
				this.model = TaskConfigModel.read({admin:true});
			},
			
			render : function() {
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
					this.$('#maxAttachSize').hide();
				}
				if(!self.model.get('attachNumberLimit')){
					this.$('#maxAttachNumber').hide();
				}
				this._renderViewer();
				
				return this;
			},
			_renderViewer : function() {
				var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
	        	if(GO.util.isUseOrgService(true)){
	        		nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
	        	}

	            this.taskCalendarView = new CircleView({
	                selector: '#viewer',
	                isAdmin: true,
	                isWriter: true,
	                circleJSON: this.model.get('viewers'),
	                nodeTypes: nodeTypes
	            });

	            this.taskCalendarView.render();
	            this.taskCalendarView.show();
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
				var sizeFlag = this.$('input#size_false').is(":checked");
				var numberFlag = this.$('input#number_false').is(":checked");
				
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
			
			toggleRadio : function(e) {
				if($(e.currentTarget).attr('value') == "true"){
					if($(e.currentTarget).is(':radio[name="attachSizeLimit"]')){
						this.$('#maxAttachSize').show();
						this.$('input[name="maxAttachSize"]').focus();
					}else if($(e.currentTarget).is(':radio[name="attachNumberLimit"]')){
						this.$('#maxAttachNumber').show();
						this.$('input[name="maxAttachNumber"]').focus();
					}
				}else if($(e.currentTarget).attr('value') == "false"){
					if($(e.currentTarget).is(':radio[name="attachSizeLimit"]')){
						this.$('#maxAttachSize').hide();
						this.$('#maxAttachSizeAlert').html('');
					}else if($(e.currentTarget).is(':radio[name="attachNumberLimit"]')){
						this.$('#maxAttachNumber').hide();
						this.$('#maxAttachNumberAlert').html('');
					}
				}
			},
			
			taskConfigSave: function() {
				var self = this,
					validate = true;
					form = this.$el.find('form[name=formTaskConfig]');
				
				$.each(form.serializeArray(), function(k,v) {
					var targetValue = v.value;
					var targetId = v.name;
					var validateEl = self.$('#'+v.name+'Alert');
					
					validateEl.html('');
					
					if(targetId == "excludeExtension"){
						if(targetValue.match(new RegExp("^[a-zA-Z0-9,]*$"))){
							v.value = v.value.toLowerCase();
						}else{
							validateEl.html(adminLang["영어, 쉼표, 숫자만 입력가능"]);
							self.$('input[name="'+targetId+'"]').focus();
							validate = false;
							return false;
						}
					}else{
						var sizeFlag = self.$('input#size_false').is(":checked");
						var numberFlag = self.$('input#number_false').is(":checked");
						
						if((targetValue == 0 || targetValue == '') && (sizeFlag == false  || numberFlag == false)){
								validateEl.html(adminLang["제한 값을 입력하세요."]);
								self.$('input[name="'+targetId+'"]').focus();
								validate = false;
								return false;
						}else if(sizeFlag == false &&targetId == 'maxAttachSize' && targetValue >999 ){
								validateEl.html(adminLang["1~999"]);
								self.$('input[name="'+targetId+'"]').focus();
								validate = false;
								return false;
						}else if(numberFlag == false && targetId == 'maxAttachNumber' && targetValue >99){
								validateEl.html(adminLang["1~99"]);
								self.$('input[name="'+targetId+'"]').focus();
								validate = false;
								return false;
						}
					}
					if(!validate){
						return false;
					}
					self.model.set(v.name, v.value, {silent: true});
				});
				
				var viewers = self.taskCalendarView.getData();
				self.model.set('viewers', viewers);
				self.model.set('detailView', self.$("#detailView").is(":checked"));
				
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
			taskConfigCancel : function(){
				var self = this;
				$.goCaution(commonLang["취소"], commonLang["변경한 내용을 취소합니다."], function() {
					self.render();
					$.goMessage(commonLang["취소되었습니다."]);
				}, commonLang["확인"]);
			}
		});
		return TaskConfig;
	});
}).call(this);