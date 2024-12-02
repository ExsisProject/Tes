define(function(require) {
	
	var $ =  require("jquery"); 
	var Backbone =  require("backbone"); 
	var GO =  require("app"); 
	var CommunityModel = require("community/models/community_info");
	var BoardsCollection =require("community/collections/community_boards");
	var sideMenuTpl =  require("hgn!board/templates/mobile/m_side");
	var boardLang = require("i18n!board/nls/board"); 
	var commonLang = require("i18n!nls/commons");
	
	var CommunityBoardTree = require('community/models/comm_board_tree');
	var BoardTree = require('board/components/board_tree/board_tree');
	
	var MobileBoardTreeMenuView = BoardTree.MobileBoardTreeMenuView
	var MobileCommBoardTreeView = MobileBoardTreeMenuView.extend({
		communityId: null, 
		
		initialize: function(options) {
			var opts = options || {};
			
			MobileBoardTreeMenuView.prototype.initialize.apply(this, arguments);
			
			this.communityId = null;
			if(opts.hasOwnProperty('communityId')) {
				this.communityId = opts.communityId;
			}
		}, 
		
		/**
		 * @Override
		 */
		renderChildView: function(boardTreeNode) {
			var childView = new this.constructor({
				"nodes": this.boardTreeNodes, 
				"parentId": boardTreeNode.getNodeId(), 
				"communityId": this.communityId, 
				"menuId": this.menuId
			});
			
			childView.render();
			return childView
		},
		
		/**
		 * @Override
		 * 링크 URL 생성
		 */
		getLinkUrl: function(boardTreeNode) {
			var url = '#';
			if(boardTreeNode.isBoardNode()) {
				url = ['community', this.communityId, 'board', boardTreeNode.getBoardId()].join('/');
			}
			
			return url;
		}, 
	});
	
	var renderTitleTpl = function() {
		var tpl = '<h3><span class="btn_wrap"><span class="txt_ellipsis">{{title}}</span></span></h3>';
		var compiled = Hogan.compile(tpl);
		return compiled.render.apply(compiled, arguments);
	};
	
	var SideView = Backbone.View.extend({
		unBindEvent : function() {
			this.$el.off('vclick', 'h3');
		},
		bindEvent : function() {
			this.$el.on('vclick', 'h3', $.proxy(this.goCommunityHome, this));
		},
		initialize : function(options) {
			var self = this;
		    this.$el.off();
			this.options = options || {};
			
			this.collection = new CommunityBoardTree.Collection();

			this.collection.on('reset', function( response, collection ) {
				self.renderBoardsList();
			});
			
		},
		render : function(options) {
			var self = this;
			
			this.packageName = this.options.packageName;
			var deferred = $.Deferred();

			if(this.communityId != options.communityId) {
				this.communityId = options.communityId;
				this.model = CommunityModel.read({ communityId : this.communityId });
				this.collection.communityId = this.communityId;
				this.collection.fetch({ data : { offset : 100, page : 0 }, reset:true}).done(function() {
					deferred.resolveWith(self, [self]);
				});
				this.setSideApp();
			} else {
				deferred.resolveWith(this, [this]);
			}
			
			this.unBindEvent();
			this.bindEvent();
			
            return deferred;
		},
		renderBoardsList : function() {
			this.collection.each(function(commBoardTree) {
				var boardTreeNodes = commBoardTree.getBoardTreeNodes();
        		var filteredNodes = boardTreeNodes.filter(function(treeNode) {
        			return !treeNode.isSeperatorNode();
        		});
        		var menuId = ['communty', this.communityId].join('.');
        		var boardTreeView = this._renderMenuTree(filteredNodes, menuId);
        		this.$el.append(renderTitleTpl({
        			"title": this.model.get('name')
        		}), boardTreeView.el);
        	}, this);
		},
		
		_renderMenuTree: function(boardTreeNodes, menuId) {
			var treeMenuView = new MobileCommBoardTreeView({
				"communityId": this.communityId, 
				"nodes": boardTreeNodes, 
				"menuId": menuId
			});
			// 제일 바깥쪽에만 클래스를 넣어줘야 한다.
			treeMenuView.$el.addClass('side_depth');
			treeMenuView.render();
			return treeMenuView;
		},
		
		setSideApp : function() {
			$('body').data('sideApp', this.packageName);
		},
		goCommunityHome : function(e) {
			$(e).focusout().blur();
			GO.router.navigate('community/'+this.communityId, true);
			return false;
		},
		goBoard : function(e) {
			debugger;
			var eTarget = $(e.currentTarget);
			var href = eTarget.attr('href');
			
			e.preventDefault();
			e.stopPropagation();
			
			if(href && href !== '#') {
				GO.router.navigate(href, {trigger: true});
			}
			return false;
		}
	}, {
        __instance__: null, 
        create: function(packageName) {
           this.__instance__ = new this.prototype.constructor({'packageName':packageName});// if(this.__instance__ === null) 
            return this.__instance__;
        }
    });
	
	return SideView;
});