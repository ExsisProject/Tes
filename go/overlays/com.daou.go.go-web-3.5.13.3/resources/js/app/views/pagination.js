// 페이징 공통 처리
define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!templates/pagination",
	'views/base_pagination'
],
function(
	$, 
	_, 
	Backbone, 
    PaginationTpl,
	BasePaginationView
) {
	return BasePaginationView.extend({
	    
		className: 'dataTables_paginate paging_full_numbers',
				
		events: {
			'click #first_page': 'firstPage',
			'click #prev_page': 'prevPage',
			'click #next_page': 'nextPage',
			'click #last_page': 'lastPage',
			'click #pages > a.paginate_button': 'goTo'
		},
		
		render: function() {
			$(this.el).html(PaginationTpl({
				pageInfo: this.pageInfo
			}));
			
			var pages = [];
			_.each(this.pageInfo.pages, function(page) {
				var pageIndex = page + 1;
				if (this.pageInfo.pageNo == page) {
					pages.push('<a tabindex="0" data-page="' + page + '" class="paginate_button paginate_active">' + pageIndex + '</a>');
				} else {
					pages.push('<a tabindex="0" data-page="' + page + '" class="paginate_button">' + pageIndex + '</a>');	
				}
			}, this);			
			this.$el.find('#pages').append(pages.join("\n"));
			if (this.useBottomButton) this.$el.css({"padding-top" : "40px"});

			return this;
		}
	});
});