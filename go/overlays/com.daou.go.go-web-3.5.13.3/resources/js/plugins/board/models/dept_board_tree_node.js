/**
 * 부서게시판노드 모델
 */
define('board/models/dept_board_tree_node', function(require) {
	
	var when = require('when');
	var BoardTreeNode = require('board/models/board_tree_node');
	var Constants = require('board/constants');
	
	var DeptBoardTreeNode = BoardTreeNode.Model.extend({
		deptId: null,
		
		urlRoot: function() {
			return GO.config('contextRoot') + 'api/department/' + this.getDeptId() + '/board/' + this.get('nodeType');
		},
		
		/**
		 * @Override
		 */
		initialize: function(models, options) {
			var opts = options || {};
			
			BoardTreeNode.Collection.prototype.initialize.apply(this, arguments);
			
			this.deptId = null;
			if(opts.hasOwnProperty('deptId')) {
				this.setDeptId(opts.deptId);
			}
		},
		
		/**
		 * 노드 재정렬
		 */
		move: function(newSeq, parentId) {
			var self = this;
			return when.promise(function(resolve, reject) {
				self.save({"seq": newSeq, "parentId": parentId}, {
					url: GO.config('contextRoot') + 'api/department/' + self.getDeptId() + '/board/' + self.getNodeId() + '/move', 
					success: resolve, 
					error: reject
				});
			});
		},
		
		/**
		 * @Override
		 */
		getSharedFlag: function() {
			return this.get('deptSharedFlag');
		}, 
		
		getManagerNames: function() {
			return this.getBoardModel().getManagerNames();
		}, 
		
		setDeptId: function(deptId) {
			this.deptId = deptId;
		}, 
		
		getDeptId: function() {
			return this.deptId;
		}
	});
	
	var DeptBoardTreeNodes = BoardTreeNode.Collection.extend({
		model: DeptBoardTreeNode, 
		deptId: null,
		
		/**
		 * @Override
		 */
		initialize: function(models, options) {
			var opts = options || {};
			
			BoardTreeNode.Collection.prototype.initialize.apply(this, arguments);
			
			this.deptId = null;
			if(opts.hasOwnProperty('deptId')) {
				this.setDeptId(opts.deptId);
			}
		},
		
		url: function() {
			var url = GO.config('contextRoot') + 'api/department/' + this.getDeptId() + '/boards';
			
			if(!this.getDeptId()) {
				console.error('부서 아이디가 필요합니다.');
				return;
			}
			
			if(this.getStatus() != null) {
				url += '/' + this.getStatus();
			}
			
			return url;
		}, 
		
		setDeptId: function(deptId) {
			this.deptId = deptId;
		}, 
		
		getDeptId: function() {
			return this.deptId;
		}, 
		
		/**
		 * @Override
		 */
		create: function(attrs, options) {
			var opts = _.extend({}, options || {}, {
				"deptId": this.getDeptId()
			});
			BoardTreeNode.Collection.prototype.create.call(this, attrs, opts);
		}, 
		
		/**
		 * @Override
		 */
		set: function(models, options) {
			var opts = _.extend({}, options || {}, {
				"deptId": this.getDeptId()
			});
			
			BoardTreeNode.Collection.prototype.set.call(this, models, opts);
		}
	});
	
	return {
		STATUS_ACTIVE: BoardTreeNode.STATUS_ACTIVE, 
		STATUS_CLOSED: BoardTreeNode.STATUS_CLOSED, 
		
		Model: DeptBoardTreeNode, 
		Collection: DeptBoardTreeNodes
	};
});