define('works/views/mobile/doc_detail/comment_list', function(require) {
	var Backbone = require('backbone');

	var CommentView = require('m_comment');
	var HeaderToolbarView = require('views/mobile/header_toolbar');
	
	var WorksActivity= require('works/models/applet_activity');
	
	var CommentListTpl = require('hgn!works/templates/mobile/doc_detail/comment_list');
	
	var commonLang = require('i18n!nls/commons');

	return Backbone.View.extend({
		el : "#content",

		initialize : function() {
			this.activity = new WorksActivity(this.options);
		},
		
		dataFetch : function() {
			return this.activity.fetch();
		},
		
		render : function() {
			HeaderToolbarView.render({
				title : commonLang["댓글"],
				isClose : true
			});
			
			this.$el.html(CommentListTpl({
				activity : this.activity.toJSON(),
				createdAt : this.activity.createdAt(),
				content : this.activity.mobileContent(),
				hasMobileContent : this.activity.hasMobileContent()
			}));
			
            CommentView.create({
                el : "#comment_list",
                type : "works/activity",
                typeId : this.activity.id,
                isReply : false
            });
			
			GO.EventEmitter.on("common", "change:comment", function(count) {
				this.$("#commentCount").text("(" + count + ")");
			}, this);
			
			return this;
		}
	});
});