define([
	"i18n!nls/commons",    
	"i18n!approval/nls/approval",
	
	"hgn!admin/templates/approval/appr_dept_folder_manage",
	"admin/views/approval/appr_dept_folder_manage_item",
	"admin/models/approval/appr_dept_folder",
	"hgn!approval/templates/add_org_member",
	
	"jquery.ui"
], 
function(
    commonLang,
    approvalLang,
    
    Template,
    FolderItemView,
    Folder,
	tplAddMember
) {

	var DeptFolderManagerModel = Backbone.Model.extend({
		url: function() {
			var url = [GO.contextRoot + 'ad/api/approval/deptfolder', this.deptId, 'managers'].join('/');
			return url;
		},
		setDeptId: function(deptId) {
			this.deptId = deptId;
		}
	});

	var DeptManagerList = Backbone.Collection.extend({
		model: DeptFolderManagerModel,
		url: function() {
			return GO.contextRoot + 'ad/api/approval/deptfolder/'  + this.deptId + '/manager';
		},
		setDeptId: function(deptId) {
			this.deptId = deptId;
		},

		getUserIds : function() {
			return this.map(function(model) {
				return model.get("userId");
			});
		}
	});

	var popupTemplate = [
		'<table class="form_type go_renew">',
			'<tbody>',
				'<tr>',
					'<th>',
						'<span class="title">',
							approvalLang["부서 문서함명"],
							'<ins class="asterisk">*</ins>',
						'</span>',
					'</th>',
					'<td>',
						'<div class="wrap_txt w_max">',
							'<input class="txt_mini w_max" type="text" id="deptFolderName" maxlength="50">',
						'</div>',
					'</td>',
				'</tr>',
			'</tbody>',
		'</table>',
		'<div id="deptFolderError"></div>',
	].join("");
	
	var lang = {
		"부서 문서함 관리" : approvalLang["부서 문서함 관리"],
		"순서 바꾸기" : commonLang["순서 바꾸기"],
		"추가" : commonLang["추가"],
		"삭제" : commonLang["삭제"],
		"문서함 이름" : approvalLang["문서함 이름"],
		"생성일" : approvalLang["생성일"],
		"문서 개수" : approvalLang["문서 개수"],
		"부서 문서함 담당자" : approvalLang['부서 문서함 담당자'],
		"담당자 추가" : approvalLang['담당자 추가']
	};
	
	var View = Backbone.View.extend({
		initialize : function(options) {
			this.deptId = options.deptId;
			this.deptName = options.deptName;
			this.collection.on("sync", this._renderList, this);
			this.collection.fetch();

            this.isDeletedDept = false;
			this.managerCollection = new DeptManagerList();
			this.managerCollection.setDeptId(this.deptId);
			this.managerCollection.fetch({
                async:false,
                error : $.proxy(function(){
                    this.isDeletedDept = true;
                },this)
            });

			this.isSortMode = false;
		},
		
		
		events : {
			"click #sort" : "_sortOrder",
			"click #add" : "_categorizePopup",
			"click #delete" : "_deleteFolders",
			"click #checkAll" : "_checkAll",
			"change #manageFolderList input" : "_toggleCheckAll",
			'click .creat .btn_wrap' : 'addManager',
			'click .btn_wrap .ic_del' : 'deleteManager'
		},
		
		
		render : function() {
			var managerData = this.managerCollection.toJSON();
			this.$el.html(Template({
				id : this.deptId,
				name : this.deptName,
				managerData : managerData,
                isDeletedDept : this.isDeletedDept,
				lang : lang
			}));
			
			return this;
		},
		
		/**
		 * 목록 렌더링 
		 * @method _renderList
		 */
		_renderList : function() {
			this.$("#manageFolderList").empty();
			this._toggleCheckAll();
			this._toggleOrderButton();
			this.collection.each(function(folder) {
				this._renderFolderItem(folder);
			}, this);
			
			if (!this.collection.length) this._renderEmptyFolder();
		},
		
		/**
		 * 문서함이 없는경우 렌더링.
		 * @method _renderEmptyFolder
		 */
		_renderEmptyFolder : function() {
			var template = [
                '<tr>',
                	'<td colspan="4">',
		                '<p class="data_null">',
			                '<span class="ic_data_type ic_no_contents"></span>',
			                '<span class="txt">', approvalLang["문서함이 없습니다"], '</span>',
		                '</p>',
	                '</td>',
                '</tr>'
            ].join("");
			
			this.$("#manageFolderList").html(template);
		},
		
		/**
		 * 분류 팝업
		 * @method _categorizePopup
		 */
		_categorizePopup : function() {
			var self = this;
			this.popup = $.goPopup({
				"pclass" : "layer_normal layer_doc_type_select",
                "header" : approvalLang["부서 문서함 추가"],
                "modal" : true,
                "width" : 300,
                "contents" :  "",
                "buttons" : [
                    {
                        'btext' : commonLang['확인'],
                        'btype' : 'confirm',
                        'autoclose' : false,
                        'callback': function() {
                        	var folderName = self.popup.find("#deptFolderName").val();
                        	if (!folderName) {
                        		$.goError(approvalLang["부서 문서함 폴더명을 입력하세요."], self.popup.find("#deptFolderError"));
                        		return;
                        	}
                        	self._addFolder(folderName);
                        }
                    }, {
                        'btext' : commonLang["취소"],
                        'btype' : 'cancel'
                    }
                ]
            });
			
			this.popup.find("div.content").html(popupTemplate);
		},
		
		/**
		 * 폴더 추가 
		 * @method _addFolder
		 * @param folderName
		 */
		_addFolder : function(folderName) {
			var self = this;
			var folder = new Folder({
				deptId : this.deptId,
				folderName : folderName
			});
			folder.save().done(function(model) {
				// response 가 상태값만 내려와서 
				// model의 id가 없기 때문에 목록을 다시 fetch 해야함.
				self.collection.fetch();
				self.popup.close();
			});
		},
		
		/**
		 * 폴더 아이템 뷰 렌더링
		 * @method _renderFolderItem
		 */
		_renderFolderItem : function(folder) {
			var itemView = new FolderItemView({
				model : folder
			});
			this.$("#manageFolderList").append(itemView.render().el);
		},
		
		/**
		 * 순서바꾸기 버튼 토글 (순서바꾸기/순서바꾸기 완료) 
		 * @method _sortOrder
		 */
		_sortOrder : function(e) {
			var self = this;
			var buttonEl = $(e.currentTarget);
			var buttonText = !this.isSortMode ? commonLang["순서바꾸기 완료"] : commonLang["순서바꾸기"];
			
			buttonEl.toggleClass("btn_save", this.isSortMode);
			buttonEl.text(buttonText);
			
			if (this.isSortMode) {
				var data = {
					ids : this._getAllFolderIds()
				};
				this.collection.submitOrder(data).done(function() {
					self._renderSortMode();
					self.collection.fetch();
				});
			} else {
				this._renderSortMode();
			} 
		},
		
		/**
		 * 순서바꾸기 모드 렌더링 
		 * @method _renderSortMode
		 */
		_renderSortMode : function() {
			var sortState = !this.isSortMode ? "enable" : "disable";
			
			this.$("#manageFolderList").removeClass().sortable({
				opacity : "1",
				delay: 100,
				cursor : "move",
				items : "tr",
				containment : ".content_page",
				hoverClass: "ui-state-hover",
				forceHelperSize : "true",
				helper : "clone",
				placeholder : "ui-sortable-placeholder",
				start : function (event, ui) {
					ui.placeholder.html(ui.helper.html());
				}
			}).sortable(sortState);
			
			this.isSortMode = !this.isSortMode;
		},
		
		/**
		 * 폴더 아이디 반환.
		 * @method _getAllFolderIds
		 * @return {Array} [folderId1, folderId2]
		 */
		_getAllFolderIds : function() {
			return _.map(this.$("#manageFolderList").find("tr"), function(folderEl) {
				return $(folderEl).attr("data-folderId");
			});
		},
		
		/**
		 * 선택된 폴더 아이디 반환.
		 * @method _getCheckedFolderIds
		 * @return {Array} [folderId1, folderId2]
		 */
		_getCheckedFolderIds : function() {
			return _.map(this.$("#manageFolderList").find("input:checked"), function(folderEl) {
				return $(folderEl).attr("data-folderId");
			});
		},
		
		/**
		 * 폴더 삭제.
		 * @method _deleteFolders
		 */
		_deleteFolders : function() {
			var self = this;
			var folderIds = this._getCheckedFolderIds();
			
			if (!folderIds.length) {
				$.goError(approvalLang["선택된 항목이 없습니다."]);
				return;
			}
			
			$.goConfirm(commonLang["삭제하시겠습니까?"], "", function() {
				self.collection.deleteFolders({ids : folderIds}).done(function() {
					self.collection.fetch();
				}).fail(function(resp) {
					if(resp.responseJSON.message) {
						$.goError(resp.responseJSON.message);
					}else {
						$.goError(commonLang['저장에 실패 하였습니다.']);
					}
            	});
			});
		},
		
		// TODO go-table
		/**
		 * 전체 체크
		 * @method _checkAll
		 */
		_checkAll : function(e) {
			var isChecked = this.$("#checkAll").is(":checked");
			this.$("#manageFolderList").find("input").attr("checked", isChecked);
			this._toggleCheckAll();
		},
		
		// TODO go-table
		/**
		 * 목록의 체크박스가 모두 선택 됐는지 여부에 따라 checkAll 체크박스를 토글
		 * @method _toggleCheckAll
		 */
		_toggleCheckAll : function() {
			var checkBoxCount = this.$("#manageFolderList").find("input").length;
			var checkedBoxCount = this.$("#manageFolderList").find("input:checked").length;
			var isCheckAll = (checkBoxCount != 0 && checkBoxCount == checkedBoxCount) ? true : false;  
			
			this.$("#checkAll").attr("checked", isCheckAll);
		},
		
		/**
		 * 순서 바꾸기 버튼 토글
		 * @method __toggleOrderButton
		 */
		_toggleOrderButton : function() {
			var isShow = this.collection.length > 0;
			this.$("#sort").toggle(isShow);
		},

		addManager : function(e){
			var self = this;
			$.goOrgSlide({
				header : approvalLang["담당자 추가"],
				desc : '',
				contextRoot : GO.contextRoot,
				isCustomType : true,
				memberTypeLabel : approvalLang["담당자"],
				externalLang : commonLang,
				isBatchAdd : true,
				isAdmin : true,
				callback : function(rs) {
					self.addMember(rs);
				}
			});
		},

		addMember : function(data) {
			var self = this;
			var targetEl = $('#addMembers');
			if(data && !targetEl.find('li[data-userId="'+ data.id+'"]').length) {
				var model = new DeptFolderManagerModel();
				var users = _.isArray(data) ? data : [data];
				var userIds = _.map(users, function(user) {
					return user.id;
				});
				var managerIds = this.managerCollection.getUserIds();
				var filtedIds = _.difference(userIds, managerIds);

				if (!filtedIds.length) return;

				model.setDeptId(self.deptId);
				model.save({},{
					data : JSON.stringify({ids : filtedIds}),
					contentType : "application/json",
					type : 'PUT',
					success : function(model, response) {
						if(response.code == '200') {
							$.goMessage(commonLang["저장되었습니다."]);
							var addedManagers = _.reject(users, function(user) {
								return _.contains(managerIds, user.id);
							});
							_.each(addedManagers, function(data) {
								targetEl.find('li.creat').before(tplAddMember($.extend(data, { lang : lang })));
							});
							self.managerCollection.fetch({async:false});
						}
					},
					error : function(model, response) {
						$.goMessage(commonLang["저장에 실패 하였습니다."]);
					}
				});
			} else {
				$.goMessage(approvalLang["이미 선택되었습니다."]);
			}
		},

		deleteManager : function(e){
			var self = this;
			var delId = $(e.currentTarget).parents('li').attr('data-userId');

			$.ajax({
				"url": GO.contextRoot + 'ad/api/approval/deptfolder/'  + this.deptId + '/manager',
				"contentType": 'application/json',
				"dataType": "json",
				"data": JSON.stringify({ "userId": delId }),
				"type": "DELETE",
				"success": function() {
					$.goMessage(commonLang["저장되었습니다."]);
					$(e.currentTarget).parents('li').remove();
					self.managerCollection.fetch({async:false});
				},
				"error" : function(xhr, status, error){
					var result = JSON.parse(xhr.responseText);
					$.goError(result.message);
				}
			});
		}
	});
	
	return View;
});