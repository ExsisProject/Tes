(function() {

	define([
	        "approval/views/layouts/defaults",
	        "views/layouts/popup_default",
			"approval/components/layoutEventListener",
			"jquery.go-preloader",
			"jquery.go-popup",
		    "jquery.go-orgslide"
    ],

    function(
    		DefaultLayout,
    		PopupDefaultLayout
    ) {
		var ApprovalController = (function() {
			var Controller = function() {

			};

			Controller.prototype = {
				render: function() {
					require(["approval/views/home/main"], function(HomeView) {
						var layout = DefaultLayout.getInstance();
						layout.initSide();
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new HomeView(); 
							layout.contentView.render();
						});
					});
				},

				renderByTodo: function(type) {
					require(["approval/views/doclist/todo_doclist"], function(TodoListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new TodoListView({ type : type });
							layout.contentView.render();
						});
					});
				},
				renderByTodoReception: function(type) {
					require(["approval/views/doclist/todo_reception_doclist"], function(TodoReceptionListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new TodoReceptionListView({ type : type });
							layout.contentView.render();
						});
					});
				},
				
				renderByOfficialTodo: function(type) {
					require(["approval/views/doclist/official_todo_doclist"], function(OfficialTodoListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new OfficialTodoListView({ type : type });
							layout.contentView.render();
						});
					});
				},
				
				renderByTodoViewer: function(type) {
					require(["approval/views/doclist/todo_viewer_doclist"], function(TodoViewerListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new TodoViewerListView({ type : type });
							layout.contentView.render();
						});
					});
				},
				
				renderByUpcoming: function() {
					require(["approval/views/doclist/upcoming_doclist"], function(UpcomingListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new UpcomingListView();
							layout.contentView.render();
						});
					});
				},
				
				renderByDraft: function(type) {
					require(["approval/views/doclist/draft_doclist"], function(DraftListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DraftListView({ type : type });
							layout.contentView.render();
						});
					});
				},
				
				renderByTempSave: function(type) {
					require(["approval/views/doclist/tempsave_doclist"], function(TempSaveListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new TempSaveListView({ type : type });
							layout.contentView.render();
						});
					});
				},
				
				renderByApprove: function(type) {
					require(["approval/views/doclist/approval_doclist"], function(ApproveListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new ApproveListView({ type : type });
							layout.contentView.render();
						});
					});
				},
				
				renderByViewer: function(type) {
					require(["approval/views/doclist/viewer_doclist"], function(ViewerListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new ViewerListView({ type : type });
							layout.contentView.render();
						});
					});
				},
				
				renderByReception: function(type) {
					require(["approval/views/doclist/reception_doclist"], function(ReceptionListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new ReceptionListView({ type : type });
							layout.contentView.render();
						});
					});
                },
                
				renderBySend: function(type) {
					require(["approval/views/doclist/send_doclist"], function(SendListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new SendListView({ type : type });
							layout.contentView.render();
						});
					});
                },
                
                renderByUserOfficial: function(type) {
					require(["approval/views/doclist/user_official_doclist"], function(UserOfficialListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new UserOfficialListView({ type : type });
							layout.contentView.render();
						});
					});
                },
                
				renderByDocumentInit: function(deptId, formId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentViewer({ 
								type : 'CREATE', 
								formId : formId, 
								deptId : deptId
							});
							layout.contentView.render();
						});
					});
				},
				
				renderByDocumentInitPopup: function(deptId, formId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						var layout = DefaultLayout.getInstance({
							isPopup : true
						});
						layout.initDefaultMarkup();
						layout.destroyContent();
						layout.contentView = new DocumentViewer({
		                    type : 'CREATE',
		                    formId : formId,
		                    deptId : deptId,
		                    isPopup : true
						});
						layout.contentView.render();
					});
				},
				
				renderByDocumentReapply: function(docId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentViewer({ type : 'REAPPLY', docId : docId });
							layout.contentView.render();
						});
					});
				},
				
				renderByDocumentReapplyPopup: function(docId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						var layout = DefaultLayout.getInstance({
							isPopup : true
						});
						layout.initDefaultMarkup();
						layout.destroyContent();
						layout.contentView = new DocumentViewer({
		                    type : 'REAPPLY',
		                    docId : docId,
		                    isPopup : true
		                });
						layout.contentView.render();
					});
				},
				
				renderByDocumentIntegration: function(docId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentViewer({ type : 'INTEGRATION', docId : docId });
							layout.contentView.render();							
						});
					});
				},
				
				renderOfficialDocumentViewer: function(officialId) {
					require(["approval/views/official_document/main"], function(OfficialDocumentView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new OfficialDocumentView({officialId : parseDocId(officialId) });
							layout.contentView.render();							
						});
					});
				},
				
				renderOfficialDocumentViewerPopup: function(officialId) {
					require(["approval/views/official_document/main"], function(OfficialDocumentView) {
						var layout = DefaultLayout.getInstance({
							isPopup : true
						});
						layout.initDefaultMarkup();						
						layout.destroyContent();
						layout.contentView = new OfficialDocumentView({
		                	officialId : parseDocId(officialId),
		                    isPopup : true
		                });
		                window.contactGoSlideMessage = function(msg, type){
		                    $.goSlideMessage(msg, type || 'caution');
		                };
						layout.contentView.render();	
					});
				},
				
				renderOfficialDocumentViewerPopupPrint: function(docId) {
					require(["approval/views/official_document/official_preview"], function(OfficialPreview) {
						var layout = DefaultLayout.getInstance({
							isPopup : true
						});
						layout.initPrintPopMarkup();
						layout.destroyContent();
						layout.contentView = new OfficialPreview({
		                	docId : parseDocId(docId),
		                    isPopup : true
		                });
		                window.contactGoSlideMessage = function(msg, type){
		                    $.goSlideMessage(msg, type || 'caution');
		                };
						layout.contentView.render();
					});
				},
				
				renderDocumentViewer: function(docId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentViewer({ type : 'DOCUMENT', docId : parseDocId(docId) });
							layout.contentView.render();	
						});
					});
				},
				
				renderDocumentViewerPopup: function(docId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						var layout = DefaultLayout.getInstance({
							isPopup : true
						});
						layout.initDefaultMarkup();
						layout.destroyContent();
						layout.contentView = new DocumentViewer({
		                    type : 'DOCUMENT',
		                    docId : docId,
		                    isPopup : true
		                });
		                window.contactGoSlideMessage = function(msg, type){
		                    $.goSlideMessage(msg, type || 'caution');
		                };
						layout.contentView.render();	
					});
				},
				
				renderByDocumentIntegrationPopup: function(docId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						var layout = DefaultLayout.getInstance({
							isPopup : true
						});
						layout.initDefaultMarkup();
						layout.destroyContent();
						layout.contentView = new DocumentViewer({
		                    type : 'INTEGRATION',
		                    docId : docId,
		                    isPopup : true
		                });
		                window.contactGoSlideMessage = function(msg, type){
		                    $.goSlideMessage(msg, type || 'caution');
		                };
						layout.contentView.render();
					});
				},

                renderVersionDocumentViewerPopupPrint: function(docId, version) {
                    require([
                        'approval/views/document/version_document_print'
					], function(VersionDocumentPrintView) {
                        var layout = DefaultLayout.getInstance({
                            isPopup: true
                        });
                        layout.initPrintPopMarkup();
                        layout.destroyContent();
                        var view = new VersionDocumentPrintView({docId: docId, version: version});
                        view.setElement($('#content'));
                        view.render();

                        window.contactGoSlideMessage = function(msg, type) {
                            $.goSlideMessage(msg, type || 'caution');
                        };
                    });
                },
				
				renderDocumentViewerPopupPrint: function(docId) {
					require(["approval/views/document/print_main"], function(DocumentPrintView) {
						var layout = DefaultLayout.getInstance({
							isPopup : true
						});
						layout.initPrintPopMarkup();
						layout.destroyContent();
						layout.contentView = new DocumentPrintView({
		                    type : 'DOCUMENT',
		                    docId : docId,
		                    isPopup : true
		                });
		                window.contactGoSlideMessage = function(msg, type){
		                    $.goSlideMessage(msg, type || 'caution');
		                };
						layout.contentView.render();
					});
				},
				
				renderDocumentViewerPreview: function(docId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						var layout = DefaultLayout.getInstance({
							isPopup : true,
							isPreview : true
						});
						layout.initPrintPopMarkup();
						layout.destroyContent();
						layout.contentView =  new DocumentViewer({
		                    type : 'DOCUMENT',
		                    docId : docId,
		                    isPopup : true,
		                    isPreview : true
		                });
		                window.contactGoSlideMessage = function(msg, type){
		                    $.goSlideMessage(msg, type || 'caution');
		                };
						layout.contentView.render();
						$("div.tool_bar").remove();
					});
				},
				
				renderDocumentViewerPreviewReference: function(docId, refDocId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						var layout = DefaultLayout.getInstance({
							isPopup : true
						});
						layout.initDefaultMarkup();
						layout.destroyContent();
						layout.contentView = new DocumentViewer({
		                    type : 'DOCUMENT',
		                    docId : docId,
		                    refDocId : refDocId,
		                    isPopup : true
		                });
		                window.contactGoSlideMessage = function(msg, type){
		                    $.goSlideMessage(msg, type || 'caution');
		                };
		                layout.contentView.render();
					});
                },
                
				renderCompanyDocumentViewer: function(docId) {
					require(["approval/views/document/main"], function(DocumentViewer) {
						
						DefaultLayout.render({isCompanyDocFolder : true}).done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentViewer({ docId : parseDocId(docId) });
							layout.contentView.render();	
						});
					});
				},
				
				renderByDeptDraftDocList: function(deptId) {
					require(["approval/views/doclist/dept_folder_doclist"], function(DeptFolderDocListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DeptFolderDocListView({ type:'deptdraft', deptId : deptId });
							layout.contentView.render();
						});
					});
				},
				
				renderByDeptReceiveDocList: function(deptId, type) {
					require(["approval/views/doclist/dept_reception_doclist"], function(DeptReceptionListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DeptReceptionListView({ type: type, deptId : deptId });
							layout.contentView.render();
						});
					});
				},
				
				renderByDeptReferenceDocList: function(deptId) {
					require(["approval/views/doclist/dept_folder_doclist"], function(DeptFolderDocListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DeptFolderDocListView({ type:'deptreference', deptId : deptId });
							layout.contentView.render();
						});
					});
				},
				
				renderByDeptOfficialDocList: function(deptId) {
					require(["approval/views/doclist/dept_folder_doclist"], function(DeptFolderDocListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DeptFolderDocListView({ type:'deptofficial', deptId : deptId });
							layout.contentView.render();
						});
					});
                },
                
                renderByUserFolderDocList: function(folderId) {
					require(["approval/views/doclist/user_folder_doclist"], function(UserFolderDocListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new UserFolderDocListView({ type:'userfolder', folderId : folderId });
							layout.contentView.render();
						});
					});
				},
				
                renderByDeptFolderDocList: function(folderId) {
					require(["approval/views/doclist/dept_folder_doclist"], function(DeptFolderDocListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DeptFolderDocListView({ type:'deptfolder', folderId : folderId});
							layout.contentView.render();
						});
					});
				},
				
				renderByUserShareFolderDocList: function(type, folderId, belong) {
					require(["approval/views/doclist/share_folder_doclist"], function(ShareFolderDocListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new ShareFolderDocListView({ type: type, folderId: folderId, belong: belong});
							layout.contentView.render();
						});
					});
				},
				
				renderByDeptShareFolderDocList: function(type, folderId, belong, deptId) {
					require(["approval/views/doclist/share_folder_doclist"], function(ShareFolderDocListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new ShareFolderDocListView({ type: type, folderId: folderId, belong: belong, deptId: deptId });
							layout.contentView.render();
						});
					});
				},
				
				renderByDeptFolderAdmin: function(deptId) {
					require(["approval/views/dept_folder_manage"], function(DeptFolderAdminView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DeptFolderAdminView({ deptId : deptId });
							layout.getContentElement().html(layout.contentView.el);
							layout.contentView.render();
						});
					});
				},
				
				renderByDocClassifyAdmin : function(deptId) {
					require(["approval/views/doc_classify_manage"], function(UserFolderClassifyAdminView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new UserFolderClassifyAdminView({ deptId : deptId });
							layout.getContentElement().html(layout.contentView.el);
							layout.contentView.render();
						});
					});
				},
				renderByUserFolderAdmin: function() {
					require(["approval/views/user_folder_manage"], function(UserFolderAdminView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new UserFolderAdminView();
							layout.getContentElement().html(layout.contentView.el);
							layout.contentView.render();
						});
					});
				},
				renderByChildDeptFolder: function() {
					require(["approval/views/doclist/child_dept_folder"], function(ChildDeptFolderView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new ChildDeptFolderView();
							layout.contentView.render();
						});
					});
				},
				
				renderDeptFolderList: function(deptId) {
					require(["approval/views/doclist/child_dept_folder"], function(ChildDeptFolderView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new ChildDeptFolderView(deptId);
							layout.contentView.render();
						});
					});
				},
				
				renderByUserConfig: function() {
					require(["approval/views/user_config"], function(UserConfigView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new UserConfigView();
							layout.contentView.render();
						});
					});
				},
				
				renderByDeputy: function() {
					require(["approval/views/user_deputy"], function(UserDeputy) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new UserDeputy();
							layout.contentView.render();
						});
					});
				},
				
				renderRegistDeputy: function() {
					require(["approval/views/regist_deputy_form"], function(RegistDeputy) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new RegistDeputy();
							layout.contentView.render();
						});
					});
				},
				
				renderByApprovalDocumentManage: function() {
					require(["approval/views/appr_doc_manage_list"], function(DocumentManageListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentManageListView({ type: 'docMaster' });
							layout.contentView.render();
						});
					});
				},
				
				renderByApprovalDocumentManageWithFormAdmin: function() {
					require(["approval/views/appr_doc_manage_list"], function(DocumentManageListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentManageListView({ type: 'formAdmin' });
							layout.contentView.render();
						});
					});
                },
                
				renderByApprovalDocumentManageView: function(docId) {
					require(["approval/views/document_manage_show"], function(DocumentManageShowView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentManageShowView({
			                    viewerType: 'docmaster',
			                    docId : parseDocId(docId)
			                });
							layout.contentView.render();
						});
					});
				},
				
				renderByApprovalDocumentManageViewWithFormAdmin: function(docId) {
					require(["approval/views/document_manage_show"], function(DocumentManageShowView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentManageShowView({
			                    viewerType: 'formadmin',
			                    docId : parseDocId(docId)
			                });
							layout.contentView.render();
						});
					});
                },
                
                renderByCompanyOfficialDocumentList: function() {
					require(["approval/views/company_official_manage_list"], function(CompanyOfficialManageListView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new CompanyOfficialManageListView();
							layout.contentView.render();
						});
					});
                },
                
                renderByCompanyOfficialDocumentShow: function(docId) {
					require(["approval/views/document_manage_show"], function(DocumentManageShowView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentManageShowView({
			                    viewerType: 'officialdocmaster',
			                    docId : parseDocId(docId)
			                });
							layout.contentView.render();
						});
					});
                },
                
				renderByApprovalDocumentManageLog: function() {
					require(["approval/views/appr_doc_manage_log"], function(DocumentManageLog) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentManageLog();
							layout.contentView.render();
						});
					});
				},
				
				renderModifyDeputy: function(deputyId) {
					require(["approval/views/modify_deputy_form"], function(ModifyDeputy) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new ModifyDeputy({deputyId : deputyId});
							layout.contentView.render();
						});
					});
				},
				
				renderByCompanyDocFolder: function() {
					require(["approval/views/doclist/company_doc_home"], function(CompanyDocHomeView) {
						DefaultLayout.render({isCompanyDocFolder : true}).done(function(layout) {
							layout.destroyContent();
							layout.contentView = new CompanyDocHomeView();
							layout.contentView.render();
						});
					});
				},
				
				renderByCompanyDocList: function(folderId) {
					require(["approval/views/doclist/company_doc_list"], function(CompanyDocListView) {
						DefaultLayout.render({isCompanyDocFolder : true, folderId : folderId}).done(function(layout) {
							layout.destroyContent();
							layout.contentView = new CompanyDocListView({ folderId : folderId });
							layout.contentView.render();
						});
					});
				},
				renderByDocumentResult: function() {
					require(["approval/views/doc_result_list"], function(DocumentResultView) {
						DefaultLayout.render().done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentResultView();
							layout.contentView.render();
						});
					});
				},
				
				renderByCompanyDocumentResult: function() {
					require(["approval/views/doc_result_list"], function(DocumentResultView) {
						DefaultLayout.render({isCompanyDocFolder : true}).done(function(layout) {
							layout.destroyContent();
							layout.contentView = new DocumentResultView();
							layout.contentView.render();
						});
					});
				},
				
				renderPopupHelp: function(formId) {
					this.popupRenderer("approval/views/help", formId);
				},
				
				popupRenderer : function(contentsPath, option) {
                    require([contentsPath], function(ContentsView) {
                        PopupDefaultLayout.render().done(function(layout) {
                            ContentsView.render(option);
                        });
                    });
                },
			};
			
			// GO-16866 이슈 처리(by Bongsu Kang, kbsbroad@daou.co.kr)
			// 412735?page=0&offset=20&property=draftedAt&direction=desc&searchtype=&keyword=
			// URL에 이런 형식으로 있을 때 docId에 파라미터까지 모두 포함되어서 수정/삭제시 처리되지 않는 현상을 수정하기 위함
			// 현재는 renderDocumentViewer에만 적용함
			function parseDocId(strDocId) {
				var result = strDocId;
				
				if(strDocId.indexOf('?') > -1) {
					var tokens = strDocId.split('?');
					result = tokens[0];
				}
				
				return result;
			}

			return Controller;
		})();

		return new ApprovalController();
	});

}).call(this);