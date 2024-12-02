define('board/models/board_tree_node', function(require) {
	
	var Backbone = require('backbone');
	var when = require('when');
	var GO = require('app');
	var Board = require('board/models/board');
	var Constants = require('board/constants');
	
	var NODETYPE_FOLDER = Constants.NODETYPE_FOLDER;
	var NODETYPE_SEPERATOR = Constants.NODETYPE_SEPERATOR; 
	var NODETYPE_BOARD = Constants.NODETYPE_BOARD;
	var NODETYPE_COMPANY_SHARE = Constants.NODETYPE_COMPANY_SHARE;
	
	var POSTFIX_SHARED = '_share';
	
	var STATUS_ACTIVE = Constants.STATUS_ACTIVE;
	var STATUS_CLOSED = Constants.STATUS_CLOSED;
	
	var BoardTreeNode = Backbone.Model.extend({		
		adminService: false,
		
		initialize: function(models, options) {
			var opts = options || {};
			
			this.adminService = false;
			if(_.isBoolean(opts.isAdminService)) {
				this.adminService = opts.isAdminService;
			}
		},
		
		/**
		 * board 객체를 SimpleBoardModel로 반환
		 * 객체에 속성으로 모델을 사용할 경우 다른 인스턴스의 속성이 제대로 해제되지 않아 간섭을
		 * 일으키는 경우가 있다. 따라서 필요하면 매번 생성해서 사용하도록 한다.
		 */
		getBoardModel: function() {
			return new Board.Model(this.get('board'));
		}, 
		
		/**
		 * 보드 노드일 경우 board 속성객체의 내부 속성을 변경하기 위한 메소드
		 */
		setBoardAttrs: function(key, value) {
			
			if(!this.isBoardNode()) {
				return;
			}
			
			var boardModel = this.getBoardModel();
			boardModel.set.apply(boardModel, arguments);
			
			this.set('board', boardModel.toJSON());
		},
		
		/**
		 * BoardTreeNode의 id값을 반환
		 */
		getNodeId: function() {
			return this.get('id');
		},
				
		/**
		 * 게시판 ID(노드 ID랑 다를 수 있음), 게시판 타입일 때만 반환
		 */
		getBoardId: function() {
			if(this.isBoardNode() || this.isCompanyShareNode()) {
				return this.getBoardModel().get('id');
			}else{
				return;
			}
			
		},
		
		getBoardName: function() {
			if(!this.isBoardNode()) {
				return;
			}
			
			return this.getBoardModel().get('name');
		},
		
		getNodeType: function() {
			return this.get('nodeType');
		},
		
		getNodeValue: function() {
			return this.get('nodeValue');
		},
		
		getParentId: function() {
			return this.get('parentId');
		},
		
		/**
		 * 공유상태 반환(게시판만 반환하며 그외 노드는 false 반환)
		 */
		getSharedFlag: function() {
			return false;
		},
		
		isFolderNode: function() {
			return this.get('nodeType') === NODETYPE_FOLDER;
		}, 
		
		isBoardNode: function() {
			return this.get('nodeType') === NODETYPE_BOARD;
		}, 
		
		isSeperatorNode: function() {
			return this.get('nodeType') === NODETYPE_SEPERATOR;
		}, 
		
		isCompanyShareNode: function() {
			return this.get('nodeType') === NODETYPE_COMPANY_SHARE;
		},
		
		getCompanyNameByCompanyShares : function(){
			if(this.isCompanyShareNode()){
				var shares = this.get('companyShares');
				if(shares.length > 0){
					return '(' + this.get('originalCompanyName') + ')';
				}else{
					return ''
				}
			}
		},
		
		isManagable: function() {
			return this.isBoardNode() && this.get('actions') && this.get('actions').managable;
		}, 
		
		isPrivateBoard: function() {
			return this.isBoardNode() && this.getBoardModel().isPrivateBoard();
		}, 
		
		/**
		 * 공유 게시판 인가?(기존 로직.. 멀티컴퍼니 공유랑 상관 없는듯)
		 */
		isSharedBoard: function() {
			return this.isBoardNode() && this.getSharedFlag();
		}, 
		
		isAnonymBoard: function() {
			return this.isBoardNode() && this.getBoardModel().get('anonymFlag');
		},
		
		/**
		 * 새 글이 있는가?(보드 노드일 경우)
		 */
		hasBoardNewPost : function() {
			return (this.isBoardNode() || this.isCompanyShareNode()) && this.getBoardModel().hasNewPost();
        }, 
        
        /**
         * 홈 노출 게시판인가(보드 노드일 경우)
         */
        isHomeExposureBoard: function() {
        	console.log(this.getBoardModel().get('homeExposureFlag'));
        	return this.isBoardNode() && this.getBoardModel().get('homeExposureFlag');
        }, 
        isDeptShared: function() {
        	return this.get('deptSharedFlag');
        },
        hasCompanyShare: function() {
        	console.log('hasCompanyShare');
        	return this.get('companyShares') ? this.get('companyShares').length > 0 : false;
        },
        /**
		 * 사이트 관리자에서 사용되는지 여부 반환
		 */
		isAdminService: function() {
			return this.adminService;
		}
	});
	
	var BoardTreeNodes = Backbone.Collection.extend({
		model: BoardTreeNode, 
		status: null, 
		adminService: false, 
		comparator: 'seq', 
		
		initialize: function(models, options) {
			var opts = options || {};
			
			this.companyId = null;
			if(opts.hasOwnProperty('companyId')) {
				this.setCompanyId(opts.companyId);
			}
			
			this.status = null;
			if(opts.hasOwnProperty('status')) {
				this.setStatus(opts.status);
			}
			
			this.adminService = false;
			if(_.isBoolean(opts.isAdminService)) {
				this.adminService = opts.isAdminService;
			}
		},
		
		getNodes: function(parentId) {
			return this.filter(function(boardTreeNode) {
				var curPid = boardTreeNode.get('parentId');
				
				if(!parentId) {
					return !curPid;
				} else {
					return curPid === parentId;
				}
			});
		},
		
		getChildrenCount: function(parentId) {
			return this.getNodes(parentId).length || 0;
		},
		
		hasChildren: function(parentId) {
			return this.getChildrenCount(parentId) > 0;
		}, 
		
		getStatus: function() {
			return this.status;
		},
		
		setStatus: function(status) {
			if(this._validateStatus(status)) {
				this.status = status;
			}
		},
		
		getCompanyId: function() {
			return this.companyId;
		},
		
		setCompanyId : function(companyId){
			this.companyId = companyId;
		},
		
		/**
		 * 노드 생성 및 서버 동기화
		 * 
		 * TODO: API 변경으로 backbone 컬렉션의 create 메커니즘을 그대로 이용할 수 있도록 변경
		 */
		createNode: function(nodeType, nodeValue, parentId) {
			var self = this;
			var reqData = {
				"nodeType": nodeType, 
				"nodeValue": nodeValue
			};
        	
        	if(parentId) {
        		reqData.parentId = parentId
        	}
        	
			return when.promise(function(resolve, reject) {
				self.create(reqData, {
					success: resolve, 
					error: function(e, response) {
						return reject(response);
					}
				});
			});
		},
		
		/**
		 * 노드 삭제 및 (서버)저장
		 */
		destroyNode: function(nodeId) {
			var self = this;
			var model = this.get(nodeId);
			
			return when.promise(function(resolve, reject) {
				model.destroy({
					success: function(model) {
						self.remove(model);
						resolve(model);
					}, 
					error: function(resp) {
						reject()
					}
				});
			});
		},
		
		/**
		 * 게시판 생성 및 서버 동기화
		 */
		createBoardNode: function(boardName, parentId) {
			return this.createNode(NODETYPE_BOARD, boardName, parentId);
		},
		
		/**
		 * 폴더 생성 및 서버동기화
		 */
		createFolderNode: function(folderName, parentId) {			
			return this.createNode(NODETYPE_FOLDER, folderName, parentId);
		},
		
		/**
		 * 구분선 생성 및 서버 동기화
		 */
		createSeperatorNode: function(label, parentId) {
			return this.createNode(NODETYPE_SEPERATOR, label, parentId);
		}, 
		
		findByBoardId: function(boardId) {
			return this.filter(function(node) {
				return node.isBoardNode() && node.getBoardModel().get('id') === parseInt(boardId);
			})[0];
		},
		
		/**
		 * 사이트 관리자에서 사용되는지 여부 반환
		 */
		isAdminService: function() {
			return this.adminService;
		},
		
		_validateStatus: function(status) {
			return _.indexOf([STATUS_ACTIVE, STATUS_CLOSED], status) > -1;
		}
	});
	
	return {
		NODETYPE_FOLDER: NODETYPE_FOLDER, 
		NODETYPE_SEPERATOR: NODETYPE_SEPERATOR,  
		NODETYPE_BOARD: NODETYPE_BOARD, 
		NODETYPE_COMPANY_SHARE : NODETYPE_COMPANY_SHARE,
		STATUS_ACTIVE: STATUS_ACTIVE, 
		STATUS_CLOSED: STATUS_CLOSED, 
		
		Model: BoardTreeNode, 
		Collection: BoardTreeNodes
	};
});