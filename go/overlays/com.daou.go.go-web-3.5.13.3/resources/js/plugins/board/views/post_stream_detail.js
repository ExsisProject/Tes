(function() {
	define([
        "jquery", 
        "backbone", 
        "board/models/post", 
        "hgn!board/templates/post_stream_detail", 
        "board/views/post_stream_unit", 
        "board/views/board_title",
        "app",
        "jquery.fancybox-buttons",
	    "jquery.fancybox-thumbs",
	    "jquery.fancybox",
	    'go-fancybox'
    ], 
    
    function(
        $, 
        Backbone, 
        PostModel, 
        TplStreamDetail, 
        postStreamUnit, 
        BoardTitleView,
        GO
    ) {
		var streamView = Backbone.View.extend({
			initialize: function(options) {
				this.options = options || {};
				this.el = this.options.id;
				this.boardId = this.options.boardId;
				this.postId = this.options.postId;
				this.communityId = this.options.communityId;
				this.model = new PostModel({
					boardId : this.boardId,
					postId : this.postId,
					isStream : true
				});
				this.model.setURL();
				this.model.fetch({
					async : false,
					statusCode: {
                        403: function() { GO.util.error('403', { "msgCode": "400-board"});}, 
                        404: function() { GO.util.error('404', { "msgCode": "400-board"});}, 
                        500: function() { GO.util.error('500'); }
                    }
				});
			},

			render: function() {
				
				if(this.boardId != this.model.get("boardId")) {
					GO.router.navigate('error/403', {trigger: true, pushState:false, replace:true});
				}
				
				this.$el.html(TplStreamDetail());
				
				this.unitView = new postStreamUnit({
					model : this.model,
					boardId : this.boardId,
					postId : this.postId,
					isDetail : true,
					isCommunity : this.communityId ? true : false
				});
				this.$("ul.feed_type").html(this.unitView.render().el);
				
				var boardName = this.model.get("boardName");
				var dept = this.model.get("boardMasterOwner").ownerInfo;
				BoardTitleView.render({
					el : '.content_top',
					dataset : {
						name : boardName,
						masterOwner : {ownerInfo : dept }
					},
					isCommunity : this.communityId ? true : false
				});
				$('ul.feed_type > li').css('border-top','0px');
				$('.fancybox-thumbs').goFancybox();
			}			
		});
		return {
			render: function(opt) {
				var view = new streamView({
					el:"#content",
					boardId:opt.boardId,
					postId:opt.postId,
					communityId:opt.communityId
				});
				
				return view.render(opt.boardId, opt.postId, opt.communityId);
			}
		};
	});
}).call(this);