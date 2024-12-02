define("works/components/filter/collections/filters", function(require) {
	var Filter = require("works/components/filter/models/filter");
	var PaginatedCollection = require('collections/paginated_collection');

    var Attrs = {
		type: 'mine',

		model : Filter,

		initialize : function(models, options) {
			this.options = options || {};
			this.collectionName = "filters"; // debugging 용도

			if (this.options.paginated) {
				PaginatedCollection.prototype.initialize.call(this, models, options);
				this._initPageOption();
			}

			this.type = options.type || this.type;
			this.appletId = options.appletId;

		},
		
		url : function() {
			var url = GO.contextRoot + 'api/works/applets/' + this.appletId + '/filters/' + this.type;
			if (this.options.paginated) url += '?' + this.makeParam();
			return url;
		},

		parse: function(resp) {
			var data = [];
			if (this.options.paginated) {
				data = PaginatedCollection.prototype.parse.call(this, resp);
			} else {
				data = resp.data;
			}

			_.each(data, function(filter) {
				filter.type = this.type;
			}, this);

			return data;
		},

		_initPageOption: function() {
			this.pageSize = 10;
			this.direction = 'asc';
			this.property = 'name';
		}
	};

	return function(models, options) {
		options = options || {};
		if (options.paginated) {
			return new (PaginatedCollection.extend(Attrs))(models, options);
		} else {
			return new (Backbone.Collection.extend(Attrs))(models, options);
		}
	}
});