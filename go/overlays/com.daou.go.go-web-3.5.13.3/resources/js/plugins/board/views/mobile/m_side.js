define(function(require) {
			
	var $ = require("jquery"); 
	var Backbone = require("backbone");
	var when = require("when");
	var Hogan = require("hogan");
	var GO = require("app"); 
	
	var BoardBaseConfigModel = require('admin/models/board_base_config');
	var SideFavoriteCollection =require("board/collections/board_favorite"); 

	var CompanyBoardTree = require('board/models/company_board_tree');
	var DeptBoardTree = require('board/models/dept_board_tree');
	var BoardTree = require('board/components/board_tree/board_tree');

	var sideMenuTpl = require("hgn!board/templates/mobile/m_side");
	var boardLang = require("i18n!board/nls/board"); 
	var commonLang = require("i18n!nls/commons");
	
	var lang = {
		'favorite_board' : commonLang['즐겨찾기'],
		'company_board' : boardLang['전사게시판'],
		'new_post' : boardLang['글쓰기'],
		'no_board' : boardLang['등록된 게시판이 없습니다.'],
		'no_dept' : boardLang['소속된 부서가 없습니다. 관리자에게 문의하세요.'],
		'confirm' : commonLang['확인'],
		'cancel' : commonLang['취소']
	};

	var renderTitleTpl = function() {
		var tpl = '<h3><span class="btn_wrap"><span class="txt_ellipsis">{{title}}</span></span></h3>';
		var compiled = Hogan.compile(tpl);
		return compiled.render.apply(compiled, arguments);
	};
	
	var SideView = Backbone.View.extend({
		events: {
			"vclick a[data-navigate]": "goBoard"
		}, 

		initialize : function(options) {
			this.options = options || {};
			
			this.model = BoardBaseConfigModel.read({admin : false}).toJSON();
			GO.config("priorityBoard", this.model.priorityBoard);
			
			// 전사게시판 목록
			this.companyBoardList = new CompanyBoardTree.Collection();
			// 부서게시판 목록
			this.deptBoardList = new DeptBoardTree.Collection();
			
			this.addMenuEls();
		},
		
		render : function() {
			return this.renderContent();
		},
		
		renderContent : function(){	
			console.debug('[board] BoardSideView:renderContent call');
			
			var self = this;
			if(GO.config("priorityBoard")){
				return when.all([
					this.favoriteRender(),
					this.deptBoardRender(),
					this.companyBoardRender()
				]).then(function() {
					self.setSideApp();
					return when.resolve(self);
				});
			}else{
				return when.all([
					this.favoriteRender(),
					this.companyBoardRender(),
					this.deptBoardRender()
				]).then(function() {
					self.setSideApp();
					return when.resolve(self);
				});
			}
		},
		
		/**
		 * 부서 게시판 렌더링(새로 작성중)
		 */
		deptBoardRender: function() {
			var self = this;
			var collection = this.deptBoardList;
			var $container = this.$('#sideDeptBoard');
			
			$container.empty();
						
			return when.promise(function(resolve, reject) {
				collection.fetch({
			        success : function(collection){
			        	collection.each(function(deptBoardModel) {
			        		var allNodes = deptBoardModel.getBoardTreeNodes();
			        		// 기존에 구분선은 렌더링 하지 않았다.
			        		var filteredNodes = allNodes.filter(function(treeNode) {
			        			return !treeNode.isSeperatorNode();
			        		});
			        		var menuId = ['company', GO.session('companyId'), 'dept'].join('.');
			        		var treeView = self._renderMenuTree(filteredNodes, menuId);
			        		$container.append(renderTitleTpl({
			        			"title": deptBoardModel.getDeptName()
			        		}), treeView.el);
			        	});
			        	resolve();
			        }, 
			        error: reject
				});
			});
		},
		
		favoriteRender : function() {
			var favoriteCollection = SideFavoriteCollection.create();
			var self = this;
			
			return when.promise(function(resolve, reject) {
				favoriteCollection.fetch({
					data : { 'page' : '0' , 'offset' : '1000' },
					success : function(collection){
						var dataset = collection.toJSON(),
						menus = [];
					
						self.$favoriteBoardEl.empty();
						
						if(!dataset.length){
						    resolve();
							return false;
						}
						$(dataset).each(function(k,v) {
							if(v.boardId) {
								menus.push({
									iconCls : 'ic_add_tag',
									name : v.name,
									publicFlag : v.publicFlag,
									'hasRecentPost?' : function() {
				                        return v.lastPostedAt && GO.util.isCurrentDate(v.lastPostedAt);
				                    },
									navigate : 'board/'+v.boardId
								});
							}
						});
						
						self.$favoriteBoardEl.append(sideMenuTpl({
							'title' : lang['favorite_board'],
							'menus' : menus,
							'hasMenu?' : function() {
								return menus.length > 0;
							}
						}));
						
						resolve();
					}, 
					error: reject
				});
			});
		},
		
		/**
         * 전사 게시판 렌더링
         */
		companyBoardRender : function(){
			var self = this;
			var collection = this.companyBoardList;
			var $container = this.$('#sideCompanyBoard');
			
			$container.empty();
						
			return when.promise(function(resolve, reject) {
				collection.fetch({
			        success : function(collection){
			        	if(collection.length > 0) {
			        		$container.show();
			        	}
			        	
			        	collection.each(function(companyBoardTree) {
			        		// 전사게시판 트리 렌더링
			        		var boardTreeNodes = companyBoardTree.getBoardTreeNodes();
			        		var filteredNodes = boardTreeNodes.filter(function(treeNode) {
			        			return !treeNode.isSeperatorNode();
			        		});
			        		var menuId = ['company', GO.session('companyId'), 'company'].join('.');
			        		var boardTreeView = self._renderMenuTree(convertBoardsAction(filteredNodes), menuId);
			        		$container.append(renderTitleTpl({
			        			"title": boardLang['전사게시판']
			        		}), boardTreeView.el);
			        	});
			        				        	
			        	resolve();
			        }, 
			        error: reject
				});
				
				function convertBoardsAction(boardTreeNodes) {
					boardTreeNodes.map(function(boardTreeNode) {
						var oldActions = boardTreeNode.get('actions');
						if(oldActions && oldActions.managable) {
							// 사용자 서비스에서 전사게시판을 관리할 수 없다.
							oldActions.managable = false;
							boardTreeNode.set('actions', oldActions);
						}
					});
					
					return boardTreeNodes;
				}
			});
		},
		
		_renderMenuTree: function(boardTreeNodes, menuId) {
			var treeMenuView = new BoardTree.MobileBoardTreeMenuView({
				"nodes": boardTreeNodes, 
				"menuId": menuId
			});
			// 제일 바깥쪽에만 클래스를 넣어줘야 한다.
			treeMenuView.$el.addClass('side_depth');
			treeMenuView.render();
			return treeMenuView;
		},

		addMenuEls : function() {
			var tpl = '<div id="sideFavoriteBoard" />';
			if (GO.config("priorityBoard")) {
				tpl += '<div id="sideDeptBoard" /><div id="sideCompanyBoard" />';
			} else {
				tpl += '<div id="sideCompanyBoard" /><div id="sideDeptBoard" />';
			}
			this.$el.html(tpl);
			this.$favoriteBoardEl = this.$el.find('#sideFavoriteBoard');
		},

		setSideApp : function() {
			$('body').data('sideApp', this.packageName);
		},

		goBoard : function(e) {
			e.preventDefault();
			e.stopPropagation();
			var eTarget = $(e.currentTarget),
				navigate = eTarget.attr('data-navigate');
			
			if(navigate) {
				GO.router.navigate(navigate, {trigger: true});
			}
			return false;
		}
	}, {
        __instance__: null, 
        create: function(packageName) {
            this.__instance__ = new this.prototype.constructor({'packageName':packageName}); 
            return this.__instance__;
        }
    });
	
	return SideView;
});