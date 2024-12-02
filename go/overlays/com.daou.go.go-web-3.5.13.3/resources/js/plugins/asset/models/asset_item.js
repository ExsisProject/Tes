define([
    "backbone"
],

function(Backbone) {
	var model = Backbone.Model.extend({
		//자산 아이템의 정보(code,name,properties 등)
		url: function() {
			this.assetId = this.get('assetId');	
			this.itemId = this.get('itemId');
			var urlArray = ['/api/asset',this.assetId,'item'];
			if(this.itemId){
				urlArray.push(this.itemId);
			}
			
			return urlArray.join('/');

		}
	}); 
	return model;
});