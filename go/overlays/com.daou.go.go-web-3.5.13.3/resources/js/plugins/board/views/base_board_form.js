define(function(require) {
	var $ = require("jquery");
	var Backbone = require("backbone"); 
	var App = require("app"); 
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
		"delete_success" : commonLang["삭제되었습니다."]
	};

	var BaseBoardFormView = Backbone.View.extend({
		/**
		 * 전송시 사용되는 rootId에 대한 실제 키 이름(companyId/deptId/communityId)
		 */
		rootIdName: '', 
		
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
			"change select[name=deptId]" : "changeDept",
			"click input#statusDeleted" : "toggleStatus",
			"click input#statusClosed" : "toggleStatus",
			"click #headerAdd" : "headerAdd",
			"click span[data-btntype='headerModify']" : "headerModify",
			"click span.headerText" : "headerModify",
			"click span[data-btntype='headerSave']" : "headerSave",
			"click span[data-btntype='headerDelete']" : "headerDelete",
			"click span[data-btntype='headerCancel']" : "headerCancel",
			"keyup input#headerName" : "headerInputValidation", 
			"click .btn-add-select-node": "_addChildNodesSelect"
		},

		initialize : function(options) {
			this.options = options || {};
			
			this.boardId = options.boardId;
			this.boardModel = this._getBoardModel();
			this.isSaveDone = true;
		},
		
		render : function() {
			var self = this; 
			var jointOnwers = [];
			var boardData = {};
			
			if (this.isCreateMode()) { // 게시판 생성
				this.$el.html(tplBoardCreate({
					isCreate : this.isCreateMode(),
					isOrgServiceOn : GO.session("useOrgAccess"), 
					lang : lang
				}));
				
				this._makeDeptSelectList().
					then(_.bind(this._setBoardOperator, this));

			} else {// 게시판 수정
				if(!this.boardModel.get('actions').managable) {
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
						isOrgServiceOn : GO.session("useOrgAccess")
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
		_addChildNodesSelect: function(e) {
			var self = this;
			var selector = '.select-node';
			var $target = this.$(selector).last();
			var parentId = $target.data('parentid');
			var rootId = this.$('select[name=deptId]').val();
			var reqData = {"deptId": rootId };
			
			if(this.$(selector).length > 1) {
				reqData.parentId = $target.val();
			}
			
			$.ajax(apiRootUrl + '/department/board/folders', {
				data: reqData, 
				contentType: 'application/json', 
				dataType: 'json'
			}).then(function(rs) {
				if(rs.data && rs.data.length === 0) {
					$.goSlideMessage('하위 폴더가 존재하지 않습니다.');
				} else {
					var $wrap = $target.parent();
					// 이후의 하위 폴더 선택박스는 모두 지운다.
					$wrap.nextAll('.wrap_select').remove();
					// 그리고 새로운 하위폴더 선택박스를 추가.
					$wrap.after(self._makeSelectNode(rs.data));
				}
			});
		},
		
		_makeSelectNode: function(nodes) {
			var lenOfSelectNodeEl = this.$('.select-node').length;
			var nodeSeq = lenOfSelectNodeEl > 1 ? lenOfSelectNodeEl - 1 : 1;
			var $el = $('<span class="wrap_select"><select name="parentId-' + nodeSeq + '" class="select-node"></select></span>');
			var html = [];
			
			_.each(nodes, function(node) {
				html.push(this._makeFolderOptionHtml(node));
			}, this);
			
			$el.find('select').html(html.join("\n"));
			
			return $el;
		},
		
		/**
		 * 게시판 추가시 부서 정보 select 박스 생성
		 */
		_makeDeptSelectList : function() {
			var self = this;
			var deptList = [];
			var defer = when.defer();
			var selectedId = this.rootId;
			
			$.ajax(apiRootUrl + 'department/list/joined').then(function success(rs) {
				if (!rs.data.length) {
					App.router.navigate("board", { trigger : true, replace : true });
					$.goAlert(lang['board_add_desc'],boardLang['부서가 설정되지 않아 게시판을 추가 할 수 없습니다.']);
					
					defer.reject();
				} else {
					_.each(rs.data, function(v, k) {
						deptList.push(self._makeFolderOptionHtml(v, selectedId));
					});
					
					self.$('select[name=deptId]').html(deptList.join("\n"));
					defer.resolve(deptList.join("\n"));
				}
			});
			
			return defer.promise;
		},
		
		_makeFolderOptionHtml: function(node, selectedId) {
			var selected = selectedId && node.id === selectedId ? ' selected="selected"': '';
			return '<option value="' + node.id + '"'+ selected +'>' + node.name + '</option>';
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
				form.find('input[name="lowPermission"][value="'+ data.masterOwner.permission+ '"]').attr('checked', true);

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
					lang : lang
				});
				self.$el.find('#headerListPart').append(headerPart);
				self.$el.find('#headerFlagOption tr[data-headerdeleteflag="true"]').hide();
			}
		},
		
		changeDept : function() {
			this.setSharedDeptName();
			this.setPublicData();
			$.goOrgSlide('close');
		},
		getSelectedDeptOption : function() {
			var data = {}, selectedDept = this.$el
					.find('select[name=deptId] option:selected');

			if (!selectedDept.length) {
				data.id = this.$el.find(
						'input[name=deptId]').val();
				data.text = this.$el.find(
						'input[name=deptText]')
						.val();
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
					name : $(this).find('th').text(),
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
				callback : self.addBoardManagerEl,
				target : e,
				accessOrg : true,
				isCustomType : true,
				externalLang : commonLang,
				isBatchAdd : true
			});
			
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
			var tables = this.$el.find('#ownersTable>table, #publicFlagOptionTable>table'), 
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
		},
		toggleHeaderFlag : function() {
			var selectedVal = this.$el.find('input[name=headerFlag]:radio:checked').val()
			var headerFlagOption = this.$el.find('#headerFlagOption');
			
			if (selectedVal == "true") {
				headerFlagOption.show();
			} else {
				headerFlagOption.hide();
			}

		},
		toggleTypeFlag : function() {
			
			var selectedVal = this.$el.find('input[name=type]:radio:checked').val(); 
			var typeFlagOption = this.$el.find('#typeFlagOption td, #typeFlagOption th');
			var typeFlagLine = this.$el.find('#typeFlagLine td');

			if (selectedVal == "CLASSIC") {
				typeFlagOption.show();
				typeFlagLine.show();
			} else {
				typeFlagOption.hide();
				typeFlagLine.hide();
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
                App.router.navigate(url,{trigger: true});
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
                    App.router.navigate("board", {trigger : true,replace : true});
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
				boardNameEl = form.find('input[name="name"]'), 
				baardNameVal = $.trim(boardNameEl.val()),
				boardDescriptionEl = form.find('[name="description"]');

			var invalidAction = function(msg,focusEl) {
				$.goError(msg, focusEl ? focusEl : '');					
				if (focusEl) {
					focusEl.addClass('error').focus();
				}
				return false;
			};

			if (boardNameEl.length) {
				if (!baardNameVal) {
					invalidAction(boardLang['제목을 입력하세요.'],boardNameEl);
					return false;
				} else if (!$.goValidation.isCheckLength(2, 64, baardNameVal)) {
					invalidAction(App.i18n(boardLang['0자이상 0이하 입력해야합니다.'],{"arg1" : "2","arg2" : "64"}),boardNameEl);
					return false;
				}
			}

			if (boardDescriptionEl.length) {
				if (!$.goValidation.isCheckLength(0, 2000, boardDescriptionEl.val())) {
					invalidAction(App.i18n(boardLang['0자이상 0이하 입력해야합니다.'],{"arg1" : "0","arg2" : "2000"}),boardDescriptionEl);
					return false;
				}
			}
			return true;
		},
		boardSave : function() {
			var self = this; 
			var form = this.$el.find('form[name='+ this.formName + ']'); 
			var deptId = form.find('[name=deptId]').val();
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
										App.router.navigate("board",true);
										return;
									}
								}
							}
							
							if (self.isCreateMode()) {
								App.router.navigate("board/"+ response.data.id,true);
							} else {
								App.router.navigate("board/"+ response.data.id+'/admin',true);
							}
						} else {
							$.goMessage(response.message);
						}
						self.isSaveDone = true;
						GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
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
			if (this.isCreateMode()) {
				saveModel.set({
					'deptId' : deptId,
					'parentId': parentId
				}, {
					silent : true
				});
			} else {
				saveModel.clear();
				saveModel.set('id', this.boardId, {
					silent : true
				});
			}

			$(form.serializeArray()).each(function(k, v) {
				if (v.name == 'managerIds') {
					managerIds.push(v.value);
				} else {
					saveModel.set(v.name, v.value, { silent : true });
				}
			});
			
			publicFlag = saveModel.get('publicFlag');
			this.$el.find('form[name|="owners"]').each(function(k, v) {
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
				"permission" : this.$('input[name="lowRankFlag"]').is("checked") ? saveModel.get('lowPermission') : 3
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
				this.$el.find('tr[data-type="headerPart"]').each(function() {					
					postHeaders.push({
						"id" : $(this).attr('data-headerid'),
						"name" : $(this).attr('data-headername'),
						"deletedFlag" : $(this).attr('data-headerdeleteflag')
					});
					if($(this).attr('data-headerdeleteflag') == 'true') headerDeletedLength++;
				});					
				if(postHeaders.length-headerDeletedLength < 1) {
					headerFlag = false;
					headerRequiredFlag = false;
				}
			}

			saveModel.set({
				'managerIds' : managerIds,
				'owners' : owners,
				'lowRankFlag' : saveModel.get('sharedFlag') == 'false' ? 'false' : saveModel.get('lowRankFlag'),
				'headerFlag' : headerFlag,
				'headerRequiredFlag' : headerRequiredFlag,
				'postHeaders' : postHeaders
			}, {
				silent : true
			});
			
			if (saveModel.get('status') == 'DELETED') {
				$.goCaution(boardLang['게시판 삭제'],boardLang['게시판 삭제 확인'], function() {
					saveModel.destroy({
						success : function(model,rs) {
							App.router.navigate("board", {trigger : true,replace : true});
							GO.EventEmitter.trigger('board', 'changed:deptBoard', true);
							GO.EventEmitter.trigger('board', 'changed:favorite', true);
						}
					});
				});
			} else {
				saveAction(saveModel);
			}
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
				var headerPart = tplBoardCreateViewHeaderPart({
					dataset : names,
					lang : lang
				});
				$('#headerListPart').append(headerPart);
				$headerNameEl.val('');
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
			var targetP = target.parents('tr')
					.first();

			var inputTextVal = target.siblings(
					'input').val();
			var headerText = targetP
					.find('span.headerText');

			targetP.attr("data-headername",
					inputTextVal);
			targetP.find('span.headerTextPart')
					.show();
			headerText.html(inputTextVal);
			targetP.find('span.headerInputPart')
					.hide();
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
		headerInputValidation : function(e) {
			var inputLen = $.goValidation.realLength($('#headerName').val());

			if (parseInt(inputLen) > 14) {
				$('#headerName').val($('#headerName').attr('data-value'));
			} else {
				$('#headerByte').text(inputLen);
				$('#headerName').attr('data-value', $('#headerName').val());
			}
		}, 
		
		_getBoardModel: function() {
			return this.isCreateMode() ? new DepartmentBoardModel() : BoardConfigModel.get(this.boardId);
		}
	});

	return BaseBoardFormView;
});