define([ 
	"app",
	"backbone", 
	"community/models/posts"
],

function(GO, Backbone, Model) {
	var instance = null;
	var CommunityFeedCollection = Backbone.Collection.extend({
		model : Model,
		url : function() {
			return "/api/community/myfeed";
		},		
		
	}, {
		
		setFetch : function(opt) {
			instance = new CommunityFeedCollection();
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
			return CommunityFeedCollection.setFetch(opt);
		},
		create : function(opt){
		    return new CommunityFeedCollection(opt);
		}
	};
});