(function() {
	define([
	        "jquery",
	        "backbone",
	        "app",
	        "approval/views/apprform/appr_company_folder_tree",
	        "hgn!approval/templates/side_company_doc_folder",
			"i18n!nls/commons",
	        "i18n!approval/nls/approval",
			"GO.util"
    ],
	function(
			$,
			Backbone,
			App,
			CompanyDocTreeTreeView,
			layoutTpl,
			commonLang,
			approvalLang
	) {

		var tplVar = {
				'company_docfolder' : approvalLang['전사 문서함'],
				'new_approval' : approvalLang['새 결재 진행'],
				'approval' : approvalLang['결재하기'],
				'user_docfolder' : approvalLang['개인 문서함'],
				'appr_wait_doc' : approvalLang['결재 대기 문서'],
				'appr_sched_doc' : approvalLang['결재 예정 문서'],
				'draft_docfolder' : approvalLang['기안 문서함'],
				'appr_docfolder' : approvalLang['결재 문서함'],
				'viewer_docfolder' : approvalLang['참조 문서함'],
	            'reception_docfolder' : approvalLang['수신 문서함'],
				'dept_rcpt' : approvalLang['부서 수신함'],
				'dept_folder' : approvalLang['부서 문서함'],
				'sub_dept_folder' : approvalLang['하위 부서 문서함'],
				'favorite_title' : commonLang['즐겨찾기'],
				'no_dept' : approvalLang['소속된 부서가 없습니다. 관리자에게 문의하세요.'],
				'user_config' : approvalLang['결재환경설정'],
				'confirm' : commonLang['확인'],
				'cancel' : commonLang['취소'],
				'collapse' : commonLang['접기'],
				'expand' : commonLang['펼치기']
		};


		var companyFolderManager = Backbone.Model.extend({
			url: '/api/approval/companyfolder/ismanager'
		});

        var DOCFOLDER_STORE_KEY = GO.session("id") + '-docfolder-folder-toggle';

		var sideView  = Backbone.View.extend({

			companyDocTreeView : null,
			el : '#side',

			events: {
				"click section#companyDocSide span.ic_side, section#companyDocSide span.txt" : "slideToggle"
			},

			initialize : function() {
				this.$el.off(); //  layout side 의 구조상 반드시 필요함
				this.companyFolderManager = new companyFolderManager();
				this.companyFolderManager.fetch({
					async:false,
					statusCode: {
	                    403: function() { GO.util.error('403'); },
                        404: function() { GO.util.error('404', { "msgCode": "400-common"}); },
                        500: function() { GO.util.error('500'); }
	                }
				});
				this.isCompanyFolderManager = this.companyFolderManager.toJSON().manager;
			},

			render : function(folderId){
			    var isOpen = this.getStoredCategory(DOCFOLDER_STORE_KEY);
				var sidetpl = layoutTpl({
					lang : tplVar,
					appName : GO.util.getAppName("docfolder"),
                    isOpen : _.isUndefined(isOpen) ? true : isOpen
				});

	    		this.$el.html(sidetpl);

				//부서 문서함
				this.sideCompanyDocRender(folderId);

				//TODO : 메뉴 선택 (이걸 어떻게 해야 할까나..)

				// event 설정 (init 을 하지 않으면 event 가 작동 않합니다.)
				this.undelegateEvents();
				this.delegateEvents();
			},

			sideCompanyDocRender : function(folderId) {

				var self = this;
				this.companyDocTreeView = new CompanyDocTreeTreeView({
	                isAdmin: false,
	                folderId : folderId,
	                disabledSelect : false,
	                apiCommonUrl : 'api/docfolder/sidetree',
	                treeElementId: 'companyDocTree',
	                selectCallback :function(data){
	                	self.goCompanyDocList(data.id);
	                }
				});

				this.companyDocTreeView.render();

			},
			
			setSelectFolderStyle : function(folderId){
				if(this.companyDocTreeView){
					this.companyDocTreeView._highlightStyle(folderId);
				}
			},

			sideCompanyDocManager : function() {
				return this.isCompanyFolderManager;
			},

			goCompanyDocList : function(id){
				var	url = "/docfolder/" + id  + "/documents";
				App.router.navigate(url, {trigger: true});

				$('html, body').animate({
					scrollTop : 0
				});
			},

			slideToggle : function(e) {
                var currentTarget = $(e.currentTarget),
                    parentTarget = currentTarget.parents('h1:first'),
                    toggleBtn = parentTarget.find('.ic_side');

                if(parentTarget.hasClass("folded")) {
                    parentTarget.removeClass("folded");
                    toggleBtn.attr("title", tplVar['collapse']);
                } else {
                    parentTarget.addClass("folded");
                    toggleBtn.attr("title", tplVar['expand']);
                }
                parentTarget.next('ul').slideToggle("fast");

                var isOpen = !parentTarget.hasClass("folded");
                this.storeCategoryIsOpen(DOCFOLDER_STORE_KEY, isOpen);
			},

			release: function() {
				// 하위뷰 해제
				//this.childView.release();

				this.$el.off();
				this.$el.empty();
				//this.remove();
			},

            getStoredCategory: function(store_key) {
                return GO.util.store.get(store_key);
            },
            storeCategoryIsOpen: function(store_key, isOpen) {
                GO.util.store.set(store_key, isOpen);
            },

		}, {
            __instance__: null,

            getInstance: function() {
            	this.__instance__ = new this.prototype.constructor();
               return this.__instance__;
            },
			getCompanyDocManageble: function(){
	        	if(this.__instance__ === null) {
	            	this.__instance__ = new this.prototype.constructor();
	            }
	        	return this.__instance__.sideCompanyDocManager();
	        }
        });
//		this.render();
		return sideView;
	});
}).call(this);