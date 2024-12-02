define([
    "jquery", 
    "backbone", 
    "app",  
    "hgn!admin/templates/board_manage_list"
], 

function(
	$, 
	Backbone,
	App, 
	layoutTpl
) {
	var instance = null;
	var manageList = Backbone.View.extend({
		unbindEvent: function() {
			this.$el.off("click", "span[data-btntype='bbsCreate']");
		}, 
		bindEvent : function() {
			this.$el.on("click", "span[data-btntype='bbsCreate']", $.proxy(this.bbsCreate, this));
		},
		initialize: function() {
			this.unbindEvent();
			this.bindEvent();
		},
		render : function(args) {
			var tmpl = layoutTpl();
			this.$el.html(tmpl);
		},
		bbsCreate : function(){
			App.router.navigate('/admin/board/create', true);
		}
	},{
		create: function() {
			if(instance === null) instance = new manageList({el:'.admin_content'});
			return instance.render();
		}
	});
	
	return {
		render: function() {	
			var layout = manageList.create();
			return layout;
		}		
	};
});