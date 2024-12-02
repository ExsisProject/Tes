define([
    "backbone"
],

function(
		Backbone
) {	
	var AssetList = Backbone.Collection.extend({
		model : Backbone.Model, 
		
		url: function() {
			return ['/api/asset',this.assetId,this.urlPart].join('/');
		},
		
		setUrlPart : function(type){
			if(type == 'info'){
				this.urlPart = 'attribute/item';   //해당자산의 변동 attribute 종류 가져오기
			}else if(type == 'reservation'){
				this.urlPart = 'attribute/reservation';
			}else if(type == 'item'){
				this.urlPart = 'item';
			}
		},
		
		setAssetId : function(id){
			this.assetId = id;
		}
	}, {
	    getCollection: function(opt) {
            var assetList = new this.prototype.constructor();
            assetList.setUrlPart(opt.type);
            assetList.setAssetId(opt.assetId);
//            assetList.fetch({async:false,reset:true});
            assetList.fetch({async:true,reset:true});
            return assetList;
        }
	}); 
	
	return AssetList;
});