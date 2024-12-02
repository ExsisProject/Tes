define('works/views/app/layout', function(require) {
	
	// dependency
	var when = require('when');
	var DefaultLayout = require('views/layouts/default');
	
	// main script
	var WorksDefaultLayout = DefaultLayout.extend({	
	    className: 'go_skin_works go_skin_default', 
		name: "works-2col", 
		
		sideView: null, 
		contentTopView: null, 
		
		initialize: function() {
			DefaultLayout.prototype.initialize.apply(this, arguments);
			GO.config('workspace_expansion_button_visible', false);
			this.sideView = null;
			this.contentTopView = null;
		},
		
		render: function() {
			var self = this;
			var defer = when.defer();
			self.appName = 'works';
			return DefaultLayout.prototype.render.call(this, arguments).then(function(layoutView) {
			    self.getContentElement().empty();
			    //self.getSideElement().empty();
			    self.getContentElement().addClass('go_renew build_situation');
			    defer.resolve(layoutView);
			}, defer.reject);
			
			return defer.promise;
		},
		
        setTitle: function(html) {
            if(this.contentTopView === null) throw new Error("contentTopView 객체가 필요합니다.");
            this.contentTopView.setTitle(html);
            return this;
        }
	});

	
	return WorksDefaultLayout;
});