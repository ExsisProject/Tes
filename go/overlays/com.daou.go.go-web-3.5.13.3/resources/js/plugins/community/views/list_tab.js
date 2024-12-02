(function() {
    define([
    		"jquery",
    		"backbone",
    		"app",
    		"i18n!nls/commons",
    		"hgn!community/templates/list_tab",
    		"hgn!community/templates/community_detail",
    		"community/views/community_feed",
    		"community/views/community_user",
    		"community/views/community_all",
    		"community/views/community_rank",
    		"community/models/join",
    		"community/models/leave",
    		"community/models/remove",
    		"community/models/community_popup_info",
    		"community/views/side_communities",
    		"community/collections/boards",
    		"i18n!community/nls/community",
    		"i18n!board/nls/board",
    		"board/views/board_title",
    		"jquery.go-grid",
    		"jquery.go-popup",
    		"jquery.placeholder"
    ], 
    
    function(
    		$,
    		Backbone,
    		App,
    		commonLang,
    		tplListTab,
    		tplcommunityDetail,
    		communityByFeed,
    		communityByUser,
    		communityByAll,
    		communityByRank,
    		communityJoinModel,
    		communityLeaveModel,
    		communityRemoveModel,
    		CommunityModel,
    		sideCommunities,
    		Boards,
    		communityLang,
    		boardLang,
    		BoardTitleView
    ) {		
		
		var tplVar = {
				'community': commonLang['커뮤니티'],            
				'all_post': communityLang['전체 글'],
	            'community_member' : communityLang['회원'],
	            'new_post' : communityLang['새 글 등록'],
	            'my_community' : communityLang['가입 커뮤니티'],
	            'all' : commonLang['전체'],
	            'feed' : boardLang['최근글'],
	            'master' : communityLang['마스터'],
	            'moderator' : communityLang['부마스터'],
	            'description' : communityLang['소개'],
	            'create_at' : communityLang['개설일'],
	            'cnt_person' : communityLang['명'],
	            'cnt_posts' : communityLang['개'],
	            'member' : communityLang['멤버'],
	            'non_member' : communityLang['비멤버'],
	            'go_to_community' : communityLang['커뮤니티 입장하기'],
	            'join_community' : communityLang['커뮤니티 가입하기'],
	            'wait_community' : communityLang['커뮤니티 가입대기'],
	            'community_home': communityLang['커뮤니티 홈'],
	            'all_community' : communityLang['전체 커뮤니티']
	        };
		
		var HomeExposureModel = Backbone.Model.extend({
		    url : "/api/community/home/feed/exposure"
		});
		
		var ListTab = Backbone.View.extend({
			listEl : null,
			el : '#content',
			manage : false,
			initialize: function() {	
				this.unbindEvent();
				this.bindEvent();
				this.homeExposureModel = new HomeExposureModel();
			},
			
			bindEvent: function() {
				this.$el.on("click", "#communityByFeed", $.proxy(this.getCommunityByFeed, this));
				this.$el.on("click", "#communityByUser", $.proxy(this.getCommunityByUser, this));
				this.$el.on("click", "#communityByAll", $.proxy(this.getCommunityByAll, this));
				this.$el.on("click", "#btn_CommunityByAll", $.proxy(this.getCommunityByAll, this));
				this.$el.on("click", "#communityCreate", $.proxy(this.communityCreate, this));
				this.$el.on("click", ".communityAction", $.proxy(this.communityAction, this));	
				this.$el.on("click", ".comm", $.proxy(this.getCommunityInfo, this));
				this.$el.on("click", "#communitySearch2", $.proxy(this.search, this));
				this.$el.on("keydown", "#communitySearch input", $.proxy(this.searchKeyboardEvent, this));
				this.$el.on("click", "ul.comm_group_list li", $.proxy(this.getCommunityInfo, this));
			},
			
			unbindEvent: function() {
				this.$el.off("click", "#communityByFeed");
				this.$el.off("click", "#communityByUser");
				this.$el.off("click", "#communityByAll");
				this.$el.off("click", "#btn_CommunityByAll");
				this.$el.off("click", "#communityCreate");
				this.$el.off("click", ".communityAction");				
				this.$el.off("click", ".comm");
				this.$el.off("click", "#communitySearch2");
				this.$el.off("keydown", "#communitySearch input");
				this.$el.off("click", "ul.comm_group_list li");
			},
			
			
			render: function() {
				this.$el.html(tplListTab({
					lang : tplVar
				}));
				
				BoardTitleView.render({
					el : '.content_top',
					dataset : {
						name : tplVar.community_home
					},
					isCommunity : true
				});
				
				var communitySize = $('li.community').size();
				communityByRank.render();
				
				this.homeExposureModel.fetch({async : false});
				
				if(this.homeExposureModel.has(true)) {
					$('#communityByFeed').addClass('active');
					this.listEl = communityByFeed.render({hasCommunity : this.homeExposureModel.has(true)});
				} else {
					$('#communityByAll').addClass('active');
					this.listEl =  communityByAll.render();
				}
			},
			
			communityCreate : function() {
				App.router.navigate("community/create", true);
			},
			
			getCommunityByFeed : function(e) {
				this.moveListTab();
				$('#communityByFeed').addClass('active');
				this.listEl = communityByFeed.render({hasCommunity : this.homeExposureModel.has(true)});
			},
			
			getCommunityByUser : function(e) {
				this.moveListTab();
				$('#communityByUser').addClass('active');
				this.listEl = communityByUser.render();
			},
			
			getCommunityByAll : function(e) {
				this.moveListTab();
				$('#communityByAll').addClass('active');
				this.listEl = communityByAll.render();
			},
			
			moveListTab : function(e) {
				this.$el.find('.active').removeClass('active');
				$('#toolBar').remove();
				$('.dataTables_wrapper').remove();
				$('.table_search').remove();
			},
			
			_reloadTables : function() {
				if(this.listEl != undefined){
					this.listEl.tables.fnClearTable();
				}
				communityByRank.render($('.select_txt').attr('data-id'));
			},
			
			getCommunityHome: function(e) {			
				var communityId = $(e.currentTarget).attr('data-id');
				var memberStatus = $(e.currentTarget).attr('data-memberStatus');
				var communityStatus = $(e.currentTarget).attr('data-communityStatus');;
				var publicFlag = $(e.currentTarget).attr('data-publicflag');
				
				if(communityStatus == 'WAIT') {				
					$.goAlert(communityLang["아직 개설이 승인되지 않았습니다."], communityLang["관리자의 승인이 필요합니다."]);
				} else {
					if(publicFlag=="true") { //공개
						App.router.navigate("community/"+communityId, true);
					} else { //비공개
						if(memberStatus == 'ONLINE') {
							App.router.navigate("community/"+communityId, true);
						} else {
							$.goAlert(communityLang["아직 가입되지 않았습니다."], communityLang["커뮤니티 관리자의 승인이 필요합니다."]);
						}
					}
				}
			},
			
			communityAction: function(e) {
				var self = this;
				var listEl = $(e.currentTarget).parents('tr').first().find('.comm');
				if(listEl.length < 1){
					listEl = $(e.currentTarget);
				}
				var communityId = listEl.attr('data-id');
				var memberStatus = listEl.attr('data-memberStatus');
				var communityStatus = listEl.attr('data-communityStatus');
				var memberType = listEl.attr('data-memberType');
				if(communityStatus == 'WAIT') {			
					if(memberStatus == 'ONLINE') {
						$.goCaution(communityLang["커뮤니티 개설을 취소하시겠습니까?"], "", function() {
							self.communityRemove(communityId);
						});
					} else {
						$.goAlert(communityLang["아직 개설이 승인되지 않았습니다."], communityLang["관리자의 승인이 필요합니다."]);
					}
				
				} else {
					
					if(memberStatus == 'ONLINE') {
						if(memberType == 'MASTER') {
							$.goConfirm(communityLang["현재 커뮤니티 마스터입니다."], communityLang["마스터 권한을 양도한 후에 탈퇴가 가능합니다. 관리 페이지로 이동하시겠습니까?"], function() {
								App.router.navigate("community/"+communityId+"/admin", true);
							});
							
						} else {
							$.goCaution(communityLang["현재 커뮤니티에서 탈퇴하시겠습니까?"], communityLang["탈퇴하여도 이전에 작성하였던 게시물들은 유지됩니다."], function() {
								self.communityLeave(communityId);
							});
						}
						
	    	    	} else if(memberStatus == 'WAIT') {
	    	    		$.goConfirm(communityLang["가입 취소를 하시겠습니까?"], "", function() {
	    	    			self.communityLeave(communityId);
						});
	    	    		
	    	    	} else {
	    	    		$.goConfirm(communityLang["가입을 신청하시겠습니까?"], communityLang["커뮤니티 가입은 관리자의 승인이 필요합니다."], function() {
	    	    			self.communityJoin(communityId);
						});
	    	    	}
				}
			},
			
			communityJoin : function(communityId) {
				var self = this;
				this.model = new communityJoinModel();
				this.model.set('communityId', communityId, {silent:true});
				this.model.save({},{
					success : function(model, response) {
						if(response.code == '200') {
							self._reloadTables();
							sideCommunities.render();
						}
					},
					error : function(model, response) {
						$.goMessage(commonLang["저장에 실패 하였습니다."]);
						if(response.msg) $.goAlert(response.msg);
						if(response.focus) form.find('input[name="'+response.focus+'"]').focus();
					}
				
				});
			
			},
			
			communityLeave : function(communityId) {
				var self = this;
				this.model = new communityLeaveModel();
				this.model.set('communityId', communityId, {silent:true});
				this.model.save({}, {type : 'DELETE',
					success : function(model, response) {
						if(response.code == '200') {
							self._reloadTables();
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
							    
							    this.boards = Boards.create();
							    this.boards.setVariables(communityId, 'active');
							    this.boards.fetch({
							        async : true,
							        success : function(collection){
			                            var boardResult = collection.toJSON();
			                             
		                                $.each(boardResult, function(k,v) {
		                                    if(v.actions.managable == true) {
		                                        App.router.navigate("community/"+v.communityId+"/board/"+v.board.id+"/admin", true);
		                                        return false;
		                                    }
		                                });
							        }
							    })
							}), commonLang["확인"];
						}
						
					}
				});
			},
			
			communityRemove : function(communityId) {
				var self = this;
				this.model = new communityRemoveModel();
				this.model.setCommunityId(communityId);
				this.model.set('id', communityId, {silent:true});
				this.model.destroy({
					success : function(model, response) {
						if(response.code == '200') {
							self._reloadTables();
							sideCommunities.render();
						}
					},
					error : function(model, response) {
						if(response.msg) $.goAlert(response.msg);
						if(response.focus) form.find('input[name="'+response.focus+'"]').focus();
					}
				});
			},
			
			searchKeyboardEvent : function(e) {
				if(e.keyCode == 13) {
					this.search();
				}
			},
			
			search : function() {
				var searchForm = this.$el.find('.table_search input[type="text"]'),
					keyword = searchForm.val();
				
				if($('input.search2').attr('placeholder') === $('input.search2').val()){
					keyword = '';
				}
				
				if(!$.goValidation.isCheckLength(2, 64, keyword)) {
					$.goMessage(App.i18n(commonLang['0자이상 0이하 입력해야합니다.'], {"arg1":"2","arg2":"64"}));
					return false;
				}
		
				this.listEl.tables.search(this.$el.find('.table_search select').val(), keyword, searchForm);
			},
			
			getMemberType : function(memberStatus, memberType){
				
				if(memberStatus == 'ONLINE'){
					if(memberType == 'MASTER'){
						memberMessage = communityLang['마스터'];
						memberTypeClass = "type master";
					}else if(memberType=="MODERATOR"){
						memberMessage = communityLang['부마스터'];
						memberTypeClass = "type sub_master";
					}else{
						memberMessage = communityLang['멤버'];
						memberTypeClass = "type member";
					}
					btnMessage = communityLang['커뮤니티 입장하기'];
				}else if(memberStatus == 'WAIT'){
					memberMessage = communityLang['비멤버'];
					memberTypeClass = "type guest";
				}else{
					memberMessage = communityLang['비멤버'];
					memberTypeClass = "type guest";
				}
				return '<span class="type_grade"><span class="'+memberTypeClass+'">'+memberMessage+'</span></span>';
			},
			
			mouseHover : function(e){
				$(e.currentTarget).text(communityLang['가입취소']);
			},
			
			mouseOut : function(e){
				$(e.currentTarget).text(communityLang['커뮤니티 가입대기']);
			},
			
			getCommunityInfo : function(e){
				var self = this;
				var listEl = $(e.currentTarget).parents('tr').first().find('.comm');
				var communityId = listEl.attr('data-id');
				
				if(listEl.length < 1){
					communityId = $(e.currentTarget).attr('data-id');
				
				}
				var communityInfo = CommunityModel.read({communityId:communityId}).toJSON();
				var header = self.getMemberType(communityInfo.memberStatus, communityInfo.memberType) + _.escape(communityInfo.name);
				
				if(!communityInfo.publicFlag){
					header = "<span class='ic_side ic_private'></span>" + header;
				}
				
				this.popupEl=$.goPopup({
					header : header,
					width : '300px',
					pclass : 'layer_comm_info layer_normal',
					buttons: self.returnBtn(e, communityInfo),
					contents : tplcommunityDetail({ 
						lang:tplVar,
						data:communityInfo,
						createAt : GO.util.basicDate2(communityInfo.createdAt),
						memberMessage : memberMessage,
					})
				});
				if (communityInfo.memberStatus == 'WAIT' && !communityInfo.publicFlag) {
					this.popupEl.on('mouseover','a.btn_major_s', $.proxy(this.mouseHover, this));
					this.popupEl.on('mouseout','a.btn_major_s', $.proxy(this.mouseOut, this));
				}
			},			
			
            returnBtn : function(e, data) {
            	var btnMessage;
            	if(data.memberStatus == 'ONLINE'){
					btnMessage = communityLang['커뮤니티 입장하기'];
				}else if(data.memberStatus == 'WAIT' && data.publicFlag){
					btnMessage = communityLang['커뮤니티 입장하기'];
				}else if(data.memberStatus == 'WAIT' && !data.publicFlag){
					btnMessage = communityLang['커뮤니티 가입대기'];
				}else{
					btnMessage = communityLang['커뮤니티 가입하기'];
				}
            	
            	var self = this;
            	if(!data.publicFlag || data.memberStatus != "NONE"){
            	return [{
						btype : 'confirm',
						btext : btnMessage,
						autoclose : false,
						callback : function() {
							if(data.publicFlag || data.memberStatus == 'ONLINE'){
								self.getCommunityHome(e);
							}else{
								$.goPopup.close();
								self.communityAction(e);
							}
						}
					}];
            	}else{	
					return [{
						btype : 'confirm',
						btext : communityLang['커뮤니티 입장하기'],
						bclass : 'btn_moveCommunity',
						callback : function() {
								self.getCommunityHome(e);
						}
					},
					{
						btype : 'confirm',
						btext : communityLang['커뮤니티 가입하기'],
						bclass : 'btn_joinCommunity',
						autoclose : false,
						callback : function() {
								$.goPopup.close();
								self.communityAction(e);
						}
					}];
            	}
            }
		});
		
		

		return {
			render: function() {
				var listTab = new ListTab();
				return listTab.render();				
			}
		};
	});
}).call(this);