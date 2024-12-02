define("views/notification/list", function(require) {

    var _ = require("underscore");
    var Backbone = require("backbone");
    var Hogan = require("hogan");
    var GO = require("app");
    var ItemView = require("views/notification/item");
    var commonLang = require("i18n!nls/commons");

    var NotificationListView = Backbone.View.extend({

        tagName: "ul",
        className: "type_simple_list simple_list_alarm",

        initialize: function() {
        },

        render: function() {
            this.$el.empty();
            this.collection.each(function(model) {
                var itemView = new ItemView({
                    model: model
                });
                this.$el.append(itemView.render());
            }, this);
            return this.$el;
        }

    });

    return NotificationListView;

});
