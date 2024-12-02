(function() {
	
	define([
        "backbone", 
        "survey/models/survey", 
        "m_comment", 
        "hgn!survey/templates/mobile/comment",
		"views/mobile/header_toolbar"
    ], 
    
    function(
		Backbone, 
		SurveyModel, 
		CommentsView, 
		CommentTpl,
		HeaderToolbarView
	) {
		
		var SurveyCommentView = Backbone.View.extend({
			tagName: 'section', 
			className: 'classic_detail', 
			
			initialize: function() {
				GO.util.appLoading(true);
				if(!this.model) {
					this.model = new SurveyModel();
				}
			}, 
			
			render: function() {
				var self = this, 
					defer = $.Deferred();
								
				this.model.fetch({
					success: function(model) {
						
						renderContainer(self, model);
						renderCommentList(self, model);
						renderHeaderToolBar();
						
						defer.resolveWith(self, [self]);
						
						GO.util.pageDone();
					}
				});
								
				return defer;
			}
		});

		function renderHeaderToolBar() {
			HeaderToolbarView.render({
				isClose : true
			});
		}
		
		function renderContainer(context, model) {
			context.$el.append(CommentTpl({
				"survey": {
					"title": model.get('title'), 
					"creator_name": model.getCreatorName(), 
					"created_at": GO.util.toMoment(model.get('created_at')).format('YYYY-MM-dd HH:mm')
				}, 
				"reply_count": 0
			}));
		}
		
		function renderCommentList(context, model) {
            var commentView = CommentsView.create({
                el : "#comment-container",
                type : "survey",
                typeId : model.id
            });
			
			$('#comment-count').text("( " + commentView.collection.length + " )");
			
            GO.EventEmitter.on("common", "change:comment", _.bind(function(count) {
                $('#comment-count').text("( " + count + " )");
            }, this));
			
			
			return commentView;
		}
		
		return SurveyCommentView;
		
	});
	
})();