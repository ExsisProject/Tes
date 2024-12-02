define([
    "backbone"
],

function(Backbone) {
	
	var instance = null;
	var IndexfssModel = Backbone.Model.extend({
		url: function() {
			return "/ad/api/system/indexfss";
		}
	},
	{
		get : function(){
			var instance = new IndexfssModel();
			instance.set({silent:true});
			instance.fetch({async:false});
			return instance;
		}
	}
	); 
	
	return {
		read : function(){
			return indexfssModel = IndexfssModel.get();
		}
	};
});