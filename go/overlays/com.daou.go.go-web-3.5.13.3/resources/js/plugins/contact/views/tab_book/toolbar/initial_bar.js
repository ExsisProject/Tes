/**
 * 이니셜 툴바
 */
;define(function (require) {
    var Backbone = require("backbone");
    var ContactLang = require("i18n!contact/nls/contact");

    var InitialView = Backbone.View.extend({
        className: "sort_wrap",

        events: {
            "click ul.tab_nav li": "_onClickInitial"
        },

        initialize: function () {

        },

        render: function () {
            var initialWord = ContactLang["초성검색"];
            var split = [];
            split = initialWord.split(',');
            var tpl = makeTpl(split);
            this.$el.html(tpl);

            function makeTpl(split) {
                var tplHtml = ["<ul class='tab_nav'>"];
                $(split).each(function (key, value) {
                    if (key == 0) {
                        tplHtml.push('<li data-param="" class="ui-state-active first"><span>' + value + '</span></li>');
                    } else if (key == split.length - 1) {
                        tplHtml.push('<li class="last" data-param="' + value + '"><span>' + value + '</span></li>');
                    } else {
                        tplHtml.push('<li data-param="' + value + '"><span>' + value + '</span></li>');
                    }
                });
                tplHtml.push('</ul>');

                return tplHtml.join("");
            }
        },

        reset: function () {
            var $targets = this.$el.find("li");

            $targets.each(function (target, index) {
                var $target = $(target);
                if (index == 0) {
                    $target.addClass("ui-state-active")
                } else {
                    $target.removeClass("ui-state-active")
                }
            });
        },

        _onClickInitial: function (e) {
            var $target= $(e.currentTarget);
            $target.closest("ul").find("li").removeClass("ui-state-active");
            $target.addClass("ui-state-active")
            var initial = $target.data("param");
            this.trigger("click.initialWord", initial);
        },

        show : function(){
            this.$el.show();
        },

        hide : function(){
            this.$el.hide();
        }
    });

    return InitialView;
});