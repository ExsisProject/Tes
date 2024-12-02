(function() {
	define([
	   "app",
	   "views/layouts/admin_default",
	   "admin/views/side_admin",
	   "i18n!admin/nls/admin"
	], 
	function(
		App,
		Layout,
		SideView,
		adminLang
	) {
		// Public API
		
		var AdminCustomController = (function() {
			
			var Controller = function() {
				
			};
		
			Controller.prototype = {
					
				/**
				 * COMPANY(일반)
				 */
//				renderCompanyCustom: function() {
//					this.renderContent("company", "companyCustom","admin/views/company_custom", "커스텀메뉴");
//				},
                
                renderContent: function(menuGroup, leftMenu, contentsPath, title, option) {
					require([contentsPath], function(ContentsView) {
						Layout.setTitle(title).render().done(function(layout) {
							var side = new SideView({menuGroup : menuGroup, leftMenu : leftMenu});
							var view = new ContentsView(option);
							Layout.getSideElement().html(side.el);
							Layout.getContentElement().html(view.el);
							side.render(); // context 를 사용하지 않은 기존 뷰때문에 render 를 나중에 한다.
							view.render();
						});
					});
				}			
			};
			
			return Controller;
			
		})();
		
		return new AdminCustomController();
		
	});
}).call(this);