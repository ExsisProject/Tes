define("admin/collections/recently_menus", function (require) {

    var Backbone = require("backbone");
    var SideMenu= require("admin/models/layout/side_menu");

    var FavoriteMenus = Backbone.Collection.extend({

        model : SideMenu,

        initialize : function(){
        },

        url: function () {
            return '/ad/api/menu/recent';
        }
    });
    return FavoriteMenus;
});