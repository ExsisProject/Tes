;(function() {
	define([
			"backbone",
			"hogan",
			"app"
	], 
	function(
			Backbone,
			Hogan,
			App
	) {
		var SideFolderTmpl = Hogan.compile(
			'<p class="title">' +
				'<a>' +
					'<span class="btn_wrap">' +
						'<span data-deptId="{{id}}" class="ic ic_root"></span>' +
						'<span class="txt_ellipsis">{{name}}</span>' +
					'</span>' +
				'</a>' +
			'</p>'
		);
		
		
		var SideFolderView = Backbone.View.extend({
			tagName : "li",
			
			
			events : {
				"vclick a" : "goListFolder"
			},
			
			
			initialize : function(data) {
				this.folder = data;
			},
			
			
			render : function() {
				this.$el.html(SideFolderTmpl.render(this.folder));
				this.$el.addClass("folder");
				return this;
			},
			
			
			goListFolder : function() {
				App.router.navigate("task/folder/" + this.folder.id + "/task", true);
			}
		});
		return SideFolderView;
	});
}).call(this);