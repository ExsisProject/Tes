define([
    "backbone"
],

function(
		Backbone
) {	
	var AssetList = Backbone.Collection.extend({
		model : Backbone.Model,
		url: function() {
			return '/ad/api/system/asset/list/'+ this.companyId;
		},
		setCompanyId : function(companyId){
			this.companyId = companyId;
		},
	}); 
	
	return AssetList;
});