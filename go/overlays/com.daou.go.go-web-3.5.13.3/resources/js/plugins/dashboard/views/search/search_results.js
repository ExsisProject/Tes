define([
    "jquery", 
    "backbone", 
    "app", 
    "dashboard/views/search/search",
    "dashboard/views/search/mail_search",
    "dashboard/views/search/contact_search",
    "dashboard/views/search/webfolder_search",
    "dashboard/views/search/calendar_search",
    "dashboard/views/search/board_search",
    "dashboard/views/search/community_search",
    "dashboard/views/search/approval_search",
    "dashboard/views/search/report_search",
    "dashboard/views/search/task_search",
    "dashboard/views/search/todo_search",
    "dashboard/views/search/works_search",
    "dashboard/views/search/docs_search",
    "hgn!dashboard/templates/search/search_results",
    "i18n!nls/commons"
], 

function(
	$, 
	Backbone,
	App, 
	SearchView,
	MailSearchView,
	ContactSearchView,
	WebfolderSearchView,
	CalendarSearchView,
	BoardSearchView,
	CommunitySearchView,
	ApprovalSearchView,
	ReportSearchView,
	TaskSearchView,
	TodoSearchView,
	WorksSearchView,
	DocsSearchView,
	SearchResultsTmpl,
	commonLang
) {
	var tplVar = {
		result : commonLang['검색결과']
	};

	return Backbone.View.extend({
		initialize: function(options) {
			this.$el.off();
			this.options = options || {};
			this.param = GO.router.getSearch();
		},
		
		render : function() {
			this.$el.html(SearchResultsTmpl({
				lang: tplVar
			}));
			var searchView = new SearchView();
			this.$("section.search").html(searchView.render().el);
			this.$('#search-keyword').val(this.param.keyword);
			var self = this;
			var availableMenus = [
				{appName : "mail", 		action : self.renderMailSearchView, appClass:"cs_mail_wrap", 		icon : "ic_type_mail"},
				{appName : "webfolder",		action : self.renderFileSearchView, appClass:"cs_reference_wrap", 	icon : "ic_type_file"},
				{appName : "contact",	action : self._renderByType, 		appClass:"cs_contact_wrap", 	icon : "ic_type_contact"},
				{appName : "calendar",	action : self._renderByType, 		appClass:"cs_calendar_wrap", 	icon : "ic_type_cal"},
				{appName : "board", 	action : self._renderByType, 		appClass:"cs_board_wrap", 		icon : "ic_type_bbs"},
				{appName : "community", action : self._renderByType, 		appClass:"cs_community_wrap", 	icon : "ic_type_comm"},
				{appName : "approval", 	action : self._renderByType, 		appClass:"cs_eapproval_wrap", 	icon : "ic_type_approval"},
				{appName : "report", 	action : self._renderByType, 		appClass:"cs_report_wrap", 		icon : "ic_type_report"},
				// 업무는 보고와 동일하므로 별도 appClass가 없습니다.
				{appName : "task", 		action : self._renderByType, 		appClass:"cs_report_wrap", 		icon : "ic_type_task"},
				{appName : "todo", 		action : self._renderByType, 		appClass:"cs_todo_wrap", 		icon : "ic_type_todo"},
				{appName : "works", 	action : self._renderByType, 		appClass:"cs_works_wrap", 		icon : "ic_type_works"},
				{appName : "docs", 		action : self._renderByType, 		appClass:"cs_docs_wrap", 		icon : "ic_type_docs"}
			];
			
			this.$('.combine_search_page').append(
				'<div class="cs_calendar_wrap" id="no_search_menu">'+
					'<h1 class="cs_s_title">'+commonLang['다음 메뉴에 대해 일치하는 결과가 없습니다']+'</h1>'+
					'<div class="no_search_menu"><span></span></div>'+
				'</div>'
			);
			_.each(GO.config("menuList"), function(menu){
				var availableMenu = _.findWhere(availableMenus, {appName : menu.appName});
				if (availableMenu) {
					this.$('#no_search_menu').before(
						"<div class='"+availableMenu.appClass+"' id='"+ availableMenu.appName +"Search'></div>"
					);
					this.$('.no_search_menu').append(
						"<span class='no_result_menu' id='"+ availableMenu.appName +"EmptyMessage' style='display:none'>"+
							"<span class='ic_gnb "+availableMenu.icon+"' title='"+menu.name+"'></span> "+ menu.name+
						"</span>"
					);
					availableMenu.action.call(this, availableMenu.appName);
				}
			}, this);
			
			
			return this;
		},
		renderMailSearchView : function(){
			var mailSearchView = new MailSearchView();
			this.$("#mailSearch").append(mailSearchView.render().el);
			if(mailSearchView.emptyMessage() != undefined){
				this.$('#mailEmptyMessage').css('display','');
			}
		},
		renderFileSearchView : function(){
			var fileSearchView = new WebfolderSearchView();
			this.$("#fileSearch").html(fileSearchView.render().el);
			if(fileSearchView.emptyMessage() != undefined){
				this.$('#fileEmptyMessage').css('display','');
			}
		},

		_renderByType: function(type) {
			var View = {
				mail: MailSearchView,
				file: WebfolderSearchView,
				contact: ContactSearchView,
				calendar: CalendarSearchView,
				board: BoardSearchView,
				community: CommunitySearchView,
				approval: ApprovalSearchView,
				report: ReportSearchView,
				task: TaskSearchView,
				todo: TodoSearchView,
				works: WorksSearchView,
				docs: DocsSearchView
			}[type];
			var view = new View();
			this.$('#' + type + 'Search').html(view.render().el);
		}
	});
});