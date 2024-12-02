// 페이지 갯수
define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!grid/templates/pagesize"
],
function(
	$, 
	_, 
	Backbone,
	PageSizeTpl
) {
	return Backbone.View.extend({
		/**
		 *  전자결재에서 사용하는 뷰와 분리.
		 *  
		 * ghost 상태에서 렌더링이 안되기 때문에 el 속성을 제거한다.
		 * 일반뷰라면 모르겠지만, 공통 컴포넌트 뷰는 ghost 렌더링도 지원해야 한다.
		 * 
		 * setElement 를 통해 wrapper 를 지정해서 사용한다.
		 */
		initialize: function(options) {
			this.pageSize = options.pageSize;
		},
		
		events : {
			"change select[data-el-grid-page-size]" : "selectPageSize"
		},
		
		render: function() {
			this.$el.html(PageSizeTpl());
			this.$('select').val(this.pageSize);
			
			return this;
		},
		selectPageSize: function(e) {
			var selectedValue = $(e.currentTarget).val();
			this.trigger('changePageSize', selectedValue);
		}
	});
});