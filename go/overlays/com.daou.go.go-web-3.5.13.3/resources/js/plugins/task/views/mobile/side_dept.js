;(function() {
	define([
			"backbone",
			"hogan",
			"app",
			
			"i18n!task/nls/task",
			"task/views/mobile/side_folder"
	], 
	function(
			Backbone,
			Hogan,
			App,
			
			taskLang,
	        SideFolderView
	) {
		var SideDeptTmpl = Hogan.compile(
				'<p class="title">' +
					'<a>' +
						'<span class="btn_wrap">' +
							'<span data-deptId="{{id}}" class="ic_side ic_part"></span>' +
							'<span class="txt_ellipsis">{{name}}</span>' +
						'</span>' +
					'</a>' +
				'</p>' +
				'<ul id="sideFolderList">' +
				'</ul>'
		);
		
		var SideDeptView = Backbone.View.extend({
			tagName : "li",
			
			
			initialize : function(data) {
				this.dept = data;
			},
			
			
			render : function() {
				this.$el.html(SideDeptTmpl.render(this.dept.toJSON()));
				this.$el.addClass("folder");
				return this;
			},
			
			
			renderFolders : function() {
				var listEl = this.$el.find("#sideFolderList");
				_.each(this.dept.getFolders(), function(folder) {
					var sideFolderView = new SideFolderView(folder);
					listEl.append(sideFolderView.render().el);
				}, this);
			}
		});
		return SideDeptView;
	});
}).call(this);