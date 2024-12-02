(function() {
	define([
        "jquery",
	    "backbone",
	    "app",
	    
	    "admin/models/base_model",
	    "hgn!admin/templates/mail/alias_create",
	    "hgn!admin/templates/mail/alias_modify",
	    
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        
        "GO.util",
        "jquery.go-popup",
        "jquery.go-orgslide",
        "jquery.go-aliasorgslide",
        "jquery.go-validation"
	],
	function(
        $,
	    Backbone,
	    App,
	    
	    AliasModel,
	    AliasCreateTmpl,
	    AliasModifyTmpl,
	    
        commonLang,
        adminLang
	) {
		var instance = null;
		var lang = {
				label_alias_create : adminLang["별칭 계정 추가"],
				label_ok : commonLang['저장'],
				label_cancel : commonLang['취소'],
				label_enabled_status : adminLang['정상'],
				label_disabled_status : adminLang['중지'],
				label_alias_name : adminLang['별칭 계정 이름'],
				label_alias_id : adminLang['별칭 계정 아이디'],
				label_service_status : adminLang['서비스 상태'],
				label_forwarding_email : adminLang['전달할 이메일'],
				label_select_account : adminLang['계정 선택'],
				label_select_alias : adminLang['별칭 선택'],
				label_delete : adminLang['삭제'],
				label_modify : adminLang['수정'],
				label_forwrding_detail_user : adminLang['(부서,사용자)'],
				label_forwrding_detail_alias : adminLang['(별칭 계정)'],
				label_move_list : adminLang['목록으로 돌아가기'],
				id_tooltip : adminLang["아이디 툴팁"],
		};
		
		var AliasCreateView = Backbone.View.extend({
			events : {
				'click #selectAccount' : 'addAccount',
				'click #selectAlias' : 'addAlias',
				'click ul.name_tag li span.ic_del' : 'deleteEamil',
				'click #btn_ok' : 'saveAlias',
				'click span.editable' : 'changeInput',
				'click #btn_cancel' : 'cancel',
				'click #btn_move_list' : 'moveList'
			},
			
			initialize: function(options) {
				this.$el.off();
				this.options = options || {};
				this.renderEl = this.options.renderEl;
				this.aliasId = this.options.aliasId;
				this.parentId = this.options.parentId;
				this.useLayout = this.options.useLayout == undefined ? true : this.options.useLayout;
				this.model = new AliasModel({
					urlRoot : GO.contextRoot + "ad/api/mail/alias",
					id : this.aliasId
				});
				var companyInfo = new Backbone.Model();
				companyInfo.url = "/ad/api/company";
				companyInfo.fetch({async : false});
				this.companyInfo = companyInfo.toJSON();
			},
			
			render: function() {
				var domain = "";
				//$("#selectType").hide();	// 선택 숨기기
				this.$el.empty();
				if(this.aliasId != undefined){
					this.model.fetch({
						async : false
					});
					this.$el.html(AliasModifyTmpl({
						lang : lang,
						domain : this.companyInfo.domainName,
						data : this.model.toJSON(),
						useLayout : this.useLayout
					}));
					if(this.model.get('accountStatus') == "disabled"){
						this.$el.find('#accountStatus_disabled').attr('checked', 'checked');
					}
					this.renderAccountList(this.model.get('forwardingAddress'));
				} else {
					this.$el.html(AliasCreateTmpl({
						lang : lang,
						domain : this.companyInfo.domainName,
						useLayout : this.useLayout
					}));
				}
				return this;
			},
			
			addAlias : function(e) {
				$.goOrgSlide('close');
				$.goAliasOrgSlide('close');
				var _this = this;
				var popupEl = $.goAliasOrgSlide({
					header : adminLang['별칭 목록'],
					desc : '',
					callback : _this.renderAliasLi,
					target : e,
					isAdmin : true,
					contextRoot : GO.contextRoot,
					type : 'node',
					aliasId : this.aliasId
				});
			},
			
			addAccount : function(e){
				$.goOrgSlide('close');
				$.goAliasOrgSlide('close');
				var _this = this;
				var popupEl = $.goOrgSlide({
					header : adminLang['조직도'],
					desc : '',
					callback : _this.renderAccountLi,
					target : e,
					isAdmin : true,
					contextRoot : GO.contextRoot,
					type : 'node'
				});
			},
			
			renderAccountList : function(accounts){
				var self = this;
				var deletedDeptMessage = [];
				$.each(accounts, function(i, account){
					account.originalEmail = account.email;
					if(account.userType == 'aliasUser'){
						self.renderAliasLi(account, self.$el.find('#addAliasEmailEl'));
					}else{
						self.renderAccountLi(account, self.$el.find('#addEmailEl'));
						if (account.deletedDept) {
							deletedDeptMessage.push(App.i18n(adminLang['부서명: 0, 부서이메일: 0'], {"arg1": account.name, "arg2": account.originalEmail}));
						}
					}
				});
				if (!_.isEmpty(deletedDeptMessage)) {
					deletedDeptMessage.unshift( adminLang['해당 부서를 완전삭제 하시거나 전달할 이메일에서 제거해주세요.']);
					$.goAlert(adminLang['삭제된 부서의 이메일이 존재합니다.'], deletedDeptMessage.join('\n'));
				}
			},
			
			renderAliasLi :function(account, targetEl){
				
				var aliasItemTpl = Hogan.compile('<li data-email="{{email}}">'+
						'<span class="name"> '+
							' {{name}} - {{email}}'+
							'<input type="hidden" name="aliasEmail" value="{{email}}" />'+
							'<input type="hidden" name="name" value="{{name}}" />'+
							'<input type="hidden" name="userType" value="{{userType}}" />'+
						'</span>'+
						'<span class="btn_wrap">'+
							'<span class="ic_classic ic_del" title="{{lang.label_delete}}"></span>'+									
						'</span>'+
					'</li>');

				if(targetEl == undefined){
					targetEl = $('#addAliasEmailEl');
				}
				
				if(account.email ==''){
					$.goAlert('', adminLang["부서 이메일이 존재하지 않습니다."]);
					return;
				}
				var isDuplicate = false;
				$.each(targetEl.find('li'), function(i, liEl){
					var targetEmail = $(liEl).find('input[name="aliasEmail"]').val();
					if(targetEmail == account.email){
						isDuplicate = true;
					}
				});
				if(isDuplicate){
					$.goAlert('', adminLang["이미 추가된 이메일입니다."]);
					return;
				}
				if( account.email != targetEl.find('li').attr('data-email') ) {
					targetEl.find('#selectAlias').parents('li.creat').before(aliasItemTpl.render($.extend(account, { lang : lang })));
				}else{
					$.goAlert('', adminLang["이미 추가된 이메일입니다."]);
				}
			},
			
			renderAccountLi : function(account, targetEl){

				var aliasItemTpl = Hogan.compile('<li data-id="{{id}}">'+
											'<span class="name">'+
												'{{name}} - {{originalEmail}}'+
												'<input type="hidden" name="accountEmail" value="{{originalEmail}}" />'+
												'<input type="hidden" name="name" value="{{name}}" />'+
												'<input type="hidden" name="userType" value="{{userType}}" />'+
											'</span>'+
											'<span class="btn_wrap">'+
												'<span class="ic_classic ic_del" title="{{lang.label_delete}}"></span>'+									
											'</span>'+
										'</li>');
				
				if(targetEl == undefined){
					targetEl = $('#addEmailEl');
				}
				
				if(account.originalEmail =='' || account.originalEmail.split('@')[0] == ''){
					$.goAlert('', adminLang["부서 이메일이 존재하지 않습니다."]);
					return;
				}

				var isDuplicate = false;
				$.each(targetEl.find('li'), function(i, liEl){
					var targetEmail = $(liEl).find('input[name="accountEmail"]').val();
					if(targetEmail == account.originalEmail){
						isDuplicate = true;
					}
				});
				if(isDuplicate){
					$.goAlert('', adminLang["이미 추가된 이메일입니다."]);
					return;
				}

				if(account.userType == 'orgAdmin' || account.type == "org"){	// 조직이면 부서 이미지를 추가한다.
					aliasItemTpl = Hogan.compile('<li data-id="{{id}}"><span class="ic_classic ic_part" title="부서"></span>'+
							'<span class="name"> '+
								' {{name}} - {{originalEmail}}'+
								'<input type="hidden" name="accountEmail" value="{{originalEmail}}" />'+
								'<input type="hidden" name="name" value="{{name}}" />'+
								'<input type="hidden" name="userType" value="{{userType}}" />'+
							'</span>'+
							'<span class="btn_wrap">'+
								'<span class="ic_classic ic_del" title="{{lang.label_delete}}"></span>'+									
							'</span>'+
						'</li>');
					targetEl.find("#addOrgEmailEl").append( aliasItemTpl.render( $.extend(account, { lang : lang })) );
				}else if(account.userType =="mailUser" || account.type == "MASTER" || account.type == "MODERATOR" ||account.type == "MEMBER" ){ //MASTER, MODERATOR, MEMBER
					targetEl.find("#addUserEmailEl").append( aliasItemTpl.render( $.extend(account, { lang : lang })) );
				}else {		// 그밖에 경우 (다른 기업 커스텀 마이징 때문에 추가)
					aliasItemTpl = Hogan.compile('<li data-id="{{id}}" style="background:lightyellow">'+
							'<span class="name"> '+
								' {{name}} - {{originalEmail}}'+
								'<input type="hidden" name="accountEmail" value="{{originalEmail}}" />'+
								'<input type="hidden" name="name" value="{{name}}" />'+
								'<input type="hidden" name="userType" value="{{userType}}" />'+
							'</span>'+
							'<span class="btn_wrap">'+
								'<span class="ic_classic ic_del" title="{{lang.label_delete}}"></span>'+									
							'</span>'+
						'</li>');
					targetEl.find("#addUserEmailEl").append( aliasItemTpl.render( $.extend(account, { lang : lang })) );
				}
			},
			
			deleteEamil : function(e) {
				$(e.currentTarget).parents('li').remove();
			},
			
			saveAlias : function() {
				var self = this,
					isValid = true,
	        		type = 'POST';
				var forwardingAddresses = [];
				
	        	var form = $('form[name=formAliasCreate]');
	        	if(this.aliasId){
	        		form = $('form[name=formAliasModify]');
	        		type = 'PUT';
	        	}
	        	$.each(form.serializeArray(), function(k,v){
	        		if(v.name == "userName"){
	        			if($.goValidation.isInvalidLength(2,64,v.value)){
	        				$.goMessage(App.i18n(adminLang["{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다."], 
	        						{"arg1":adminLang['별칭 계정 이름'],"arg2":"2","arg3":"64"}));
	        				$("#userName").focus();
	        				isValid = false;
	        				return false;
	        			}
	        		}else if(v.name == "mailUid") {
	        			if($.goValidation.isInvalidLength(2,64,v.value)){
	        				$.goMessage(App.i18n(adminLang["{{arg1}}은(는) {{arg2}}자이상 {{arg3}}이하 입력해야합니다."], 
	        						{"arg1":adminLang['별칭 계정 아이디'],"arg2":"2","arg3":"64"}));
	        				$("#mailUid").focus();
	        				isValid = false;
	        				return false;
	        			}
	        			if($.goValidation.isInvalidEmailId(v.value)){
	        				$.goMessage(adminLang['사용할 수 없는 이메일입니다.']);
	        				$("#mailUid").focus();
	        				isValid = false;
	        				return false;
	        			}
	        			
	        		}
	        		self.model.set(v.name, v.value, {silent: true});
	        	});
	        	
	        	if(!isValid){
	        		return;
	        	}

	        	if(this.useLayout || this.aliasId){
		        	$.each($('#addEmailEl li'), function(i, liEl){
		        		var item = {name : $(liEl).find('[name="name"]').val() , email : $(liEl).find('[name="accountEmail"]').val() , userType : $(liEl).find("[name='userType']").val()};
		        		if(item.name || 0 != 0 || item.email || 0 != 0){
		        			forwardingAddresses.push(item);
		        		}
		        	});
		        	$.each($('#addAliasEmailEl li'), function(i, liEl){
		        		var item = {name : $(liEl).find('[name="name"]').val() , email : $(liEl).find('[name="aliasEmail"]').val() , userType : $(liEl).find("[name='userType']").val()};
		        		if(item.name || 0 != 0 || item.email || 0 != 0){
		        			forwardingAddresses.push(item);
		        		}
		        	});
	        	}
	        	
	        	if(this.aliasId){
	        		self.model.set("parentMailUserSeq", this.aliasId, {silent: true});
	        		self.model.set("prevParentMailUserSeq", this.aliasId, {silent: true});
	        	}
	        	
	        	if(this.parentId){
	        		self.model.set("parentMailUserSeq", this.parentId, {silent: true});
	        	}
	        	self.model.set("forwardingAddress", forwardingAddresses, {silent: true});
	        	this.model.save({}, {
					type : type,
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
							App.EventEmitter.trigger('common', 'layout:clearOverlay', true);
							if(self.aliasId){
								if(self.useLayout){
									self.render();
								} else {
									GO.EventEmitter.trigger('admin', 'layout:renderAliasTree', "");
								}
							}else{
								if(self.useLayout){
									App.router.navigate('mail/alias', {trigger: true});
								} else {
									App.router.navigate('mail/alias/tree', {trigger: true});
								}
							}
						}
					},
					error : function(model, response) {
						var responseData = JSON.parse(response.responseText);
						$.goMessage(responseData.message);
						if(responseData.name == "duplicated.login.id"){
							$("#mailUid").focus();
						}
						App.EventEmitter.trigger('common', 'layout:clearOverlay', true);
					}
				});
			},
			
			changeInput : function(e){
	            var $toggleEl = $(e.target),
	                hideTarget;

	            if($toggleEl.hasClass("ic_edit")){
	                hideTarget = $toggleEl.parent().parent();
	                hideTarget.hide();
	                hideTarget.next().show();
	            }else{
	                $toggleEl.hide();
	                $toggleEl.next().show();
	            }
	        },
	        
	        cancel : function() {
	        	this.render();
	        },
	        
	        moveList : function() {
				App.router.navigate('mail/alias', {trigger: true});
	        }
		});

		return AliasCreateView;
		
	});
}).call(this);
