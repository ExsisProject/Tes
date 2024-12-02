define(function(require) {
	
	var GO = require('app');
	var BoardTree = require('board/models/board_tree');
	var CommBoardTreeNode = require('community/models/comm_board_tree_node');
	
	/**
	 * CommunityBoardTreeModel 모델
	 */
	var CommBoardTreeModel = BoardTree.Model.extend({
		initialize: function(attrs, options) {
			var opts = options || {};
			
			BoardTree.Model.prototype.initialize.apply(this, arguments);
			
			if(opts.hasOwnProperty('communtyId')) {
				this.set('communtyId', opts.communtyId);
			}
		},
		/**
		 * @Override
		 */
		getBoardTreeNodes: function() {
			return new CommBoardTreeNode.Collection(this.getBoards());
		},
		
		getCommunityId: function() {
			return this.get('communityId');
		},
		
		getCommunityName: function() {
			return this.get('communityName');
		}
	});
	
	var CommBoardTreeList = BoardTree.Collection.extend({
		model: CommBoardTreeModel,
		communityId: null,
		
		url: function() {
			return GO.config('contextRoot') + 'api/community/'+ this.getCommunityId() +'/boards';
		}, 
		
		/**
		 * @Override
		 */
		initialize: function(models, options) {
			var opts = options || {};
			
			BoardTree.Collection.prototype.initialize.apply(this, arguments);
			
			this.communityId = null;
			if(opts.hasOwnProperty('communityId')) {
				this.setCommunityId(opts.communityId);
			}
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
			BoardTree.Collection.prototype.create.call(this, attrs, opts);
		}, 
		
		/**
		 * @Override
		 */
		set: function(models, options) {
			var opts = _.extend({}, options || {}, {
				"communityId": this.getCommunityId()
			});
			
			BoardTree.Collection.prototype.set.call(this, models, opts);
		}
	});
	
	return {		
		Model: CommBoardTreeModel, 
		Collection: CommBoardTreeList
	};
	
});