define('works/views/app/doc_detail/doc_log_item', function(require) {
	// dependency
	var renderDocLogItemTmpl = require('hgn!works/templates/app/doc_detail/doc_log_item');
    var ProfileView = require("views/profile_card");
	var DocLogItem = Backbone.View.extend({
		tagName : "li",
		initialize : function(data) {
			this.log = data;
		},
		
		events : {
			"click a[data-userId]" : "showProfileCard"
		},

		render : function() {
			
			this.$el.html(renderDocLogItemTmpl({
				log : this.log.toJSON(),
				actorNameWithPosition : function() {
					var actor = this.log.actor;
					if(actor.position) {
						return actor.name + " " + actor.position;
					}else{
						return actor.name;
					}
				},
				messages : this.log.contentParser(),
				createdAt : GO.util.snsDate(this.log.get("createdAt")) 
			}));
			return this;
		},
		
		showProfileCard : function(e) {
			var userId = $(e.currentTarget).attr("data-userid");
			ProfileView.render(userId, e.currentTarget);
		}

	});
	return DocLogItem;
});