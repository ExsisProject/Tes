define('works/home/collections/applet_export_list', function (require) {
	var PaginatedCollection = require("collections/paginated_collection");
	
	var Collection = PaginatedCollection.extend({
		url: function() {
			var url = GO.contextRoot + "api/works/applets/export";
			url += "?" + this.makeParam();
			
			return url; 
		}
	});
	
	return Collection;
});