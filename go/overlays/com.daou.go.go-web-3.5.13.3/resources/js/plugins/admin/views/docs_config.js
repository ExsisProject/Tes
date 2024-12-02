define('admin/views/docs_config', function(require) {
	
	var App = require('app');
	var commonLang = require("i18n!nls/commons");
	var adminLang = require("i18n!admin/nls/admin");
    var approvalLang = require("i18n!approval/nls/approval");
    var docsLang = require("i18n!docs/nls/docs");
    
	var DocsConfigTpl = require("hgn!admin/templates/docs_config");
	var DocsConfigFormTpl = require("hgn!admin/templates/docs_config_form");
    
	var _ = require("underscore");
    
	var CircleTableView = require("views/circle_tableTmpl");
    var CircleView = require("views/circle");
    var FolderTreeView = require("admin/views/docs_folder_tree");
    
    var DocsFolderModel = require("admin/models/docs_folder");
    
    require("jquery.go-orgslide");

    var lang = {
        'cannot_create_under_hidden' : adminLang["숨김처리된 폴더는 하위폴더를 생성할 수 없습니다."],
        'folder_detail' : docsLang["문서함 상세정보"],
        'add' : commonLang["추가"],
        'delete' : commonLang["삭제"],
        'folder_name' : adminLang["문서함 명"],
        'admin' : adminLang["운영자"],
        'docsYear' : docsLang["보존연한"],
        'docNum' : docsLang["문서번호"],
        'use' : adminLang["사용"],
        'unuse' : adminLang["사용하지 않음"],
        'use_approval' : docsLang["등록승인기능"],
        'access_target' : docsLang["열람자 설정"],
        'exception_target' : docsLang["예외자 설정"],
    	'status' : adminLang["사용여부"],
    	'hidden' : adminLang["숨김"],
    	'normal' : adminLang["정상"],
    	'save' : commonLang["저장"],
    	'cancel' : commonLang["취소"]
    };

    var DocsYearModel = Backbone.Model.extend({
            initialize: function(option){
                this.option = option || {docYear : 5};
            }
        },
        {
            PRESERVE_YEARS : [1, 3, 5, 10, 0]
        }
    );

	var DocsConfigView = Backbone.View.extend({

        events : {
            "click span[data-btntype='publicDelete']" : "deletePublicRange",
            "click span.btn_add" : "folderAdd",
            "click span.btn_delete" : "folderDelete",
            "click #docsConfigSubmit" : "submit",
            "click #docsConfigCancel" : "cancel"
        },

		initialize : function(options) {

		},
		
		render : function() {
			this.$el.html(DocsConfigTpl({
				lang : lang
			}));
            this.renderFolderList();
		},

        renderFolderList : function(){

            this.treeView = new FolderTreeView({
                isAdmin: true,
                treeElementId: 'orgTree',
                selectCallback: $.proxy(function(data) {
                	this.$('.tb_wrap')
                	if(data.type == 'root'){
                		var rootTmpl = '<div class="header_group"><h3>' + docsLang["전사 문서함" ]+ "</h3></div>"+
            			'<table class="detail tb_admin_doc_folder">' +
                		    '<tbody>' + 
                		    	'<tr class="odd">' + 
	                		    	'<td valign="top" colspan="2" class="dataTables_empty align_c">' +
	                		    		'<p class="data_null">' + 
	                		    			'<span class="ic_data_type ic_no_data"></span>' +
	                		    			'<span class="txt">' + docsLang["문서함을 선택해 주세요."] +'</span>' + 
	        		    				'</p>' +
	    		    				'</td>' + 
    		    				'</tr>' +
		    				'</tbody>' + 
	    				'</table>';
                		this.$('.tb_wrap').html(rootTmpl);
                	}else{
                		this.renderDetailForm(data['id']);
                	}
                }, this)
            });

            this.treeView.render();

        },

        renderForm : function() {
            this.renderAdminView();
            this.renderAccessUserView();
            this.renderExceptionUserView();
        },

		deletePublicRange : function(e){
			$(e.currentTarget).parents('li').first().remove();
		},

        makeDocInfo : function(docYear){
            this.yearsModel = new DocsYearModel({docYear : docYear});
            var preserveYears = _.map(DocsYearModel.PRESERVE_YEARS, function(num) {
                return {
                    'value' : num,
                    'label' : (num == 0) ? approvalLang['영구'] : num + approvalLang['년'],
                    'isSelected' : (this.yearsModel.get('docYear') * 1 == num * 1) ? true : false
                };
            }, this);
            return preserveYears;
        },

        renderAdminView: function() {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if(GO.util.isUseOrgService(true)){
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            if(this.model.get("admin") != null){
                this.model.get("admin").nodes = _.sortBy(this.model.get("admin").nodes, 'nodeType');
            }
            this.adminView = new CircleView({
                selector: '#admin',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get("admin"),
                nodeTypes: nodeTypes
            });
            this.adminView.render();
        },

        renderAccessUserView: function() {
            var nodeTypes = ['company','user', 'position', 'grade', 'usergroup'];
            if(GO.util.isUseOrgService(true)){
                nodeTypes = ['company','user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            if(this.model.get("accessTarget") != null){
                this.model.get("accessTarget").nodes = _.sortBy(this.model.get("accessTarget").nodes, 'nodeType');
            }
            this.accessUserView = new CircleTableView({
                selector: '#accessUser',
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get("accessTarget"),
                nodeTypes: nodeTypes
            });
            this.accessUserView.render();
        },

        renderExceptionUserView: function() {
            var nodeTypes = ['user', 'position', 'grade', 'usergroup'];
            if(GO.util.isUseOrgService(true)){
                nodeTypes = ['user', 'department', 'position', 'grade', 'duty', 'usergroup'];
            }
            if(this.model.get("exceptionTarget") != null){
                this.model.get("exceptionTarget").nodes = _.sortBy(this.model.get("exceptionTarget").nodes, 'nodeType');
            }
            this.exceptionUserView = new CircleTableView({
                selector: '#exceptionUser',
                isExceptionList: true,
                isAdmin: true,
                isWriter: true,
                circleJSON: this.model.get("exceptionTarget"),
                nodeTypes: nodeTypes
            });
            this.exceptionUserView.render();
        },

        renderDetailForm : function(id){
            $.goOrgSlide('close');
            if(id){
                this.model = new DocsFolderModel();
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

                this.$('.tb_wrap').html(DocsConfigFormTpl({
                    preserveYears : this.makeDocInfo(data.docYear),
                    data : data,
					isNormalState : data.state == "NORMAL",
					lang : lang
                }));
            }else{
                this.$('.tb_wrap').html(DocsConfigFormTpl({
                    preserveYears : this.makeDocInfo(5)
                }));
            }
            this.renderForm();
        },

        folderAdd : function(){
            $.goOrgSlide('close');
            if(!this.validBeforeFolderCreate()){
                return false;
            }
            this.treeView.renderNewFolderInput(lang['folder_name']);
        },
        folderDelete : function(){
            $.goOrgSlide('close');
            this.treeView.deleteSelectedFolder();
        },

        validBeforeFolderCreate : function(){
            if(this.model != undefined && this.model.get('state') == "HIDDEN"){
                $.goError(lang['cannot_create_under_hidden']);
                return false;
            }else{
                return true;
            }
        },

        submit : function(){
            $.goOrgSlide('close');
            var self = this;
            var name = $("#name").val(),
            	useDocNum = $("#enableDocNum").attr("checked") ? true : false,
                useApproved = $("#enableDocEnrollConfirm").attr("checked") ? true : false,
                state = $("#disableDoc").attr("checked") ? "HIDDEN" : "NORMAL",
                accessTarget = self.accessUserView.getData(),
                exceptionTarget = self.exceptionUserView.getData(),
                admin = self.adminView.getData();

            var trimName = $.trim(name);
            if (trimName.length > 100 || trimName.length < 2) {
            	var errorMsg = App.i18n(docsLang["0은 0자이상 0자이하 입력해야 합니다."], {"arg0":docsLang["문서함 이름"], "arg1":"2","arg2":"100"});
                $.goError(errorMsg, $("#name"), false, true);
                return false;
            }

            var selectYear = document.getElementById("docYear");
            self.model.set("name", name, {silent: true});
            self.model.set("useDocNum", useDocNum, {silent: true});
            self.model.set("useApproved", useApproved, {silent: true});
            self.model.set("docYear", selectYear.options[selectYear.selectedIndex].value * 1, {silent: true});
            self.model.set("state", state, {silent: true});
            self.model.set("admin", admin, {silent: true});
            self.model.set("accessTarget", accessTarget, {silent: true});
            self.model.set("exceptionTarget", exceptionTarget, {silent: true});

            GO.EventEmitter.trigger('common', 'layout:setOverlay', "");
            self.model.save({}, {
                type : 'PUT',
                success : function(model, response) {
                    if(response.code == '200') {
                        $.goMessage(commonLang["저장되었습니다."]);
                        GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                        GO.router.navigate("docs", {trigger: true});

                    }
                },
                error : function(model, response) {
                    $.goMessage(commonLang["저장에 실패 하였습니다."]);
                    GO.EventEmitter.trigger('common', 'layout:clearOverlay', true);
                }
            });
        },

        cancel : function() {
            $.goOrgSlide('close');
            this.render();
        },

        setOwners : function(){
            var owners = [];

            var sharedListPart = $('#groupUl').find('li');
            if(sharedListPart.length < 1){
                return;
            }
            sharedListPart.each(function(){
                owners.push({
                    ownerShip : 'JOINT',
                    ownerType : $(this).attr('data-type') ? $(this).attr('data-type') : 'DomainCode',
                    ownerId : $(this).attr('data-code'),
                    scope : 'ALL',
                    permission : '3',
                    sharedType : $(this).attr('data-sharedtype') ? $(this).attr('data-sharedtype') : 'NONE'
                });
            });


            return owners;
        }

	});
	
	return DocsConfigView;
});