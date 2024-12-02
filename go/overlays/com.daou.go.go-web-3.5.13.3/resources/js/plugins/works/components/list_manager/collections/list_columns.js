define("works/components/list_manager/collections/list_columns", function(require) {
	
	var Column = require("works/components/list_manager/models/list_column");
	
	return Backbone.Collection.extend({
		
		model : Column,
		
		initialize : function() {
			this.collectionName = "columns";
		},
		
		setTitleColumnByIndex : function(index) {
			this.each(function(model) {
				model.set("isTitle", false);
			}, this);
			
			var column = this.at(index);
			if (!column) return false;
			column.set("isTitle", true);
		},
		
		setTitleColumnByFieldCid : function(fieldCid) {
			this.each(function(model) {
				model.set("isTitle", false);
			}, this);
			
			var column = this.findWhere({fieldCid : fieldCid});
			if (!column) return false;
			column.set("isTitle", true);
		},
		
		getTitleColumnIndex : function() {
			var column = this.findWhere({isTitle : true});
			return this.indexOf(column);
		},
		
		setSortColumnByIndex : function(index, sortDirection) {
			this.each(function(model) {
				model.set("isSortBy", false);
			}, this);
			
			if (index < 0) return;
			
			var column = this.at(index);
			column.set("isSortBy", true);
			column.set("sortDirection", sortDirection);
		},
		
		setSortColumnByFieldCid : function(fieldCid, sortDirection) {
			this.each(function(model) {
				model.set("isSortBy", false);
			}, this);
			
			var column = this.findWhere({fieldCid : fieldCid});
			column.set("isSortBy", true);
			column.set("sortDirection", sortDirection);
		},
		
		getSortColumnIndex : function() {
			var column = this.findWhere({isSortBy : true});
			return this.indexOf(column);
		},
		
		getSortDirection : function() {
			var index = this.getSortColumnIndex();
			if (index < 0) return null;
			return this.at(this.getSortColumnIndex()).get("sortDirection");
		},
		
		reIndex : function(cids) {
			var reIndexedColumns = _.map(cids, function(cid) {
				return this.findWhere({fieldCid : cid});
			}, this);
			
			this.reset(reIndexedColumns);
		},
		
		/**
		 * fields 에 존재하지 않는 column 을 무시한다.
		 */
		filterByFields : function(fields) {
			var fieldIds = _.map(fields, function(field) {
				return field.cid;
			});
			return this.filter(function(column) {
				return _.contains(fieldIds, column.get("fieldCid"));
			});
		},
		
		mergeFromFields : function(fields) {
			_.each(fields, function(field) {
				var column = this.findWhere({fieldCid : field.cid});
				if (!column) return;
				column.set("fieldType", field.fieldType);
				column.set("fieldLabel", field.label);
			}, this);
		}
	});
});