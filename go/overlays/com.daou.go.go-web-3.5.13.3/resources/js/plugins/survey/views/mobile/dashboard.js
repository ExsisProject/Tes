;(function() {
define([
		"jquery",
		"backbone", 
		"app",
		"survey/views/mobile/list", 
		"hgn!survey/templates/mobile/dashboard", 		
		"i18n!nls/commons", 
		"i18n!survey/nls/survey",
		"views/mobile/header_toolbar"
	],
	
	function(
		$,
		Backbone,
		GO,
		SurveyListView,
		LayoutTpl, 
		CommonLang, 
		SurveyLang,
		HeaderToolbarView
	) {

		var SurveyDashboardView = Backbone.View.extend({

			events: {
				"vclick .dashboard-tab": "_toggleTabAndView"
			},

			initialize : function(){
				this.tabKind = !_.isNull(sessionStorage.getItem("tabKind")) ? sessionStorage.getItem("tabKind") : 'progress';
				sessionStorage.removeItem("tabKind");
				GO.util.appLoading(true);
                GO.EventEmitter.on("survey", "layout:toggleLatestTab", this.toggleLatestTabView, this);
            },

			release: function() {
				this.undelegateEvents();
				this.$el.empty();
			},

			render : function() {

				this.$el.append(LayoutTpl({
					"label": { "todo": SurveyLang["진행중인 설문"], "latest": SurveyLang["최근 생성된 설문"]}
				}));
				this.$el.find('li[data-type="' + this.tabKind + '"] > a').trigger('vclick');
				HeaderToolbarView.render({
					title: SurveyLang['설문'],
					isList : true,
					isSideMenu: true,
					isHome: true
				});

				GO.util.pageDone();
			},

			_toggleTabAndView: function(e) {
				e.preventDefault();
				var $el = $(e.currentTarget),
					filter = $el.closest('li').data('type');
				$("#surveyTab li").removeClass('on');
				$el.closest('li').addClass("on");
				renderListView(this, '.list-container', filter);
				if(filter === 'latest'){
					$(window).off('scroll.renderNewPage');
				}
				sessionStorage.setItem("tabKind", filter);
				return false;
			},

            toggleLatestTabView: function(){
			    $("li[data-type='latest']").find(".dashboard-tab").trigger("vclick");
            }
		});
		
		function renderListView(context, selectorForContainer, filter) {
			var listView = new SurveyListView({"filter": filter});
			context.$el.find(selectorForContainer).html(listView.el);
			listView.render();
            HeaderToolbarView.render({
                title: SurveyLang['설문'],
                isList : true,
                isSideMenu: true,
                isHome: true
            });
			return listView;
		}
		return SurveyDashboardView;
		
	});
}).call(this);