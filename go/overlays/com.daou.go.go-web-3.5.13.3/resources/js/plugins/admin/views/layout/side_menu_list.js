define('admin/views/layout/side_menu_list', function (require) {

    var $ = require('jquery');
    var Backbone = require('backbone');
    var App = require('app');


    return Backbone.View.extend({

        tagName:'ul',
        className:'gnb_sub',

        initialize: function (name, sideMenuCollection) {
            this.name = name;
            this.sideMenuCollection = sideMenuCollection;
        },
        tpl: function (model, idPrefix) {
            if (!model || !model.accessible || !model.view) {
                return '';
            }
            return '<li name="' + model.getMenuKey() + '" id="' + idPrefix + model.getMenuKey() + '"> <a class="tit"> <span class="txt">' + model.labelKey + '</span> </a> </li>'
        },
        render: function () {

            this.$el.html();
            var root = this.$el;
            root.empty();

            if(!this.init){
                root.css('display', 'none');
                this.init = true;
            }

            if (this.models) {
                for (var i = 0; i < this.models.length; i++) {
                    root.append( this.tpl (this.models[i], this.name));
                }
            }
            return this;
        },
        update:function(menus) {

            this.models = [];
            for (var i = 0; i < menus.length; i++) {
                this.models[i] = this.sideMenuCollection.findMenu(menus.models[i].getMenuKey());
            }
            this.render();
        },

    });
});