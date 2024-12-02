define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!community/templates/side",
    "community/views/side_communities",
    "community/models/leave",
    "community/collections/boards",
    "i18n!nls/commons",
    "i18n!community/nls/community",
    "amplify"
], 

function(
	$, 
	Backbone,
	App, 
	layoutTpl,
	sideCommunities,
	communityLeaveModel,
	Boards,
	commonLang,
	communityLang,
	Amplify
) {
	var JOIN_COMMUNITY_STORE_KEY = GO.session("loginId") + '-community-join-toggle';
	var instance = null;
	var SideView = Backbone.View.extend({		
		el : '#side',
		initialize: function() {
		},
		
		unBindEvent: function() {
			this.$el.off("click", "a.toggleCommunityList");
			this.$el.off("click", "a.communityName");
			this.$el.off("click", "span.masterHome");
			this.$el.off("click", "#communityCreate");
			this.$el.off("click", "span.joinCancel");
			this.$el.off("click", "span.communityLeave");
		},
		
		bindEvent: function() {
			this.$el.on("click", "a.toggleCommunityList", $.proxy(this.slideCommunityToggle, this));
			this.$el.on("click", "a.communityName", $.proxy(this.getCommunityHome, this));
			this.$el.on("click", "span.masterHome", $.proxy(this.getCommunityMaster, this));
			this.$el.on("click", "#communityCreate", $.proxy(this.communityCreate, this));
			this.$el.on("click", "span.joinCancel", $.proxy(this.setJoinCancel, this));
			this.$el.on("click", "span.communityLeave", $.proxy(this.setCommunityLeave, this));
		}, 
		
		render : function() {
			this.unBindEvent();
			this.bindEvent();
			sideCommunities.render({
				isOpen : this.getStoredCategoryIsOpen(JOIN_COMMUNITY_STORE_KEY)
			});
		},	
		
		getCommunityHome : function(e){
			var separatorli = $(e.currentTarget).parents('li'),
			communityId = separatorli.attr('data-id'),
			status = separatorli.attr('data-status'),
			publicFlag = separatorli.attr('data-publicFlag');
			memberStatus = separatorli.attr('data-memberStatus');
			
			if(status == 'WAIT') {	
				$.goAlert(communityLang["아직 개설이 승인되지 않았습니다."], communityLang["관리자의 승인이 필요합니다."]);
			} else {
				if(publicFlag == 'false' && memberStatus != 'ONLINE') { //공개
					$.goAlert(communityLang["아직 가입되지 않았습니다."], communityLang["커뮤니티 관리자의 승인이 필요합니다."]);
				} else {
					App.router.navigate("community/"+communityId, true);
				}
			}
		},		
		
		getCommunityMaster : function(e){		
			var separatorli = $(e.currentTarget).parents('li'),
				communityId = separatorli.attr('data-id'),
				status = separatorli.attr('data-status');
			if(status == 'WAIT') {	
				$.goAlert(communityLang["아직 개설이 승인되지 않았습니다."], communityLang["관리자의 승인이 필요합니다."]);
			} else {
				App.router.navigate("community/"+communityId+"/admin", true);
			}
		},
		
		slideCommunityToggle : function(e) {
		    var self = this,
			    currentTarget = $(e.currentTarget),
				parentTarget = currentTarget.parents('h1'),
                toggleBtn = parentTarget.find('.ic_hide_up');

			currentTarget.parents('h1.community').next('ul').slideToggle("fast", function() {
				if($(this).css('display') == 'block') {
                    parentTarget.removeClass('folded');
                    toggleBtn.attr("title", commonLang["접기"]);
				} else {
                    parentTarget.addClass('folded');
                    toggleBtn.attr("title", commonLang["펼치기"]);
				}
				
				var isOpen = parentTarget.hasClass("folded");
				self.storeCategoryIsOpen(JOIN_COMMUNITY_STORE_KEY, !isOpen);
			});
		},
		
		setJoinCancel : function(e){
			var self = this;
			var separatorli = $(e.currentTarget).parents('li'),
			communityId = separatorli.attr('data-id');
			$.goCaution(communityLang["가입 취소를 하시겠습니까?"], "", function() {
				self.communityLeave(communityId);
			});
		},
		
		
		setCommunityLeave : function(e){
			var self = this;
			var separatorli = $(e.currentTarget).parents('li'),
			communityId = separatorli.attr('data-id');
			$.goCaution(communityLang["현재 커뮤니티에서 탈퇴하시겠습니까?"], communityLang["탈퇴하여도 이전에 작성하였던 게시물들은 유지됩니다."], function() {
				self.communityLeave(communityId);
			});
		},
		
		communityCreate : function() {
			App.router.navigate("community/create", true);
		}, 
		
		communityLeave : function(communityId) {
			var self = this;
			this.model = new communityLeaveModel();
			this.model.set('communityId', communityId, {silent:true});
			this.model.save({}, {type : 'DELETE',
				success : function(model, response) {
					if(response.code == '200') {
						sideCommunities.render();
					}
				},
				error : function(model, response) {
					var result = JSON.parse(response.responseText);
					if(result.name == "already.community.master") {
						$.goConfirm(communityLang["현재 커뮤니티 마스터입니다."], communityLang["마스터 권한을 양도한 후에 탈퇴가 가능합니다. 관리 페이지로 이동하시겠습니까?"], function() {
							App.router.navigate("community/"+communityId+"/admin", true);
						}, commonLang["확인"]);
					} else if(result.name == "already.community.board.master"){
						$.goConfirm(communityLang["현재 커뮤니티 게시판 운영자입니다."], communityLang["운영자 권한을 양도한 후에 탈퇴가 가능합니다. 관리 페이지로 이동하시겠습니까?"], function() {
							this.boards = Boards.getCollection(communityId, 'active');
							boardResult = this.boards.toJSON();
							$.each(boardResult, function(k,v) {
								if(v.actions.managable == true) {
									App.router.navigate("community/"+v.communityId+"/board/"+v.board.id+"/admin", true);
									return false;
								}
							});
						}), commonLang["확인"];
					}
					
				}
			});
		},
		
        getStoredCategoryIsOpen: function(store_key) {
            var savedCate = '';
            if(!window.sessionStorage) {
                savedCate = Amplify.store(store_key);
            } else {
                savedCate = Amplify.store.sessionStorage(store_key);
            }
            
            if(savedCate == undefined){
                savedCate = true;
            }
            
            return savedCate;
        },
        
        storeCategoryIsOpen: function(store_key, category) {
            return Amplify.store( store_key, category, { type: !window.sessionStorage ? null : 'sessionStorage' } );
        }
	},{
		
		create: function() {
			if(instance === null) instance = new layoutView();
			return instance.render();
		}
	
	});
	return SideView;
});