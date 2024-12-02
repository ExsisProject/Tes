define([
    "when",
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"i18n!approval/nls/approval",
	
	"hgn!admin/templates/approval/appr_dept_folder_main",
	"admin/views/approval/appr_dept_folder_tree",
	"admin/views/approval/appr_dept_folder_list",
	'admin/views/approval/appr_dept_setting_list_layout',
	"admin/views/approval/appr_dept_folder_manage",
	
	"admin/collections/approval/appr_dept_folders",
	
	"jquery.go-orgslide"
], 
function(
	when,
    commonLang,
    adminLang,
    approvalLang,
    
    Template,
    TreeView,
    ListView,
    ListLayoutView,
    ManageView,
    
    DeptFolders
) {	
	
	var headerTemplate = [
	    "<input id='normalState' name='status' type='radio' value='department'>",
        "<label for='normalState'>", 
      	  	commonLang["정상 부서 검색"],
        "</label>",
        "<br />",
        "<input id='deleteState' name='status' type='radio' value='deleteDept'>",
        "<label for='deleteState'>", 
      		commonLang["삭제된 부서 검색"],
        "</label>"
    ].join("");
	
	var lang = {
		"부서 문서함 관리" : approvalLang["부서 문서함 관리"],
		"부서 문서함 사용 설정" : adminLang["부서 문서함 사용 설정"],
		"사용 설정" : adminLang["사용 설정"],
		"부서 선택" : commonLang["부서 선택"],
		"[부서 상세]로 이동" : adminLang["[부서 상세]로 이동"],
		"부서 문서함 목록" : adminLang["부서 문서함 목록"]
	};
	
	var DeptSettingCollection = Backbone.Collection.extend({
		initialize: function(options) {
		    this.options = options || {};
		},
		url : function(){
			return GO.config('contextRoot') + 'ad/api/approval/deptsetting';
		}
	});
	
	var View = Backbone.View.extend({
		popupEl: null,
		initialize : function(options) {
            this.options = options || {};
            this.deptId = this.options.opt1;
			this.collection = new DeptFolders(); 
			this.department = {
				id : null,
				name : null
			};
			this.orgOptiontype = 'department';
		},
		
		
		events : {
			"click #callOrg" : "_callOrg",
			"click #moveDeptDetail" : "_moveDeptDetail",
			"click #btnDeptApprSetting" : "popupDeptApprSetting"
		},
		
		render : function() {
			this.$el.html(Template({
				lang : lang
			}));
			this._renderDefaultTree();
		},
		
		popupDeptApprSetting : function(){
            var html = [];
            var self = this;
            this.popupEl = $.goPopup({
                'header' : approvalLang['부서 일괄 셋팅'],
                'modal' : true,
                'width' : 650,
                'pclass' : 'layer_normal layer_use_set',
                'contents' : '',
                "buttons" : [
                             {
                                'btext' : commonLang['확인'],
                                'autoclose' : false,
                                'btype' : 'confirm',
                                'callback' : function(rs){
                                		self.saveDeptApprSetting(rs);
                                }
                            },
                            {
                                'btext' : commonLang["취소"],
                                'btype' : 'cancel'
                            }
                        ]
            });
            this.layoutView = new ListLayoutView();
            when(this.layoutView.render())
			.then(function(){
				self.popupEl.reoffset();
			})
			.otherwise(function printError(err) {
                console.log(err.stack);
				self.popupEl.reoffset();
            });
		},
		
		saveDeptApprSetting : function(rs){
			var collection = new DeptSettingCollection();
			collection.fetch({
        		type : 'PUT',
    			dataType : "json",
				contentType:'application/json',
				data : JSON.stringify(this.layoutView.getData())
        	}).done(function(){
    			$.goMessage(commonLang['저장되었습니다.']);
    			rs.close();
            }).fail(function(){
    			$.goError(commonLang['저장에 실패 하였습니다.']);
            });
        	
		},
		
		/**
		 * 기본값으로 렌더링
		 * @method _renderDefault
		 */
		_renderDefaultTree : function() {
			var self = this;
			this._getDepts().done(function() {
				self._renderTree("draft");
			});
		},

		/**
		 * 부서정보 가져오기
		 * @method _getDepts
		 */
		_getDepts : function() {
            var self = this;
            return $.ajax({
                url: GO.contextRoot + (this.deptId ? "ad/api/department/" + this.deptId : "ad/api/organization/root"),
                success: function (resp) {
                    var id = resp.data.id;
                    var name = resp.data.name;
					self.collection.setDeptId(id);
					self.department = {
						id : id,
						name : name
					};
				}
			});
		},
		
		/**
		 * 조직도 호출 
		 * department, deleteDept. 두가지 타입으로 호출한다.  
		 * @method _callOrg
		 * @param {Object} 이벤트
		 * @param {Object} 조직도 옵션
		 */
		_callOrg : function(e, option) {
			var orgOption = option || this._defaultOrgOption();
			var self = this;
			var org = $.goOrgSlide(orgOption);
			var orgEl = org.getPopupEl();
			
			orgEl.find("input[name='status'][value='" + orgOption.type + "']").attr("checked", "chcked");
			orgEl.find("input[name='status']").on("change", function() {
				var type = $(this).val();
				var option = self._defaultOrgOption(type);
				self._callOrg(null, option);
				self.orgOptiontype = option.type;
			});
		},

		_moveDeptDetail : function(e, option) {
            var self = this;
            var contents = adminLang["해당 화면으로 이동하기 위한 권한이 없습니다."];
            var buttons = [];
            if(GO.routes.hasRouteAuth("admin", "dept(/:id)")) {
                contents = GO.i18n(adminLang['메뉴로 이동하시겠습니까'], {"menuName":adminLang['부서 상세']});
                buttons = [{
                    btext : commonLang["확인"],
                    btype : "confirm",
                    autoclose : true,
                    callback : function() {
                        if(_.isEmpty(self.department)){
                            window.location.href = GO.contextRoot + "admin/dept/";
                        }else{
                            var departmentId = self.department.id;
                            if(self.orgOptiontype == 'department'){
                                window.location.href = GO.contextRoot + "admin/dept/"+departmentId;
                            }else if(self.orgOptiontype == 'deleteDept'){
                                window.location.href = GO.contextRoot + "admin/dept/delete/"+departmentId;
                            }
                        }
                    }
                }, {
                    btext : commonLang["취소"]
                }];

            }
            $.goPopup({
                width : 600,
                title : "",
                pclass : "layer_confim",
                contents : "<p class='q'>" + contents + "</p>",
                buttons : buttons
            });

		},

		/**
		 * 조직도 기본 옵션
		 * @method _defaultOrgOption
		 * @param 조직도 type 또는 undefined
		 * @return {object} 조직도 옵션
		 */
		_defaultOrgOption : function(type) {
			var self = this;
			return {
				contextRoot : GO.contextRoot,
				header : commonLang["부서 선택"],
				isAdmin : true,
				type : type || "department",
				headerOption : headerTemplate,
				callback : function(department) {
					self.collection.setDeptId(department.id);
					self.department = department;
					self._renderTree();
				}
			};
		},
		
		/**
		 * 트리뷰 렌더링
		 * @method _renderTree
		 */
		_renderTree : function(defaultType) {
			// TODO : 정상부서 및 삭제부서 선택시 부서명 정보가 상이한 Key로 넘어오는 이슈
			// 조직도 처리 Refactoring 필요
			// 정상부서 : this.department.name
			// 삭제부서 : this.department.deptName
			var treeView = new TreeView({
				deptId : this.department.id,
				deptName : this.department.name || this.department.deptName,
				collection : this.collection,
				defaultType : defaultType
			});
			this.$("#treeArea").html(treeView.render().el);
			this._clearList();
//			treeView.$el.on("clickFolder", _.bind(this._renderList, this));
//			treeView.$el.on("clickManageButton", _.bind(this._renderManage, this));
			treeView.on("renderList", this._renderList, this);
			treeView.on("renderManage", this._renderManage, this);
		},
		
		/**
		 * 목록뷰 렌더링
		 * @method _renderList
		 * @param {Array} params
		 */
		_renderList : function(params) {
			var targetEl = params[0];
			var target = $(targetEl);
			var type = target.attr("data-navi");
			var folderId = target.attr("data-folderId");
			var name = target.find("span.txt").text();
			
			var listView = new ListView({
				name : name,
				folderId : folderId,
				type : type,
				department : this.department,
				isPredefined : type != "doc",
				isOfficial : type == "official"
			});
			this.$("#listArea").html(listView.el);
			listView.render();
		},
		
		/**
		 * 목록뷰 제거
		 * @method _clearList
		 */
		_clearList : function() {
			this.$("#listArea").empty();
		},
		
		/**
		 * 관리뷰 렌더링
		 * @method _renderManage
		 */
		_renderManage : function() {
			var manageView = new ManageView({
				deptId : this.department.id,
				deptName : this.department.name,
				collection : this.collection
			});
			this.$("#listArea").html(manageView.render().el);
		}
	}, {
		attachTo: function(targetEl) {
			var contentView = new View();
			
			targetEl
				.empty()
				.append(contentView.el);
			
			contentView.render();
			
			return contentView;
		}
	});
	
	return View;
});