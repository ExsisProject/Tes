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
			var availableMenus = [
                {appName : "mail"},
                {appName : "webfolder"},
                {appName : "contact"},
                {appName : "calendar"},
                {appName : "board"},
                {appName : "community"},
                {appName : "approval"},
                {appName : "report"},
                {appName : "task"},
                {appName : "todo"},
                {appName : "works"},
                {appName : "docs"}
            ];
			
            var isAvailable = _.findWhere(availableMenus, {appName : this.param.appName});
            if (isAvailable) this._renderByType(this.param.appName);

			return this;
		},

        _renderByType: function(type) {
            var View = {
                mail: MailSearchView,
                webfolder: WebfolderSearchView,
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
            this.$(".combine_search_page").html(view.render().el);
        }
	});
});