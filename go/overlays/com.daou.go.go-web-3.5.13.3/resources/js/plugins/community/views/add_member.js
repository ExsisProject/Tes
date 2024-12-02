//게시판 글 목록 HOME
(function() {
	define([
	        "jquery",
	        "backbone", 	
	        "app",
	        "community/models/add_member",
	        "community/models/info",
	        "hgn!community/templates/add_member",
	        "hgn!community/templates/add_org_member",
	        "board/views/board_title",
	        "i18n!nls/commons",
	        "i18n!community/nls/community",
	        "jquery.go-popup",
	        "jquery.go-orgslide"
	        
	        ], 
	        function(
	        		$,
	        		Backbone,
	        		App,
	        		addMemberModel,
	        		infoModel,
	        		tplAddMember,
	        		tplAddOrgMember,
	        		BoardTitleView,
	        		commonLang,
	        		communityLang
	        ) {

		tplVar = {
				'invite_desc': communityLang["※ 새로 초대할 멤버를 선택하시고, 아래 '초대' 버튼을 클릭하시면 가입이 완료됩니다."],
	            'add_member' : communityLang['멤버 추가'],
	            'invite_ok' : communityLang['초대'],
	            'community_cancel' : commonLang['취소'],
	            'empty_member' : communityLang["초대할 멤버가 없습니다."]
	        };
		
		
		var CommunityAddMember = Backbone.View.extend({
			
			el : '#content',
			manage : false,
			events:{
				'click #btnAddMember':'getOrgList',
				'click #addMemberOK':'saveAddMember',
				'click #addMemberCancel':'cancelAddMember',
				'click ul.name_tag li span.ic_del' : 'deleteMember',
			},
			
			initialize: function(communityId) {
				this.formName = 'formAddMember';
				
				
			},

			render: function(communityId) {
				this.communityId = communityId;
				var model = infoModel.read({ communityId : communityId}).toJSON();
				var tmpl = tplAddMember({
					lang : tplVar,
					name : model.name,
					communityId : communityId
				});
				
				this.$el.html(tmpl);
				
				BoardTitleView.render({
					el : '.content_top',
					dataset : {
						name : model.name
					},
					isCommunity : true
				});
				
			},
			
			addMember : function(data) {
				var members = _.isArray(data) ? data : [data];
				var isSingleSelection = members.length == 1;
				var targetEl = $('#addMembers');
				
				_.each(members, function(member) {
					if($('#communityMembers').find('a[data-userId="'+member.id+'"]').length) {
						if (isSingleSelection) $.goMessage(communityLang["이미 커뮤니티 멤버입니다"]);
					} else {
						if(member && !targetEl.find('li[data-id="'+member.id+'"]').length) { 
							targetEl.find('li.creat').before(tplAddOrgMember($.extend(member, { lang : tplVar })));
						} else {
							if (isSingleSelection) $.goMessage(communityLang["이미 선택되었습니다."]);
						}
					}
				});
			},
			
			cancelAddMember : function() {
				var self = this;
				$.goConfirm(commonLang['취소하시겠습니까?'], commonLang['입력하신 정보가 초기화됩니다.'], function() {
					self.render(self.communityId);
				});
			},
			
			deleteMember : function(e) {
				$(e.currentTarget).parents('li').remove();
			},
			
			getOrgList : function(e) {
				var self = this;				
				$.goOrgSlide({
					header : communityLang["초대하기"],
					desc : '',
					contextRoot : GO.contextRoot,
					callback : self.addMember,
					externalLang : commonLang,
					memberTypeLabel : communityLang["멤버"],
					isBatchAdd : true
				});
			},
			
			saveAddMember : function(e) {	
				var self = this, 
				form = this.$el.find('form[name='+this.formName+']'),
				userIds = [];
				
				var communityId = $('.select_nav').attr('data-id');
				
				$(form.serializeArray()).each(function(k,v) {
					if(v.name == 'memberId') {
						userIds.push(v.value);
					} 
				});
				
				if(userIds.length == 0){
					$.goAlert(tplVar.empty_member);
					return;
				}
				
				this.model = new addMemberModel();
				this.model.set({ 
					'communityId' : communityId,
					'userIds' : userIds
				},{ silent : true });
				
				this.model.save({},{
					success : function(model, response) {
						if(response.code == '200') {
							App.router.navigate("community/"+communityId, true);							
						}
					},
					error : function(model, response) {
						if(response.msg) $.goAlert(response.msg);
						if(response.focus) form.find('input[name="'+response.focus+'"]').focus();
					}
				
				});
				
			
			}
		});

		return {
			render: function(communityId) {
				var communityAddMember = new CommunityAddMember();
				return communityAddMember.render(communityId);				
			}
		};
	});

}).call(this);