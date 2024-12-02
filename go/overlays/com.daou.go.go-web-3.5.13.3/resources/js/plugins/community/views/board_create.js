define(function(require) {
	var GO = require("app");
	var when = require('when');
	var BoardCreateView = require("board/views/board_create");
	var BoardModel = require("community/models/board");
	var BoardConfigModel = require("board/models/board_config");
	
	var tplCommunityBoardCreate = require("hgn!community/templates/board_create");   
	var tplCommunityBoardModify = require("hgn!community/templates/board_modify");	   	
	var tplBoardCreatePublicData = require("hgn!community/templates/board_create_public_data");
	var tplBoardCreateAnonymousData = require("hgn!community/templates/board_create_anonymous_data");
	var tplBoardCreateMembers = require("hgn!community/templates/board_create_public_members");
	var tplBoardCreateHeaderPart = require("hgn!board/templates/board_create_header");
	
	var BoardTitleView = require("board/views/board_title");
	var boardLang = require("i18n!board/nls/board");
	var commonLang = require("i18n!nls/commons");

	require("jquery.go-orgslide");
	
	var session = GO.session();
	var tplVar = {
			'anonym_flag' : boardLang['익명 설정'],
			'anonym_desc' : boardLang['※ 익명 설정은 나중에 변경하실 수 없습니다.'],
			'public_writer_for_post' : boardLang['게시물 작성자 공개 설정 허용'],
			'public_writer_for_post_comment' : boardLang['댓글 작성자 공개 설정 허용'],
			'all_user_option' : commonLang['전체 사용자'],
			'specific_user_option' : boardLang['사용자 설정'],
			'me': boardLang['나'],
			'board_add': boardLang['게시판 추가'],
			'board_modify' : commonLang['게시판 설정'],
			'board_add_desc' : boardLang['게시판 추가하기'],
			'search_detail' : commonLang['상세검색'],
			'search' : commonLang['검색'],
			'where' : boardLang['게시판그룹'],
			'title' : commonLang['제목'],
			'desc' : boardLang['설명'],
			'board_desc_null' : boardLang['게시판 설명을 입력하세요.'],
			'type' : boardLang['유형'],
			'classic' : boardLang['클래식'],
			'feed' : boardLang['피드'],
			'manager' : boardLang['운영자'],
			'manager_add' : boardLang['운영자 추가'],
			'manager_select' : boardLang['운영자 선택'],
			'share' : boardLang['공유'],
			'share_desc' : boardLang['공유 설명'],
			'use' : boardLang['사용함'],
			'unuse' : commonLang['사용하지 않음'],
			'share_dept_desc' : boardLang['공유부서지정'],
			'share_dept_select' : boardLang['공유부서 선택'],
			'share_low_dept' : boardLang['하위 부서에 공유함'],
			'perm_write_read' : boardLang['열람, 작성 모두 허용'],
			'perm_only_read' : boardLang['열람만 허용'],
			'dept_share' : boardLang['특정 부서와 공유함'],
			'dept_share_add' : boardLang['공유 부서 추가'],
			'close_set' : boardLang['비공개 설정'],
			'open_set_desc' : boardLang['공개 설정 설명'],
			'open_member_desc' : boardLang['공개 멤버 지정'],
			'open_dept_member' : boardLang['공개 부서 멤버 설정'],
			'open_dept_name' : boardLang['부서명'],
			'open_dept_value' : boardLang['부서 공개 여부'],
			'open_all' : boardLang['전체공개'],
			'open_dept_write_perm' : boardLang['작성권한'],
			'board_add_confirm' : commonLang['확인'],
			'board_add_submit' : boardLang['만들기'],
			'board_add_cancel' : commonLang['취소'],
			'modify' : commonLang['수정'],
			'stop' : boardLang['중지'],
			'board_stop' : boardLang['게시판 중지'],
			'board_stop_desc' : boardLang['게시판 중지 설명'],
			'board_delete' : boardLang['게시판 삭제'],
			'board_delete_desc' : boardLang['게시판 삭제 설정'],
			'setting' : commonLang['설정'],
			'delete' : commonLang['삭제'],
			"public_owner" : boardLang['열람자 선택'],
			"add_public_member" : boardLang['공개 멤버 추가'],
			"add_anonymous_member": boardLang['멤버 추가'],
			"save_success" : commonLang['저장되었습니다.'],
        	'header' : boardLang['말머리'],
        	'header_placeholder' : boardLang['말머리명 입력'],
        	'header_add' : boardLang['말머리 추가'],
        	'header_subject' : boardLang['말머리 제목'],
        	'modify_done' : commonLang['수정완료'],
			'comment_flag' : boardLang['댓글 작성'],
			'comment_flag_true' : commonLang['허용'],
			'comment_flag_false' : commonLang['허용하지 않음'],
			'header_required_option' : boardLang['게시물 등록시 반드시 선택하게 함'],
			'add_board_alert' : boardLang["게시판이 추가되었습니다."], 
			"select_group": boardLang["게시판그룹 선택"],
			"send_mail_title" : commonLang["메일발송 타이틀"],
			"send_mail_tooltip" : commonLang["메일발송 툴팁"],
			"yes" : commonLang["예"],
			"no" : commonLang["아니오"],
			"add_member": boardLang["사용자 추가"],
			"select_member": boardLang["사용자 선택"],
			"add_member_desc": boardLang["익명 옵션 사용자를 추가하세요."],
			"anonymous_option_value": boardLang["익명 옵션 설정 여부"],
			"settable": boardLang["설정 허용 여부"],
			"anonymous_option_member": boardLang["익명 옵션 멤버 설정"],
			"anonym_tooltip" : boardLang['익명 설정 툴팁']
	};	
	
	/**
	 * 게시판의 board_create.js를 가져쓰는 방식으로 개선 필요.
	 */
	var ComunityBoardCreateView = BoardCreateView.extend({
		
		rootKeyName: 'communityId', 
		
		/**
		 * @Override
		 */
		events: function() {
			return _.extend({
				"click #publicFlagOptionTable .creat.ic_setup" : "addCommunityMember",
				"click #postGroupWrap .creat.ic_setup" : "addPostGroup",
				"click #postCommentGroupWrap .creat.ic_setup" : "addPostCommentGroup"
			}, BoardCreateView.prototype.events);
		}, 
		
		/**
		 * @Override
		 */
		initialize: function(options) {
			this.options = options || {};
			
			this.boardId = options.boardId;
			this.communityId = options.communityId;
			
			this.boardModel = this._getBoardModel();
		},

		/**
		 * @Override
		 */
		render: function() {
			var self = this;
			var communityName = null;
			var communityId = null;	
			var communityMember = [];
            var hidePostAuthOption = false;  // 게시글열람자설정 기능자체를 삭제안할때 사용
			
			var boardData = {};
			
			if(this.isCreateMode()) {	// 게시판 생성
				this.$el.html(tplCommunityBoardCreate({
					communityId : this.communityId,
					isCreate : true,
					lang : tplVar,
					boardLang : boardLang,
					hidePostAuthOption : hidePostAuthOption
				}));
				
				this._makeCommunitySelectList().
					then(_.bind(this._setBoardOperator, this));
			} else {	// 게시판 수정
				if(!this.boardModel.isManageable()) {
					GO.util.error('403', { "msgCode": "400-board"});
				}
				boardData.dataset = this.boardModel.toJSON();
			
				$.each(boardData.dataset.owners,function(k,v) {
					if(v.ownerType == "Community") {
						communityName = v.ownerInfo;
						communityId = v.ownerId;
					} else if(v.ownerType == 'User') {
						communityMember.push(v);
					}
				});
				
				if(_.isArray(boardData.dataset.pathName)) {
					boardData.dataset.pathInfo = GO.util.escapeXssFromHtml(boardData.dataset.pathName.join(' &gt; '));
				}

				this.$el.html(tplCommunityBoardModify($.extend(boardData, {  
					isClassic : function() {
						if(this.dataset.type == 'CLASSIC') return true;
						return false;
					}, isStream : function() {
						if(this.dataset.type == 'STREAM') return true;
						return false;						
					}, isAnonym : function() {
						if(this.dataset.anonymFlag) return true;
						return false;
					},
					lang : tplVar,
					boardLang : boardLang,
					isCreate : true,
					communityName : communityName,
					communityId : communityId,
                    hidePostAuthOption :  hidePostAuthOption
				})));

				this.boardDataset(boardData.dataset);
				
				if(communityMember.length) {
					this.$el.find('#publicFlagOptionTable ul.name_tag li.default_option').hide();
					var membersTarget = this.$el.find('#publicFlagOptionTable ul.name_tag');
					$.each(communityMember, function(k,v) {
						membersTarget.find('li.creat').before(tplBoardCreateMembers({ 
							id : v.ownerId,
							name : v.ownerInfo,
							communityId : communityId,
							lang : tplVar
						}));
					});
				} else {
					this.$el.find('#publicFlagOptionTable ul.name_tag li.default_option').show();
				}
			} 

			BoardTitleView.render({
				el : '.content_top',
				dataset : {
					name : boardData.dataset ? tplVar.board_modify : tplVar.board_add  
				},
				isCommunity : true,
			});
		},
		/**
		 * 게시판 추가시 커뮤니티 정보 select 박스 생성
		 */
		_makeCommunitySelectList : function() {
			var self = this;
			var joinedCommunities = [];
			var defer = when.defer();
			var selectedId = this.communityId;
			
			$.ajax(GO.contextRoot + 'api/community/list/menu').then(function success(rs) {
				_.each(rs.data, function(v, k) {
					joinedCommunities.push(self._makeFolderOptionHtml(v.communityId, v.name, parseInt(selectedId)));
				});
				
				self.$('select[name=communityId]').html(joinedCommunities.join("\n"));
				defer.resolve();
			});
			
			return defer.promise;
		},
		/**
		 * @Override
		 */
		togglePublicWriterPostGroup: function() {
			var radioVal = this.$el.find('input[name=targetForPost]:radio:checked').val();
			if(radioVal == "false"){
				$('#postGroupWrap').show();
				this.setAnonymousPost();
			} else {
				$('#postGroupWrap').hide();
			}
		},
		/**
		 * @Override
		 */
		togglePublicWriterPostCommentGroup: function() {
			var radioVal = this.$el.find('input[name=targetForPostComment]:radio:checked').val();
			if(radioVal == "false"){
				$('#postCommentGroupWrap').show();
				this.setAnonymousComment();
			} else {
				$('#postCommentGroupWrap').hide();
			}
		},
		setAnonymousPost: function () {
			var publicHtml = [tplBoardCreateAnonymousData({
				lang : tplVar,
				isCreate : this.isCreateMode()
			})];
			this.$el.find('#postGroupWrap').html(publicHtml.join(''));
			this.$el.find('#postGroupWrap ul.name_tag li.default_option').show();
		},
		setAnonymousComment: function () {
			var publicHtml = [tplBoardCreateAnonymousData({
				lang : tplVar,
				isCreate : this.isCreateMode()
			})];
			this.$el.find('#postCommentGroupWrap').html(publicHtml.join(''));
			this.$el.find('#postCommentGroupWrap ul.name_tag li.default_option').show();
		},
		/**
		 * @Override
		 * 하위 폴더 추가버튼 클릭시 호출되는 이벤트 핸들러
		 */
		_addChildNodesSelect: function(accessor) {
			this.addChildNodesSelect('community');
		},

		/**
		 * @Override
		 */
		addBoardManagers : function() {
			var self = this,
			loadId = self.$el.find('[name=communityId]').val();
			$.goOrgSlide({
				header : tplVar['manager_select'],
				desc : '',
				type : 'community',
				contextRoot : GO.contextRoot,
				loadId : loadId,
				callback : self.addBoardManagerEl,
				accessOrg : true
			});
		},
		addPostGroup: function (e) {
			var self = this;
			var loadId = self.$el.find('[name=communityId]').val();
			var selectedEl = self.$el.find('#postGroupWrap');
			var	targetEl = selectedEl.find('ul.name_tag');
			var	msgEl = targetEl.find('li.default_option');

			var callback = function(rs) {
				if(rs && !targetEl.find('li[data-id="'+rs.id+'"]').length) {
					rs.communityId = loadId;
					targetEl.find('li.creat').before(tplBoardCreateMembers($.extend(rs, { lang : tplVar })));
					targetEl.trigger('changePostGroup.public');
				}
			};
			$.goOrgSlide({
				header : tplVar['add_member'],
				desc : '',
				type: 'community',
				contextRoot : GO.contextRoot,
				loadId : loadId,
				callback : callback,
				accessOrg : true
			});
			targetEl.bind('changePostGroup.public', function() {
				if(!targetEl.find('li:not(.creat, .default_option)').length) {
					msgEl.show();
				} else {
					msgEl.hide();
				}
			});
		},
		addPostCommentGroup: function (e) {
			var self = this;
			var loadId = self.$el.find('[name=communityId]').val();
			var selectedEl = self.$el.find('#postCommentGroupWrap');
			var	targetEl = selectedEl.find('ul.name_tag');
			var	msgEl = targetEl.find('li.default_option');

			var callback = function(rs) {
				if(rs && !targetEl.find('li[data-id="'+rs.id+'"]').length) {
					rs.communityId = loadId;
					targetEl.find('li.creat').before(tplBoardCreateMembers($.extend(rs, { lang : tplVar })));
					targetEl.trigger('changePostCommentGroup.public');
				}
			};
			$.goOrgSlide({
				header : tplVar['add_member'],
				desc : '',
				type: 'community',
				contextRoot : GO.contextRoot,
				loadId : loadId,
				callback : callback,
				accessOrg : true
			});
			targetEl.bind('changePostCommentGroup.public', function() {
				if(!targetEl.find('li:not(.creat, .default_option)').length) {
					msgEl.show();
				} else {
					msgEl.hide();
				}
			});
		},
		/**
		 * @Override
		 */
		addCommunityMember : function(e) {
			var self = this,
			loadId = self.$el.find('[name=communityId]').val(),
			selectedEl = self.$el.find('#publicFlagOption'),
			targetEl = selectedEl.find('ul.name_tag'),
			msgEl = targetEl.find('li.default_option');
		
			var callback = function(rs) {
				if(rs && !targetEl.find('li[data-id="'+rs.id+'"]').length) {
					rs.communityId = loadId;
					targetEl.find('li.creat').before(tplBoardCreateMembers($.extend(rs, { lang : tplVar })));
					targetEl.trigger('contentChanged.public');
				}
			};	

			$.goOrgSlide({
				header : tplVar['public_owner'],
				desc : '',
				type: 'community',
				contextRoot : GO.contextRoot,
				loadId : loadId,
				callback : callback,
				accessOrg : true
			});
			
			targetEl.bind('contentChanged.public', function() {
				if(!targetEl.find('li:not(.creat, .default_option)').length) {
					msgEl.show();
				} else {
					msgEl.hide();
				}
			});
		},
		
		/**
		 * @Override
		 */
		setPublicData : function() {
			var publicHtml = [tplBoardCreatePublicData({
				lang : tplVar,
				isCreate : this.isCreateMode()
			})];
			this.$el.find('#publicFlagOptionTable').html(publicHtml.join(''));
			this.$el.find('#publicFlagOptionTable ul.name_tag li.default_option').show();
		},

		/**
		 * @Override
		 */
		boardDataset : function(data) {
			var self = this,
			form = this.$el.find('form[name="'+self.formName+'"]');
			$.each(data.managers,function(k,v) {
				self.addBoardManagerEl(v);
			});
			if(data.publicFlag) {
				this.$el.find('form[name="'+self.formName+'"] input[name="publicFlag"][value="true"]').attr('checked', true);
				this.togglePublicFlag();
			}
			
			this.$el.find('input[name="headerFlag"][value="'+data.headerFlag+'"]').attr('checked',true);
			this.$el.find('input[name="commentFlag"][value="'+data.commentFlag+'"]').attr('checked', true);
			this.$el.find('input[name="sendMailFlag"][value="'+data.sendMailFlag+'"]').attr('checked', true);
			
			if (data.postHeaders.length || data.headerFlag) {
				
				this.$el.find('input[name="headerRequiredFlag"]').attr('checked', data.headerRequiredFlag);
				
				this.toggleHeaderFlag();
				var headerPart = tplBoardCreateHeaderPart({
					dataset:data.postHeaders,
					lang:tplVar
				});
				self.$el.find('#headerListPart').append(headerPart);
				self.$el.find('#headerFlagOption tr[data-headerdeleteflag="true"]').hide();
			}
			//익명 설정 반영
			this.togglePublicWriterPostGroup();
			this.togglePublicWriterPostCommentGroup();
            if(!_.isUndefined(data.anonymousWriterPostOption) && !_.isUndefined(data.anonymousWriterPostOption.specificUsers)) {
                this.getAnonymousOptionTarget(self.$el.find('#postGroupWrap'), data.anonymousWriterPostOption.specificUsers);
            }
            if(!_.isUndefined(data.anonymousWriterPostCommentOption) && !_.isUndefined(data.anonymousWriterPostCommentOption.specificUsers)) {
                this.getAnonymousOptionTarget(self.$el.find('#postCommentGroupWrap'), data.anonymousWriterPostCommentOption.specificUsers);
            }
        },
		/**
		 * @Override
		 */
		getAnonymousOptionTarget: function (element, targets) {
			_.each(targets, function(item) {
				var tplData = {
					id: item.userId,
					displayName: item.name,
					name: item.name,
					communityId: this.communityId
				}
				var tpl = tplBoardCreateMembers($.extend(tplData, {lang: tplVar}));
				element.find('.creat').before(tpl);
			});
			element.find('ul.name_tag li.default_option').hide();
		},
		/**
		 * @Override
		 */
		boardSave : function() {				
			var self = this;
			var form = this.$el.find('form[name='+this.formName+']');
			var communityId = form.find('[name=communityId]').val();
			var saveModel = null;
			var managerIds = [];
			var owners = [];
			var parentId = (this.$('.select-node').length > 1 ? this.$('.select-node').last().val() : null);

			var saveAction = function(model) {
				if(!self.isSaveDone){
					return;
				}
				self.isSaveDone = false;
				
				model.save({},{
					success : function(model, response) {
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
						if(response.code == '200') {
							if(self.isCreateMode()) {
								$.goMessage(tplVar.add_board_alert);
							}else{
								$.goMessage(tplVar['save_success']);
								GO.EventEmitter.trigger('community', 'changed:sideCommunityBoard', self.deptId);
							}
							
							if(model.get("publicFlag")){
								var ids = [],
									member = _.filter(model.get("owners"), function(d){return d.ownerType == "User";});
								
								if(member.length != 0){
									$.each(model.get("managers"), function(){
										ids.push(this.id);
									});
									
									ids = _.union(ids, member);
									
									if($.inArray(session.id, ids) < 0){
										GO.router.navigate("community/"+communityId,true);
										return;
									}
								}
							}
							
							if(self.isCreateMode()) {
								GO.router.navigate("community/"+communityId+"/board/"+response.data.id,true);
							}
							else {
								GO.router.navigate("community/"+communityId+"/board/"+response.data.id+"/admin",true);
							}
						} else {
							$.goMessage(response.message);
						}
						self.isSaveDone = true;
					},
					error : function(model, response) {
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
						var responseObj = JSON.parse(response.responseText);
						if(responseObj.message) $.goMessage(responseObj.message);
						if(responseObj.name == 'board.name.duplicated') responseObj.focus = 'name';
						if(responseObj.focus) form.find('input[name="'+responseObj.focus+'"]').focus();
						self.isSaveDone = true;
						return;
					}
				});
			};
			
			if(!this.boardFormValidation()) return false;
			GO.EventEmitter.trigger('common', 'layout:setOverlay', true);
			
			saveModel = this.boardModel;
			if(this.isCreateMode()) {
				saveModel.set({
					'communityId' : communityId,
					'parentId': parentId
				}, {
					silent : true
				});
			} else {
				saveModel.clear();
				saveModel.set('id', this.boardId, {silent: true});
			}
			
			this.publicFlag = null;
			$(form.serializeArray()).each(function(k,v) {
				if(v.name == 'publicFlag') {
					publicFlag = v.value;
				}
				
				if(v.name == 'managerIds') {
					managerIds.push(v.value);
				} else {
					saveModel.set(v.name , v.value, { silent : true });
				}
			});
			
			if(publicFlag) {
				this.$el.find('#publicFlagOptionTable form[name|="owners"]').each(function(k,v) {
					var tmpOwners = {};
					$($(v).serializeArray()).each(function(k2,v2) {
						tmpOwners[v2.name] = v2.value;
					});
					owners.push(tmpOwners);
				});
			}
			
			owners.push({
				"ownerShip" : "MASTER",
				"ownerType" : "Community",
				"ownerId" : communityId,
				"permission" : 3,
				"scope" : (self.$el.find('form[name|="owners-'+communityId+'-member"]').length == 0 || publicFlag == 'false') ?  'ALL' : 'PART', // 전체공개 : 일부에게 공개
			});

			var postHeaders = [];
			var headerFlag = this.$el.find('input[name=headerFlag]:radio:checked').val(),					
				headerRequiredFlag = this.$el.find('input[name=headerRequiredFlag]').is(":checked"),
				headerDeletedLength = 0;
			if (headerFlag == "true") {
				this.$el.find('tr[data-type="headerPart"]').each(function(i) {
					postHeaders.push({
						"id" : $(this).attr('data-headerid'),
						"name" : $(this).attr('data-headername'),
						"deletedFlag" : $(this).attr('data-headerdeleteflag'),
						"sortOrder" : i
					});
					if($(this).attr('data-headerdeleteflag') == 'true') headerDeletedLength++;
				});					
				if(postHeaders.length-headerDeletedLength < 1) {
					headerFlag = false;
					headerRequiredFlag = false;
				}
			}

			//익명 게시판 > 게시글 작성자 공개 허용 여부
			var isAllowedAnonymousWriterExpositionInPost = $('input[name=publicWriterSettingForPost]:checkbox').is(':checked') || false;
			//익명 게시판 > 댓글 작성자 공개 허용 여부
			var isAllowedAnonymousWriterExpositionInPostComment = $('input[name=publicWriterSettingForPostComment]:checkbox').is(':checked') || false;

			var elAnonymousDetailSettingForPost = $('div[name=publicWriterDetailForPost]');
			var elAnonymousDetailSettingForPostComment = $('div[name=publicWriterDetailForPostComment]');
			//게시글 작성자 공개 기능 사용 대상
			var anonymousSettingTargetForPost = elAnonymousDetailSettingForPost.find('input[name=targetForPost]:radio:checked').val(); //'true': 전체 사용자, 'false': 일부사용자
			//댓글 작성자 공개 기능 사용 대상
			var anonymousSettingTargetForPostComment = elAnonymousDetailSettingForPostComment.find('input[name=targetForPostComment]:radio:checked').val(); //'true': 전체 사용자, 'false': 일부사용자

			var availableUserListForAnonymousWriterExpositionInPost = [];
			availableUserListForAnonymousWriterExpositionInPost = elAnonymousDetailSettingForPost.find('#postGroupWrap ul.name_tag').find('li');
			var anonymousSettingDetailsForPost = [];
			//Post
			if (!(availableUserListForAnonymousWriterExpositionInPost == undefined || availableUserListForAnonymousWriterExpositionInPost.length == 0)) {
				availableUserListForAnonymousWriterExpositionInPost.each(function () {
					if ($(this).attr("data-id")) {
						anonymousSettingDetailsForPost.push({
							type: 'User',
							typeId: $(this).attr('data-id'),
							userId: $(this).attr('data-id')
						});
					}
				});
			}

			var availableUserListForAnonymousWriterExpositionInPostComment = [];
			availableUserListForAnonymousWriterExpositionInPostComment = elAnonymousDetailSettingForPostComment.find('#postCommentGroupWrap ul.name_tag').find('li');;
			var anonymousSettingDetailsForPostComment = [];

			//PostComment
			if (!(availableUserListForAnonymousWriterExpositionInPostComment == undefined || availableUserListForAnonymousWriterExpositionInPostComment.length == 0)) {
				availableUserListForAnonymousWriterExpositionInPostComment.each(function () {
					if ($(this).attr("data-id")) {
						anonymousSettingDetailsForPostComment.push({
							type: 'User',
							typeId: $(this).attr('data-id'),
							userId: $(this).attr('data-id')
						});
					}
				});
			}
			var anonymousWriterSettingForPost = this.createAnonymousOption(
				isAllowedAnonymousWriterExpositionInPost,
				anonymousSettingTargetForPost,
				anonymousSettingDetailsForPost
			);
			var anonymousWriterSettingForPostComment = this.createAnonymousOption(
				isAllowedAnonymousWriterExpositionInPostComment,
				anonymousSettingTargetForPostComment,
				anonymousSettingDetailsForPostComment
			);

			saveModel.set({ 
				'managerIds' : managerIds,
				'owners' : owners,
				'headerFlag' : headerFlag,
				'headerRequiredFlag' : headerRequiredFlag,
				'postHeaders' : postHeaders,
				'anonymFlag' : this.$el.find('input[name=anonymFlag]:radio:checked').val() || false,
				'anonymousWriterPostOption' : anonymousWriterSettingForPost,
				'anonymousWriterPostCommentOption': anonymousWriterSettingForPostComment,
                'postAuthOption' : this.$el.find('.postAuthOption:checked').val(),
                'closePostTitleShowOption' : this.$el.find('.closePostTitleShowOption:checked').val()
			},{ silent : true });

			if(saveModel.get('status') == 'DELETED') {
				$.goCaution(boardLang['게시판 삭제'],  boardLang['게시판 삭제 확인'], function() {
					saveModel.destroy({success : function(mode, rs) {
						GO.router.navigate('community/'+communityId, {trigger: true, pushState:true});
						GO.EventEmitter.trigger('community', 'changed:sideCommunityBoard', true);
					}});
				});
			} else {
				saveAction(saveModel);
			}
		},
		
		/**
		 * @Override
		 */
		boardSaveCancel : function() {
			var self = this;
			if(self.isCreateMode()){
				$.goConfirm(commonLang['취소하시겠습니까?'],
						commonLang['입력하신 정보가 초기화됩니다.'],
						function() {
							self.render();
						});
			}else{
                var url = "community/" + self.communityId + "/board/" + self.boardId;
                GO.router.navigate(url,{trigger: true});
			}
		},
		
		/**
		 * @Override
		 */
		_getBoardModel: function() {
			return this.isCreateMode() ? new BoardModel() : BoardConfigModel.get(this.boardId);
		}
	});
	
	return ComunityBoardCreateView;
});