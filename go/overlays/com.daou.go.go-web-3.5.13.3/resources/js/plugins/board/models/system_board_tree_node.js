/**
 * 전사게시판노드 모델
 * 
 * 전사게시판노드 모델은 사용자 서비스와 사이트 관리자 모두 사용한다.
 */
define('board/models/system_board_tree_node', function(require) {
	
	var when = require('when');
	var BoardTreeNode = require('board/models/board_tree_node');
	var Constants = require('board/constants');
	
	var CompanyBoardTreeNode = BoardTreeNode.Model.extend({
		urlRoot: function() {
			return GO.config('contextRoot') + (this.isAdminService() ? 'ad/': '') + 'api/company/'+this.get('companyId')+'/board/' + this.get('nodeType');
		},
		
		/**
		 * 노드 재정렬
		 */
		move: function(newSeq, parentId) {
			var self = this;
			return when.promise(function(resolve, reject) {
				self.save({"seq": newSeq, "parentId": parentId}, {
					url: GO.config('contextRoot') + (self.isAdminService() ? 'ad/': '') + 'api/company/board/' + self.getNodeId() + '/move', 
					success: resolve, 
					error: reject
				});
			});
		},
		
		getManagerNames: function() {
			return this.getBoardModel().getManagerNames();
		}
	});
	
	var CompanyBoardTreeNodes = BoardTreeNode.Collection.extend({
		model: CompanyBoardTreeNode, 
		
		url: function() {
			var url = GO.config('contextRoot') + (this.isAdminService() ? 'ad/': '') + 'api/company/'+this.getCompanyId()+'/boards';
			if(this.getStatus() != null) {
				url += '/' + this.getStatus();
			}
			
			return url;
		}, 
		
		/**
		 * @Override
		 */
		create: function(attrs, options) {
			var opts = _.extend({}, options || {}, {
				"isAdminService": this.isAdminService()
			});
			BoardTreeNode.Collection.prototype.create.call(this, attrs, opts);
		}, 
		
		/**
		 * @Override
		 */
		set: function(models, options) {
			var opts = _.extend({}, options || {}, {
				"isAdminService": this.isAdminService()
			});
			
			BoardTreeNode.Collection.prototype.set.call(this, models, opts);
		}, 
		
		/**
		 * @Override
		 */
		reset: function(models, options) {
			var opts = _.extend({}, options || {}, {
				"isAdminService": this.isAdminService()
			});
			
			BoardTreeNode.Collection.prototype.reset.call(this, models, opts);
		}
	});
	
	return {
		STATUS_ACTIVE: BoardTreeNode.STATUS_ACTIVE, 
		STATUS_CLOSED: BoardTreeNode.STATUS_CLOSED, 
		
		Model: CompanyBoardTreeNode, 
		Collection: CompanyBoardTreeNodes
	};
});