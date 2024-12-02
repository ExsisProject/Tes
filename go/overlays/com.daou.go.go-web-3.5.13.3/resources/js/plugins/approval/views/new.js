(function() {
	define([
        // 필수
    	"jquery",
		"underscore", 
        "backbone", 
        "app",
        "approval/views/form_detail",
        "approval/views/apprform/appr_form_searchTree",
        "hgn!approval/templates/new_layer",
		"i18n!nls/commons",
        "i18n!approval/nls/approval",
        "jquery.jstree"
    ], 
    
    function(
        $,  
		_, 
        Backbone, 
        App,
        FormDetailView,
        ApprFormSearchTreeView,
        NewDocumentLayerTpl,
        commonLang,
		approvalLang
    ) {	
		
		var instance = null,
			formId,
			langVar = {
				"자주쓰는 양식으로 추가" : approvalLang["자주쓰는 양식으로 추가"],
				"양식명" : approvalLang["양식명"],
				"상세정보" : approvalLang["상세정보"],
				"검색" : commonLang["검색"]
			};
		
		var AddFavoriteModel = Backbone.Model.extend({
			model: Backbone.Model.extend(),
			url: function() {
				return '/api/approval/favorite';
			}
		});
		
		var NewDocumentLayerView = Backbone.View.extend({
			searchTreeView: null,
            formListView: null,
            saveFavoriteCallBack  : null,
    		el : ".go_popup .content",
		
			events: {
				"click a#addFavorite" : "addFavorite"
			},
	    	
    		initialize: function(options) {
                this.options = options || {};
                this.deptFolderInfos = this.options.deptFolderInfos;
                this.drafterDeptFolderInfos = this.options.drafterDeptFolderInfos;
    			if(_.isFunction(this.options.saveFavoriteCallBack)){
    				this.saveFavoriteCallBack = this.options.saveFavoriteCallBack;
    			};
    		},
    		
	    	render : function(){
				var tpl = NewDocumentLayerTpl({
					lang : langVar
				});
				
				this.$el.html(tpl);
				
				this.searchTreeView = new ApprFormSearchTreeView({
                    isAdmin: false,
                    elId : "appr_form_searchTree",
                    treeElId : "formTree",
                    inputMaxLength : 20,
                    searchInputId : 'searchInput',
                    searchResultElId : 'searchResult',
                    selectCallback: $.proxy(function(data){
                    	var formListEl = this.$el.find('#form_detail_tbody');
                        if (formListEl.length > 0) {
                            formListEl.remove();
                        } 
                        if (data['type'] == ['FORM']) {
                        	this.formDetailView.formDetail(data['id']);
                    	} else {
                    		this.formDetailView.emptyDetail();
                    	}
                    }, this)
				});
				
				this.formDetailView = new FormDetailView({
					deptFolderInfos : this.deptFolderInfos,
					drafterDeptFolderInfos : this.drafterDeptFolderInfos
				});
				
				this.searchTreeView.render();
				this.formDetailView.render().emptyDetail();
				
				// 해당 소속 부서가 없을 경우 '자주쓰는 폼 추가', '확인' 버튼을 감춤
				
				//if(!$.isArray(this.deptFolderInfos) || $.isEmptyObject(this.deptFolderInfos) || _.isEmpty(this.deptFolderInfos)) {
				if(!$.isArray(this.drafterDeptFolderInfos) || $.isEmptyObject(this.drafterDeptFolderInfos) || _.isEmpty(this.drafterDeptFolderInfos)) {
					$('#favorite_form').hide();
					$('a.btn_major_s').hide();
				}
    		},
    		    		
    		addFavorite: function(){
    			var self = this;
    			var addFavoriteModel = new AddFavoriteModel();
    			var deptId = $('#draftDeptId').val();
    			this.formId = $('#form_title').attr('data-formId');
    			
    			var formId = this.formId;
    			
				if(!formId){
					$.goError(approvalLang['양식을 선택해 주세요.']);
					return false;
				}
				addFavoriteModel.set({ 
					'deptId' : deptId,
					'formId' : formId
				}, {		
    				silent : true
    			});
    			
    			addFavoriteModel.save({},{ 
    				async : false,
    				type : 'POST',
    				success: function(){
    						self.saveFavoriteCallBack(true);
    				},
    				error: function(){
    					if(!deptId || !formId){
    						$.goError(approvalLang['양식을 선택해 주세요.']);
    						return false;
    					}else{
    						$.goError(approvalLang['이미 추가한 폼입니다.']);
    						return false;
    					}
					}
				});
    		},
    		
	    	release: function() {
				this.$el.off();
				this.$el.empty();
			}
		});

		return NewDocumentLayerView;
	});
	
}).call(this);