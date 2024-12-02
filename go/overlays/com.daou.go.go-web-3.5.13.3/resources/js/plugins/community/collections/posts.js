define([ 
	"app",
	"backbone", 
	"community/models/posts"
],

function(GO,Backbone, Model) {
	var instance = null;
	var CommunityPostCollection = Backbone.Collection.extend({
		model : Model,
		url : function(communitId) {
			return [ "/api/community", this.communityId, "board" , "myhome"].join('/');
		},		
		setVariables : function(communityId){
			this.communityId = communityId;
		}
	}, {
		setFetch : function(opt) {
			instance = new CommunityPostCollection();
			instance.setVariables(opt.communityId);			
			instance.fetch({				
				data: {
					"page":opt.page,
					"offset":opt.offset},
				async : false,
				statusCode: {
                    403: function() { GO.util.error('403', { "msgCode": "400-board"}) }, 
                    404: function() { GO.util.error('404', { "msgCode": "400-board"}) }, 
                    500: function() { GO.util.error('500'); }
                }
			});
			return instance;			
		}	
	});
	return {
		getCollection : function(opt) {
			return CommunityPostCollection.setFetch(opt);
		},
		create : function(opts){
		    return new CommunityPostCollection(opts);
		}
	};
});