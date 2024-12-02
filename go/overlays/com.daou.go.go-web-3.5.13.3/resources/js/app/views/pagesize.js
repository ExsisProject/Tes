// 페이지 갯수
define([
    "jquery",
    "underscore",
    "backbone",
    "hgn!templates/pagesize"
],
function(
	$, 
	_, 
	Backbone,
	PageSizeTpl
) {
	var PageSizeView = Backbone.View.extend({
		el : ".dataTables_length",
		className : 'dataTables_length',
		
		initialize: function(options) {
			_.bindAll(this, 'render', 'selectPageSize');
			this.pageSize = options.pageSize;
			this.$el.on('change', 'select', this.selectPageSize);
		},
		render: function() {
			this.$el.html(PageSizeTpl());
			this.$('select').val(this.pageSize);
			
			return this;
		},
		selectPageSize: function(e) {
			var selectedValue = $(e.currentTarget).val();
			$('label > select').val(selectedValue);
			this.trigger('changePageSize', selectedValue);
		}
	});
	
	return PageSizeView;
});