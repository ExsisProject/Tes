define(function(require) {
	var $ = require("jquery");
	require("jquery.go-sdk");
	require("jquery.go-validation");
    require("jquery.go-popup");
    require("jquery.go-orgslide");
	var Backbone = require("backbone");
	var App = require('app');

	var FMenuConfigModel = require("admin/models/fmenu_config");
	var modifyTmpl = require("hgn!admin/templates/fmenu_update");
	var DomainClassView = require("admin/views/org_group_list");
	var LinkMenuListView = require("admin/views/link_menu_list");
	var CustomOrgWebView = require("admin/views/custom_org_web");
	var CircleView = require("views/circle");
	var commonLang = require("i18n!nls/commons");
	var adminLang  = require("i18n!admin/nls/admin");

	var tmplVal = {
		add_org_access_deny : adminLang["접근제한 클래스 추가"],
		label_ok: commonLang["저장"],
		label_cancel: commonLang["취소"],
		use : commonLang["사용"],
        not_use : commonLang["사용하지 않음"],
        use_label : adminLang["사용여부"],
        label_base: adminLang["기본 정보"],
        label_access: adminLang['메뉴 접근 설정'],
        label_fmenu: adminLang['기능 메뉴'],
        label_status: adminLang['메뉴 활성화 여부'],
        label_online: adminLang['해당 메뉴를 활성화 합니다.'],
        label_stop: adminLang['해당 메뉴를 비활성화 합니다. 외부에 노출하지 않습니다.'],
        label_white : adminLang['공개'],
        label_black : adminLang['비공개'],
        label_policy : adminLang['정책 설정'],
        label_addAccessDenyClass : adminLang['접근 처던 클래스 추가'],
        label_addAccessAllowedClass : adminLang['접근 허용 클래스 추가'],
        label_selectClass : adminLang['차단할 클래스 선택'],
        label_addExceptionClass : adminLang['허용할 클래스 선택'],
		설정 : adminLang['설정']
	};
	var instance = null;

	var fmenuCreate = Backbone.View.extend({
		accessUserView: null,
		exceptionUserView: null,

		unbindEvent: function() {
			this.$el.off("click", "span.btn[data-btntype='submit_modify']");
			this.$el.off("click", "span.btn_nega[data-btntype='cancel']");

			this.$el.off("click", "#selectAccessPolicy input:radio");
			this.$el.off("click", "input:radio[name='status']");
			this.$el.off("click", "span[data-btntype='publicModify']");
            this.$el.off("click", "span[data-btntype='publicDelete']");

		},
		bindEvent : function() {
			this.$el.on("click", "span.btn[data-btntype='submit_modify']", $.proxy(this.save, this));
			this.$el.on("click", "span.btn_nega[data-btntype='cancel']", $.proxy(this.cancel, this));

			this.$el.on("click", "#selectAccessPolicy input:radio", $.proxy(this.changePolicyLabel, this));
			this.$el.on("click", "input:radio[name='status']", $.proxy(this.toggleStatus, this));
			this.$el.on("click", "span[data-btntype='publicModify']", $.proxy(this.modifyPublicRange, this));
	        this.$el.on("click", "span[data-btntype='publicDelete']", $.proxy(this.deletePublicRange, this));
		},
		initialize: function(options) {
			this.options = options || {};
			this.fmenuId = this.options.fmenuId;
			this.release();
			this.unbindEvent();
			this.bindEvent();
		},
		cancel : function() {
			App.router.navigate('/company/function', true);
		},
		render : function() {
			var tmpl;
			if(this.fmenuId){
				var self = this;
				if(this.model != null) {
					this.model.clear();
				}
				this.model = FMenuConfigModel.read(this.fmenuId);

				tmpl = modifyTmpl({
					lang : tmplVal,
					data : this.model.toJSON(),
					nameValue : function() {
						if(this.name == 'org'){
							return adminLang["조직도 - 웹서비스"];
						}else if(this.name == 'org_mobile'){
							return adminLang["조직도 - 모바일"];
						}else if(this.name == 'org_pc'){
							return adminLang["조직도 - PC 메신저"];
						}else if(this.name == 'chat'){
							return adminLang["대화"];
						}else if(this.name == 'messenger'){
							return adminLang["PC 메신저"];
						}else if(this.name == 'mobileapp'){
							return adminLang["모바일 앱"];
						}else if(this.name == 'note'){
							return adminLang["쪽지"];
						}else if(this.name == 'pubsubcircle'){
							return adminLang["공지톡"];
						}
					},
					isOnline : function() {
						if(this.status == 'online') return true;
						else return false;
					},
					makeNodeValue : function() {
						if(this.nodeType == "position"){
							return "[" + adminLang['직위'] + " : " + this.nodeValue + "]";
						}else if(this.nodeType == "grade"){
							return "[" + adminLang['직급'] + " : " + this.nodeValue + "]";
						}else if(this.nodeType == "duty") {
							return "[" + adminLang['직책'] + " : " + this.nodeValue + "]";
						}else if(this.nodeType == "usergroup") {
							return "[" + adminLang['사용자그룹'] + " : " + this.nodeValue + "]";
						}else{
							return this.nodeValue;
						}
					}
				});
				this.$el.html(tmpl);
				this.renderAccessUserView();
				this.renderExceptionUserView();

				this.customConfigRender();
			}
			if($(":input:radio[name='status']:checked").val() == 'online'){
				$('#accessControll').show();
			}else{
				$('#accessControll').hide();
			}
			DomainClassView.render({id:"#partPublicWrap",type:"add"});
			if($(":radio[name='apply']:checked").val() == "false") {
				$('#configOff').parents('tr').addClass('last');
			}
			var accessSetting = self.model.get("accessSetting");
			$('input[name="accessSetting"][value="'+accessSetting+'"]').attr('checked', true);
			if("black" == accessSetting){
                $('#selectedClass').text(adminLang['차단할 클래스 선택']);
                $('#exceptedClass').text(adminLang['예외 허용 클래스 선택']);
				$('#exceptedClassToolTip').text(adminLang['예외허용 클래스 선택 툴팁']);
            }else{
                $('#selectedClass').text(adminLang['허용할 클래스 선택']);
                $('#exceptedClass').text(adminLang['예외 차단 클래스 선택']);
                $('#exceptedClassToolTip').text(adminLang['예외차단 클래스 선택 툴팁']);
			}
		},
		toggleStatus : function(e){
			if($(e.target).val() == "stop"){
				$("#accessControll").hide();
				$("#customFunctionMenu").hide();
			}else if($(e.target).val() == "online"){
				$("#accessControll").show();
				if($('#customConfigArea').children().length>0){
					$('#customFunctionMenu').show();
				}
			}
		},
		save : function(e) {
			var customConfigSaveResult = this.customConfigSave();
			if(customConfigSaveResult.success){
				var self = this;

				self.model.set('status', $(":radio[name='status']:checked").val());
				self.model.set('accessSetting', $(":radio[name='accessSetting']:checked").val());
				var accessUser = this.accessUserView.getData();
				self.model.set('accessTarget', accessUser);
	            var exceptionUser = this.exceptionUserView.getData();
	            self.model.set('exceptionTarget', exceptionUser);

				GO.util.preloader(self.model.save({},{
					type : 'PUT',
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
						}
					},
					error : function(model, response) {
						var responseData = JSON.parse(response.responseText);
						if(responseData != null){
							$.goAlert(commonLang["오류"],responseData.message);
						}else{
							$.goMessage(commonLang["실패했습니다."]);
						}
					}
				}));
			}else{
				var errorMessage = customConfigSaveResult.message;
				if(errorMessage!=null){
					$.goAlert(commonLang["오류"], errorMessage);
				}else{
					$.goMessage(commonLang["실패했습니다."]);
				}
			}

			return;
		},
		getAccessTargetInfo : function(){
            var nodeList = [];
            $("#groupUl li").each(function(){
                nodeList.push({"nodeId" : $(this).attr("data-code"), "nodeType" : $(this).attr("data-type")});
            });
            return nodeList;
        },
        changePolicyLabel : function(event){
            if($(event.target).val() == "black"){
                $('#selectedClass').text(adminLang['차단할 클래스 선택']);
                $('#exceptedClass').text(adminLang['예외 허용 클래스 선택']);
                $('#exceptedClassToolTip').text(adminLang['예외허용 클래스 선택 툴팁']);
            }else{
                $('#selectedClass').text(adminLang['허용할 클래스 선택']);
                $('#exceptedClass').text(adminLang['예외 차단 클래스 선택']);
                $('#exceptedClassToolTip').text(adminLang['예외차단 클래스 선택 툴팁']);
            }
			this.confirmDeleteTarget(event);
		},
		confirmDeleteTarget : function(e){
			var self = this;
			var cancelCallback = function(){
					if($(e.target).val() == "black"){
						$('input[name="accessSetting"][value="white"]').attr('checked', true);
                        $('#selectedClass').text(adminLang['허용할 클래스 선택']);
                        $('#exceptedClass').text(adminLang['예외 차단 클래스 선택']);
                        $('#exceptedClassToolTip').text(adminLang['예외차단 클래스 선택 툴팁']);
		        	}else{
		        		$('input[name="accessSetting"][value="black"]').attr('checked', true);
                        $('#selectedClass').text(adminLang['차단할 클래스 선택']);
                        $('#exceptedClass').text(adminLang['예외 허용 클래스 선택']);
                        $('#exceptedClassToolTip').text(adminLang['예외허용 클래스 선택 툴팁']);
		        	}
				};
			var confirmCallback = function(){
					self.accessUserView.deleteAllData();
					self.exceptionUserView.deleteAllData();
				};
			$.goConfirm(adminLang['정책 설정 변경 확인'], "", confirmCallback, cancelCallback, commonLang['확인']);
		},
		modifyPublicRange : function(e){
            $(e.currentTarget).parents('li').first().after('<li></li>');
            DomainClassView.render({id:$(e.currentTarget).parents('li').first().next('li'),type:"save"});
            $(e.currentTarget).parents('li').first().find('span.btn_border').css("display","none");
        },
        deletePublicRange : function(e){
            $(e.currentTarget).parents('li').first().remove();
        },
        renderAccessUserView: function() {
        	var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
        	if(GO.util.isUseOrgService(true)){
        		nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
        	}
            this.accessUserView = new CircleView({
                selector: '#accessUser',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('accessTarget'),
                nodeTypes: nodeTypes
            });
            this.accessUserView.render();
        },
		renderExceptionUserView: function() {
        	var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
        	if(GO.util.isUseOrgService(true)){
        		nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
        	}
            this.exceptionUserView = new CircleView({
                selector: '#exceptionUser',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get('exceptionTarget'),
                nodeTypes: nodeTypes
            });
            this.exceptionUserView.render();
        },
        release: function() {
			this.$el.off();
			this.$el.empty();
		},

		customConfigRender : function() {
			var functionName = this.model.toJSON().name;

			if(functionName == 'messenger'){
				this.LinkMenuListView = new LinkMenuListView();
				this.LinkMenuListView.render();
			} else if(functionName == 'org'){
				this.CustomOrgWebView = new CustomOrgWebView();
				this.CustomOrgWebView.render();
			}

			if($('#online').is(':checked') && $('#customConfigArea').children().length>0){
				$('#customFunctionMenu').show();
			}
		},

		customConfigSave : function() {
			var result = {success : true, message : null};
			var functionName = this.model.toJSON().name;
			if(functionName == 'org'){
				result = this.CustomOrgWebView.save();
			}
			return result;
		}
	});
	return fmenuCreate;
})