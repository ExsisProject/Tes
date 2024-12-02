	define([
	        "views/layouts/mobile_default",
	        "i18n!nls/commons",
	        "approval/views/mobile/m_side",
	        "approval/views/mobile/m_company_doc_side"
    ],
    function(
    		MobileLayout,
    		commonLang,
    		SideView,
    		CompanyDocSideView
    ) {
			var appName = 'approval'; //전자결재 appname
			var companyDocAppName = 'docfolder'; //전사문서함 appname
			var LayoutView = MobileLayout.create();

			var Controller = {
				renderSideMenu : function() {
					var SideMenuView = SideView.create(appName);
					if($('body').data('sideApp') != appName) {
						SideMenuView.render().done(function(sideMenu) {
							var sideEl = LayoutView.getSideContentElement().append(sideMenu.el);
							GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
							sideEl.parent().hide();
							LayoutView.getContentBodyElement().addClass("go_approval");
						});
					} else {
						return;
					}
				},

				renderCompanyDocSide : function() {
					var SideCompanytMenuView = CompanyDocSideView.create(companyDocAppName);
					if($('body').data('sideApp') != companyDocAppName) {
						SideCompanytMenuView.render().done(function(sideMenu) {
							var sideEl = LayoutView.getSideContentElement().append(sideMenu.el);
							GO.EventEmitter.trigger('common', 'layout:initSideScroll', this);
							sideEl.parent().hide();
						});
					} else {
						return;
					}
				},
				render: function() {
					require(["approval/views/mobile/m_todo_doclist"], function(HomeListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new HomeListView();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByDraft: function() {
					require(["approval/views/mobile/m_draft_doclist"], function(DraftListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new DraftListView();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByDocumentInit: function(deptId,formId){
					require(["approval/views/mobile/document/m_main"], function(DocumentViewer) {
						LayoutView.render(appName).done(function(layout) {
							var view = new DocumentViewer({
								type : 'CREATE',
								formId : formId,
								deptId : deptId
							});
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByTodo : function(){
					require(["approval/views/mobile/m_todo_doclist"], function(TodoListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new TodoListView();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByTodoReception : function(){
					require(["approval/views/mobile/m_todo_reception_doclist"], function(TodoReceptionListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new TodoReceptionListView();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByOfficialTodo : function(){
					require(["approval/views/mobile/m_official_todo_doclist"], function(OfficialTodoListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new OfficialTodoListView();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByTodoViewer : function(){
					require(["approval/views/mobile/m_todo_viewer_doclist"], function(TodoViewerListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new TodoViewerListView();

							view.render();
							Controller.renderSideMenu();
						});
					});
				},
				renderByTempSave : function(){
					require(["approval/views/mobile/m_tempsave_doclist"], function(TempSaveListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new TempSaveListView();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},
				renderByDocumentReapply: function(docId) {
					require(["approval/views/mobile/document/m_main"], function(DocumentViewer) {
						LayoutView.render(appName).done(function(layout) {
							var view = new DocumentViewer({
								type : 'REAPPLY',
								docId : docId
							});
							view.render();
							Controller.renderSideMenu();
						});
					});
				},
				renderByUpcoming : function(){
					require(["approval/views/mobile/m_upcoming_doclist"], function(UpcomingListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new UpcomingListView();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByApprove : function(){
					require(["approval/views/mobile/m_approval_doclist"], function(ApprovalListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new ApprovalListView();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByViewer : function(){
					require(["approval/views/mobile/m_viewer_doclist"], function(ViewerListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new ViewerListView();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByReception : function(){
                    require(["approval/views/mobile/m_reception_doclist"], function(ReceptionListView) {
                        LayoutView.render(appName).done(function(layout) {
                            var view = new ReceptionListView();
                            view.render();
                            Controller.renderSideMenu();
                        });
                    });
                },

                renderBySend : function(){
                    require(["approval/views/mobile/m_send_doclist"], function(SendListView) {
                        LayoutView.render(appName).done(function(layout) {
                            var view = new SendListView();
                            view.render();
                            Controller.renderSideMenu();
                        });
                    });
                },

                renderByUserOfficial : function(){
                    require(["approval/views/mobile/m_user_official_doclist"], function(UserOfficialListView) {
                        LayoutView.render(appName).done(function(layout) {
                            var view = new UserOfficialListView();
                            view.render();
                            Controller.renderSideMenu();
                        });
                    });
                },

                renderOfficialDocumentViewer: function(officialId) {			//공문서 상세 조회
					require(["approval/views/mobile/official_document/m_main"], function(OfficialDocumentView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new OfficialDocumentView({officialId : officialId});
								view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderDocumentViewer: function(docId) {					// 문서 상세 조회
					require(["approval/views/mobile/document/m_main"], function(MainView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new MainView({docId : docId});
								view.render();
							layout.getSearchWrapElement().hide();
							Controller.renderSideMenu();
						});
					});
				},

				renderDocumentCommentsViewer: function(docId) {					// 문서 상세 조회
					require(["approval/views/mobile/document/m_main"], function(MainView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new MainView({docId : docId, isComments : true});
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByDocumentResult : function(){
					require(["approval/views/mobile/m_search_result"], function(searchResult) {
						LayoutView.render(appName).done(function(layout) {
							var view = new searchResult();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByCompanyDocumentResult : function(){
					require(["approval/views/mobile/m_search_result"], function(searchResult) {
						LayoutView.render(companyDocAppName).done(function(layout) {
							var view = new searchResult();
							view.render();
							Controller.renderCompanyDocSide();
						});
					});
				},

				renderByCompanyDocFolder : function(){
					require(["approval/views/mobile/m_company_doc_home"], function(CompanyDocHomeView) {
						LayoutView.render(companyDocAppName).done(function(layout) {
							var view = new CompanyDocHomeView();
							view.render();
							Controller.renderCompanyDocSide();
						});
					});
				},

				renderByCompanyDocList : function(folderId){
					require(["approval/views/mobile/m_company_doc_list"], function(CompanyDocHomeView) {
						LayoutView.render(companyDocAppName).done(function(layout) {
							var view = new CompanyDocHomeView({folderId : folderId});
							view.render();
							Controller.renderCompanyDocSide();
						});
					});
				},

				renderByUserFolderDocList: function(folderId) {
					require(["approval/views/mobile/m_user_folder_doclist"], function(UserFolderDocListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new UserFolderDocListView({ type:'userdoc', folderId : folderId });
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByDeptFolderDocList: function(folderId, deptId) {
					require(["approval/views/mobile/m_dept_folder_doclist"], function(DeptFolderDocListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new DeptFolderDocListView({ type:'deptdoc', folderId : folderId, deptId : deptId });
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByUserShareFolderDocList: function(type, folderId, belong) {
					require(["approval/views/mobile/m_share_folder_doclist"], function(ShareFolderDocListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new ShareFolderDocListView({ type: type, folderId: folderId, belong: belong });
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByDeptShareFolderDocList: function(type, folderId, belong, deptId) {
					require(["approval/views/mobile/m_share_folder_doclist"], function(ShareFolderDocListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new ShareFolderDocListView({ type: type, folderId: folderId, belong: belong, deptId: deptId });
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByDeptDraftDocList: function(deptId) {
					require(["approval/views/mobile/m_dept_folder_doclist"], function(DeptFolderDocListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new DeptFolderDocListView({ type: 'deptdraft', deptId : deptId });
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByDeptReferenceDocList: function(deptId) {
					require(["approval/views/mobile/m_dept_folder_doclist"], function(DeptFolderDocListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new DeptFolderDocListView({ type: 'deptreference', deptId : deptId });
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByDeptOfficialDocList: function(deptId) {
                    require(["approval/views/mobile/m_dept_folder_doclist"], function(DeptFolderDocListView) {
                        LayoutView.render(appName).done(function(layout) {
                            var view = new DeptFolderDocListView({ type: 'deptofficial', deptId : deptId });
                            view.render();
                            Controller.renderSideMenu();
                        });
                    });
                },

				renderByDeptReceiveDocList: function(deptId, type) {
					require(["approval/views/mobile/m_reception_doclist"], function(ReceptionListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new ReceptionListView({ deptId : deptId });
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderByChildDeptFolder : function(folderId, deptId) {
					require(["approval/views/mobile/m_child_dept_folder"], function(SubFolderDocListView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new SubFolderDocListView();
							view.render();
							Controller.renderSideMenu();
						});
					});
				},

				renderCompanyDocumentViewer : function(docId) {					// 문서 상세 조회
					require(["approval/views/mobile/document/m_main"], function(MainView) {
						LayoutView.render(companyDocAppName).done(function(layout) {
							var view = new MainView({docId : docId});
							view.render();
							layout.getSearchWrapElement().hide();
							Controller.renderCompanyDocSide();
						});
					});
				},

                reply : function(docId) {
                    require(["approval/views/mobile/document/m_reply"], function(ReplyView) {
                        LayoutView.render(appName).done(function(layout) {
                            var view = new ReplyView({docsInfoId : docId});
                            view.render();
                        });
                    });
                },
				
				renderByDocumentIntegration: function(docId) {					// 문서 연동
					require(["approval/views/mobile/document/m_main"], function(MainView) {
						LayoutView.render(appName).done(function(layout) {
							var view = new MainView({type : 'INTEGRATION', docId : docId});
							view.render();
							layout.getSearchWrapElement().hide();
							Controller.renderSideMenu();
						});
					});
				}
			};

			return Controller;
		});
