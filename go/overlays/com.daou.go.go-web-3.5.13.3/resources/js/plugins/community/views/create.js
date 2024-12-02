//게시판 글 목록 HOME
(function() {
	define([
	        "jquery",
	        "backbone", 	
	        "app",
	        "community/models/create",
	        "hgn!community/templates/create",
	        "i18n!nls/commons",
	        "i18n!community/nls/community",
	        "jquery.go-validation"
	        ], 
	        function(
	        		$,
	        		Backbone,
	        		App,
	        		CommunityCreateModel,
	        		tplCommunityCreate,
	        		commonLang,
	        		communityLang
	        ) {
		var CommunityCreate = Backbone.View.extend({
			className: "content_page", 
			
			manage : false,
			events:{
			},

			initialize: function() {
				this.unbindEvent();
				this.bindEvent();
			},
			
			unbindEvent: function() {
				this.$el.off("click", "span#btn_ok");
				this.$el.off("click", "span#btn_cancel");
				this.$el.off("submit");
			}, 
			
			bindEvent: function() {
				this.$el.on("click", "span#btn_ok", $.proxy(this.communityCreateSave, this));
				this.$el.on("click", "span#btn_cancel", $.proxy(this.communityCreateCancel, this));
				this.$el.on("submit", "", $.proxy(this.preventSubmit, this));
			}, 
			render: function() {
				this.$el.empty().html(tplCommunityCreate({
					label_ok: commonLang["확인"],
					label_cancel: commonLang["취소"],
					label_public: communityLang["공개"],
					label_private: commonLang["비공개"],
					label_publicFlag: communityLang["공개여부"],
					label_name: communityLang["커뮤니티 명"],
					label_desc: communityLang["소개"],
					label_communityCreate: communityLang["커뮤니티 개설"],
					label_communityDesc: communityLang["커뮤니티 설명"]
				}));
				
				return this;
			},
			preventSubmit : function(e) {
				e.preventDefault();
				return false;
			},
			communityCreateSave: function(){
				this.model = new CommunityCreateModel();	
				var self = this,
				form = this.$el.find('form[name=formCommunityCreate]'),
				communityNameEl = form.find('input[name="name"]'),
				communityDescriptionEl = form.find('[name="description"]');
				$.each(form.serializeArray(), function(k,v) {
					self.model.set(v.name, v.value, {silent: true});
				});
				
				var invalidAction = function(msg, focusEl) {
					$.goError(msg, $(focusEl).parent());
					if(focusEl) focusEl.focus().addClass('error');
					return false;
				};
				
				if(!$.goValidation.isCheckLength(2, 64, $.trim(this.model.get('name')))) {
					invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}), communityNameEl);
					return false;
				}
				
				if(!$.goValidation.isCheckLength(0, 124, $.trim(this.model.get('description')))) {
					invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"0","arg2":"124"}), communityDescriptionEl);
					return false;
				}

				this.model.save({},{
					success : function(model, response) {
						var communityId = model.toJSON().id;
						if(response.code == '200') {
							App.router.navigate("community/"+communityId, true);
						} 
					},
					error : function(model, response) {
						var result = JSON.parse(response.responseText);
						$.goError(result.message);
					}
				});
			},
			communityCreateCancel: function(){
				App.router.navigate("community", true);

			}
		});
		return CommunityCreate;
	});
}).call(this);