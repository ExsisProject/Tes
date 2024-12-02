/**
 * 탭 툴바
 */
;define(function (require) {
    var Backbone = require("backbone");
    var Hogan = require("hogan");

    /**
     * tab에 대한 view
     */
    var TabView = Backbone.View.extend({
        tagName: "ul",

        className: "tab_nav nav_layer",

        template: Hogan.compile("<li data-type='{{type}}'><a data-bypass=''>{{name}}</a></li>"),

        events: {
            "click li": "clickTab",
            "change select" : "change"
        },

        initialize: function (options) {
            this.tabMenus = options.tabMenus;
            this.initType = options.initType;
        },

        render: function () {
            var menus = [];

            _.each(this.tabMenus, function (menu) {
                menus.push(this.template.render(menu));
            }, this);

            this.$el.html(menus.join(""));
            this.$el.find("li[data-type='" + this.initType +"']").addClass("ui-state-active");
        },

        clickTab: function (e) {
            var $target = $(e.currentTarget);
            this.$el.find("li").removeClass("ui-state-active");
            $target.addClass("ui-state-active");

            var type = $target.data("type");
            this.trigger("tab.click", {type: type});
        }
    });

    return TabView;
});