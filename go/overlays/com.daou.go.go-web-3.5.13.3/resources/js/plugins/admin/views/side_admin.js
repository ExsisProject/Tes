define('admin/views/side_admin', function(require) {

	var $ = require('jquery');
	var Backbone = require('backbone');
	var App = require('app');
	
	var sideMenuModel = require("admin/models/side_menu");
	
	var layoutTpl = require('hgn!admin/templates/side_menus');

	var UploadMangagerView =require("views/layouts/upload_manager_layer");

	var SideView = Backbone.View.extend({
		
		events : {
			'click ul.admin li' : 'movePage'
		},
		
		initialize : function() {
			this.model = new sideMenuModel(this.options);
    	},
    	
    	render : function() {
			var self = this;
			var isActive = function() {
				return self.options.leftMenu == this.leftName;
			};
			
			this.model.getAccessMenu().done($.proxy(function(menuData) {
				this.$el.html(layoutTpl({
					contextRoot : GO.contextRoot,
					menus : menuData,
					isActive : isActive
				}));

				$("body").trigger("admin."+this.options.menuGroup+"SideRender", [isActive]);
				if(this.options.menuGroup=='company'){
                    this.setGuide();
                }
			}, this));

			
			return this;
		},

		movePage : function(e){
			var target = $(e.currentTarget);
			App.router.navigate(target.attr('data-url'), {trigger : true, pushState : true});
		},
        setGuide: function() {
            var guideView = new UploadMangagerView();
            this.$el.find("#uploadManager").html(guideView.$el);
            guideView.render();
            $("#guideBadge").draggable({containment:"body"});
        },
	});

	return SideView;
});