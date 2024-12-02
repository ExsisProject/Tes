define([ 
	"app",
	"backbone", 
	"community/models/posts"
],

function(GO, Backbone, Model) {
	var instance = null;
	var CommunityRankCollection = Backbone.Collection.extend({
		model : Model,
		url : function() {
			return "/api/community/list/all";
		},		
		
	}, {
		
		setFetch : function(opt) {
			instance = new CommunityRankCollection();
			instance.fetch({				
				data: {
					"page":opt.page,
					"offset":opt.offset,
					"property":opt.property},
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
			return CommunityRankCollection.setFetch(opt);
		},
		create : function(opt){
		    var instance = new CommunityRankCollection(opt);
		    return instance;
		}
	};
});