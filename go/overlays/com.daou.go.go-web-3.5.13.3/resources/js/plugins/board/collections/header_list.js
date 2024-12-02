define([
    "backbone"
],

function(
) {	
	var instance = null;
	var HeaderListCollection = Backbone.Collection.extend({
		initialize : function(options) {
			this.options = options || {};
			this.boardId = this.options.boardId;
		},
		
		url: function() {
			return "/api/board/" + this.boardId + "/header";
		},
		setBoardId : function(boardId){
			this.boardId = boardId;
		}
		
	}, {
		setFetch: function(opt) {
			instance = new HeaderListCollection();
			instance.setBoardId(opt.boardId);
			instance.fetch({async:false});
			
			return instance;
		}
	});
	
	return {
		// deprecated!!
		getHeaderList: function(opt) {
			var headerList = HeaderListCollection.setFetch(opt);
			return headerList;
		},
		init : function(opt) {
			return new HeaderListCollection(opt);
		}
	};
	
});