//전사문서함 관리
define([
    "jquery",
    "underscore",
    "backbone",
    "app", 
    "approval/views/apprform/admin_company_folder_tree",
    "views/circle",
    "admin/models/appr_company_folder_manage",
    "hgn!admin/templates/appr_company_folder_manage",
    "hgn!admin/templates/appr_company_folder_manage_form",
    "hgn!approval/templates/add_org_member",
	"i18n!nls/commons",    
	"i18n!admin/nls/admin",
	"jquery.go-popup",
    "jquery.go-orgslide",
    "jquery.go-validation"
], 
function(
	$, 
	_, 
	Backbone, 
	GO,
	CompanyFolderTreeView,
    CircleView,
    ApprCompanyFolderModel,
	ApprCompanyFolderManageTpl,
	CompanyFolderFormTpl,
	tplAddMember,
    commonLang,
    adminLang
) {	
	
	var lang = {
            'head_title' : adminLang["결재 양식 관리"],
            'appr_form_folder_list' : adminLang["결재양식 폴더 목록"],
            'folder_name' : adminLang["폴더명"],
            'folder_add' : adminLang["폴더 추가"],
            'folder_delete' : commonLang["삭제"],
            'selected_folder' : adminLang["선택된 폴더"],
            'form_add' : adminLang["양식 추가"],
            'form_delete' : adminLang["양식 삭제"],
            'reorder' : adminLang["순서바꾸기"],
            'reorder_done' : adminLang["순서바꾸기 완료"],
            'folder_delete_message' : adminLang["폴더 삭제"],
            'folder_delete_confirm' : adminLang["폴더를 삭제하시겠습니까?"],
            'null_data' : adminLang["등록된 결재 양식이 없습니다."],
            'select_folder' : adminLang["폴더를 선택해 주십시오."],
            'cannot_update' : adminLang["최상위 폴더를 수정할 수 없습니다."],
            'hidden' : adminLang['숨김'],
            'normal' : adminLang['정상'],
            'cannot_delete_root' : commonLang["최상위 폴더는 삭제할 수 없습니다."],
            'cannot_delete' : adminLang["삭제할 수 없습니다."],
            'cannot_delete_parent' : adminLang["양식이 있거나 하위 폴더가 있는 경우는 삭제할 수 없습니다."],
            'cannot_change_hidden' : adminLang["하위폴더가 있는경우 숨김처리를 할 수 없습니다."],
            'cannot_create_under_hidden' : adminLang["숨김처리된 폴더는 하위폴더를 생성할 수 없습니다."],
            'save_success' : commonLang['저장되었습니다.'],
            'already_used_name' : adminLang["이미 사용중인 이름입니다."],
            'name_required' : adminLang['제목을 입력하세요.'],
            'alias_required' : adminLang['양식약어를 입력하세요.'],
            'name_invalid_length' : adminLang['제목은 20자까지 입력할 수 있습니다.'],
			'name_invalid_character' : adminLang['유효하지 않은 문자열 입니다.'],
			"취소" : commonLang['취소'],
            'state' : adminLang['사용여부'],
            'name_required' : adminLang['이름을 입력하세요.'],
            '문서함 상세정보' : adminLang['문서함 상세정보'],
            '추가' : commonLang['추가'],
            '삭제' : commonLang['삭제'],
            "전사 문서함 폴더 추가" : adminLang["전사 문서함 폴더 추가"],
            "문서함 이름" : adminLang["문서함 이름"],
            "문서함 명" : adminLang["문서함 명"],
            "문서함 설명" : adminLang["문서함 설명"],
            "접근 권한" : adminLang["접근 권한"],
            "전체 사용자" : adminLang["전체 사용자"],
            "일부 사용자" : adminLang["일부 사용자"],
            "저장" : commonLang["저장"],
            "취소" : commonLang["취소"]
    };
	
	var ApprCompanyFolderManageView = Backbone.View.extend({
		el: '#layoutContent',
        treeView: null,
        folderUserView: null,
		initialize: function() {
			
		},
		delegateEvents: function(events) {
            this.undelegateEvents();
            Backbone.View.prototype.delegateEvents.call(this, events);
            this.$el.on("click.companyFolder", "span.btn_add", $.proxy(this.folderAdd, this));
            this.$el.on("click.companyFolder", "span.btn_delete", $.proxy(this.folderDelete, this));
            this.$el.on("click.companyFolder", "span#companyFolerSave", $.proxy(this.saveManage, this));
            this.$el.on("click.companyFolder", "span#companyFolerCancel", $.proxy(this.cancel, this));
            this.$el.on('click.companyFolder', 'input[name=folderUserScope]', $.proxy(this._onFolderUserScopeChanged, this));
        }, 
        
        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.call(this);
            this.$el.off(".companyFolder");
            return this;
        },
        
        renderDetailForm : function(id){
        	if(id){
                this.model = new ApprCompanyFolderModel();
            	this.model.set('id', id);
            	this.model.fetch({
					async:false,
					statusCode: {
	                    403: function() { GO.util.error('403'); }, 
                        404: function() { GO.util.error('404', { "msgCode": "400-common"}); }, 
                        500: function() { GO.util.error('500'); }
	                }
            	});

    			var data = this.model.toJSON();
                this.$el.find('.tb_wrap').html(
                	CompanyFolderFormTpl({data : data, lang : lang})
                );
                
        	}else{
                this.$el.find('.tb_wrap').html(
                    	CompanyFolderFormTpl({lang : lang})
                    );
        	}
        	if(this.model.get('root')){
    			$(this.el).find('#tb_admin_doc_folder input[data-name=name]').attr("readonly", true);        	
        	}
        	if(this.model.get('state') == "NORMAL"){
            	this.$el.find(':radio[name="state"]:radio[value="NORMAL"]').attr("checked", true);        		
        	}else if(this.model.get('state') == "HIDDEN"){
            	this.$el.find(':radio[name="state"]:radio[value="HIDDEN"]').attr("checked", true);
        	}
        	this._renderFolderUserView();
        },
        
        _renderFolderUserView: function() {
        	var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
        	if(GO.util.isUseOrgService(true)){
        		nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
        	}
            this.folderUserView = new CircleView({
                selector: '#folderUser',
                isAdmin: true,
                circleJSON: this.model.get('folderUser'),
                nodeTypes: nodeTypes
            });
            
            this.folderUserView.render();
            if(this.model.get('folderUserScope')=='ALL'){
            	this.$el.find(':radio[name="folderUserScope"]:radio[value="ALL"]').attr("checked", true);
            }else if(this.model.get('folderUserScope')=='SPECIFIC'){
            	this.$el.find(':radio[name="folderUserScope"]:radio[value="SPECIFIC"]').attr("checked", true);
            } 
            
            if (this.model.get('folderUserScope') == 'ALL') {
                this.folderUserView.hide();
            } else {
                this.folderUserView.show();
            }
        },
        
		render: function() {
			var self = this;
			
			this.$el.html(ApprCompanyFolderManageTpl({
				lang: lang				
			}));
			this.treeView = new CompanyFolderTreeView({
                isAdmin: true,
                treeElementId: 'orgTree',
                selectCallback: $.proxy(function(data) {
                	this.renderDetailForm(data['id']);
                }, this)
			});
			
			this.treeView.render();
		},		
		
		folderAdd : function(){
			if(!this.validBeforeFolderCreate()){
				return false;
			}
            this.treeView.renderNewFolderInput(lang['folder_name']);
		},
		
		folderDelete : function(){
	        this.treeView.deleteSelectedFolder();

		},
		
		validBeforeFolderCreate : function(){
			if(this.model.get('state') == "HIDDEN"){
            	$.goError(lang['cannot_create_under_hidden']);
            	return false;
			}else{
				return true;
			} 
		},
		
		_onFolderUserScopeChanged: function(e) {
            var scope = $(e.currentTarget).val();
            if (scope == 'SPECIFIC') {
                this.folderUserView.show();
            } else {
                this.folderUserView.hide();
                this.model.set('folderUser', {});
            }
        },
        
        validBeforeSaveManage : function(){
			var name = $(this.el).find('#tb_admin_doc_folder input[data-name=name]').val();        	
			var state = $(this.el).find('#tb_admin_doc_folder input[name=state]:checked').val();
			var isUniqueName = this.treeView._checkUniqueTextOnRename(name);
            if(!isUniqueName){
            	$.goError(lang['already_used_name']);
                return false;                	
            }
            
            return true;
        },
        
		saveManage : function(){
			var self = this;
			var name = $(this.el).find('#tb_admin_doc_folder input[data-name=name]').val();
			var description = $(this.el).find('#tb_admin_doc_folder textarea[data-name=description]').val();
			var state = $(this.el).find('#tb_admin_doc_folder input[name=state]:checked').val();
			
			if(!this.validBeforeSaveManage()){
				return false;
			}
			
			this.model.set({ 
				name : name,
				desc : description,
				state : state
			},{ silent : true });
            this.model.set('folderUserScope', this.$el.find('input[name=folderUserScope]:checked').val());
            var folderUser = (this.model.get('folderUserScope') == 'SPECIFIC') ? this.folderUserView.getData() : {nodes: []};
            this.model.set('folderUser', folderUser);
            if (!this.model.isValid()) {
            	if(this.model.validationError == 'name_invalid_length'){
	                $.goError(GO.i18n(commonLang["0자이상 0이하 입력해야합니다."],{arg1 : 2, arg2 : 100}));
	            	this.$el.find(':input[data-name=name]').select();
            	}else{
	                $.goError(lang[this.model.validationError]);            		
            	}
	                return false;
            }
        	this.model.save({},{
        		type : 'PUT',
                async: false, 
                success: function(data, response) {
					if(response.code == '200') {
	                    $.goMessage(commonLang["수정되었습니다."]);
	                    self.render();
					}
                },
				error : function(model, rs) {
					var responseObj = JSON.parse(rs.responseText);
					if (responseObj.message) {
						$.goError(responseObj.message);
						return false;
					} else {
						$.goError(commonLang['저장에 실패 하였습니다.']);
						return false;
					}
				}
        	});
		},
		cancel : function(){
            this.renderDetailForm(this.model.get('id'));
		}
	});
	return ApprCompanyFolderManageView;
});