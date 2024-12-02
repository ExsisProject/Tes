define('works/home/collections/applet_import_list', function (require) {
	var PaginatedCollection = require("collections/paginated_collection");
	
	var Collection = PaginatedCollection.extend({
		url: function() {
			var url = GO.contextRoot + "api/works/templates/import";
			url += "?" + this.makeParam();
			
			return url; 
		},
		parse: function(resp) {
			var responseData = PaginatedCollection.prototype.parse.apply(this, arguments);
			
			return _.map(responseData, function(data) {
				data.id = data.templateId;
				return data;
			});
		}
	});
	
	return Collection;
});