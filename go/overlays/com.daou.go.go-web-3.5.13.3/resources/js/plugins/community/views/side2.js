define(function(require) {
	
	var $ =	require("jquery"); 
	var Backbone = require("backbone"); 
	var when = require("when");
	var GO = require("app");
	
	var layoutTpl = require("hgn!community/templates/side2"); 
	var communityJoinModel = require("community/models/join");

	var sideCommunities = require("community/views/side_communities");
	var sideMembers = require("community/views/side_members");
	var members = require("community/views/members");
	var addMember = require("community/views/add_member");
	var infoModel = require("community/models/info");

	var communityLeaveModel = require("community/models/leave");
	var sideInfoTmpl = require("hgn!community/templates/side_info");
	var CommunityBaseConfigModel = require("admin/models/community_base_config");
	var boardLang = require("i18n!board/nls/board"); 
	var commonLang = require("i18n!nls/commons");
	var communityLang = require("i18n!community/nls/community");
	var boardLang = require("i18n!board/nls/board");
	var ProfileView = require("views/profile_card");
	
	// 정리대상
	var Boards = require("community/collections/boards");

    var BackdropView = require('components/backdrop/backdrop');
	var BoardTree = require('board/components/board_tree/board_tree');
	var CommBoardTree = require('community/models/comm_board_tree');
	
	var renderBoardNodeTpl = BoardTree.renderBoardTreeMenuNode;
	
	require('jquery.go-sdk');
	
	var instance = null;
	var lang = {
			'community_board': boardLang['커뮤니티게시판'],            
            'new_post' : boardLang['글쓰기'],
            'new_board' : boardLang['새 게시판'],
            'board_add' : boardLang['게시판 추가'],
            'community_home' : commonLang['커뮤니티 홈으로'],
            'community_master' : commonLang['관리'],
            'community_list' : commonLang['커뮤니티 목록보기'],
            'manage_flag' : commonLang['관리'],
            'board_null' : communityLang['생성된 게시판이 없습니다.'],
            'community' : commonLang['커뮤니티'],
            'closed_board' : boardLang['중지된 게시판 관리']
        };
	
	var BoardTreeMenuView = BoardTree.BoardTreeMenuView;
	
	var CommBoardTreeView = BoardTreeMenuView.extend({
		communityId: null, 
		
		initialize: function(options) {
			var opts = options || {};
			
			BoardTreeMenuView.prototype.initialize.apply(this, arguments);
			
			this.communityId = null;
			if(opts.hasOwnProperty('communityId')) {
				this.communityId = opts.communityId;
			}
		}, 
		
		/**
		 * @Override
		 */
		renderChildView: function(boardTreeNode) {
			var childView = new this.constructor({
				"nodes": this.boardTreeNodes, 
				"parentId": boardTreeNode.getNodeId(), 
				"menuId": this.getMenuId(), 
				"communityId": this.communityId
			});
			
			childView.render();
			return childView
		},
		
		/**
		 * @Override
		 * 링크 URL 생성
		 */
		getLinkUrl: function(boardTreeNode) {
			var url = '#';
			if(boardTreeNode.isBoardNode()) {
				url = ['community', this.communityId, 'board', boardTreeNode.getBoardId()].join('/');
			}
			
			return url;
		}, 
	});
	
	var SideView2 = Backbone.View.extend({		
		el : '#side',
		
		events: {
			"click a.go_board[data-boardId]": "getBoard",
			"click a#writeBtn": "sideWriteBtnAction",
			"click #masterHomeSide": "getCommunityMaster",
			"click #dropDown": "getDropDown",
			"click .communityName": "getCommunityHome",
			"click #communityList": "getCommunityList",
			"click #members": "getMember",
			"click #memberDelete": "deleteMember",
			"click #memberInvite": "addMember",
			"click .btn-setting": "getBoardAdmin",
			"click a.memberPhoto": "showProfileCard",
			"click #addBoard": "createBoard",
			"click .go_closedBoard": "goClosedBoard",
			"click #communityHome": "communityHome",
		}, 

		initialize: function() {
			// 부서게시판 목록
			this.commBoardList = new CommBoardTree.Collection();
			
			this.$el.off();
		},
		
		goClosedBoard : function(e){
			var communityId = $(e.currentTarget).attr('data-communityid');
			GO.router.navigate('community/'+communityId +'/board/closedList', true);
			$('html, body').animate( {scrollTop:0} );
		},
		showProfileCard : function(e){
			var userId = $(e.currentTarget).attr('data-userId');
			ProfileView.render(userId, e.currentTarget);
		},
		
		render : function(communityId, boardId) {
			this.boardId = boardId;
			
			var tmpl = layoutTpl({
				lang : lang, 
				context_root : GO.config("contextRoot"),
				appName : GO.util.getAppName("community")
			});
			this.$el.html(tmpl); //.css('minHeight', $('#main').height()-70);
			this.communityId = communityId;			
			this.renderInfo(communityId);
			sideCommunities.render({"communityId" : communityId});
			sideMembers.render(communityId);
			this.renderBoards(communityId);
			this._selectSideMenu();
			
			GO.EventEmitter.off('boardTree', 'changed:nodes');
			GO.EventEmitter.on('boardTree', 'changed:nodes', function() {
				this.renderBoards(communityId);
				this._selectSideMenu();
			}, this);
			
			// GO-19629: 이슈 대응(Bongsu Kang, kbsbroad@daou.co.kr)
			// 게시판 쪽 수정을 최소화하기 위해 아래와 같이 대응함. 
			// 게시판/커뮤니티 전반적인 코드 리팩토링이 필요한 상태.
			GO.EventEmitter.off('board', 'changed:deptBoard');
			GO.EventEmitter.on('board', 'changed:deptBoard', function() {
				this.renderBoards(communityId);
				this._selectSideMenu();
			}, this);
			
			// 정리...
			GO.EventEmitter.off('community', 'changed:sideCommunityBoard');
			GO.EventEmitter.on('community', 'changed:sideCommunityBoard', function() {
				this.renderBoards(communityId);
				this._selectSideMenu();
			}, this);
			
			GO.EventEmitter.on('board', 'changed:lastPostedAt', function() {
				this.addNewIcon(arguments.length > 0 ? arguments[0] : '');
			}, this);
			
			
			var communityConfigModel = CommunityBaseConfigModel.create();
			communityConfigModel.set({ admin : false });
			communityConfigModel.fetch({
			    success : function(model){
			        var data = model.toJSON();
			        
		            GO.config("attachNumberLimit", data.attachNumberLimit);
		            GO.config("attachSizeLimit", data.attachSizeLimit);
		            GO.config("maxAttachNumber", data.maxAttachNumber);
		            GO.config("maxAttachSize", data.maxAttachSize);
		            GO.config("excludeExtension", data.excludeExtension ? data.excludeExtension  : "");
			    }
			});
			
		},        
		
		renderInfo : function(communityId) {
			this.model = infoModel.read({ communityId : communityId});
			var model = this.model.toJSON();
			
			if(model.communityId == undefined) {
				GO.router.navigate('community', {trigger: true, pushState:true});
				$.goAlert(communityLang["생성된 커뮤니티가 없습니다."], "");
			}
			
			if(model.status == 'WAIT') {
				GO.router.navigate('community', {trigger: true, pushState:true});
				$.goAlert(communityLang["커뮤니티 개설 신청이 완료되었습니다."], communityLang["관리자의 승인이 필요합니다."]);
			} else {
				if(model.publicFlag == false && model.memberStatus != 'ONLINE') { //공개
					GO.router.navigate('community', {trigger: true, pushState:true});
					$.goAlert(communityLang["아직 가입되지 않았습니다."], communityLang["커뮤니티 관리자의 승인이 필요합니다."]);
				}
			}			
			
			var self = this;
			var tmpl = sideInfoTmpl({
				lang:lang,
				model : model,
				isMemberTypeMaster : function() {
					if(self.model.get('memberType') == "MASTER" || self.model.get('memberType') == "MODERATOR") {
						return true;
					} else {
						return false;
					}
				}
			});
			
			if(model.memberStatus == "NONE") {
				$("#writeBtn span.txt").text(communityLang["가입하기"]);
				$("#writeBtn span.ic_side").removeClass("ic_app_bbs").addClass("ic_app_join");;
				
			} else if(model.memberStatus == "WAIT") {
				$("#writeBtn span.txt").text(communityLang["가입진행중"]);
				$("#writeBtn span.ic_side").removeClass("ic_app_bbs").addClass("ic_app_join");;
			}
			
			$('#sideNav').append(tmpl);
		}, 
		
		renderBoards: function(communityId) {
			var self = this;
			var collection = this.commBoardList;
			var $section = this.$('#communitySide');
			var $container = $section.find('ul');
			var elBuff = [];
			
			collection.setCommunityId(communityId);
			
			$container.empty();
			
			return when.promise(function(resolve, reject) {
				collection.fetch({
			        success : function(collection){
			        	if(collection.length < 1) {
			        		return;
			        	}
			        	
			        	collection.each(function(commBoardTree) {			        		
			        		var boardTreeNodes = commBoardTree.getBoardTreeNodes();
			        		if(boardTreeNodes.length > 0) {
			        			var menuId = ['communty', communityId].join('.');
			        			var boardTreeView = self._renderMenuTree(boardTreeNodes, menuId);
			        			$container.show();
			        			elBuff.push(boardTreeView.el);
			        		}
			        	});
			        	
			        	// 중지된 게시판 조회 링크 렌더링
			        	if(collection.hasClosedBoards()) {
			        		var linkUrl = GO.config('contextRoot') + 'app/community/'+communityId +'/board/closedList';
			        		elBuff.push(self._renderClosedBoardLink(linkUrl));
			        	}
			        	
			        	$container.append.apply($container, elBuff);
			        	resolve();
			        }, 
			        error: reject
				});
			}).then(function() {
				self._selectSideMenu();
				if($('#side').find('.select_nav').attr('data-memberStatus') != 'ONLINE') {
	            	self.$el.find('div.list_action').remove();
				}
				return when.resolve();
			});
		},
		
		_renderMenuTree: function(boardTreeNodes, menuId) {
			var treeMenuView = new CommBoardTreeView({
				"communityId": this.communityId, 
				"nodes": boardTreeNodes, 
				"menuId": menuId
			});
			treeMenuView.render();
			return treeMenuView;
		},
		
		_renderClosedBoardLink: function(linkUrl) {
			return $(renderBoardNodeTpl({
				"nodeType": 'LINK',	// 가상의 타입을 준다.
				"nodeValue": lang.closed_board,
				"iconType": 'closed', 
				"linkUrl": linkUrl, 
				"managable": false
			}));
		},
		
		getCommunityHome : function(e) {
			if (GO.util.hasActiveEditor()) {
				
				if(GO.util.isEditorWriting()){
					this.wirtePageMovePopup(e,'getCommunityHome');
				}else{
					this.goGetCommunityHome(e);
				}
			
			} else {
				if ($('#feedContent').val() && $('#feedContent').val() != boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.']) {
					this.wirtePageMovePopup(e,'getCommunityHome');
				} else {
					this.goGetCommunityHome(e);
				}
			}
		},		
		
		goGetCommunityHome : function(e){
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
					GO.router.navigate("community/"+communityId, true);
				}
			}
		},
		
		getCommunityMaster : function(e){
			if (GO.util.hasActiveEditor()) {
				
				if(GO.util.isEditorWriting()){
					this.wirtePageMovePopup(e,'getCommunityMaster');
				}else{
					this.goGetCommunityMaster(e);
				}
				
			} else {
				if ($('#feedContent').val() && $('#feedContent').val() != boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.']) {
					this.wirtePageMovePopup(e,'getCommunityMaster');
				} else {
					this.goGetCommunityMaster(e);
				}
			}

		},
		
		goGetCommunityMaster : function(e){
			separatorli = $(e.currentTarget).parents('span.select_nav'),
			communityId = separatorli.attr('data-id');
			GO.router.navigate("community/"+communityId+"/admin", true);
		},
				
		getCommunityList : function(e){
			if (GO.util.hasActiveEditor()) {
				
				if(GO.util.isEditorWriting()){
					this.wirtePageMovePopup(e,'getCommunityList');
				}else{
					this.goGetCommunityList(e);
				}
			
			} else {
				if ($('#feedContent').val() && $('#feedContent').val() != boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.']) {
					this.wirtePageMovePopup(e,'getCommunityList');
				} else {
					this.goGetCommunityList(e);
				}
			}
		},
		
		goGetCommunityList : function(e){
			GO.router.navigate("community", true);
		},
		
		getMember : function(e){
			if (GO.util.hasActiveEditor()) {
				
				if(GO.util.isEditorWriting()){
					this.wirtePageMovePopup(e,'getMember');
				}else{
					this.goGetMember(e);
				}
			
			} else {
				if ($('#feedContent').val() && $('#feedContent').val() != boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.']) {
					this.wirtePageMovePopup(e,'getMember');
				} else {
					this.goGetMember(e);
				}
			}
		},
		
		goGetMember : function(e){
			var communityId = this.$el.find('.select_nav').attr('data-id');
			GO.router.navigate("community/"+communityId+"/member", true);
		},
		
		deleteMember : function(e){
			var communityId = this.$el.find('.select_nav').attr('data-id');
			var memberType = this.$el.find('.select_nav').attr('data-memberType');
			
			if(memberType == 'MASTER') {
				$.goConfirm(communityLang["현재 커뮤니티 마스터입니다."], communityLang["마스터 권한을 양도한 후에 탈퇴가 가능합니다. 관리 페이지로 이동하시겠습니까?"], function() {
					GO.router.navigate("community/"+communityId+"/admin", true);
				});	

			} else {
				$.goCaution(communityLang["현재 커뮤니티에서 탈퇴하시겠습니까?"], communityLang["탈퇴하여도 이전에 작성하였던 게시물들은 유지됩니다."], function() {
					var self = this;
					this.model = new communityLeaveModel();
					this.model.set('communityId', communityId, {silent:true});
					this.model.save({}, {type : 'DELETE',
						success : function(model, response) {
							if(response.code == '200') {
								GO.router.navigate("community", true);
							}
						},
						error : function(model, response) {
							var result = JSON.parse(response.responseText);
							if(result.name == "already.community.master") {
								$.goConfirm(communityLang["현재 커뮤니티 마스터입니다."], communityLang["마스터 권한을 양도한 후에 탈퇴가 가능합니다. 관리 페이지로 이동하시겠습니까?"], function() {
									GO.router.navigate("community/"+communityId+"/admin", true);
								}, commonLang["확인"]);
							} 
						}
					});
				}, commonLang["확인"]);
			} 
		},
		
		addMember : function(e){
			if (GO.util.hasActiveEditor()) {
				
				if(GO.util.isEditorWriting()){
					this.wirtePageMovePopup(e,'addMember');
				}else{
					this.goAddMember(e);
				}
			
			} else {
				if ($('#feedContent').val() && $('#feedContent').val() != boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.']) {
					this.wirtePageMovePopup(e,'addMember');
				} else {
					this.goAddMember(e);
				}
			}
		},
		
		goAddMember : function(e) {
			var communityId = this.$el.find('.select_nav').attr('data-id');
			GO.router.navigate('community/'+communityId+'/invite', {trigger: true, pushState:true});
		},
		
		getDropDown : function(){
		    if (!this.backdropView) {
                this.backdropView = new BackdropView();
                this.backdropView.backdropToggleEl = this.$("ul[el-backdrop]");
                this.backdropView.linkBackdrop(this.$("span[el-backdrop-link]"));
		    }
		},

		getBoard : function(e) {
			if (GO.util.hasActiveEditor()) {
				
				if(GO.util.isEditorWriting()){
					this.wirtePageMovePopup(e,'getBoard');
				}else{
					this.goGetBoard(e);
				}
			
			} else {
				if ($('#feedContent').val() && $('#feedContent').val() != boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.']) {
					this.wirtePageMovePopup(e,'getBoard');
				} else {
					this.goGetBoard(e);
				}
			}
			
		},
		
		goGetBoard : function(e) {
			
			var selectedEl = $(e.currentTarget);			
			if(selectedEl.attr('data-boardId')) {		
				GO.router.navigate('community/'+this.communityId +'/board/'+selectedEl.attr('data-boardId'), true);
				$('html, body').animate( {scrollTop:0} );
			}
		},
		
		sideWriteBtnAction : function(e){			
			var target = $(e.currentTarget).parent().parent();			
			var boardId = target.find('p.on .go_board').attr('data-boardId');
			var boardCount = target.find('ul.side_depth li[data-type=BOARD]').length;
			var memberStatus = this.$el.find('.select_nav').attr('data-memberStatus');
			var communityId = this.$el.find('.select_nav').attr('data-id');
			var self = this;
			
			if(memberStatus == "ONLINE") {
				if(boardCount <= 0) {
					$.goMessage(communityLang["등록된 게시판이 없습니다."]);
				} else {
					var url = "";
					if(!boardId){				
						url = 'community/'+this.communityId+'/board/post/write';
					}else{
						url = 'community/'+this.communityId+'/board/'+boardId+'/post/write';
					}
					
					var callback = function() {
						GO.router.navigate(url, true);
					};
					
					GO.util.editorConfirm(callback);
				} 
				
			} else if(memberStatus == "WAIT"){

				$.goConfirm(communityLang["가입 취소를 하시겠습니까?"], "", function() {

					this.model = new communityLeaveModel();
					this.model.set('communityId', communityId, {silent:true});
					this.model.save({}, {type : 'DELETE',
						success : function(model, response) {
							if(response.code == '200') {
								$.goMessage(communityLang["취소되었습니다."]);
								self.render(self.communityId);
							}
						},
						error : function(model, response) {
							if(response.msg) $.goAlert(response.msg);
							if(response.focus) form.find('input[name="'+response.focus+'"]').focus();
						}
					});
				});
				
			} else {
				$.goConfirm(communityLang["가입을 신청하시겠습니까?"], communityLang["커뮤니티 가입은 관리자의 승인이 필요합니다."], function() {
					this.model = new communityJoinModel();
					this.model.set('communityId', communityId, {silent:true});
					this.model.save({},{
						success : function(model, response) {
							if(response.code == '200') {
								$.goMessage(communityLang["가입신청 완료"]);
								self.render(self.communityId);
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
		
		createBoard : function(e){
			if (GO.util.hasActiveEditor()) {
				
				if(GO.util.isEditorWriting()){
					this.wirtePageMovePopup(e,'createBoard');
				}else{
					this.goCreateBoard(e);
				}
			} else {
				if ($('#feedContent').val() && $('#feedContent').val() != boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.']) {
					this.wirtePageMovePopup(e,'createBoard');
				} else {
					this.goCreateBoard(e);
				}
			}
		},
		
		goCreateBoard : function(e){
			
			GO.router.navigate('community/'+this.communityId+'/board/create', {trigger: true, pushState:true});
		},
		
		getBoardAdmin : function(e) {
			if (GO.util.hasActiveEditor()) {
				if(GO.util.isEditorWriting()){
					this.wirtePageMovePopup(e,'getBoardAdmin');
				}else{
					this.goGetBoardAdmin(e);
				}
			} else {
				if ($('#feedContent').val() && $('#feedContent').val() != boardLang['새로운 정보, 기분 좋은 소식을 부서원들과 공유하세요.']) {
					this.wirtePageMovePopup(e,'getBoardAdmin');
				} else {
					this.goGetBoardAdmin(e);
				}
			}
		},
		
		goGetBoardAdmin : function(e) {
			var $target = $(e.currentTarget);
			var boardId = $target.data('id');
			
			//TODO: 기존 호환코드. 삭제 예정
			if(!$target.data('type')) {
				boardId = $target.data('boardid');
			}
			GO.router.navigate('community/'+this.communityId+'/board/'+boardId+'/admin', {trigger: true, pushState:true});
		},
		
		communityCreate : function() {
			GO.router.navigate("community/create", true);
		}, 
		
		_selectSideMenu : function() {
			// 임시 
			var menuArr =  GO.router.getUrl().split('?'),
				loadMenuArr = menuArr[0].split('/');

			if(loadMenuArr[2] == 'board' && loadMenuArr[3] != "closedList") {
				this.$el.find('.on').removeClass('on');
				var boardTitle = this.$el.find('#communitySide li[data-type=BOARD] a[data-id="'+loadMenuArr[3]+'"]');
				if(boardTitle.length) {
					boardTitle.parent().addClass('on');
				}
			} else if(loadMenuArr[3] == "closedList"){
				this.$el.find('.on').removeClass('on');
				var boardTitle = this.$el.find('#communitySide li[data-type=LINK] a');
				if(boardTitle.length) {
					boardTitle.parent().addClass('on');
				}
			} else{
				this.$el.find('.on').removeClass('on');
				this.$el.find("#goClosedBoard p").addClass("on");
			}
			return;
		},
		
		wirtePageMovePopup : function(e, type) {
			var _this = this;
			$.goPopup({
				title : '',
				message : boardLang['현재 작성중인 내용이 있습니다.<br>화면 이동 시 작성 중인 내용은 사라집니다.<br>이동하시겠습니까?'],
				modal : true,
				buttons : [{'btext' : commonLang['확인'],
				'btype' : 'confirm',
				'callback' : function() {
					if (type == "getBoardAdmin") {
						var boardId = $(e.currentTarget).attr('data-id');
						GO.router.navigate('community/'+_this.communityId+'/board/'+ boardId +'/admin', {trigger: true, pushState:true});
					}else if (type == "addMember") {
						_this.goAddMember(e);
					}else if (type == "getMember") {
						_this.goGetMember(e);
					}else if (type == "getCommunityMaster") {
						_this.goGetCommunityMaster(e);
					}else if (type == "getCommunityList") {
						_this.goGetCommunityList(e);
					}else if (type == "getCommunityHome") {
						_this.goGetCommunityHome(e);
					}else if (type == "getBoard") {
						var boardId = $(e.currentTarget).find('a.go_board').attr('data-boardId');
						GO.router.navigate('community/'+_this.communityId +'/board/'+boardId, true);
						$('html, body').animate( {scrollTop:0} );
					}else if (type == "createBoard") {
						_this.goCreateBoard(e);
					}
				}},
					{
						'btext' : commonLang['취소'],
						'btype' : 'normal',
						'callback' : function() {
						}
					}]
			});
		},
		addNewIcon : function(boardId) {
			if(!boardId) return false;
			this.render(this.communityId);
			return ;
		},
		
		
		communityHome : function() {
			var callback = function() {
        		GO.router.navigate(GO.contextRoot + "community", true);
        	};
        	GO.util.editorConfirm(callback);
		}, 
		
		/**
		 * 부서/게시판의 설정 버튼 클릭 핸들러
		 * 
		 * BoardTreeView 내부로 들어가도 좋으나, 부서의 경우 BoardTreeView 구성요소가 아니므로 우선 여기서 일괄 처리
		 * BoardTreeView는 버튼만 제공하는 셈.
		 */
		_clickBtnSettingHandler: function(e) {
			var $target = $(e.currentTarget);
			var nodeType = $target.data('type');
			
			switch(nodeType) {
			case 'BOARD':	// 그외 모든 게시판 타입의 설정
				this.getBoardAdmin(e);
				break;
			default:
				// 그외에는 관리액션이 존재하지 않는다.
				break;
			}
		},
	},{
		create: function() {
			if(instance === null) instance = new layoutView();
			return instance.render();
		}
	});
	return SideView2;
});