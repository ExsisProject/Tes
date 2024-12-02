//게시판 글 목록 HOME
(function() {
	define([
	        "jquery",
	        "backbone", 	
	        "app",
	        "hgn!community/templates/master_delete",
	        "i18n!nls/commons",
	        "i18n!community/nls/community",
	        "jquery.placeholder"
	        ], 
	        function(
	        		$,
	        		Backbone,
	        		App,
	        		tplCommunityMasterDelete,
	        		commonLang,
	        		communityLang
	        ) {
		
		var tplVar = {
				'community_desc1': communityLang['커뮤니티를 폐쇄하시면, 현재 커뮤니티 내에 있는 모든 자료들이 삭제됩니다.'],            
				'community_desc2': communityLang['자료가 삭제된 이후에는 복구가 불가능 합니다.'],
	            'community_placeholder' : communityLang['커뮤니티 폐쇄 공지를 이곳에 작성하세요'],
	            'community_delete' : communityLang['폐쇄하기']
	        };
		
		var CommunityMasterDelete = Backbone.View.extend({
			manage : false,
			
			events:{
				
			},
			initialize: function(options) {
				this.$el.off();
				this.options = options || {};
				this.communityId = this.options.communityId;
			},

			render: function() {
				this.$el.empty();
				this.$el.html(tplCommunityMasterDelete({
					lang:tplVar
				}));
				$('input[placeholder], textarea[placeholder]').placeholder();
			},
		});

		return {
			render: function(communityId) {
				var communityMasterDelete = new CommunityMasterDelete({el : '.tab_conent_wrap', communityId : communityId });
				return communityMasterDelete.render();				
			}
		};
	});

}).call(this);