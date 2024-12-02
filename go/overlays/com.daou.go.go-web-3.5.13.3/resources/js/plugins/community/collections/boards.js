define([ 
	"backbone", 
	"community/models/boards" 
],

function(Backbone, Model) {
	var instance = null;
	var CommunityBoardCollection = Backbone.Collection.extend({
		model : Model,
		url : function(communitId) {
			return [ "/api/community", this.communityId, "boards" , this.status].join('/');
		},		
		setVariables : function(communityId, status){
			this.communityId = communityId;
			this.status = status;
		},
		// 내가 운영자로 있는 게시판. managable 게시판이 아님. 
		// 커뮤니티에 managable 한경우 그 커뮤니티의 게시판에도 managable 하기때문에 별도로 추가한 함수.
		getManagerInBoard : function() {
			var namePosition = GO.session().name + " " + GO.session().position || ""; 
			return _.filter(this.models, function(model) {
				return model.get("board").managerName == namePosition;
			});
		}
	}, {
		setFetch : function(communityId, status, offset) {			
			instance = new CommunityBoardCollection();
			instance.setVariables(communityId, status);			
			instance.fetch({				
				data: {
					"page":"0",
					"offset" : offset
				},
				async : false
			});
			return instance;			
		}
	});
	return {
		getCollection : function(communityId, status, offset) {
			return CommunityBoardCollection.setFetch(communityId, status, offset);
		},
		create : function(opts){
		    return new CommunityBoardCollection(opts);
		}
	};
});