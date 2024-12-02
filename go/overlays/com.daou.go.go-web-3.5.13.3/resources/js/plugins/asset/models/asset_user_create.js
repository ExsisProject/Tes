define([
    "backbone"
],

function(Backbone) {
	var AssetReservationModel = Backbone.Model.extend({

	    url: function() {
	        var urlArray = ['/api/asset', this.get('assetId'), 'item', this.get('itemId')];
			
			switch( this.get('type') ) {
    			case 'reserve': 
    			    urlArray.push('reserve');
    			    break;
    			case 'return':
    			    urlArray.push('reservation/return');
    			    break;
                case 'current':
                    urlArray.push('reservation/current');
                    break;
                case 'title':
                    urlArray.push('title');
                    break;
                case 'reservationStatus':
                    urlArray.push('reservation');
                    urlArray.push(this.get('reservationId'));
                    break;
			}
			
			return urlArray.join('/');
		}
	}); 
	
	return AssetReservationModel;
});