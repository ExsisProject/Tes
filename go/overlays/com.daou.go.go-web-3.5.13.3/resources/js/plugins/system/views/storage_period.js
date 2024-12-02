(function() {
	define([
		"jquery",
		"backbone", 	
		"app",
		"hgn!system/templates/storage_period",
	    "i18n!nls/commons",
	    "i18n!admin/nls/admin",
	    "jquery.go-grid",
	    "jquery.go-sdk",
	    "GO.util"
	], 

function(
	$, 
	Backbone,
	App,
	StoragePeriodTmpl,
	commonLang,
	adminLang
) {
	var tmplVal = {
			'label_set_storage_period' : adminLang['보관 기간 설정'],
			'label_noti_period' : adminLang['알림 보관 기간'],
			'label_chat' : adminLang['대화내용 보관 기간'],
			'label_attach' : adminLang['첨부파일 보관 기간'],
			'label_chat_and_attach' : adminLang['대화 및 첨부파일 보관 기간'],
			'label_ok': commonLang['저장'],
			'label_cancel': commonLang['취소'],
			'label_direct_input':adminLang['직접 입력'],
			'label_months':adminLang['개월'],
			'label_days':adminLang['일단위'],
			'label_years':adminLang['년단위'],
			'label_validation_input':adminLang['(1~999 입력가능)'],
			'label_tool_tip':adminLang['대화내용 보관 기간 설명'],
			'label_apply_all' : adminLang['시스템 설정'],
			'label_apply_site' : adminLang['사이트 별 설정'],

	};

	var StoragePeriodView = Backbone.View.extend({
		el : '#layoutContent',
		initialize : function() {
			this.unbindEvent();
			this.bindEvent();
			this.model = null;
		},
		unbindEvent : function() {
			this.$el.off();
		},
		bindEvent : function() {
			this.$el.on("click", "#btn_ok", $.proxy(this.saveStoragePeriod, this));
			this.$el.on("click", "#btn_cancel", $.proxy(this.cancelStoragePeriod, this))
			this.$el.on("change", "#notiPeriod", $.proxy(this.selectNotiPeriod, this));
			this.$el.on("change", "[name='applyType']", $.proxy(this.toggleRadio, this));
		},
		render : function() {
			
			$('#etcConfig').addClass("on");
			
			var self = this;
		    var deferred = $.Deferred();
		    
		    $.when(this.getStoragePeriod()).then(function(){
		    	$('.breadcrumb .path').html(adminLang['기타 설정'] +" > " + adminLang['보관 기간 설정']);
		    	$('#layoutTitle').html(adminLang['보관 기간 설정']);
		    	self.$el.html(StoragePeriodTmpl({
						lang : tmplVal,
						isApplyAll : function() {
							if("ALL" == self.model.applyType) {
								return true;
							}
							return false;
						}
				}));
		    	deferred.resolveWith(self, [self]);
		    	self.selectedValueFromModel();
		    	self.toggleRadio();
		    });
		    
            return deferred;
		},
		
		getStoragePeriod : function(){
			var self = this;
			var deferred = $.Deferred();
			
			var url = GO.contextRoot + "ad/api/system/storagePeriod";
			var self = this;
			$.go(url,'' , {
				qryType : 'GET',				
				responseFn : function(response) {
					if(response.code == 200){
						self.model = response.data;
						deferred.resolve();
					}
				},
				error: function(response){
					
				}
			});
			return deferred;
		},
		saveStoragePeriod : function(){
			var self = this;
			var deferred = $.Deferred();
			var param = {};
			var url = GO.contextRoot + "ad/api/system/storagePeriod";

			var notiPeriod = self.$('#notiPeriod').val();
			var chatPeriod = Number(self.$('#chatPeriod').val());
			var chatAttachPeriod = Number(self.$('#chatAttachPeriod').val());

			if(notiPeriod=='etc') {
				var etcValue = self.$('#notiPeriodDirectValue').val();
				if(isNaN(etcValue) || etcValue<1){
					$.goError(adminLang["숫자만 입력하세요."]);
					return;
				}
				notiPeriod=  etcValue+ "_days" ; 
			}

			if(isNaN(chatPeriod) || chatPeriod < 1 || isNaN(chatAttachPeriod) || chatAttachPeriod < 1) {
				$.goError(adminLang["숫자만 입력하세요."]);
				return;
			}

			if(chatAttachPeriod > chatPeriod) {
				$.goError(App.i18n(adminLang["대화내용 ge 첨부파일 보관기간"]));
				return;
			}

			param["notiPeriod"] = notiPeriod;
			param["chatPeriod"] = chatPeriod;
			param["chatAttachPeriod"] = chatAttachPeriod;
			param["applyType"] = $("[name='applyType']:checked").val();
			
			$.go(url,JSON.stringify(param) , {
				qryType : 'PUT',	
				contentType : 'application/json',
				responseFn : function(response) {
					if(response.code == 200){
						$.goMessage(commonLang["저장되었습니다."]);
						self.model = response.data;
						deferred.resolve();
					}
				},
				error: function(response){
					$.goMessage(responseData.message);
				}
			});
			return deferred;
		},
		selectedValueFromModel : function() {
			var self = this;
			var notiPeriod = this.model.notiPeriod;
			var chatPeriod = this.model.chatPeriod;
			var chatAttachPeriod = this.model.chatAttachPeriod;
			var isSelNoti = false;

			$.each($("select#notiPeriod option"), function(i, option){
				if($(option).val()==notiPeriod){
					self.$("#notiPerioddirect").hide();
					$(option).attr("selected","selected"); 
					isSelNoti = true;	return false;
				}
			});

			if(!isSelNoti){
				self.$("#notiPerioddirect").show();
				self.$("select#notiPeriod option[value='etc']").attr("selected","selected");
				self.$("#notiPeriodDirectValue").removeAttr("disabled");
				var etcVal = notiPeriod.split('_');
				self.$("#notiPeriodDirectValue").val(etcVal[0]);
			}

			self.$("#chatPeriod").val(chatPeriod);
			self.$("#chatAttachPeriod").val(chatAttachPeriod);
		},
		
		selectNotiPeriod : function(e){
			if($(e.currentTarget).val()=='etc'){
				this.$("#notiPerioddirect").show();
				this.$("#notiPeriodDirectValue").removeAttr("disabled").val("1");
			}else { 
				this.$("#notiPerioddirect").hide();
				this.$("#notiPeriodDirectValue").attr("disabled","disabled").val("-");
			}
		},
		
		toggleRadio : function(){
			var checked = $("[name='applyType']:checked").val();
			if(checked == "ALL"){
				$('#chatPeriodDiv').show();
				$('#chatAttachPeriodDiv').show();
			}else{
				$('#chatPeriodDiv').hide();
				$('#chatAttachPeriodDiv').hide();
			}
		},
		cancelStoragePeriod : function(e) {
			this.render();
		}
	},{
			__instance__: null
	});
	
		return StoragePeriodView;
	});
}).call(this);