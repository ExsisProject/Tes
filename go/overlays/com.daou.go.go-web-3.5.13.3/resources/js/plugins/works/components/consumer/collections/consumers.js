define('works/components/consumer/collections/consumers', function(require) {
	var Collection = Backbone.Collection.extend({
		initialize: function(options) {
			this.appletId = options.appletId;
			this.docId = options.docId;
		},
		
		url: function() {
			return GO.contextRoot + 'api/works/applets/' + this.appletId + '/doc/' + this.docId + '/consumers';
		}
	});
	
	return Collection;
});