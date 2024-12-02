(function() {
	define([ 
		"jquery", 
		"backbone", 
		"app",
        "approval/views/mobile/m_appr_company_folder_tree",
	    "hgn!approval/templates/mobile/m_company_doc_side",
	    "i18n!approval/nls/approval"
	],
	function(
		$, 
		Backbone, 
		GO,
		CompanyDocTreeTreeView,
		sideMenuTpl,
		approvalLang
	) {
				
		var lang = {
				'company_docfolder' : approvalLang['전사 문서함'],
			};
		
		var companyFolderManager = Backbone.Model.extend({
			url: '/api/approval/companyfolder/ismanager'
		});
		
		var SideView = Backbone.View.extend({
			id: 'approvalSideMenu',
			unBindEvent : function() {
			},
			bindEvent : function() {
			},
			initialize : function(options) {
				this.options = options || {};
			},
			
			render : function() {
				var _this = this;
				this.packageName = this.options.packageName;
				var deferred = $.Deferred();

				this.$el.html(sideMenuTpl({
					lang:lang
				}));
				
				this.setSideApp();
				setTimeout(function(){
					_this.sideCompanyDocRender();
				},100);
				
				deferred.resolveWith(this, [this]);
				this.unBindEvent();
				this.bindEvent();
	            return deferred;
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
			
			sideCompanyDocManager : function() {
				return this.isCompanyFolderManager;
			},
			
			goCompanyDocList : function(id){
				var	url = "/docfolder/" + id  + "/documents";
				GO.router.navigate(url, {trigger: true});
				
				$('html, body').animate({
					scrollTop : 0
				});
			},

			setSideApp : function() {
				$('body').data('sideApp', this.packageName);
			}
		}, {
            __instance__: null, 
            create: function(packageName) {
                /*if(this.__instance__ === null)*/ this.__instance__ = new this.prototype.constructor({'packageName':packageName});
                return this.__instance__;
            },
            getInstance: function() {
                if(this.__instance__ === null) {
                 	this.__instance__ = new this.prototype.constructor();
                } 
                return this.__instance__;
             },
             hasInstance : function(){
            	 return this.__instance__; 
             }
            
        });
		
		return SideView;
	});
}).call(this);