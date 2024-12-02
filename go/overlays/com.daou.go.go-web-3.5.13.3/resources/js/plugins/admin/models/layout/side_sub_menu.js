define('admin/models/layout/side_sub_menu', function (require) {

    var Backbone = require('backbone');
    var _ = require('underscore');

    var SideNewModel = Backbone.Model.extend({

        initialize: function (options){
            this.attributes = options;
            this.uid = this.get('uid');
            this.title = this.get('title');
            this.contentsPath = this.get('contentsPath');
            this.routingName = this.get('routingName');
            this.idParamName = this.get('idParamName');
            this.option = this.get('option');
        },
        getMenuKey: function () {
            return this.uid ? this.uid : this.adminMenuKey;
        },
        updateFavorite: function (favorite) {
            this.favorite = favorite;
            var self=this;
            $.ajax({
                url: GO.contextRoot + "ad/api/menu/favorite",
                data: JSON.stringify({
                    adminMenuKey: self.parentUid,
                    favorite: self.favorite
                }),
                type: 'PUT',
                async:false,
                contentType: 'application/json',
                success: function (res) {
                    self.favorite = res.favorite;
                    $('body').trigger('favorite.menu.updated');
                }, error: function () {
                    self.favorite = !self.favorite;
                }
            })
        }
    });
    return SideNewModel;
});