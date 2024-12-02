define([
    "backbone"
],

function(
		Backbone
) {	
	var instance = null;
	
	var Board = Backbone.Model.extend({
		isHeaderRequired : function() {
			return this.get("header").headerRequiredFlag;
		}
	});
	
	var BoardListCollection = Backbone.Collection.extend({
		model : Board,
		initialize : function(opt) {
			this.options = opt || {};
			this.urlPart = this.options.urlPart;
		},
		
		url: function() {
			return "/api/board/menu/"+this.urlPart;
		},
		setDeptId : function( isCommunity, deptId, ownerType, boardType ) {
			boardType = boardType || 'all';
			
			if(isCommunity){
				this.urlPart = "community/" + deptId;
			}else{
				if(ownerType == "Department"){
					this.urlPart = "department/" + deptId;
				}else{
					this.urlPart = "target/company";
				}
			}
			
			this.urlPart += '/'+boardType;
		},
		
		
		getWritableBoards : function() {
			return _.filter(this.models, function(board) {
				return board.get("actions").writable;
			});
		},
		
		
		getBoard : function(boardId) {
			return _.find(this.models, function(model) {
				return model.id == boardId;
			});
		}
	}, {
		setFetch: function(opt) {
			
			instance = new BoardListCollection(opt);
			instance.setDeptId(opt.isCommunity, opt.deptid, opt.ownerType, opt.boardType);
			if (opt.deptid != 'all') {
				instance.fetch({async:false});				
			}
			
			return instance;
		}
	});
	
	return {
		// deprecated!!
		getBoardList: function(opt) {
			var deptList = BoardListCollection.setFetch(opt);
			return deptList;
		},
		init : function(opt) {
			return new BoardListCollection(opt);
		}
	};
	
});