define(function(require) {
	
	var $ = require("jquery");
	var Backbone =require("backbone"); 	
	var App = require("app");
	var tplCommunityMasterHome =require("hgn!community/templates/master_home");
	var tplAddOrgManager =require("hgn!community/templates/add_org_manager");
	var tplChangeOrgMaster =require("hgn!community/templates/change_org_master");
	var masterUpdate =require("community/views/master_update");
	var masterMembers = require("community/views/master_members");
	var masterDelete =require("community/views/master_delete");
	var communityDeleteModel =require("community/models/delete");
	var memberRemoveModel = require("community/models/member_remove");
	var memberOnlineModel = require("community/models/member_online");
	var infoModel = require("community/models/info");
	var sideMembers = require("community/views/side_members");	
	var BoardTitleView =require("board/views/board_title");
	var commonLang =require("i18n!nls/commons");
	var communityLang = require("i18n!community/nls/community");

	// 정리 대상
	var communityBoard = require("community/views/community_board");
	
	require("jquery.go-popup");
	require("jquery.go-orgslide");
	require("jquery.go-validation");
	
	var tplVar = {
			'community_info': communityLang['정보'],            
			'community_board': communityLang['게시판'],
            'community_member' : communityLang['멤버'],
            'community_delete' : communityLang['패쇄']
        };
	
	
	var CommunityMasterHome = Backbone.View.extend({
		listEl : null,
		el : '#content',
		manage : false,
		
		initialize: function() {
			this.unbindEvent();
			this.bindEvent();
		},
		
		unbindEvent: function() {
			this.$el.off("click", "#communityUpdate");
			this.$el.off("click", "#communityBoard");
			this.$el.off("click", "#communityMember");
			this.$el.off("click", "#communityDelete");
			this.$el.off("click", "input[type=radio][name=member]");
			this.$el.off("click", "input[type=radio][name=board");
			this.$el.off("click", "#communityRemove");
			this.$el.off("click", "#btnOnline");
			this.$el.off("click", "#btnRemove");
			
			this.$el.off("click", "#communityMaster");
			this.$el.off("click", "#communityManager");
			this.$el.off("click", "ul.name_tag li span.ic_del");
		}, 
		
		bindEvent: function() {
			this.$el.on("click", "#communityUpdate", $.proxy(this.getUpdate, this));
			this.$el.on("click", "#communityBoard", $.proxy(this.getBoard, this));
			this.$el.on("click", "#communityMember", $.proxy(this.getMember, this));
			this.$el.on("click", "#communityDelete", $.proxy(this.getDelete, this));
			this.$el.on("click", "input[type=radio][name=member]", $.proxy(this.getMemberByRadio, this));
			this.$el.on("click", "input[type=radio][name=board]", $.proxy(this.getBoardByRadio, this));
			this.$el.on("click", "#communityRemove", $.proxy(this.communityRemove, this));
			this.$el.on("click", "#btnOnline", $.proxy(this.memberOnline, this));
			this.$el.on("click", "#btnRemove", $.proxy(this.memberRemove, this));
			
			this.$el.on("click", "#communityMaster", $.proxy(this.changeMaster, this));
			this.$el.on("click", "#communityManager", $.proxy(this.addManager, this));
			this.$el.on("click", "ul.name_tag li span.ic_del", $.proxy(this.deleteMember, this));
			
		}, 
		
		/**
		 * 현재 버블링이 발생하므로 우선 기존 방법대로 둔다.
		 */
//		events: {
//			"click #communityUpdate": "getUpdate",
//			"click #communityBoard": "getBoard",
//			"click #communityMember": "getMember",
//			"click #communityDelete": "getDelete",
//			"click input[type=radio][name=member]": "getMemberByRadio",
//			"click input[type=radio][name=board]": "getBoardByRadio",
//			"click #communityRemove": "communityRemove",
//			"click #btnOnline": "memberOnline",
//			"click #btnRemove": "memberRemove",
//
//			"click #communityMaster": "changeMaster",
//			"click #communityManager": "addManager",
//			"click ul.name_tag li span.ic_del": "deleteMember"
//		},

		render: function(communityId, type, subType) {
			
			var model = infoModel.read({ communityId : communityId}).toJSON();
			if(!(model.memberType == "MASTER" || model.memberType == "MODERATOR") ) {
				App.router.navigate('community/'+communityId, {trigger: true, pushState:true});
				$.goAlert(communityLang["접근 할 수 없는 메뉴입니다."], communityLang["마스터, 부마스터 권한이 필요합니다."]);
			}
			
			this.$el.html(tplCommunityMasterHome({
				lang : tplVar,
				communityId:communityId}));
			

			this.$el.find('.active').removeClass('active');
			if(type == 'board') {
				this.$el.find('#communityBoard').addClass('active');
				communityBoard.render({communityId : communityId, status : "ACTIVE" });
			} else if(type == "member") {
			    var memberType = (subType == undefined) ? 'online' :  subType;
			    
				this.$el.find('#communityMember').addClass('active');
				this.listEl = masterMembers.render(communityId, memberType);
			} else if(type == "delete") {
				this.$el.find('#communityDelete').addClass('active');
				masterDelete.render(communityId);
			} else {
				this.$el.find('#communityUpdate').addClass('active');
				masterUpdate.render(communityId);
				if(model.memberType =="MODERATOR") {
					$('#communityDelete').remove();
					$('#communityMaster').remove();
				}
			}
			
			BoardTitleView.render({
				el : '.content_top',
				dataset : {
					name : model.name 
				}
			});
		},
		
		
		modifyDesc : function(e) {
			$("#modifyDesc").hide();
			$("#inputModifyDesc").show();
		},
		
		
		deleteMember : function(e) {
			$(e.currentTarget).parents('li').remove();
		},
		
		masterData : function(data) {
			var targetEl = $('#changeMaster');
			var managerEl = $('#addManagers');
			
			if((data && !targetEl.find('li[data-id="'+data.id+'"]').length)
					&&(data && !managerEl.find('li[data-id="'+data.id+'"]').length)) { 
				targetEl.find('li').first().remove();
				targetEl.prepend(tplChangeOrgMaster($.extend(data, { lang : tplVar })));
			} else {
				$.goMessage(communityLang["이미 선택되었습니다."]);
			}
		},
		
		managerData : function(data) {
			var targetEl = $('#addManagers');
			var masterEl = $('#changeMaster');

			if((data && !targetEl.find('li[data-id="'+data.id+'"]').length)
					&&(data && !masterEl.find('li[data-id="'+data.id+'"]').length)) { 
				targetEl.find('li.creat').before(tplAddOrgManager($.extend(data, { lang : tplVar })));
			} else {
				$.goMessage(communityLang["이미 선택되었습니다."]);
			}
		},
		
		changeMaster : function(e) {
			var communityId = this.$el.find('.tab_menu').attr('data-id');
			
			$.goOrgSlide({
				header : communityLang["마스터 변경"],
				type : 'community',
				desc : communityLang['멤버를 클릭하면 마스터로 변경됩니다.'],
				contextRoot : GO.contextRoot,
				callback : this.masterData,
				loadId : communityId,
				accessOrg : true
			});
		},
		
		addManager : function(e) {
			var communityId = this.$el.find('.tab_menu').attr('data-id');
			$.goOrgSlide({
				header : communityLang["부마스터 추가"],
				type : 'community',
				desc : communityLang['멤버를 클릭하면 부마스터로 추가됩니다.'],
				contextRoot : GO.contextRoot,
				callback : this.managerData,
				loadId : communityId,
				accessOrg : true
			});
		},
		
		getUpdate : function(e) {
			var selectedEl = $(e.currentTarget);
			this.$el.find('.active').removeClass('active');
			selectedEl.addClass('active');
			var communityId = this.$el.find('.tab_menu').attr('data-id');
			masterUpdate.render(communityId);
			var model = infoModel.read({ communityId : communityId}).toJSON();
			
			if(model.memberType == "MODERATOR") {
				$('#communityMaster').remove();
			}
		},
		
		getBoard : function(e) {
			var selectedEl = $(e.currentTarget);
			this.$el.find('.active').removeClass('active');
			selectedEl.addClass('active');
			var communityId = this.$el.find('.tab_menu').attr('data-id');
			communityBoard.render({communityId : communityId, status : "ACTIVE" });
		},
		
		getMember : function(e) {
			var selectedEl = $(e.currentTarget);
			this.$el.find('.active').removeClass('active');
			selectedEl.addClass('active');
			var communityId = this.$el.find('.tab_menu').attr('data-id');
			this.listEl = masterMembers.render(communityId, 'online');
		},
		
		getMemberByRadio : function(e) {	
			var communityId = this.$el.find('.tab_menu').attr('data-id');				
			var memberStatus = $("input:radio[name='member']:checked").val()
			this.listEl = masterMembers.render(communityId, memberStatus);
		},
		
		getBoardByRadio : function(e) {
			var communityId = this.$el.find('.tab_menu').attr('data-id');				
			var boardStatus = $(":checked").val();
			this.listEl = communityBoard.render({communityId : communityId, status : boardStatus });
		},
		
		memberOnline : function(e) {
			var self = this;
			var communityId = this.$el.find('.tab_menu').attr('data-id');				
			
			var userIds = [];
			form = this.$el.find('form[name=formCommunityMembers]'),
			memberEl = form.find('tbody input[type="checkbox"]:checked');
			
			if(memberEl.size() == 0){
				$.goMessage(communityLang['선택된 멤버가 없습니다']);
				return;
			}
			
			
			$.goConfirm(communityLang["선택하신 회원의 가입을 승인하시겠습니까?"], App.i18n(communityLang["총 0명 선택되었습니다."], "count", memberEl.size()), function() {
				
				$(form.serializeArray()).each(function(k,v) {
					if(v.name == 'userId') {
						userIds.push(v.value);
					} 
				});
				
				this.model = new memberOnlineModel();
				this.model.set({ 
					'id' : communityId,
					'userIds' : userIds
				},{ silent : true });
				
				this.model.save({},{
					success : function(model, response) {
						if(response.code == '200') {
							self._reloadTables();		
							sideMembers.render(communityId);
						}
					},
					error : function(model, response) {
					    if(response.msg) {
                            $.goAlert(response.msg);
                        } else if (response.responseJSON && response.responseJSON.message) {
                            $.goAlert(response.responseJSON.message);
                        }

                        if(response.focus) {
                            form.find('input[name="'+response.focus+'"]').focus();
                        }
					}
				});
			});
		},
		
		memberRemove : function(e) {
			var self = this;
			var communityId = this.$el.find('.tab_menu').attr('data-id');
			
			var userIds = [];
			form = this.$el.find('form[name=formCommunityMembers]'),
			memberEl = form.find('tbody input[type="checkbox"]:checked');
			
			if(memberEl.size() == 0){
				$.goMessage(communityLang["선택된 멤버가 없습니다"]);
				return;
			}
			
			var title;
			if($(e.currentTarget).attr("data-status") == 'online') {
				title = communityLang["선택하신 멤버를 탈퇴시키겠습니까?"];
			} else {
				title = communityLang["선택하신 회원의 가입을 거부하시겠습니까?"];
			}
			
			$.goConfirm(title, App.i18n(communityLang["총 0명 선택되었습니다."], "count", memberEl.size()), function() {
				$(form.serializeArray()).each(function(k,v) {
					if(v.name == 'userId') {
						userIds.push(v.value);
					} 
				});
				
				this.model = new memberRemoveModel();
				this.model.set({ 
					'id' : communityId					
				},{ silent : true });
				
				this.model.save({'userIds' : userIds }, {
					type : 'DELETE',
					success : function(model, response) {
						if(response.code == '200') {
							self._reloadTables();	
							sideMembers.render(communityId);
						}
					},
					error : function(model, response) {
						if(response.msg) $.goAlert(response.msg);
						if(response.focus) form.find('input[name="'+response.focus+'"]').focus();
					}
				
				});
			});
		},
		
		_reloadTables : function() {
			this.listEl.tables.fnClearTable();
		},
		
		renderToolbar: function(totalElements) {	
			this.$el.find('#toolBar #memberTotalElements').html(totalElements);
			this.$el.find('.tool_bar .custom_header').html(this.$el.find('#toolBar').html());
			this.$el.find('#toolBar').remove();
			
		},
		
		getDelete : function(e) {
			var selectedEl = $(e.currentTarget);
			this.$el.find('.active').removeClass('active');
			selectedEl.addClass('active');				
			var communityId = this.$el.find('.tab_menu').attr('data-id');
			masterDelete.render(communityId);
		},
		
		communityRemove : function(e) {
			var communityId = this.$el.find('.tab_menu').attr('data-id'),
			form = this.$el.find('form[name=formCommunityDelete]'),
			communityDescriptionEl = form.find("textarea");
			
			var invalidAction = function(msg, focusEl) {
				$.goMessage(msg);
				if(focusEl) focusEl.focus().addClass('error');
				return false;
			};
			
			if(!$.goValidation.isCheckLength(1, 255, communityDescriptionEl.val()) || 
					communityDescriptionEl.val() == communityLang["커뮤니티 폐쇄 공지를 이곳에 작성하세요"]) {
				invalidAction(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"1","arg2":"255"}), communityDescriptionEl);								
			} else {
				$.goCaution(communityLang["커뮤니티를 패쇄하시겠습니까?"], "", function() {
					this.model = new communityDeleteModel();
					this.model.setCommunityId(communityId);
					this.model.save({'description' : communityDescriptionEl.val() }, {
						type : 'DELETE',
						success : function(model, response) {
							if(response.code == '200') {
								App.router.navigate("community", true);
							}
						},
						error : function(model, response) {
							if(response.msg) $.goAlert(response.msg);
							if(response.focus) form.find('input[name="'+response.focus+'"]').focus();
						}
					});
				});
			}
		},
	});

	return {
		render: function(communityId, type, subType) {
			var communityMasterHome = new CommunityMasterHome();
			return communityMasterHome.render(communityId, type, subType);				
		}
	};
});