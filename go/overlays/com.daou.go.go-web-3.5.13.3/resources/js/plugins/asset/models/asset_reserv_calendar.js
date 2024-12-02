define([
    "backbone"
],

function(Backbone) {
    var instance = null;
    var AliasModel = Backbone.Model.extend({
        urlRoot : GO.contextRoot + "api/asset/reservation/calendar"
    }, {
        get: function(id) {
            if(instance == null) instance = new AliasModel();
            instance.urlRoot = GO.contextRoot + "api/asset/reservation/calendar/" + id;
            //instance.set("reservationId", id, {silent: true});
            instance.fetch({async:false});
            return instance;
        },
		create : function(){
		    return new AliasModel();
		}
    }); 
    
    return AliasModel;
});