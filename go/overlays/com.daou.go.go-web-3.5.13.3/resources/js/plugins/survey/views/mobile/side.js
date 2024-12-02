(function() {
	define([ 
		"backbone", 
		"amplify", 
		"app",
		"hgn!survey/templates/mobile/m_side", 
		"i18n!survey/nls/survey"
	],
	function(
		Backbone, 
		amplify, 
		GO,
		SideMenuTpl, 
		SurveyLang
	) {
		var CATE_STORE_KEY = GO.session("loginId") + '-survey-lastcate';
		
		var SideView = Backbone.View.extend({
			id: 'surveySideMenu',
			
			events: {
				"vclick a[data-category]": "_tabSideMenu"
			},
			
			initialize : function(options) {
				this.options = options || {};
			},
			
			render : function() {
				var deferred = $.Deferred();
				this.$el.html(SideMenuTpl({
					"context_root" : GO.config('contextRoot'), 
					"label": {
						"survey": SurveyLang["설문"],
                        "progressing": SurveyLang["진행중인 설문"], 
                        "finished": SurveyLang["완료된 설문"], 
                        "created_by_me": SurveyLang["내가 만든 설문"]
					}
				}));
				
				$('body').data('sideApp', this.options.packageName);
				
				deferred.resolveWith(this, [this]);
	            return deferred;
			},
            
            getStoredCategory: function() {            	
            	return GO.util.store.get(CATE_STORE_KEY);
            }, 
            
            storeCategory: function(category) {
            	return GO.util.store.set(CATE_STORE_KEY, category, {type: 'session'});
            }, 
			
			_tabSideMenu : function(e){
				e.preventDefault();
				var $el = $(e.currentTarget);
				
				this.storeCategory($el.data('category'));
            	
				GO.router.navigate($el.data('href'), {trigger: true, pushState: true});
				e.stopPropagation();
			}
		});
		

		
		return SideView;
	});
}).call(this);