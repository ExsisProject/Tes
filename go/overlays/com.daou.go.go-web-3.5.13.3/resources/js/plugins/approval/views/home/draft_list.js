define([
    "jquery",
    "underscore",
    "backbone",
    "app",
    "approval/views/doclist/doclist_item",
    "approval/models/doclist_item",
    "hgn!approval/templates/doclist_empty",
    "hgn!approval/templates/home_list",
	"i18n!nls/commons",
    "i18n!approval/nls/approval",
], 
    
function(
	$, 
	_, 
	Backbone, 
	GO,
	DocListItemView,
	DocListItemModel,
	DocListEmptyTpl,
    HomeListTpl,
    commonLang,
    approvalLang
) {
	var HomeDraftDocList = Backbone.Collection.extend({
		model: DocListItemModel,
		url: function() {
			return "/api/approval/home/draft";
		}
	});
	
	var HomeDraftDocListView = Backbone.View.extend({
		columns: {
			'기안일' : approvalLang.기안일,
			'결재양식': approvalLang.결재양식,
			'긴급': approvalLang.긴급,
			'제목': commonLang.제목, 
			'첨부': approvalLang.첨부, 
			'결재상태': approvalLang.결재상태, 
			'count': 6
		},
		initialize: function(options) {
		    this.options = options || {};
			this.collection = new HomeDraftDocList();
			this.collection.bind('reset', this.generateList, this);
			this.collection.fetch({reset:true});
		},	
		events: {
			'click a#showDetailSearch' : 'showDetailSearch'
    		// 이벤트가 있으면 추가
    	},
		render: function() {
			var lang = {};
			this.$el.html(HomeListTpl({
				lang: lang,
				columns: this.columns
			}));
			return this;
		},
		generateList: function() {
			var viewEl = this.$el;
			viewEl.find('.list_approval > tbody').empty();
			var columns = this.columns;
			var listType = "approval";
			this.collection.each(function(doc){
				var docListItemView = new DocListItemView({ 
					model: doc, 
					listType : listType,
					columns: columns
				});
				viewEl.find('.list_approval > tbody').append(docListItemView.render().el);
			});
			if (this.collection.length == 0) {
				viewEl.find('.list_approval > tbody').html(DocListEmptyTpl({
					columns: this.columns,
					lang: { 'doclist_empty': approvalLang['문서가 없습니다.'] }
				}));
			}
		}
	});
	
	return HomeDraftDocListView;
});