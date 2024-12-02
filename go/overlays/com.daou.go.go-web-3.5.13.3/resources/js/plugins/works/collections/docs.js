define("works/collections/docs", function(require) {
	var PaginatedCollection = require("collections/paginated_collection");
	var BaseDocs = require('works/collections/base_docs');
	return BaseDocs.extend(PaginatedCollection.prototype);
});