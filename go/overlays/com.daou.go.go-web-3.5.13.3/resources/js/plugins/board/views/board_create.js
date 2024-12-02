define(function(require) {
	var $ = require("jquery");
	var Backbone = require("backbone"); 
	var GO = require("app"); 
	var when = require('when');

	var BoardTitleView = require("board/views/board_title");
	var DepartmentBoardModel = require("board/models/dept_board");
	var BoardConfigModel = require("board/models/board_config");

	var tplBoardCreate = require("hgn!board/templates/board_create");
	var tplBoardModify = require("hgn!board/templates/board_modify");
	var tplBoardCreateManager = require("hgn!board/templates/board_create_manager");
	var tplBoardCreateOwners = require("hgn!board/templates/board_create_owners");
	var tplBoardCreateOwnersData = require("hgn!board/templates/board_create_owners_data");
	var tplBoardCreatePublic = require("hgn!board/templates/board_create_public");
	var tplBoardCreatePublicData = require("hgn!board/templates/board_create_public_data");
	var tplBoardCreateMembers = require("hgn!board/templates/board_create_public_members");
	var tplBoardCreateHeaderPart = require("hgn!board/templates/board_create_header");
	var tplBoardCreateAnonymous = require("hgn!board/templates/board_create_anonymous");
	var tplBoardCreateAnonymousData = require("hgn!board/templates/board_create_anonymous_data");

	var boardLang = require("i18n!board/nls/board"); 
	var commonLang = require("i18n!nls/commons");
	
	require("jquery.go-orgslide");
	require("jquery.go-popup");
	require("jquery.go-sdk");
	
	var session = GO.session(); 
	var apiRootUrl = GO.contextRoot+ 'api/'; 
	var lang = {
		"anonym_flag" : boardLang["익명 설정"],
		"anonym_desc" : boardLang["※ 익명 설정은 나중에 변경하실 수 없습니다."],
		"public_writer_for_post" : boardLang['게시물 작성자 공개 설정 허용'],
		"public_writer_for_post_comment" : boardLang['댓글 작성자 공개 설정 허용'],
		"all_user_option" : commonLang['전체 사용자'],
		"specific_user_option" : boardLang['사용자 설정'],
		"board_add" : boardLang["게시판 추가"],
		"board_modify" : commonLang["게시판 설정"],
		"board_add_desc" : boardLang["게시판 추가하기"],
		"search_detail" : commonLang["상세검색"],
		"search" : commonLang["검색"],
		"where" : boardLang["게시판그룹"],
		"title" : commonLang["제목"],
		"desc" : boardLang["설명"],
		"board_desc_null" : boardLang["게시판 설명을 입력하세요."],
		"type" : boardLang["유형"],
		"classic" : boardLang["클래식"],
		"feed" : boardLang["피드"],
		"manager" : boardLang["운영자"],
		"manager_add" : boardLang["운영자 추가"],
		"manager_select" : boardLang["운영자 선택"],
		"manager_select_desc" : boardLang["운영자를 선택하세요."],
		"share" : boardLang["공유"],
		"share_setting": boardLang["공유 부서 설정"],
		"share_desc" : boardLang["공유 설명"],
		"use" : boardLang["사용함"],
		"unuse" : commonLang["사용하지 않음"],
		"share_dept_desc" : boardLang["공유부서지정"],
		"share_dept_select" : boardLang["공유부서 선택"],
		"share_dept_select_desc" : boardLang["공유할 부서를 선택하세요."],
		"share_low_dept" : boardLang["하위 부서에 공유함"],
		"perm_write_read" : boardLang["열람, 작성 모두 허용"],
		"perm_only_read" : boardLang["열람만 허용"],
		"dept_share" : boardLang["특정 부서와 공유함"],
		"dept_share_add" : boardLang["공유 부서 추가"],
		"close_set" : boardLang["비공개 설정"],
		"open_set_desc" : boardLang["공개 설정 설명"],
		"open_member_desc" : boardLang["공개 멤버 지정"],
		"open_dept_member" : boardLang["공개 부서 멤버 설정"],
		"open_member_select" : boardLang["열람자 선택"],
		"open_member_add" : boardLang["열람자 추가"],
		"open_member_select_desc" : boardLang["게시판 열람자를 추가하세요."],
		"open_dept_name" : boardLang["부서명"],
		"open_dept_value" : boardLang["부서 공개 여부"],
		"open_all" : boardLang["전체공개"],
		"open_dept_write_perm" : boardLang["작성권한"],
		"board_add_confirm" : commonLang["확인"],
		"board_add_submit" : boardLang["만들기"],
		"board_add_cancel" : commonLang["취소"],
		"modify" : commonLang["수정"],
		"stop" : boardLang["중지"],
		"board_stop" : boardLang["게시판 중지"],
		"board_stop_desc" : boardLang["게시판 중지 설명"],
		"board_delete" : boardLang["게시판 삭제"],
		"board_delete_desc" : boardLang["게시판 삭제 설정"],
		"setting" : commonLang["설정"],
		"delete" : commonLang["삭제"],
		"me" : boardLang["나"],
		"save_success" : commonLang["저장되었습니다."],
		"add_board_alert" : boardLang["게시판이 추가되었습니다."],
		"header" : boardLang["말머리"],
		"header_placeholder" : boardLang["말머리명 입력"],
		"header_add" : boardLang["말머리 추가"],
		"header_subject" : boardLang["말머리 제목"],
		"modify_done" : commonLang["수정완료"],
		"comment_flag" : boardLang["댓글 작성"],
		"comment_flag_true" : commonLang["허용"],
		"comment_flag_false" : commonLang["허용하지 않음"],
		"alert_board_type" : boardLang["게시판 유형은 나중에 변경하실 수 없습니다."],
		"header_required_option" : boardLang["게시물 등록시 반드시 선택하게 함"],
		"send_mail_title" : commonLang["메일발송 타이틀"],
		"send_mail_tooltip" : commonLang["메일발송 툴팁"],
		"yes" : commonLang["예"],
		"no" : commonLang["아니오"],
		"delete_title" : boardLang["게시판 삭제"],
		"delete_confirm" : boardLang["게시판 삭제 확인"],
		"delete_success" : commonLang["삭제되었습니다."], 
		"add_board_group": boardLang["게시판그룹"], 
		"select_group": boardLang["게시판그룹 선택"],
		"add_member": boardLang["사용자 추가"],
		"select_member": boardLang["사용자 선택"],
		"add_member_desc": boardLang["익명 옵션 사용자를 추가하세요."],
		"anonymous_option_value": boardLang["익명 옵션 설정 여부"],
		"settable": boardLang["설정 허용 여부"],
		"anonymous_option_member": boardLang["익명 옵션 멤버 설정"],
		"anonym_tooltip" : boardLang['익명 설정 툴팁']
	};

	var BoardCreateView = Backbone.View.extend({
		
		rootKeyName: 'deptId', 
		formName: 'formBoardCreate',
		isSaveDone: true, 
		
		events : {
			"click a#formCreateRegist" : "boardSave",
			"click a#formCreateCancel" : "boardSaveCancel",
			"click a#formCreateDelete" : "boardDelete",
			"click span#btnAddManager" : "addBoardManagers",
			"click span#btnAddOwners" : "addBoardOwners",
			"click ul.name_tag li span.ic_del" : "deleteMember",
			"click div#ownersTable span.ic_basket" : "deleteOwner",
			"click input[name=sharedFlag]:radio" : "toggleSharedFlag",
			"click input[name=publicFlag]:radio" : "togglePublicFlag",
			"click input[name=lowRankFlag]:checkbox" : "toggleLowRankFlag",
			"click input[name=headerFlag]:radio" : "toggleHeaderFlag",
			"click input[name=type]:radio" : "toggleTypeFlag",
			"click input#ownersUse:checkbox" : "toggleOwners",
			"click #publicFlagOptionTable span[data-id]" : "addPublicMember",
			"click #postCommentGroupWrap span[data-id]": "addAnonymousPostCommentMember",
			"click #postGroupWrap span[data-id]": "addAnonymousPostMember",
			"change select[name=deptId]" : "changeDept",
			"click input#statusDeleted" : "toggleStatus",
			"click input#statusClosed" : "toggleStatus",
			"click #headerAdd" : "headerAdd",
			"click span[data-btntype='headerModify']" : "headerModify",
			"click span.headerText" : "headerModify",
			"click span[data-btntype='headerSave']" : "headerSave",
			"click span[data-btntype='headerDelete']" : "headerDelete",
			"click span[data-btntype='headerCancel']" : "headerCancel",
			"keyup input#headerName" : "addHeaderLengthValidate",
			"click .btn-add-select-node": "_addChildNodesSelect",
            "keyup span.headerInputPart input:text" : "editHeaderLengthValidate", 
            "change select.select-node": "_clearSelectedChildren",
			"click input[name=anonymFlag]:radio": "toggleAnonymFlag",
			"click input#publicWriterSettingForPost": "togglePublicWriterForPost",
			"click input#publicWriterSettingForPostComment": "togglePublicWriterForPostComment",
			"click input[name=targetForPost]:radio": "togglePublicWriterPostGroup",
			"click input[name=targetForPostComment]:radio": "togglePublicWriterPostCommentGroup"
		},

		initialize : function(options) {
			this.options = options || {};
			
			this.boardId = options.boardId;
			this.deptId = options.deptId;
			
			this.boardModel = this._getBoardModel();
			this.isSaveDone = true;
		},
		
		render : function() {
			var jointOnwers = [];
			var boardData = {};
            var hidePostAuthOption = false;  // 게시글열람자설정 기능자체를 삭제안할때 사용
			
			if (this.isCreateMode()) { // 게시판 생성
				this.$el.html(tplBoardCreate({
					isCreate : this.isCreateMode(),
					isOrgServiceOn : GO.session("useOrgAccess"), 
					lang : lang,
					boardLang : boardLang,
                    hidePostAuthOption : hidePostAuthOption
				}));
				
				this._makeDeptSelectList().
					then(_.bind(this._setBoardOperator, this));

			} else {// 게시판 수정
				if(!this.boardModel.isManageable()) {
					GO.util.error('403', { "msgCode": "400-board"});
				}
				boardData.dataset = this.boardModel.toJSON();
				// owner 정보 - MASTER || JOINT
				$.each(boardData.dataset.owners, function(k, v) {
					if(v.ownerType == 'Company'){	//전사게시판은 사이트 관리자만 관리 할 수 있다.
						GO.util.error('403', { "msgCode": "400-board"});
					}
					if (v.ownerShip == 'MASTER') {
						boardData.dataset.masterOwner = v;
						if(!boardData.dataset.masterOwner.ownerInfo) {
							boardData.dataset.masterOwner.ownerInfo = boardData.dataset.deptText;
						}
					}
					else if (v.ownerShip == 'JOINT')  {
						jointOnwers.push(v);
					}
				});
				boardData.dataset.jointOnwers = jointOnwers;
				
				if(_.isArray(boardData.dataset.pathName)) {
					boardData.dataset.pathInfo = GO.util.escapeXssFromHtml(boardData.dataset.pathName.join(' &gt; '));
				}
				this.$el.html(tplBoardModify(
					$.extend(boardData,{
						isClassic : function() {
							if (this.dataset.type == 'CLASSIC')
								return true;
							return false;
						},
						isStream : function() {
							if (this.dataset.type == 'STREAM')
								return true;
							return false;
						},
						isAnonym : function() {
							if(this.dataset.anonymFlag){
								return true;
							}
							return false;
						},
						lang : lang,
						boardLang : boardLang,
						isOrgServiceOn : GO.session("useOrgAccess"),
                        hidePostAuthOption : hidePostAuthOption
					})
				));
				this.boardDataset(boardData.dataset);
			}

			BoardTitleView.render({
				el : '.content_top',
				dataset : {
					name : this.isCreateMode() ? lang['board_add'] : lang['board_modify']
				}
			});
		},
		
		/**
		 * 하위 폴더 추가버튼 클릭시 호출되는 이벤트 핸들러
		 */
		addChildNodesSelect: function(accessor) {
			var self = this;
			var selector = '.select-node';
			var $target = this.$(selector).last();
			var rootId = this.$(selector).first().val();
			var reqData = {};
			
			reqData[this.rootKeyName] = rootId;
			
			if(this.$(selector).length > 1) {
				reqData.parentId = $target.val();
			}
			
			$.ajax(GO.config('contextRoot') + 'api/' + (accessor || 'department') + '/board/folders', {
				data: reqData, 
				contentType: 'application/json', 
				dataType: 'json'
			}).then(function(rs) {
				if(rs.data && rs.data.length === 0) {
					$.goSlideMessage(boardLang['게시판그룹이 존재하지 않습니다']);
				} else {
					var $wrap = $target.parent();
					// 이후의 하위 폴더 선택박스는 모두 지운다.
					$wrap.nextAll('.wrap_select').remove();
					// 그리고 새로운 하위폴더 선택박스를 추가.
					$wrap.after(self._makeSelectNode(rs.data));
				}
			});
		},
		
		_addChildNodesSelect: function(e) {
			this.addChildNodesSelect('department');
		},
		
		_makeSelectNode: function(nodes) {
			var lenOfSelectNodeEl = this.$('.select-node').length;
			var nodeSeq = lenOfSelectNodeEl > 1 ? lenOfSelectNodeEl - 1 : 1;
			var $el = $('<span class="wrap_select"><select name="parentId-' + nodeSeq + '" class="select-node"></select></span>');
			var html = [];
			
			_.each(nodes, function(node) {
				var nodeValue = node.nodeValue || node.title || node.name;
				html.push(this._makeFolderOptionHtml(node.id, nodeValue));
			}, this);
			
			$el.find('select').html(html.join("\n"));
			
			return $el;
		},
		toggleAnonymFlag : function() {
			// notification
			var selectedVal = this.$el.find('input[name=anonymFlag]:radio:checked').val();
			// anonymousOption
			var anonymousOption = this.$el.find('#anonymFlagOption');
			if(selectedVal == "true") {
				anonymousOption.show();
			} else {
				anonymousOption.hide();
			}
		},
		/**
		 * 게시판 추가시 부서 정보 select 박스 생성
		 */
		_makeDeptSelectList : function() {
			var self = this;
			var deptList = [];
			var defer = when.defer();
			var selectedId = this.deptId;
			
			$.ajax(apiRootUrl + 'department/list/joined').then(function success(rs) {
				if (!rs.data.length) {
					GO.router.navigate("board", { trigger : true, replace : true });
					$.goAlert(lang['board_add_desc'],boardLang['부서가 설정되지 않아 게시판을 추가 할 수 없습니다.']);
					
					defer.reject();
				} else {
					_.each(rs.data, function(v, k) {
						deptList.push(self._makeFolderOptionHtml(v.id, v.name, selectedId));
					});
					
					self.$('select[name=deptId]').html(deptList.join("\n"));
					defer.resolve(deptList.join("\n"));
				}
			});
			
			return defer.promise;
		},
		
		_makeFolderOptionHtml: function(id, displayText, selectedId) {
			var selected = selectedId && id === selectedId ? ' selected="selected"': '';
			return '<option value="' + id + '"'+ selected +'>' + _.escape(displayText) + '</option>';
		},
		
		/**
		 * 게시판 추가시 나를 게시판 운영자로 기본 추가
		 */
		_setBoardOperator: function() {
			this.$('#boardManagers li.creat').before(
				tplBoardCreateManager({
					isMe : true,
					name : session.name,
					id : session.id,
					positionName : session.position,
					lang : lang
				})
			);
		}, 
		
		isCreateMode: function() {
			return !this.boardId;
		},
		
		boardDataset : function(data) {
			console.log("boardDataset()");
			console.log(data);
			var self = this, form = this.$el.find('form[name="'+ self.formName + '"]');

			// 운영자
			$.each(data.managers, function(k, v) {
				self.addBoardManagerEl(v,"cteate");
			});
			
			if (data.sharedFlag) {
				form.find('input[name="sharedFlag"][value="true"]').attr('checked', true);
				this.toggleSharedFlag();
				form.find('input[name="lowRankFlag"]').attr('checked',data.lowRankFlag);
				this.toggleLowRankFlag();
				form.find('input[name="lowPermission"][value="'+ data.lowPermission+ '"]').attr('checked', true);

				if (data.jointOnwers.length) {
					form.find('input#ownersUse').attr('checked', true);
					this.toggleOwners();
					$.each(data.jointOnwers,function(k, v) {
						self.addBoardOwnerEl({
							id : v.ownerId,
							name : v.ownerInfo,
							checked : v.permission == 1 ? false : true
						});
						if (v.ownerShip == 'JOINT' && v.scope == 'PART') {
							self.getJoinMembers(v.id, v.ownerId);
						}
					});
				}
			}

			if (data.masterOwner && data.masterOwner.scope == 'PART') {
				self.getJoinMembers(data.masterOwner.id, data.masterOwner.ownerId);
			}

			if (data.status == 'CLOSED') {
				self.$el.find('#statusClosed').attr('checked', true);
			}

			if (data.publicFlag) {
				this.$el.find('form[name="'+ self.formName+ '"] input[name="publicFlag"][value="true"]').attr('checked', true);
				this.togglePublicFlag();
			}

			this.$el.find('input[name="headerFlag"][value="'+data.headerFlag+'"]').attr('checked', true);
			this.$el.find('input[name="commentFlag"][value="'+data.commentFlag+'"]').attr('checked', true);
			this.$el.find('input[name="sendMailFlag"][value="'+data.sendMailFlag+'"]').attr('checked', true);
			
			if (data.postHeaders.length || data.headerFlag) {
				
				this.$el.find('input[name="headerRequiredFlag"]').attr('checked', data.headerRequiredFlag);
				
				this.toggleHeaderFlag();
				var headerPart = tplBoardCreateHeaderPart({
					dataset : data.postHeaders,
                    lang : lang,
                    headerLength : function(){
                        return $.goValidation.realLength(this.name);
                    }
				});
				self.$el.find('#headerListPart').append(headerPart);
				self.sortableHeaderFlag();
				self.$el.find('#headerFlagOption tr[data-headerdeleteflag="true"]').hide();
			}

			//익명 설정
			this.togglePublicWriterPostGroup();
			this.togglePublicWriterPostCommentGroup();
            if(!_.isUndefined(data.anonymousWriterPostOption) && !_.isUndefined(data.anonymousWriterPostOption.specificUsers)) {
				this.getAnonymousOptionTarget(self.$el.find('#postGroupWrap'), data.anonymousWriterPostOption.specificUsers);
			}
            if(!_.isUndefined(data.anonymousWriterPostCommentOption) && !_.isUndefined(data.anonymousWriterPostCommentOption.specificUsers)) {
				this.getAnonymousOptionTarget(self.$el.find('#postCommentGroupWrap'), data.anonymousWriterPostCommentOption.specificUsers);
			}
		},
		getAnonymousOptionTarget: function (element, targets) {
			var departments = element.find('tbody>tr');
			_.each(targets, function (item) {
				var tplData = {
					id: item.userId,
					displayName: item.name,
					name: item.name,
					deptId: item.typeId
				}
				var tpl = tplBoardCreateMembers($.extend(tplData, {lang: lang}));
				departments.each(function() {
					if ($(this).attr('data-id') == item.typeId) {
						$(this).find('.creat').before(tpl);
					}
				})
			});
			//hide, show
			element.find('span.public_all').hide();
			element.find('ul.name_tag').show();
		},
		getJoinMembers : function(ownerId, deptId) {
			var self = this;
			$.go( apiRootUrl + 'board/' + this.boardId + '/dept/owner/' + ownerId + '/member', {}, {
				qryType : 'GET',
				contentType : 'application/json',
				responseFn : function(rs) {
					if (rs.code == 200) {
						console.log('getJoinMemberResponse');
						console.log(rs.data);
                        if(rs.data.length == 0){
                            self.$el.find('#publicFlagOptionTable tr[data-id="'+ deptId+ '"] span.public_all')[0].firstChild.nodeValue = boardLang["공개/공유된 멤버가 없습니다."];
                        }else{
                            var targetEl = self.$el.find('#publicFlagOptionTable tr[data-id="'+ ownerId+ '"] ul.name_tag');
                            $.each(rs.data, function(k, v) {
                                self.addPublicMember({}, {
                                    deptId : deptId,
                                    id : v.ownerId,
                                    name : v.ownerInfo
                                });
                            });
                        }
						targetEl.show();
						self.setPublicLowRankText();
					}
				}
			});
		},
		changeDept : function() {
			this.setSharedDeptName();
			this.setPublicData();
			this.setAnonymousPost();
			this.setAnonymousComment();
			$.goOrgSlide('close');
		},
		getSelectedDeptOption : function() {
			var data = {}, selectedDept = this.$el
					.find('select[name=deptId] option:selected');

			if (!selectedDept.length) {
				data.id = this.$el.find('input[name=deptId]').val();
				data.text = this.$el.find('input[name=deptText]').val();
			} else {
				data.id = selectedDept.val();
				data.text = selectedDept.text();
			}
			return data;
		},
		setSharedDeptName : function() {
			return this.$el
					.find('#sharedDeptName')
					.html(
							this
									.getSelectedDeptOption().text);
		},
		setPublicData : function() {
			var publicHtml = [ tplBoardCreatePublicData({
				name : this.getSelectedDeptOption().text,
				id : this.getSelectedDeptOption().id,
				lang : lang
			}) ];
			this.$el.find('#ownersTable>table>tbody>tr').each(function() {
				publicHtml.push(tplBoardCreatePublicData({
					name : $(this).find('td').text(),
					id : $(this).attr('data-id'),
					lang : lang
				}));
			});
			this.$el.find('#publicFlagOptionTable').html(
				tplBoardCreatePublic({
					lang : lang
				})
			);
			this.$el.find('#publicFlagOptionTable>table>tbody').html(publicHtml.join(''));
		},
		setAnonymousPost: function(){
			var publicHtml = [ tplBoardCreateAnonymousData({
				name : this.getSelectedDeptOption().text,
				id : this.getSelectedDeptOption().id,
				lang : lang
			}) ];
			//공유설정으로 추가된 부서가 있으면 반영
			this.$el.find('#ownersTable>table>tbody>tr').each(function() {
				publicHtml.push(tplBoardCreateAnonymousData({
					name: $(this).find('td').text(),
					id: $(this).attr('data-id'),
					lang: lang
				}));
			});
			//익명 옵션 - Post
			this.$el.find('#postGroupWrap').html(
				tplBoardCreateAnonymous({
					lang : lang
				})
			);
			this.$el.find('#postGroupWrap>table>tbody').html(publicHtml.join(''));
		},
		setAnonymousComment: function (){
			var publicHtml = [ tplBoardCreateAnonymousData({
				name : this.getSelectedDeptOption().text,
				id : this.getSelectedDeptOption().id,
				lang : lang
			}) ];
			//공유설정으로 추가된 부서가 있으면 반영
			this.$el.find('#ownersTable>table>tbody>tr').each(function() {
				publicHtml.push(tplBoardCreateAnonymousData({
					name: $(this).find('td').text(),
					id: $(this).attr('data-id'),
					lang: lang
				}));
			});
			//익명 옵션 - PostComment
			this.$el.find('#postCommentGroupWrap').html(
				tplBoardCreateAnonymous({
					lang : lang
				})
			);
			this.$el.find('#postCommentGroupWrap>table>tbody').html(publicHtml.join(''));
		},
		addBoardOwnerEl : function(rs) {
			var ownersTarget = $('#ownersTable .in_table');
			var selectedDeptId = $('form[name="formBoardCreate"] [name="deptId"]').val();

			if (rs && !ownersTarget.find('tr[data-id="' + rs.id + '"]').length) {
				if (rs.id == selectedDeptId) {
					return false;					
				}
				
				if (!ownersTarget.length) {
					$('#ownersTable').append(tplBoardCreateOwners({lang : lang}));
					ownersTarget = $('#ownersTable .in_table');
				}
				
				ownersTarget.find('tbody').append(
					tplBoardCreateOwnersData($.extend(rs, {lang : lang}))
				);
				
				$('#publicFlagOptionTable tbody').append(
					tplBoardCreatePublicData($.extend(rs,{lang : lang}))
				);
				//addBoardOwnerEl 메서드지만 익명 옵션 대상자도 추가하게 되었다.
				$('#postGroupWrap tbody').append(
					tplBoardCreateAnonymousData($.extend(rs, {lang: lang}))
				);
				$('#postCommentGroupWrap tbody').append(
					tplBoardCreateAnonymousData($.extend(rs, {lang: lang}))
				);
			}
		},
		addBoardOwners : function(e) {
			$.goOrgSlide({
				target : e,
				header : lang['share_dept_select'],
				type : 'department',
				desc : lang['share_dept_select_desc'],
				contextRoot : GO.contextRoot,
				callback : this.addBoardOwnerEl,
				target : e
			});
		},
		
		addBoardManagerEl : function(data, opt) {
			var managers = _.isArray(data) ? data : [data];
			var targetEl = $('#boardManagers');
			
			_.each(managers, function(manager) {
				if (manager && !targetEl.find('li[data-id="'+ manager.id + '"]').length) {
					if (manager.id === session.id) {
						manager.isMe = true;
						manager.position = session.position;
					}
					if(!manager.displayName) {
						manager.displayName = manager.name + (manager.positionName ? " " + manager.positionName : "");
					}
					targetEl.find('li.creat').before(tplBoardCreateManager($.extend(manager, {lang : lang})));
				}
			});
		},
		
		getSharedDeptIds : function() {
			var sharedDeptIds = [];
			if(this.$el.find('input#ownersUse:checkbox').is(':checked')) {
				sharedDeptIds = this.$el.find('#ownersTable tr[data-id]').map(function(k, v) {
					return $(v).attr('data-id');
				}).get();
			}
			
			return sharedDeptIds;
		},
		addBoardManagers : function(e) {
			var self = this,
				loadId = this.$el.find('[name=deptId]').val(),
				includeLoadIds = this.getSharedDeptIds() || [],
				sharedFlag = this.$el.find('input[name="sharedFlag"]:checked').val();
			
			$.goOrgSlide({
				header : lang['manager_select'],
				memberTypeLabel : lang['manager'],
				desc : lang['manager_select_desc'],
				target : e,
				contextRoot : GO.contextRoot,
				isMyDeptOpened : false,
				loadId : loadId,
				includeLoadIds : includeLoadIds,
				hideOrg : sharedFlag == 'false' ? true :!this.$el.find('#lowRankFlag').is(':checked'),
				accessOrg : true,
				isCustomType : true,
				externalLang : commonLang,
				isBatchAdd : true,
				callback : self.addBoardManagerEl
			});
		},
		addAnonymousPostMember: function (e, data) {
			var self = this;
			var loadId = $(e.currentTarget).attr('data-id') || data.deptId;
			var selectedEl = self.$el.find('#postGroupWrap tr[data-id="' + loadId + '"]');//하나의 tr
			var msgEl = selectedEl.find('span.public_all');
			var targetEl = selectedEl.find('ul.name_tag');
			var sharedFlag = this.$el.find('input[name="sharedFlag"]:checked').val();

			var addMember = function(data) {
				var members = _.isArray(data) ? data : [data];
				_.each(members, function(rs) {
					if (rs && !targetEl.find('li[data-id="'+ rs.id+ '"]').length) {
						rs.deptId = loadId;
						rs.displayName = rs.name + (rs.position ? " " + rs.position : "");
						var tpl = tplBoardCreateMembers($.extend(rs, {
							lang : lang
						}));
						targetEl.find('.creat').before(tpl);
					}
					targetEl.trigger('contentChanged.anonymous');
				});
				return;
			};

			targetEl.bind('contentChanged.anonymous', function() {
				if (!targetEl.find('li:not(.creat)').length) {
					msgEl.show();
					targetEl.hide();
				} else {
					msgEl.hide();
					targetEl.show();
				}
			});

			var hideOrgCheck = function(e, sharedFlag){
				var target = $(e.currentTarget);
				var currentDeptId = self.$el.find('[name="deptId"]').val();

				//공유를 사용하지 않을경우 비공개 설정의 열람자 설정은 자기부서의 하위팀이 보이지 않아야함.
				if(sharedFlag == 'false'){
					return true;
				}else{
					//현재 자기 부서 아니면 하위부서 노출하지 않아야함.
					if(currentDeptId != target.closest("tr").attr("data-id")){
						return true;
					}else{
						return !self.$el.find('#lowRankFlag').is(':checked');
					}
				}
			};

			if (e.currentTarget) {
				$.goOrgSlide({
					header : lang['add_member'],
					desc : lang['add_member_desc'],
					contextRoot : GO.contextRoot,
					loadId : loadId,
					callback : addMember,
					hideOrg : hideOrgCheck(e,sharedFlag),
					target : e,
					isCustomType : true,
					externalLang : commonLang,
					memberTypeLabel : commonLang["사용자"],
					isBatchAdd : true
				});
			} else {
				addMember(data);
			}
		},
		addAnonymousPostCommentMember: function (e, data) {
			var self = this;
			var loadId = $(e.currentTarget).attr('data-id') || data.deptId;
			var selectedEl = self.$el.find('#postCommentGroupWrap tr[data-id="' + loadId + '"]');//하나의 tr
			var msgEl = selectedEl.find('span.public_all');
			var targetEl = selectedEl.find('ul.name_tag');
			var sharedFlag = this.$el.find('input[name="sharedFlag"]:checked').val();

			var addMember = function(data) {
				var members = _.isArray(data) ? data : [data];
				_.each(members, function(rs) {
					if (rs && !targetEl.find('li[data-id="'+ rs.id+ '"]').length) {
						rs.deptId = loadId;
						rs.displayName = rs.name + (rs.position ? " " + rs.position : "");
						var tpl = tplBoardCreateMembers($.extend(rs, {
							lang : lang
						}));
						targetEl.find('.creat').before(tpl);
					}
					targetEl.trigger('contentChanged.anonymousComment');
				});
				return;
			};

			targetEl.bind('contentChanged.anonymousComment', function() {
				if (!targetEl.find('li:not(.creat)').length) {
					msgEl.show();
					targetEl.hide();
				} else {
					msgEl.hide();
					targetEl.show();
				}
			});

			var hideOrgCheck = function(e, sharedFlag){
				var target = $(e.currentTarget);
				var currentDeptId = self.$el.find('[name="deptId"]').val();

				//공유를 사용하지 않을경우 비공개 설정의 열람자 설정은 자기부서의 하위팀이 보이지 않아야함.
				if(sharedFlag == 'false'){
					return true;
				}else{
					//현재 자기 부서 아니면 하위부서 노출하지 않아야함.
					if(currentDeptId != target.closest("tr").attr("data-id")){
						return true;
					}else{
						return !self.$el.find('#lowRankFlag').is(':checked');
					}
				}
			};

			if (e.currentTarget) {
				$.goOrgSlide({
					header : lang['add_member'],
					desc : lang['add_member_desc'],
					contextRoot : GO.contextRoot,
					loadId : loadId,
					callback : addMember,
					hideOrg : hideOrgCheck(e,sharedFlag),
					target : e,
					isCustomType : true,
					externalLang : commonLang,
					memberTypeLabel : commonLang["사용자"],
					isBatchAdd : true
				});
			} else {
				addMember(data);
			}
		},
		addPublicMember : function(e, data) {
			var self = this, 
				loadId = $(e.currentTarget).attr('data-id') || data.deptId, 
				selectedEl = self.$el.find('#publicFlagOption tr[data-id="'+ loadId + '"]'), 
				msgEl = selectedEl.find('span.public_all'), 
				targetEl = selectedEl.find('ul.name_tag'),
				sharedFlag = this.$el.find('input[name="sharedFlag"]:checked').val();

			var addMember = function(data) {
				var members = _.isArray(data) ? data : [data];
				_.each(members, function(rs) {
					if (rs && !targetEl.find('li[data-id="'+ rs.id+ '"]').length) {
						rs.deptId = loadId;
						rs.displayName = rs.name + (rs.position ? " " + rs.position : "");
						var tpl = tplBoardCreateMembers($.extend(rs, {
							lang : lang
						}));
						targetEl.find('.creat').before(tpl);
					}
					targetEl.trigger('contentChanged.public');
				});
				return;
			};

			targetEl.bind('contentChanged.public', function() {
				if (!targetEl.find('li:not(.creat)').length) {
					msgEl.show();
					targetEl.hide();
				} else {
					msgEl.hide();
					targetEl.show();
				}
			});
			
			var hideOrgCheck = function(e,sharedFlag){
				var target = $(e.currentTarget);
				var currentDeptId = self.$el.find('[name="deptId"]').val();
				
				//공유를 사용하지 않을경우 비공개 설정의 열람자 설정은 자기부서의 하위팀이 보이지 않아야함.
				if(sharedFlag == 'false'){
					return true;
				}else{
					//현재 자기 부서 아니면 하위부서 노출하지 않아야함.
					if(currentDeptId != target.closest("tr").attr("data-id")){
						return true;
					}else{
						return !self.$el.find('#lowRankFlag').is(':checked');
					}
				}
			};
			
			if (e.currentTarget) {
				$.goOrgSlide({
					header : lang['open_member_select'],
					desc : lang['open_member_select_desc'],
					contextRoot : GO.contextRoot,
					loadId : loadId,
					callback : addMember,
					hideOrg : hideOrgCheck(e,sharedFlag),
					target : e,
					isCustomType : true,
					externalLang : commonLang,
					memberTypeLabel : commonLang["열람자"],
					isBatchAdd : true
				});
			} else {
				addMember(data);
			}
		},
		deleteMember : function(e) {
			var parents = $(e.currentTarget).parents('ul.name_tag');
			$(e.currentTarget).parents('li').remove();
			parents.trigger('contentChanged.public');
		},
		deleteOwner : function(e) {
			var tables = this.$el.find('#ownersTable>table, #publicFlagOptionTable>table, #postGroupWrap>table, #postCommentGroupWrap>table'),
				ownersTable = $(tables[0]), 
				target = tables.find('tbody');

			target.find('tr[data-id="' + $(e.currentTarget).attr('data-id') + '"]').remove();
			if (!ownersTable.find('tbody>tr').length) {
				ownersTable.remove();
			}
		},			
		toggleOwners : function() {
			var self = this, 
				ownersOption = this.$el.find('#ownersOption'), 
				ownsersUse = this.$el.find('input#ownersUse:checkbox').is(':checked'), 
				ownersEl = ownersOption.find('tr[data-id]');

			$.goOrgSlide('close');
			
			if (ownsersUse) {
				ownersOption.show();
			} else {
				ownersOption.hide();
			}

			if (ownersEl.length) {
				$(ownersEl).each(function(k, v) {
					var publicEl = self.$el.find('#publicFlagOptionTable tr[data-id="'+ $(v).attr('data-id') + '"]');
					if (ownsersUse) {
						publicEl.show();
					} else {
						publicEl.hide();
					}
				});
			}
		},
		toggleLowRankFlag : function() {
			var $lowRankPermEl = this.$el.find('#lowRankPermission');
			$.goOrgSlide('close');
			if (this.$el.find('#lowRankFlag').is(':checked')) {
				$lowRankPermEl.show();
			} else {
				$lowRankPermEl.hide();
			}
			this.setPublicLowRankText();
		},
		toggleSharedFlag : function() {
			var selectedVal = this.$el.find('input[name=sharedFlag]:radio:checked').val(), 
				sharedFlagOption = this.$el.find('#sharedFlagOption');
			
			$.goOrgSlide('close');
			if (selectedVal == "true") {
				sharedFlagOption.show();
				this.setSharedDeptName();
			} else {
				sharedFlagOption.hide();
				this.$el.find('#ownersTable').empty();
			}
			this.setPublicData();
			this.setPublicLowRankText();
			//익명 설정에도 부서 추가
			//this.setAnonymousPost();
			//this.setAnonymousComment();
		},
		toggleHeaderFlag : function() {
			var selectedVal = this.$el.find('input[name=headerFlag]:radio:checked').val()
			var headerFlagOption = this.$el.find('#headerFlagOption');
			
			if (selectedVal == "true") {
				headerFlagOption.show();
				this.sortableHeaderFlag();
			} else {
				headerFlagOption.hide();
			}

		},
		sortableHeaderFlag : function () {
			this.$el.find('#headerListPart').sortable({
				delay: 100,
				axis: "y",
				items : "tr",
				hoverClass: "headerText",
				start: function (event, ui) {
					//jQuery Ui-Sortable Overlay Offset Fix
					if ($.browser.webkit) {
						wscrolltop = $(window).scrollTop();
					}
				},
				sort: function (event, ui) {
					//jQuery Ui-Sortable Overlay Offset Fix
					if ($.browser.webkit) {
						ui.helper.css({ 'top': ui.position.top + wscrolltop + 'px' });
					}
				}
			});
			this.$el.find('#headerListPart').disableSelection();
		},
		toggleTypeFlag : function() {
			var selectedVal = this.$el.find('input[name=type]:radio:checked').val();
			var typeFlagOption = this.$el.find('#typeFlagOption td, #typeFlagOption th');
			var typeFlagLine = this.$el.find('#typeFlagLine td');

			if (selectedVal == "CLASSIC") {
				typeFlagOption.show();
				typeFlagLine.show();
                this.$el.find('.postAuthOptionArea').show();
                this.$el.find('.closePostTitleShowOptionArea').show();

			} else {
				typeFlagOption.hide();
				typeFlagLine.hide();
                this.$el.find('.closePostTitleShowOptionArea').hide();
                this.$el.find('.closePostTitleShowOption:radio[value=true]').prop('checked', false);
                this.$el.find('.closePostTitleShowOption:radio[value=false]').prop('checked', true);

                this.$el.find('.postAuthOptionArea').hide();
                this.$el.find('.postAuthOption:radio[value=true]').prop('checked', false);
                this.$el.find('.postAuthOption:radio[value=false]').prop('checked', true);
			}
		},
		togglePublicFlag : function() {
			var selectedVal = this.$el.find('input[name=publicFlag]:radio:checked').val();
			var publicFlagOption = this.$el.find('#publicFlagOption');

			if (selectedVal == "true") {
				publicFlagOption.show();
				this.setPublicData();
				this.setPublicLowRankText();
			} else {
				publicFlagOption.hide();
			}
		},

		togglePublicWriterForPost : function() {
			var detailOption = this.$el.find('div[name=publicWriterDetailForPost]');
			if($('#publicWriterSettingForPost').is(':checked')) {
				detailOption.show();
			} else {
				detailOption.hide();
			}
		},
		togglePublicWriterForPostComment : function() {
			var detailOption = this.$el.find('div[name=publicWriterDetailForPostComment]');
			if($('#publicWriterSettingForPostComment').is(':checked')) {
				detailOption.show();
			} else {
				detailOption.hide();
			}
		},
		togglePublicWriterPostGroup : function() {
			var radioVal = this.$el.find('input[name=targetForPost]:radio:checked').val();
			if(radioVal == "false"){
				$('#postGroupWrap').show();
				this.setAnonymousPost();
			} else {
				$('#postGroupWrap').hide();
			}
		},
		togglePublicWriterPostCommentGroup : function() {
			var radioVal = this.$el.find('input[name=targetForPostComment]:radio:checked').val();
			if(radioVal == "false"){
				$('#postCommentGroupWrap').show();
				this.setAnonymousComment();
			} else {
				$('#postCommentGroupWrap').hide();
			}
		},
		setPublicLowRankText : function() {

			var lowRankText = null;
			var ownerId = this.$el.find('[name="deptId"]').val();
			var sharedFlag = this.$el.find('input[name=sharedFlag][value="true"]').is(':checked');
			var lowRankFlag = this.$el.find('#lowRankFlag').is(':checked');
			var $publicOwnerEl = this.$el.find('#publicFlagOptionTable tr[data-id="'+ ownerId+ '"] th strong');

			if (sharedFlag && lowRankFlag) {
				lowRankText = '&nbsp;(' + boardLang['하위 부서 포함'] + ')';
			}
			$publicOwnerEl.html(lowRankText);
		},
		toggleStatus : function(e) {
			var target = $(e.currentTarget);
			if (target.val() == 'DELETED') {
				this.$el.find('#statusClosed').attr('disabled', target.is(':checked'));
			}
		},
		boardSaveCancel : function() {
			var self = this;
			if(this.isCreateMode()){
				$.goConfirm(
					commonLang['취소하시겠습니까?'],
					commonLang['입력하신 정보가 초기화됩니다.'],
					function() {
						self.render();
					}
				);
			}else{
                var url = "board/" + self.boardId;
                GO.router.navigate(url,{trigger: true});
			}
		},
		boardDelete : function() {
			var self = this;
			var ids = [];
			ids.push(self.boardId);
			
			$.goConfirm(lang.delete_title, lang.delete_confirm, function() {
				$.ajax({
                    type: 'DELETE',
                    async: true,
                    data : JSON.stringify({ids : ids}),
                    dataType: 'json',
                    contentType : "application/json",
                    url: GO.config("contextRoot") + 'api/board/status/deleted'
                }).
                done(function(response){
                    $.goMessage(lang.delete_success);
                    GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
                    GO.router.navigate("board", {trigger : true,replace : true});
                }).
                fail(function(error){
                    if(error.status == 403){
                        $.goAlert(commonLang['권한이 없습니다.'] + '<br/>' + commonLang['운영자에게 문의하세요.']);
                    }else{
                        $.goAlert(commonLang['실패했습니다.']);
                    }
                });
			});
		},
					
		boardFormValidation : function() {
			var form = this.$el.find('form[name='+ this.formName + ']'), 
				boardNameEl = form.find("input[name='name']"), 
				boardNameVal = $.trim(boardNameEl.val()),
				boardDescriptionEl = form.find('[name="description"]');

			var invalidAction = function(msg,focusEl) {
				$.goError(msg, focusEl ? focusEl : '');					
				if (focusEl) {
					focusEl.addClass('error').focus();
				}
				return false;
			};

			if (boardNameEl.length) {
				if (!boardNameVal) {
					invalidAction(boardLang['제목을 입력하세요.'],boardNameEl);
					return false;
				} else if (!$.goValidation.isCheckLength(2, 100, boardNameVal)) {
					invalidAction(GO.i18n(boardLang['0자이상 0이하 입력해야합니다.'],{"arg1" : "2","arg2" : "100"}),boardNameEl);
					return false;
				}
			}

			if (boardDescriptionEl.length) {
				if (!$.goValidation.isCheckLength(0, 2000, boardDescriptionEl.val())) {
					invalidAction(GO.i18n(boardLang['0자이상 0이하 입력해야합니다.'],{"arg1" : "0","arg2" : "2000"}),boardDescriptionEl);
					return false;
				}
			}
			return true;
		},
		boardSave : function() {
			var self = this; 
			var form = this.$el.find('form[name='+ this.formName + ']'); 
			var deptId = this.$('#deptId').val();
			var ownersUse = this.$el.find('#ownersUse').is(':checked'); 
			var saveModel = null;
			var managerIds = [];
			var publicFlag = null;
			var owners = [];
			var parentId = (this.$('.select-node').length > 1 ? this.$('.select-node').last().val() : null);

			var saveAction = function(model) {
				if(!self.isSaveDone){
					return;
				}
				self.isSaveDone = false;
				model.save({},{
					success : function(model,response) {
						GO.EventEmitter.trigger('common','layout:clearOverlay',true);
                        GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
                        if (response.code == '200') {

                            if(self.isCreateMode()) {
								$.goMessage(lang["add_board_alert"]);
							}else{
								$.goMessage(lang['save_success']);
							}
							
							if(model.get("publicFlag")){
								var ids = [];
								var member = _.filter(model.get("owners"), function(d){return d.ownerType == "User";});
								
								if(member.length != 0){
									$.each(model.get("managers"), function(){
										ids.push(this.id);
									});
									
									ids = _.union(ids, member);
									
									if($.inArray(session.id, ids) < 0){
										GO.router.navigate("board",true);
										return;
									}
								}
							}
							
							if (self.isCreateMode()) {
								GO.router.navigate("board/"+ response.data.id,true);
							} else {
								GO.router.navigate("board/"+ response.data.id+'/admin',true);
							}
						} else {
							$.goMessage(response.message);
						}
						self.isSaveDone = true;
					},
					error : function(model, response) {
						GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
						var responseObj = JSON.parse(response.responseText);
						if (responseObj.message) $.goError(responseObj.message);
						if (responseObj.name == 'board.name.duplicated') responseObj.focus = 'name';
						if (responseObj.focus) form.find('input[name="'+ responseObj.focus+ '"]').focus();
						self.isSaveDone = true;
						return;
					}
				});
			};

			if (!this.boardFormValidation()) {
				return false;
			}

			GO.EventEmitter.trigger('common','layout:setOverlay', true);

			saveModel = this.boardModel;
			if (!this.isCreateMode()) {
				saveModel.clear();
			}

			$(form.serializeArray()).each(function(k, v) {
				if (v.name == 'managerIds') {
					managerIds.push(v.value);
				} else {
					saveModel.set(v.name, v.value, { silent : true });
				}
			});

			if (this.isCreateMode()) {
				saveModel.set({
					'deptId' : deptId,
					'parentId': parentId
				}, {
					silent : true
				});
			} else {
				saveModel.set('id', this.boardId, {
					silent : true
				});
			}
			
			publicFlag = saveModel.get('publicFlag');
			this.$el.find('#publicFlagOptionTable form[name|="owners"], #ownersTable form[name|="owners"]').each(function(k, v) {
				var tmpOwners = {};
				
				$($(v).serializeArray()).each(function(k2,v2) {
					tmpOwners[v2.name] = v2.value;
				});

				if (ownersUse || (!ownersUse && tmpOwners.deptId == deptId)) {
					if(publicFlag == 'false') {
						tmpOwners.scope = 'ALL';
					} else {
						if (tmpOwners.ownerType == 'Department') {
							if (self.$el.find('form[name|="owners-'+ tmpOwners.ownerId+ '-member"]').length) {
								tmpOwners.scope = 'PART';
							} else {
								tmpOwners.scope = 'ALL';
							}
							tmpOwners.permission = tmpOwners.permission || 1;
						} else {
							tmpOwners.scope = 'ALL';
						}
					}
					
					// ...... if 가 참 많네요
				
					if (tmpOwners.ownerType == 'User') {
						if(deptId == tmpOwners.deptId) {
							if(self.$el.find('input#sharedFlag1').is(':checked')) {
								if(self.$el.find('input#lowRankFlag').is(':checked')) {
									tmpOwners.permission = saveModel.get('lowPermission') || 1;
								} else {
									tmpOwners.permission = 3;
								}
							} else {
								tmpOwners.permission = 3;
							}
						} else {
							if (self.$el.find('form[name="owners-'+ tmpOwners.deptId+ '"] input[name="permission"]').is(':checked')) {
								tmpOwners.permission = 3;
							} else {
								tmpOwners.permission = 1;
							}
						}
					}
					tmpOwners.permission = tmpOwners.permission || 1;
					owners.push(tmpOwners);
				}
			});

			owners.push({
				"ownerShip" : "MASTER", // MASTER
				"ownerType" : "Department",
				"ownerId" : deptId,
				"scope" : (publicFlag == 'false' || self.$el.find('form[name|="owners-' + deptId + '-member"]').length == 0) ? 'ALL' : 'PART', // 전체공개
				"permission" : 3	//MASTER면 무조건 read write
			});
			// :
			// 일부에게
			// 공개
			// saveModel.get('lowRankFlag')
			// ?

			var postHeaders = [];
			var headerFlag = this.$el.find('input[name=headerFlag]:radio:checked').val();
			var headerRequiredFlag = this.$el.find('input[name=headerRequiredFlag]').is(":checked");
			var headerDeletedLength = 0;
			
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

			var anonymousDeptListInPost = elAnonymousDetailSettingForPost.find('#postGroupWrap>table>tbody>tr');
			var anonymousSettingDetailsForPost = [];
			//Post
			if (!(anonymousDeptListInPost == undefined || anonymousDeptListInPost.length == 0)) {
				anonymousDeptListInPost.each(function () {
					var deptId = $(this).attr('data-id');
					var users = $(this).find('li');
					if(!(users == undefined || users.length == 0)) {
						users.each(function () {
							if (!$(this).hasClass("creat")) {
								anonymousSettingDetailsForPost.push({
									type: 'DEPARTMENT',
									typeId: deptId,
									userId: $(this).attr('data-id'),
									sharedType: 'NONE'
								});
							}
						});
					}
				});
			}

			var anonymousDeptListForPostComment = elAnonymousDetailSettingForPostComment.find('#postCommentGroupWrap>table>tbody>tr');
			var anonymousSettingDetailsForPostComment = [];

			//PostComment
			if (!(anonymousDeptListForPostComment == undefined || anonymousDeptListForPostComment.length == 0)) {
				anonymousDeptListForPostComment.each(function () {
					var deptId = $(this).attr('data-id');
					var users = $(this).find('li');
					if(!(users == undefined || users.length == 0)) {
						users.each(function () {
							if (!$(this).hasClass("creat")) {
								anonymousSettingDetailsForPostComment.push({
									type: 'DEPARTMENT',
									typeId: deptId,
									userId: $(this).attr('data-id'),
									sharedType: 'NONE'
								});
							}
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
				'lowRankFlag' : saveModel.get('sharedFlag') == 'false' ? 'false' : saveModel.get('lowRankFlag'),
				'headerFlag' : headerFlag,
				'headerRequiredFlag' : headerRequiredFlag,
				'postHeaders' : postHeaders,
				'anonymousWriterPostOption' : anonymousWriterSettingForPost,
				'anonymousWriterPostCommentOption': anonymousWriterSettingForPostComment,
				'postAuthOption' : this.$el.find('.postAuthOption:checked').val(),
				'closePostTitleShowOption' : this.$el.find('.closePostTitleShowOption:checked').val()
			}, {
				silent : true
			});
			
			if (saveModel.get('status') == 'DELETED') {
				$.goCaution(boardLang['게시판 삭제'],boardLang['게시판 삭제 확인'], function() {
					saveModel.destroy({
						success : function(model,rs) {
							GO.router.navigate("board", {trigger : true,replace : true});
							GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
							GO.EventEmitter.trigger('board', 'changed:favorite', true);
						}
					});
				});
			} else {
				saveAction(saveModel);
			}
		},
		createAnonymousOption: function(isAllowed, isAllUser, specificUsers) {
			return {
				allowed: isAllowed,
				allUser: isAllUser,
				specificUsers: specificUsers
			};
		},
		headerAdd : function() {
			
			var $headerNameEl = this.$el.find('#headerName'),
				headerNameVal = $.trim($headerNameEl.val()),
				existHeader = false;
			
			if(!headerNameVal) {
				$headerNameEl.focus();
				return false;
			}
			
			this.$el.find('tr[data-type="headerPart"]').each(function() {
				if ($(this).attr('data-headername') == headerNameVal) {
					$(this).attr('data-headerdeleteflag','false');
					$(this).show();
					$headerNameEl.val('');
					existHeader = true;
					return;
				}
			});
			if (!existHeader) {
				var names = [];
				names.push({
					"name" : headerNameVal
				});
				var headerPart = tplBoardCreateHeaderPart({
					dataset : names,
                    lang : lang,
                    headerLength : function(){
                        return $.goValidation.realLength(this.name);
                    }
				});
				$('#headerListPart').append(headerPart);
				$headerNameEl.val('');
                $("#headerByte").html('0');
			}
		},
		headerModify : function(e) {
			var target = $(e.currentTarget)
					.parents('tr').first();
			target.find('span.headerTextPart')
					.hide().end().find(
							'span.headerInputPart')
					.show();
			return false;
		},
		headerSave : function(e) {
			var target = $(e.currentTarget)
					.parent();
			var targetP = target.parents('tr').first();

			var inputTextVal = target.siblings('input').val();
			var headerText = targetP.find('span.headerText');

			targetP.attr("data-headername",inputTextVal);
			targetP.find('span.headerTextPart').show();
			headerText.html(inputTextVal);
			targetP.find('span.headerInputPart').hide();
			return false;
		},
		headerCancel : function(e) {
			var target = $(e.currentTarget).parents('tr').first();
			var textPart = target.find('span.headerTextPart');
			var inputPart = target.find('span.headerInputPart'); 
			
			textPart.show();
			inputPart.hide();
			inputPart.find("input").val(textPart.text().trim());
			
			return false;
		},
		headerDelete : function(e) {
			var target = $(e.currentTarget);
			var targetP = target.parents('tr')
					.first();
			targetP.attr('data-headerdeleteflag',
					'true');
			targetP.hide();
		},
        
        headerLengthValidate : function(targetEl, maxByte, successCallback){
            var inputLen = $.goValidation.realLength(targetEl.val());

            if (parseInt(inputLen) > maxByte) {
                targetEl.val(targetEl.attr('data-value'));
            } else {
                if(typeof successCallback === 'function'){
                    successCallback(inputLen);
                }
                targetEl.attr('data-value',targetEl.val());
            }
        },
        
        addHeaderLengthValidate : function(e){
            var $inputEl = $(e.currentTarget);
            var maxByte = 30;
            var successCallback = function(inputLen){
                var $parent = $inputEl.closest("div"); 
                $parent.find("#headerByte").text(inputLen);
            }
            this.headerLengthValidate($inputEl, maxByte, successCallback);
        },
        
        editHeaderLengthValidate : function(e){
            var $inputEl = $(e.currentTarget);
            var maxByte = 30;
            var successCallback = function(inputLen){
                var $parent = $inputEl.closest("span.headerInputPart"); 
                $parent.find("#headerByte").text(inputLen);
            }
            this.headerLengthValidate($inputEl, maxByte, successCallback);
        },
		
		_getBoardModel: function() {
			return this.isCreateMode() ? new DepartmentBoardModel() : BoardConfigModel.get(this.boardId);
		}, 
		
		_clearSelectedChildren: function(e) {
			var $wrap = $(e.currentTarget).parent();
			$wrap.nextAll('.wrap_select').remove();
		}
	});

	return BoardCreateView;
});