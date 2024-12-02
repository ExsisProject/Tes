(function() {
	define([
        "jquery",
	    "backbone",
	    "app",
	    
	    "admin/models/mail_banner",
	    "hgn!admin/templates/mail/banner",
	    "hgn!admin/templates/mail/banner_edit",
	    
        "i18n!nls/commons",
        "i18n!admin/nls/admin",
        
        "content_viewer",
        
        "GO.util",
        "go-webeditor/jquery.go-webeditor"
	],
	function(
        $,
	    Backbone,
	    App,
	    
	    MailBannerModel,
	    BannerTmpl,
	    BannerEditTmpl,
	    
        CommonLang,
        AdminLang,
        
        ContentViewer
	) {
		var instance = null;
		var lang = {
			bannerDisplay: AdminLang["배너표시"],
			bannerSetting: AdminLang["배너설정"],
			bannerConfigInfo: AdminLang["메일 배너 표시 안내"],
			bannerNotFound: AdminLang["등록된 배너가 없습니다."],
			yes: CommonLang["사용"],
			no: AdminLang["사용 안함"],
			save: CommonLang["저장"],
			cancel: CommonLang["취소"],
			preview: CommonLang["미리보기"],
			edit: CommonLang["편집"],
			remove: CommonLang["삭제"],
			editMode: AdminLang["편집기 선택"]
		};
		
		var MailBannerView = Backbone.View.extend({
			el: "#layoutContent",
			
			initialize: function() {
				this.configModel = new Backbone.Model();
				this.configModel.url = GO.contextRoot + "ad/api/mail/bannerconfig"; 
				this.configModel.fetch({async : false});
				this.bannerModel = new MailBannerModel();
			},
			
			render: function() {
				this.bannerModel.fetch({async:false});
				
				var config = this.configModel.toJSON();
				config.isBannerDisplayOn = config.bannerDisplay === "on" ? true : false;
				
				var banner = this.bannerModel.toJSON();
				
				this.isEditMode = false;
				this.isCreate = this.bannerModel.has("content") ? false : true;
				this.contentType = banner.contentType ? banner.contentType : "HTML";
				
				var html = BannerTmpl({
					lang: lang,
                    config: config,
                    banner: banner,
                    isCreate: this.isCreate
				});
				this.$el.html(html);
				
				this.contentViewer = ContentViewer.init({
					$el : this.$("#bannerContentArea"),
					content : this.bannerModel.get("content")
				});
				
				this.toggleDeleteButton();
			},
			
            delegateEvents: function(events) {
                this.$el.on("click", "#btnModifyBanner", $.proxy(this.modifyBanner, this)); // 배너 편집
                this.$el.on("click", "#btnDeleteBanner", $.proxy(this.deleteBanner, this)); // 배너 삭제
                this.$el.on("click", "#btnSaveBanner", $.proxy(this.saveBanner, this)); // 설정및 배너 저장
                this.$el.on("click", ".btn_nega", $.proxy(this.cancel, this));
            },
            
            undelegateEvents: function() {
                this.$el.off();
            },
            
            saveBannerConfig: function() {
            	var form = GO.util.serializeForm(this.$el.find("#frmBannerConfig"));
            	
            	this.configModel.save(form, {
            		async: false,
                    success: function(model, response){
						return true;
                    }, error: function(model, response){
                    	GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    	if(response.message) $.goAlert(response.message);
                        else $.goMessage(CommonLang["실패했습니다."]);
                    	return false;
                    }
                });
            },
            
            modifyBanner: function() {
            	this.isEditMode = true;
            	
            	var html = BannerEditTmpl({
            		lang: lang
            	});
				this.$el.find("#trBannerContent").html(html);
				
				this.$el.off("change", "#selContentType");
				this.$el.on("change", "#selContentType", $.proxy(this.selectContentType, this));
				
				var content = this.bannerModel.get("content");
			
				this.$el.find("#bannerContent").val(this.contentType === "TEXT" ? content : "");
				this.initEditor(this.contentType === "HTML" ? content : "");
				
				this.changeContentType();
            },
            
            saveBanner: function() {
            	var self = this;
            	if(self.contentType === "TEXT" && !GO.Editor.getInstance("editor").validate()) {
            		$.goError(commonLang['마임 사이즈 초과']);
            		return false;
            	} 
            	
            	GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            	
            	var form = GO.util.serializeForm(this.$el.find("#frmBannerConfig"));
            	
            	var self = this;
            	this.configModel.save(form, {
                    success: function(model, response){
						if(self.isEditMode) { // 배너 편집 모드였을 경우 배너 저장
							var content = "";
							if(self.contentType === "TEXT") {
								content = self.$el.find("#bannerContent").val();
							} else {
								content = self.getContent();
							}
							
							if(self.isContentEmpty(content)) { // 본문이 비어있을 경우 배너 삭제
								self.autoDeleteBanner();
								GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
								$.goMessage(CommonLang["저장되었습니다."]);
							} else { // 배너 저장
								var banner = {
									contentType: self.contentType,
									content: content
								};
								
								self.bannerModel.save(banner, {
									success : function(){
										self.render();
										GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
										$.goMessage(CommonLang["저장되었습니다."]);
									},
									error : function(model, response) {
										self.render();
										GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
										if(response.message) $.goAlert(response.message);
										else $.goMessage(CommonLang["실패했습니다."]);
									}
								});
							}
						} else { // 미리보기 모드였을 경우 배너 설정만 저장
							self.render();
							GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
							$.goMessage(CommonLang["저장되었습니다."]);
						}
                    }, error: function(model, response){
                    	GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                    	if(response.message) $.goAlert(response.message);
                        else $.goMessage(CommonLang["실패했습니다."]);
                    	return false;
                    }
                });
            },
                        
            deleteBanner: function() {
            	GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            	
            	var self = this;
            	$.goConfirm(AdminLang["메일 배너 삭제 알림"], AdminLang["메일 배너 삭제 알림 내용"], function() {
            		self.bannerModel.destroy({
                        success : function(model){
                        	self.bannerModel = new MailBannerModel();
                        	self.render();
                        	GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            $.goMessage(AdminLang["메일 배너를 삭제 하였습니다."]);
                        },
                        error : function(model, response) {
                        	self.render();
                        	GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                            if(response.message) $.goAlert(response.message);
                            else $.goMessage(CommonLang["실패했습니다."]);
                        }
            		});
            	});
            },
            
            autoDeleteBanner: function() {
            	var self = this;
            	this.bannerModel.destroy({
                    success : function(model){
                    	self.bannerModel = new MailBannerModel();
                    	self.render();
                    },
                    error : function(model, response) {
                    	self.render();
                        if(response.message) $.goAlert(response.message);
                        else $.goMessage(CommonLang["실패했습니다."]);
                    }
        		});
            },
            
            cancel: function() {
            	var self = this;
				$.goCaution(CommonLang["취소"], CommonLang["변경한 내용을 취소합니다."], function() {
					self.render();
					$.goMessage(CommonLang["취소되었습니다."]);
				}, CommonLang["확인"]);
            },
            
            initEditor: function(content) {
				var locale = GO.session('locale');
				this.$el.find("#editor").goWebEditor({
					lang: locale,
					editorValue: content,
					contextRoot: GO.config('contextRoot')
				});
			},
			
			selectContentType: function() {
				var beforeContentType = this.contentType;
				
				var self = this;
				$.goConfirm(AdminLang["편집 모드 변경"], AdminLang["편집 모드 변경 알림"], function() {
					self.contentType = $("#selContentType").val();
					self.clearContent();					
					self.changeContentType();
				}, CommonLang["확인"], function() {
					self.$el.find("#selContentType").val(beforeContentType);
				});
			},
			
			changeContentType: function() {
				if(this.contentType === "TEXT") {
					this.$el.find("#selContentType").val("TEXT");
					this.$el.find("#trTextContent").show();
					this.$el.find("#trEditorContent").hide();
				} else {
					this.$el.find("#selContentType").val("HTML");
					this.$el.find("#trTextContent").hide();
					this.$el.find("#trEditorContent").show();
				}
			},
			
			getContent: function() {
				if(this.contentType === "TEXT") {
					return this.$el.find("#bannerContent").val();
				} else {
					return GO.Editor.getInstance("editor").getContent();
				}
			},
			
			clearContent: function() {
				if(this.contentType === "TEXT") {
					GO.Editor.getInstance("editor").setContent(" ");
				} else {
					this.$el.find("#bannerContent").val("");
				}
			},
			
			isContentEmpty: function(content) {
				content = content.split(" ").join("");
				content = content.split("<br>").join("");
				content = content.split("&nbsp;").join("");
				content = content.split("<p>").join("");
				content = content.split("</p>").join("");
				content = content.replace(/\r\n/g, "");
				content = content.replace(/\n/g, "");
				content = content.replace(/\r/g, "");
				
				return content == "" ? true : false;
			},
			
			toggleDeleteButton: function() {
				if(this.isCreate) {
					this.$el.find("#btnDeleteBanner").hide();
				} else {
					this.$el.find("#btnDeleteBanner").show();
				}
			}
		});
		return MailBannerView;
	});
}).call(this);