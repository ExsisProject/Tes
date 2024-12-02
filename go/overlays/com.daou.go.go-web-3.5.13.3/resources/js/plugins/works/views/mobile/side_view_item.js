define('works/views/mobile/side_view_item', function (require) {
    var Backbone = require('backbone');
    var Hogan = require('hogan');

    var ViewItemTmpl = Hogan.compile(
        '<a name="sideViewItem" keyword="{{model.keyword}}">{{model.리포트}}</a>'
    );

    var ViewItemView = Backbone.View.extend({
        tagName: "li",

        initialize: function (options) {
            this.options = options || {};
            this.model = options.model;
            this.className = options.className;
        },

        render: function () {
            this.$el.html(ViewItemTmpl.render({
                model: this.model,
                className: this.className
            }));
            return this;
        }

    });
    return ViewItemView;
});
