define('works/components/app_list/collections/apps', function(require) {
	var PaginatedCollection = require("collections/paginated_collection");
	
	var Collection = PaginatedCollection.extend({
		url: function() {
			var url = GO.contextRoot + "api/works/applets/search";
			url += "?" + this.makeParam();
			
			return url; 
		}
	});
	
	return Collection;
});