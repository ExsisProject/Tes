//게시판 글 목록 HOME
(function() {
	define([
	        "jquery",
	        "backbone", 	
	        "app",
	        "community/collections/boards", 
	        "hgn!community/templates/side_boards",
	        "i18n!nls/commons",
	        ], 
	        function(
	        		$,
	        		Backbone,
	        		App,
	        		CommunityBoardsModel,
	        		tplSideBoards,
	        		commonLang
	        ) {

		var Boards = Backbone.View.extend({
			el : '.go_side',			
			
			initialize: function(options) {
				this.options = options || {};
				this.communityId = this.options.communityId;			
				this.collection = CommunityBoardsModel.getCollection(this.communityId);
			},
			
			render: function() {
				var dataset = this.collection.toJSON() || [];
				var tmpl = tplSideBoards({
					contextRoot : GO.contextRoot,
					dataset : dataset,
					total : this.collection.page.totalElements,
					isDataset : dataset.length ? true : false
				});
				this.$el.append(tmpl);
			},
			
			
		});

		return {
			render: function(communityId) {
				var Boards = new Boards({ communityId : communityId });
				return Boards.render();				
			}
		};
	});
}).call(this);