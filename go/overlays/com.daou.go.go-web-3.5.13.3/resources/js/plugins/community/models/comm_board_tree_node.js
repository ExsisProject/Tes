/**
 * 커뮤니티 게시판노드 모델
 */
define('community/models/comm_board_tree_node', function(require) {
	
	var when = require('when');
	var BoardTreeNode = require('board/models/board_tree_node');
	
	var CommBoardTreeNode = BoardTreeNode.Model.extend({
		communityId: null,
		
		urlRoot: function() {
			return GO.config('contextRoot') + 'api/community/' + this.getCommunityId() + '/board/' + this.get('nodeType');
		},
		
		/**
		 * @Override
		 */
		initialize: function(models, options) {
			var opts = options || {};
			
			BoardTreeNode.Collection.prototype.initialize.apply(this, arguments);
			
			this.communityId = null;
			if(opts.hasOwnProperty('communityId')) {
				this.setCommunityId(opts.communityId);
			}
		},
		
		/**
		 * 노드 재정렬
		 */
		move: function(newSeq, parentId) {
			var self = this;
			return when.promise(function(resolve, reject) {
				self.save({"seq": newSeq, "parentId": parentId}, {
					url: GO.config('contextRoot') + 'api/community/' + self.getCommunityId() + '/board/' + self.getNodeId() + '/move', 
					success: resolve, 
					error: reject
				});
			});
		},
		
		getManagerNames: function() {
			return this.getBoardModel().getManagerNames();
		}, 
		
		setCommunityId: function(communityId) {
			this.communityId = communityId;
		}, 
		
		getCommunityId: function() {
			return this.communityId;
		}
	});
	
	var CommBoardTreeNodes = BoardTreeNode.Collection.extend({
		model: CommBoardTreeNode, 
		communityId: null,
		
		/**
		 * @Override
		 */
		initialize: function(models, options) {
			var opts = options || {};
			
			BoardTreeNode.Collection.prototype.initialize.apply(this, arguments);
			
			this.communityId = null;
			if(opts.hasOwnProperty('communityId')) {
				this.setCommunityId(opts.communityId);
			}
		},
		
		url: function() {
			var url = GO.config('contextRoot') + 'api/community/' + this.getCommunityId() + '/boards';
			
			if(!this.getCommunityId()) {
				console.error('커뮤니티 아이디가 필요합니다.');
				return;
			}
			
			if(this.getStatus() != null) {
				url += '/' + this.getStatus();
			}
			
			return url;
		}, 
		
		setCommunityId: function(communityId) {
			this.communityId = communityId;
		}, 
		
		getCommunityId: function() {
			return this.communityId;
		}, 
		
		/**
		 * @Override
		 */
		create: function(attrs, options) {
			var opts = _.extend({}, options || {}, {
				"communityId": this.getCommunityId()
			});
			BoardTreeNode.Collection.prototype.create.call(this, attrs, opts);
		}, 
		
		/**
		 * @Override
		 */
		set: function(models, options) {
			var opts = _.extend({}, options || {}, {
				"communityId": this.getCommunityId()
			});
			
			BoardTreeNode.Collection.prototype.set.call(this, models, opts);
		}
	});
	
	return {
		STATUS_ACTIVE: BoardTreeNode.STATUS_ACTIVE, 
		STATUS_CLOSED: BoardTreeNode.STATUS_CLOSED, 
		
		Model: CommBoardTreeNode, 
		Collection: CommBoardTreeNodes
	};
});