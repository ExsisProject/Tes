(function() {
    define([
        "jquery",
        "backbone",
        "app",
        "when",
        
        "approval/models/todocount",
        "approval/models/upcomingcount",
        "approval/models/receptioncount",
        "approval/models/todoviewercount",
        "approval/models/favoriteform",
        "approval/models/officialtodocount",
        
        "approval/views/favorite_list",
        "approval/views/new",
        
        "hgn!approval/templates/side",
        "hgn!approval/templates/side_dept_folder",
        
        "i18n!nls/commons",
        "i18n!approval/nls/approval",
        "i18n!board/nls/board",
        
        "amplify",
        "GO.util"
    ],
    function(
        $,
        Backbone,
        App,
        when,
        
        TodoCountModel,
        UpcomingCountModel,
        TodoReceptionCountModel,
        TodoViewerCountModel,
        SideFavoriteFormModel,
        OfficialTodoCountModel,
        
        SideFavoriteFormListView,
        NewDocumentLayerView,
        
        layoutTpl,
        tplSideDeptFolder,
        
        commonLang,
        approvalLang,
        boardLang,
        
        Amplify
    ) {
        
        var SideFavoriteFormCollection = Backbone.Collection.extend({
            model: SideFavoriteFormModel,
            url: '/api/approval/favorite'
        });
        
        var SideDeptFolderCollection = Backbone.Collection.extend({
            url: '/api/approval/deptfolder'
        });

        var SideDrafterDeptFolderCollection = Backbone.Collection.extend({
            url: '/api/approval/drafterdeptfolder'
        });

        var TodoCountModel = Backbone.Model.extend({
            url: '/api/approval/todo/count'
        });

        var UpcomingCountModel = Backbone.Model.extend({
            url: '/api/approval/upcoming/count'
        });

        var TodoReceptionCountModel = Backbone.Model.extend({
            url: '/api/approval/todoreception/count'
        });
        
        var TodoViewerCountModel = Backbone.Model.extend({
            url: '/api/approval/todoviewer/count'
        });
        
        var ApprSideModel = Backbone.Model.extend({
            url: '/api/approval/side'
        });
        
        var ConfigModel = Backbone.Model.extend({
            url : "/api/approval/apprconfig"
        });

        var FAVORITE_STORE_KEY = GO.session("loginId") + '-appr-favorite-toggle';
        var APPROVAL_STORE_KEY = GO.session("loginId") + '-appr-approval-toggle';
        var USER_DOCFOLDER_STORE_KEY = GO.session("loginId") + '-appr-user-toggle';
        var DEPT_DOCFOLDER_STORE_KEY = GO.session("loginId") + '-appr-dept-toggle';

        var tplVar = {
            'new_approval' : approvalLang['새 결재 진행'],
            'approval' : approvalLang['결재하기'],
            '전자결재' : approvalLang['전자결재'],
            'base_docfolder' : approvalLang['기본 문서함'],
            'added_docfolder' : approvalLang['추가된 문서함'],
            'user_docfolder' : approvalLang['개인 문서함'],
            'appr_wait_doc' : approvalLang['결재 대기 문서'],
            'appr_wait_reception_doc' : approvalLang['결재 수신 문서'],
            'appr_sched_doc' : approvalLang['결재 예정 문서'],
            'draft_docfolder' : approvalLang['기안 문서함'],
            'tempsave_docfolder' : approvalLang['임시 저장함'],
            'appr_docfolder' : approvalLang['결재 문서함'],
            'viewer_docfolder' : approvalLang['참조/열람 문서함'],
            'reception_docfolder' : approvalLang['수신 문서함'],
            'admin_dept_folder' : approvalLang['부서 문서함 관리'],
            'dept_folder' : approvalLang['부서 문서함'],
            'sub_dept_folder' : approvalLang['하위 부서 문서함'],
            'dept_draft' : approvalLang['기안 완료함'],
            'dept_ref' : approvalLang['부서 참조함'],
            'dept_rcpt' : approvalLang['부서 수신함'],
            'dept_official' : approvalLang['공문 발송함'],
            'favorite_title' : commonLang['즐겨찾기'],
            'no_dept_folder' : approvalLang['부서 문서함이 존재하지 않습니다.'],
            'no_dept' : approvalLang['소속된 부서가 없습니다. 관리자에게 문의하세요.'],
            'doc_admin' : approvalLang['전자결재 문서관리'],
            'appr_form_admin' : approvalLang['양식별 문서 조회'],
            'appr_doc_admin' : approvalLang['양식별 문서 조회'],
            'appr_doc_admin_log' : approvalLang['관리자 작업기록'],
            'company_official' : approvalLang['전사 공문 발송함'],
            'user_config' : approvalLang['전자결재 환경설정'],
            'confirm' : commonLang['확인'],
            'cancel' : commonLang['취소'],
            'collapse' : commonLang['접기'],
            'expand' : commonLang['펼치기'],
            'alert_check_editor' : boardLang['현재 작성중인 내용이 있습니다.<br>화면 이동 시 작성 중인 내용은 사라집니다.<br>이동하시겠습니까?'],
            'send_docfolder' : approvalLang['발송 문서함'],
            'audit' : approvalLang['감사'],
            'shared_docfolder' : approvalLang['공유된 문서함'],
            'user_official_docfolder' : approvalLang['공문 문서함'],
            'official_todo_doc' : approvalLang['공문 대기 문서'],
            'appr_todoviewer_doc' : approvalLang['참조/열람 대기 문서']
        };

        var sideView  = Backbone.View.extend({

            favoriteFormCollection : null,
            sideDeptFolderCollection : null,
            sideDrafterDeptFolderCollection : null,
            todoCountModel : null,
            upcomingCountModel : null,
            todoReceptionCountModel : null,
            officialTodoCountModel: null,
            todoViewerCountModel : null,
            
            el : '#side',

            events: {
                "click a.go_boards[data-navi]" : "goDocList",
                "click a#writeBtn" : "sideWriteBtnAction",
                "click section.lnb span.ic_side[data-slide]" : "slideToggle",
                "click section.lnb a.txt" : "slideToggle",
                "click #favoriteSide li span.ic_list_del" : "favoriteItemDelete",
                "click span#reorderSave" : "favoriteReorderSave",
                "click span[btn-type='deptAdmin']" : "deptFolderAdmin",
                "click span[btn-type='userAdmin']" : "userFolderAdmin",
                "click #apprHome" : "apprHome"
            },

            initialize : function(options) {
				this.$el.off(); //  layout side 의 구조상 반드시 필요함
                this.options = options || {};
                this.deleteFavoriteIds = [];
                this.favoriteFormCollection = new SideFavoriteFormCollection();
                this.sideDeptFolderCollection = new SideDeptFolderCollection();
                this.sideDrafterDeptFolderCollection = new SideDrafterDeptFolderCollection();
                this.sideFavoriteFormListView = SideFavoriteFormListView;
                
                this.model = new ApprSideModel();

                this.model.fetch({async : false});
    			this.configModel = new ConfigModel(this.model.get('apprConfig'));
                this.favoriteFormCollection.set(this.model.get('favorites'));
                this.sideDeptFolderCollection.set(this.model.get('deptFolders'));
                this.sideDrafterDeptFolderCollection.set(this.model.get('drafterDeptFolders'));
                this.countFlag = true;

                GO.config("excludeExtension", this.configModel.get("excludeExtension") ? this.configModel.get("excludeExtension") : "");
            },

            render : function(reload){
            	if (reload) {
            		this.model.fetch({async : false});
            		this.favoriteFormCollection.set(this.model.get('favorites'));
                    this.sideDeptFolderCollection.set(this.model.get('deptFolders'));
                    this.sideDrafterDeptFolderCollection.set(this.model.get('drafterDeptFolders'));
                    this.configModel = new ConfigModel(this.model.get('apprConfig'));
                }
            	var addedFolder = false;
            	if(this.model.get('userFolders')){
            		addedFolder = (this.model.get('userFolders').length > 0)? true : false;
            	}
            	var sharedFolder = false;
            	if(this.model.get('sharedFoldersToUser')){
            		sharedFolder = (this.model.get('sharedFoldersToUser').length > 0)? true : false;
            	}
            	
            	var data = _.extend(this.model.toJSON(), {
                    isDocAdminSideAccessible: this.model.get('isApprDocMaster') || this.model.get('isApprFormAdmin') || this.model.get('isOfficialMaster'),
                    isApprDocumentAccessible: this.model.get('isApprDocMaster') || this.model.get('isApprFormAdmin'),
                    isOfficialDocMaster : this.model.get('isOfficialMaster'),
                    useOfficialConfirm: this.configModel.get('useOfficialConfirm'),
                    isApprDocMaster: this.model.get('isApprDocMaster'),
                    addedFolder: addedFolder,
                    sharedFolder: sharedFolder
                });
            	
            	$.each(data.sharedFoldersToUser, function(i,v) {
                	if (v.folderType == "USER") {
                		v.isfolderTypeUser = true;
                	} else {
                		v.isfolderTypeUser = false;
                	}
                });
                var sidetpl = layoutTpl({
                    lang : tplVar,
                    data : data,
                    isApprovalOpen : this.getStoredCategoryIsOpen(APPROVAL_STORE_KEY),
                    isUserOpen : this.getStoredCategoryIsOpen(USER_DOCFOLDER_STORE_KEY),
                    isDeptOpen : this.getStoredCategoryIsOpen(DEPT_DOCFOLDER_STORE_KEY),
                    appName : GO.util.getAppName("approval")
                });

                this.$el.html(sidetpl);
                this.favoriteFormRender();//즐겨찾기
                this.sideDeptFolderRender();//부서 문서함
                this.drawListCount();
                this.selectSideMenu(App.router.getUrl()); //사이드 메뉴에 highlight추가
                this.undelegateEvents();
                this.delegateEvents();
                this.openWriteLayout();

                $("body").trigger("approval.sideRender");
            },
            
            openWriteLayout: function() {
                if (GO.router.getSearch("openWriteLayout") == 'true') {
                    $('a#writeBtn', this.$el).trigger("click");
                }
            },

            deptFolderAdmin : function(e) {
                var target = $(e.currentTarget);
                var deptId = target.attr('data-deptid');
                var callback = function() {
                    App.router.navigate('approval/deptfolder/' + deptId + '/manage', true);
                };
                
                GO.util.editorConfirm(callback);
            },
            
            userFolderAdmin: function(e){
            	var target = $(e.currentTarget);
            	var callback = function() {
                    App.router.navigate('approval/userfolder/manage', true);
                };
                GO.util.editorConfirm(callback);
            },
            
            sideDeptManager : function() {
                return this.sideDeptFolderCollection.toJSON();
            },
            sideDeptFolderRender : function(reload) {
                if (reload) {
                    this.sideDeptFolderCollection = new SideDeptFolderCollection();
                    this.sideDeptFolderCollection.fetch({ async : false });
                    this.sideDrafterDeptFolderCollection = new SideDrafterDeptFolderCollection();
                    this.sideDrafterDeptFolderCollection.fetch({ async : false });
                }
                var dataset = this.sideDeptFolderCollection.toJSON(),
                containsSubDept = false;
                var addedFolder = false;
                var sharedFolder = false;
                if (!dataset.length || !GO.session('useOrg')) {
                } else {
                    $.each(dataset, function(k,v) {
                    	if (v.deptFolders.length > 0) {
                    		v.addedFolder = true;
                    	} else {
                    		v.addedFolder = false;
                    	}
                    	if (v.sharedDocFolders && v.sharedDocFolders.length > 0) {
                    		v.sharedFolder = true;
                    		$.each(v.sharedDocFolders, function(i, folder){
                    			folder.deptId = v.deptId;
                    			if (folder.folderType == "USER") {
                    				folder.isfolderTypeUser = true;
                            	} else {
                            		folder.isfolderTypeUser = false;
                            	}
                    		});
                    		
                    	} else {
                    		v.sharedFolder = false;
                    	}
                        if(v.managable && v.containsSubDept) {
                            containsSubDept = true;
                        }
                    });
                }
                
                this.$el.find('#deptDocfolderSide>ul').html(
                    tplSideDeptFolder({
                        contextRoot : GO.contextRoot,
                        dataset : dataset,
                        containsSubDept : containsSubDept,
                        lang : tplVar,
                    })
                );

            },

            drawListCount : function() {
            	var self = this;
                this.todoCountModel = new TodoCountModel();
                this.todoCountModel.fetch({ 
                	success : function(){
                		self.todoCount = self.todoCountModel.toJSON().docCount;
                        var selectedEl = self.$el.find('ul.side_depth li a[data-navi="todo"] .num');
                        if (self.todoCount > 0) {
                            selectedEl.text(self.todoCount);
                        }else{
                            selectedEl.text('');
                        }
                	}
                });
                
                this.officialTodoCountModel = new OfficialTodoCountModel();
                this.officialTodoCountModel.fetch({ 
                	success : function(){
                		self.officialTodoCount = self.officialTodoCountModel.toJSON().docCount;
                        var selectedEl = self.$el.find('ul.side_depth li a[data-navi="officialtodo"] .num');
                        if (self.officialTodoCount > 0) {
                            selectedEl.text(self.officialTodoCount);
                        }else{
                            selectedEl.text('');
                        }
                	}
                });
                
                this.upcomingCountModel = new UpcomingCountModel();
                this.upcomingCountModel.fetch({ 
                	success : function(){
                		self.upcomingCount = self.upcomingCountModel.toJSON().docCount;
                        var selectedEl = self.$el.find('ul.side_depth li a[data-navi="upcoming"] .num');
                        if (self.upcomingCount > 0) {
                            selectedEl.text(self.upcomingCount);
                        }else{
                            selectedEl.text('');
                        }
                	}
                });
                
                
                this.todoReceptionCountModel = new TodoReceptionCountModel();
                this.todoReceptionCountModel.fetch({ 
                	success : function(){
                		self.todoReceptionCount = self.todoReceptionCountModel.toJSON().docCount;
                        var selectedEl = self.$el.find('ul.side_depth li a[data-navi="todoreception"] .num');
                        if (self.todoReceptionCount > 0) {
                            selectedEl.text(self.todoReceptionCount);
                        }else{
                            selectedEl.text('');
                        }
                	}
                });
                
                this.todoViewerCountModel = new TodoViewerCountModel();
                this.todoViewerCountModel.fetch({ 
                	success : function(){
                		self.todoViewerCount = self.todoViewerCountModel.toJSON().docCount;
                        var selectedEl = self.$el.find('ul.side_depth li a[data-navi="todoviewer"] .num');
                        if (self.todoViewerCount > 0) {
                            selectedEl.text(self.todoViewerCount);
                        }else{
                            selectedEl.text('');
                        }
                	}
                });
            },
            
            documentSideMenu: function(url) {
                var isSelected = this.selectSideMenu(App.router.getUrl());
                if (!isSelected && url) {
                    this.selectSideMenu(url);
                }
            },
            
            selectSideMenu : function(url) {
            	var selectedEl = null, loadMenuArr = url.split('?')[0].split('/');
                var type = loadMenuArr[1];
                var navi = "", formId = "", deptId = "", dataId="";
                this.$el.find('.on').removeClass('on');
                if (type != null && type.indexOf("?") >=0) {
                    type = type.substr(0,type.indexOf("?"));
                }
                
                if (type != null) {
                    if (_.contains(["todo", "todoreception", "todoviewer", "officialtodo", "upcoming", "usersetting", "manage", "managelog", "manageform", "company"], type)) {
                        navi = loadMenuArr[1];
                        if (navi !=null && navi.indexOf("?") >=0) {
                            navi = navi.substr(0,navi.indexOf("?"));
                        }
                        selectedEl = this.$el.find('ul.side_depth li a[data-navi="' + navi + '"]');
                    }
                    else if (type == "doclist") {
                        // 개인문서함
                        navi = loadMenuArr[2];
                        if (navi !=null && navi.indexOf("?") >=0) {
                            navi = navi.substr(0,navi.indexOf("?"));
                        }
                        selectedEl = this.$el.find('ul.side_depth li a[data-navi="' + navi + '"]');
                    }
                    else if (type == "document" && loadMenuArr[2] == 'new') {
                        // 즐겨찾기 양식
                        navi = 'favorite';
                        deptId = loadMenuArr[3];
                        formId = loadMenuArr[4];
                        selectedEl = this.$el.find('ul.side_depth li a[data-navi="' + navi + '"][data-deptid="'+ deptId +'"][data-formid = "'+ formId+'"]');
                    }
                    else if(type == "userfolder"){
                    	//개인 문서함 - 추가된 문서함, 공유된 문서함
                    	var dataId = loadMenuArr[2];
                    	if(loadMenuArr[3] == "documents"){//추가된 문서함
                    		var navi = "userdoc";
                    		selectedEl = this.$el.find('ul.side_depth li a[data-navi="'+ navi +'"][data-id = "' + dataId + '"]');
                    	}else if(loadMenuArr[3] == "share"){//공유된 문서함
                    		var navi = "shareuserdoc";
                    		var belong = loadMenuArr[4];
                    		if(belong == "indept"){
                    			var deptId = loadMenuArr[5];
                    			selectedEl = this.$el.find('ul.side_depth li a[data-navi="'+ navi +'"][data-id = "' + dataId + '"][data-belong = "'+ belong+'"][data-deptid = "'+ deptId+'"]');
                    		}else{
                    			selectedEl = this.$el.find('ul.side_depth li a[data-navi="'+ navi +'"][data-id = "' + dataId + '"][data-belong = "'+ belong+'"]');
                    		}
                    	}
                    }
                    else if(type == "deptfolder") {
                        // 부서 문서함
                        if (_.contains(['draft', 'receive', 'reference', 'official'], loadMenuArr[2])) {
                            var navi = 'dept' + loadMenuArr[2];
                            var dataId = loadMenuArr[3];
                            selectedEl = this.$el.find('ul.side_depth li a[data-navi="' + navi + '"][data-deptid = "' + dataId + '"]');
                        } else {
                            var dataId = loadMenuArr[2];
                            if(dataId == 'subfolder'){ //하위 부서 문서함
                                selectedEl = this.$el.find('ul.side_depth li.assigned a');
                            } else {
                                if (loadMenuArr[3] == "documents") {
                                	var navi = 'deptdoc';
                                    selectedEl = this.$el.find('ul.side_depth li a[data-navi="' + navi + '"][data-id = "'+ dataId+'"]');
                                }else if(loadMenuArr[3] == "share"){// 부서_공유된 문서함
                                	var navi = 'sharedeptdoc';
                                	var belong = loadMenuArr[4];
                                	var deptId = loadMenuArr[5];
                                	selectedEl = this.$el.find('ul.side_depth li a[data-navi="'+ navi +'"][data-id = "'+ dataId+'"][data-belong = "'+ belong+'"][data-deptid = "'+ deptId+'"]');
                                }
                            }
                        }
                    }
                }
                if (!_.isNull(selectedEl)) {
                    selectedEl.parents('p:eq(0)').addClass('on');
                    return true;
                }
                return false;
            },

            favoriteFormRender : function(reload) {
                this.deleteFavoriteIds = [];
                if (reload){
                    //this.favoriteFormCollection = SideFavoriteFormCollection.getCollection();
                    this.favoriteFormCollection = new SideFavoriteFormCollection();
                    this.favoriteFormCollection.fetch({ async : false });
                };
                var favoriteFormListData = $(this.favoriteFormCollection.toJSON()).map(function(k, v) {
                    return {
                        formName : v.formName,
                        formId  : v.formId,
                        deptId : v.deptId,
                        id : v.id
                    };
                });
                this.sideFavoriteFormListView.render({
                    data : favoriteFormListData.get(),
                    isOpen : this.getStoredCategoryIsOpen(FAVORITE_STORE_KEY )
                });
            },

            favoriteItemDelete : function(e) {
                var targetEl = $(e.currentTarget).parents('li');
                this.deleteFavoriteIds.push(targetEl.attr('data-id'));
                targetEl.remove();
            },

            favoriteReorderSave : function(e) {
                var self = this, formFavoriteIds = this.sideFavoriteFormListView.getReorderIds();

                if (!this.favoriteModel){this.favoriteModel = new SideFavoriteFormModel();}

                if (this.deleteFavoriteIds.length) {
                    $.ajax({
                        "url": GO.config("contextRoot") + 'api/approval/favorite',
                        "contentType": 'application/json',
                        "dataType": "json",
                        "data": JSON.stringify({ "ids": this.deleteFavoriteIds }),
                        "type": "DELETE",
                        "success": function() {
                            self.favoriteFormRender(true);
                        }
                    });
                }
                this.sideFavoriteFormListView.destroySortable();
                if (formFavoriteIds) {
                    this.favoriteModel.set('id', '', {
                        silent : true
                    });
                    this.favoriteModel.save({
                        'ids' : formFavoriteIds
                    }, {
                        type : 'PUT',
                        success : function(model, rs) {
                            if (rs.code == 200){self.favoriteFormRender(true);}
                        }
                    });
                }
            },
            
            goDocListNavi: function(e) {
                var selectedEl = $(e.currentTarget);
                
                var url = "/approval/";
                var currentPageKeep = false;  //결재작성방식이 팝업작성이고 즐겨찾기를 클릭했을때 필요
                switch (selectedEl.attr('data-navi')) {
                	case "todo":
                		url += selectedEl.attr('data-navi') + "/all";
                        break;
                    case "upcoming":
                        url += selectedEl.attr('data-navi');
                        break;
                    case "todoreception":
                        url += selectedEl.attr('data-navi') + "/waiting";
                        break;
                    case "officialtodo":
                        url += selectedEl.attr('data-navi');
                        break;
                    case "todoviewer":
                        url += selectedEl.attr('data-navi') + "/all";
                        break;
                    case "deptdraft":
                        url += "deptfolder/draft/" + selectedEl.attr('data-deptid');
                        break;
                    case "deptreceive":
                        url += "deptfolder/receive/" + selectedEl.attr('data-deptid') + "/waiting";
                        break;
                    case "deptreference":
                        url += "deptfolder/reference/" + selectedEl.attr('data-deptid');
                        break;
                    case "deptofficial":
                        url += "deptfolder/official/" + selectedEl.attr('data-deptid') + "/all";
                        break;
                    case "userdoc":
                        url += "userfolder/" + selectedEl.attr('data-id') + "/documents";
                        break;
                    case "deptdoc":
                        url += "deptfolder/" + selectedEl.attr('data-id') + "/documents";
                        break;
                    case "shareuserdoc":
                    	if(selectedEl.attr('data-belong') == "indept"){
                    		url += "userfolder/" + selectedEl.attr('data-id') + "/share/" + selectedEl.attr('data-belong') + "/" + selectedEl.attr('data-deptid');
                    	}else{
                    		url += "userfolder/" + selectedEl.attr('data-id') + "/share/" + selectedEl.attr('data-belong');
                    	}
                        break;
                    case "sharedeptdoc":
                        url += "deptfolder/" + selectedEl.attr('data-id') + "/share/" + selectedEl.attr('data-belong') + "/" + selectedEl.attr('data-deptid');
                        break;
                    case "usersetting":
                        url += "usersetting/userconfig";
                        break;
                    case "manageform":
                        url += "manageform";
                        break;
                    case "manage":
                        url += "manage";
                        break;
                    case "company":
                    	url += "company/official";
                        break;
                    case "managelog":
                        url += "managelog";
                        break;
                    case "favorite":
                    	if (this.model.get('writeMode') == 'POPUP') {
                    		currentPageKeep = true;
                            url = GO.contextRoot + 'app/approval/document/new/popup/' + selectedEl.attr('data-deptId') + '/'+selectedEl.attr('data-formId');
                        }else{
                        	url += "document/new/"+selectedEl.attr('data-deptId')+"/"+selectedEl.attr('data-formId');
                        }
                        break;
                    case "reception":
                        url += "doclist/reception/waiting";
                        break;
                    case "send":
                        url += "doclist/send/all";
                        break;
                    case "userofficial":
                    	url += "doclist/userofficial/all";
                        break;
                    default:
                        url += "doclist/" + selectedEl.attr('data-navi') + "/all";
                        break;
                }
                //결재작성방식이 팝업작성이고 즐겨찾기를 클릭했을때는 현재페이지를 유지해야한다.
                if(currentPageKeep){
					window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
                }else{
                	this.$el.find('.on').removeClass('on');
                    selectedEl.parent().addClass('on');
	                GO.router.navigate(url, {trigger: true});
	                $('html, body').animate({
	                    scrollTop : 0
	                });
                }
            },
            
            approvalWirtePageMovePopup : function(e, type) {
                var _this = this;
                $.goPopup({
                    title : '',
                    message : tplVar.alert_check_editor,
                    modal : true,
                    buttons : [
                        {
                            'btext' : tplVar.confirm,
                            'btype' : 'confirm',
                            'callback' : function() {
//                                          window['oEditors'] = [];
                                if (type == "goDocListNavi") {
                                    _this.goDocListNavi(e);
                                } else if (type == "sideWriteBtnNavi") {
                                    _this.sideWriteBtnNavi(e);
                                }
                            }
                        },
                        {
                            'btext' : tplVar.cancel,
                            'btype' : 'normal',
                            'callback' : function() {
                            }
                        }
                    ]
                });
            },
            
            goDocList : function(e) {
                if (GO.util.hasActiveEditor()) {
                    if(GO.util.isEditorWriting()){
                        this.approvalWirtePageMovePopup(e,'goDocListNavi');
                    }else{
                        this.goDocListNavi(e);
                    }
                } else {
                    this.goDocListNavi(e);
                }
            },

            slideToggle : function(e) {
                var currentTarget = $(e.currentTarget),
                    parentTarget = currentTarget.parents('h1:first'),
                    toggleBtn = parentTarget.find(".ic_side"),
                    self = this;

                    parentTarget.next('ul').slideToggle("fast",
                        function() {
                            if ($(this).css('display') == 'block') {
                                parentTarget.removeClass("folded");
                                toggleBtn.attr("title", tplVar['collapse']);
                            } else {
                                parentTarget.addClass("folded");
                                toggleBtn.attr("title", tplVar['expand']);
                            }

                            var isApproval = parentTarget.hasClass("approval");
                            var isPersonal = parentTarget.hasClass("user");
                            var isDept = parentTarget.hasClass("org");
                            var isFavorite = parentTarget.hasClass("star");
                            var isOpen = !parentTarget.hasClass("folded");
                            if(isApproval){
                                self.storeCategoryIsOpen(APPROVAL_STORE_KEY , isOpen);
                            }else if(isPersonal){
                                self.storeCategoryIsOpen(USER_DOCFOLDER_STORE_KEY , isOpen);
                            }else if(isDept){
                                self.storeCategoryIsOpen(DEPT_DOCFOLDER_STORE_KEY , isOpen);
                            }else if(isFavorite){
                                self.storeCategoryIsOpen(FAVORITE_STORE_KEY , isOpen);
                            }
                        });
            },
            
            sideWriteBtnNavi : function(e) {
                var confirmCallback = function(rs) {
                    this.formId = $('#form_title').attr('data-formId');
                    if(!this.formId){
                        $.goError(approvalLang['양식을 선택해 주세요.']);
                        return false;
                    }
                    
                    var draftDeptId = $('#draftDeptId').val(),
                        deptFolderId = $('#deptFolderId').val(),
                        url = "/approval/document/new/";

                    var writeMode = this.model.get('writeMode');
                    if(writeMode == 'POPUP') {
                    	url = GO.contextRoot + 'app' + url + 'popup/';
                    }
                    url = url + draftDeptId + "/" + this.formId;
                    if ($.isNumeric(deptFolderId)) {
                        url += "?deptFolderId=" + deptFolderId;
                    }
                    console.log(url);
                    if (writeMode == 'POPUP') {
                        window.open(url, '','location=no, directories=no,resizable=yes,status=no,toolbar=no,menubar=no, width=1280,height=650,left=0, top=0, scrollbars=yes');
                    } else {
                        App.router.navigate(url, {trigger: true});
                        $('html, body').animate({
                            scrollTop : 0
                        });
                    }
                    
                    rs.close();
                };
                
                //새 결제 진행 버튼 이벤트
                var newDocumentLayer = $.goPopup({
                    "pclass" : "layer_normal layer_doc_choice",
                    "header" : approvalLang["결재양식 선택"],
                    "modal" : true,
                    "width" : 700,
                    "contents" :  "",
                    "buttons" : [
                        {
                            'btext' : commonLang["확인"],
                            'btype' : 'confirm',
                            'autoclose' : false,
                            'callback' : $.proxy(confirmCallback, this)
                        },
                        {
                            'btext' : commonLang["취소"],
                            'btype' : 'cancel'
                        }
                    ]
                });

                var newDocumentLayerView = new NewDocumentLayerView({
                    deptFolderInfos : this.sideDeptFolderCollection.toJSON(),
                    drafterDeptFolderInfos : this.sideDrafterDeptFolderCollection.toJSON(),
                    saveFavoriteCallBack : $.proxy(
                        this.favoriteFormRender, this)
                });
                
                newDocumentLayerView.render();
                newDocumentLayer.reoffset();
            },
            
            sideWriteBtnAction : function(e) {
                if (GO.util.hasActiveEditor()) {
                    if(GO.util.isEditorWriting()){
                        this.approvalWirtePageMovePopup(e,'sideWriteBtnNavi');
                    }else{
                        this.sideWriteBtnNavi(e);
                    }
                } else {
                    this.sideWriteBtnNavi(e);
                }
            },
            
            release: function() {
                // 하위뷰 해제
                //this.childView.release();

                this.$el.off();
                this.$el.empty();
                //this.remove();
            },

            getStoredCategoryIsOpen: function(store_key) {
            	var isOpen = GO.util.store.get(store_key);
            	if(isOpen == null){
            		isOpen = true;
            	}
                return isOpen;
            },

            storeCategoryIsOpen: function(store_key, isOpen) {
            	GO.util.store.set(store_key, isOpen);
            },
            
            
            apprHome : function() {
                var callback = function() {
                    App.router.navigate(GO.contextRoot + "approval", true);
                };
                GO.util.editorConfirm(callback);
            }
        }, {
            __instance__: null,

            getInstance: function() {
                this.__instance__ = new this.prototype.constructor();
               return this.__instance__;
            },
            getManageble: function(){
                if(this.__instance__ === null) {
                    this.__instance__ = new this.prototype.constructor();
                }
                return this.__instance__.sideDeptManager();
            },
            renderDeptFolder: function(reload){
                if(this.__instance__ === null) {
                    this.__instance__ = new this.prototype.constructor();
                }
                this.__instance__.sideDeptFolderRender(reload);
            },
            reload: function(reload){
                if(this.__instance__ === null) {
                    this.__instance__ = new this.prototype.constructor();
                }
                this.__instance__.render(reload);
            },
            apprSelectSideMenu: function(url){
                if(this.__instance__ === null) {
                    this.__instance__ = new this.prototype.constructor();
                }
                this.__instance__.documentSideMenu(url);
            },

            getStoredCategoryIsOpen: function(store_key) {
            	var isOpen = GO.util.store.get(store_key);
            	if(isOpen == null){
            		isOpen = true;
            	}
                return isOpen;
            },

            storeCategoryIsOpen: function(store_key, category) {
            	GO.util.store.set(store_key, category);
            }
        });
        return sideView;
    });
}).call(this);