// 페이징 공통 처리
define([
    "jquery",
    "backbone",
    "hgn!approval/templates/mobile/m_pagination",
    "i18n!nls/commons"
],
function(
	$, 
	Backbone,
    PaginationTpl,
    commonLang
) {
	var PaginationView = Backbone.View.extend({
		initialize : function(options){
			this.pageInfo = options.pageInfo;
		}, 
		tagName: 'div',
		className: 'paging br_no',
		events : {
			'vclick #prev_page': 'prevPage',
			'vclick #next_page': 'nextPage'
		},
		render: function() {
			$(this.el).html(PaginationTpl({
				pageInfo: this.pageInfo,
				lang : commonLang
			}));
			
			var pages = [];
			var pageIndex = this.pageInfo.pageNo*this.pageInfo.pageSize + 1;
			pages.push('<span class="current_page">'+pageIndex+'</span>');
			
			var lastIndex = (this.pageInfo.pageNo+1)*this.pageInfo.pageSize > this.pageInfo.total ? this.pageInfo.total : (this.pageInfo.pageNo+1)*this.pageInfo.pageSize;     
			pages.push('<span class="txt_bar">-</span>');
			pages.push('<span class="total_page">'+lastIndex+'</span>');
			pages.push('<span class="total_page"> / '+this.pageInfo.total+'</span>');
			this.$el.find('#pages').append(pages.join("\n"));

			return this;
		},
		
		
		goTo: function(e) {
			GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
			e.preventDefault();
			this.paging($(e.currentTarget).attr('data-page'));
		},
		
		prevPage: function(e) {
			GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
			e.preventDefault();
			if (this.pageInfo.prev) {
				this.paging(this.pageInfo.pageNo - 1);
			}
		},
		
		nextPage: function(e) {
			GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
			e.preventDefault();
			if (this.pageInfo.next) {
				this.paging(this.pageInfo.pageNo + 1);
			}
		},

		
		paging: function(pageNo) {
		GO.EventEmitter.trigger('common', 'layout:scrollToTop', this);
			this.trigger('paging', pageNo);
		}
		
	});
	
	return PaginationView;
});