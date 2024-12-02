define([
    "backbone"
],

function(
		Backbone
) {	
	var AssetList = Backbone.Collection.extend({
		url: function() {
			return ['/api/asset',this.assetId,'item',this.urlPart].join('/');
		},
		setUrlPart : function(type){
			if(type == 'reservation'){
				this.urlPart = '';
			}else if(type == 'rentable'){
				this.urlPart = 'rental/RENTABLE';
			}else if(type == 'norentable'){
				this.urlPart = 'rental/NORENTABLE';
			}else if(type == "return"){
				this.urlPart = 'rental/RETURN';
			}else if(type == "notavailable"){ //모바일용 대여불가능
				this.urlPart = 'rental/NOTAVAILABLE';
			}else if(type == "calendar"){  //캘린더 예약용 , 예약가능한 자산목록
				this.urlPart = 'reservation/availability';
			}
		},
		setAssetId : function(id){
			this.assetId = id;
		},

        getItems: function() {
            return this.map(function(item) {
                return {
					assetId: item.get("assetId"),
					useRental: item.get("useRental"),
					rentStatus: item.get("rentStatus"),
                    key: item.id,
                    label: item.get('name')
                };
            });
        }
	}); 
	
	return {
        init: function(arguments) {
            return new AssetList(arguments);
        },
		getCollection: function(opt) {
			var assetList = new AssetList();		
			assetList.setAssetId(opt.assetId);
			assetList.setUrlPart(opt.type);
			var data = {};
			
			if(opt.mobile){
				 data.page = opt.page || '0';
				 data.offset = opt.offset || '10';
				 data.property = 'name';
				 data.direction = 'desc';
			}
			
			if(opt.type == "calendar"){
				data.startTime = opt.startTime;
				data.endTime = opt.endTime;
			}
			
			assetList.fetch({data : data, async:true,reset:true});
			return assetList;
		}
	};
});