define([
        "backbone",
        "app",
        "hgn!welfare/templates/title",
        "i18n!welfare/nls/welfare"
    ],

    function(
        Backbone,
        GO,
        TitleTpl,
        WelfareLang
    ) {
        var lang = {
            "내 복지포인트" : WelfareLang["내 복지포인트"],
            "전사 복지포인트" : WelfareLang["전사 복지포인트"],
            "전사 복지포인트 관리" : WelfareLang["전사 복지포인트 관리"]
        };

        var Title = Backbone.View.extend({
            events: {

            },

            initialize: function() {},

            render: function(title) {

                $.extend(lang, {"label_title" : WelfareLang[title]});;

                this.$el.html(TitleTpl({
                    lang: lang
                }));
                return this;
            }

        });

        function privateFunc(view, param1, param2) {

        }

        return Title;

    });