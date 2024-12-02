(function() {
define([
    "components/favorite/views/favorite",
], 
function(
    FavoriteView
) {

    var FavoriteAppView = Backbone.View.extend({
        initialize: function(options) {
        	this.favoriteView = new FavoriteView(options)
        },
        
        render : function(isModify) {
            return this.favoriteView.render();
        }
    },{
        create : function(opt){
            var instance = new FavoriteAppView(opt);
            return instance.render();
        }
    });
 
    return FavoriteAppView;
});
}).call(this);